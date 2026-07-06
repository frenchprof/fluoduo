"use client";

/**
 * Compose It — dialogue mode (Au café). A scripted waiter walks the learner
 * through ordering: greet → order → drink → anything else → bill → goodbye.
 * The learner composes every reply from the same chip UI as solo mode; sent
 * lines and waiter lines are spoken (waiter voice pitched male, learner
 * female). All copy stays French except the small English nudges shown when
 * a reply doesn't move the script forward.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { sfx } from "@/games/audio/sfx";
import { speak, speakSequence } from "@/games/letris/speech";
import { awardConversationXp } from "@/lib/progress";
import { CAFE_PRICES, categoryHeaderClass, type ComposeBank } from "@/games/compose/banks";

// "waiter" is the internal key for the persona (café waiter, classmate,
// friend, shopkeeper…) whatever the scene; "me" is the learner.
type Msg = { who: "waiter" | "me"; text: string };
type Stage = "order" | "drink" | "more" | "pay" | "done";

/** Join tapped chips into readable French (same cleanup as solo mode). */
function joinChips(chips: string[]): string {
  return chips
    .join(" ")
    .replace(/\s+,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

function countIn(text: string, phrase: string): number {
  return text.split(phrase).length - 1;
}

export default function ComposeDialogue({ bank }: { bank: ComposeBank }) {
  const lang = "fr-FR";
  // Persona config (café keeps its defaults; other scenes bring their own).
  const opening = bank.scene?.opening ?? "Bonsoir ! Vous désirez ?";
  const personaEmoji = bank.scene?.emoji ?? "🤵";
  const personaVoice: "m" | "f" = bank.scene?.voice ?? "m";
  const aiOnly = bank.scene?.aiOnly ?? false; // no rule fallback (non-café)
  // Per-persona colourway → CSS variables consumed by the chrome below.
  const theme = bank.scene?.theme ?? { edge: "#e8c49a", strong: "#d98e46", deep: "#b96f2e", personaBg: "#fff8ef", meBg: "#ffdcb3", ink: "#4a2c14" };
  const themeVars = {
    "--dlg-edge": theme.edge,
    "--dlg-strong": theme.strong,
    "--dlg-deep": theme.deep,
    "--dlg-persona-bg": theme.personaBg,
    "--dlg-me-bg": theme.meBg,
    "--dlg-ink": theme.ink,
  } as CSSProperties;
  const phrasesOf = (label: string) =>
    bank.categories.find((c) => c.label === label)?.phrases ?? [];
  const COMMANDER = phrasesOf("Commander");
  const PLATS = phrasesOf("Plats");
  const BOISSONS = phrasesOf("Boissons");
  const TERMINER = phrasesOf("Terminer");

  const [messages, setMessages] = useState<Msg[]>([]);
  const [stage, setStage] = useState<Stage>("order");
  const [ordered, setOrdered] = useState<string[]>([]); // priced items, with repeats
  const [draft, setDraft] = useState<string[]>([]);
  const [typed, setTyped] = useState(""); // free-text the learner adds to the chips
  const [nudge, setNudge] = useState<string | null>(null);
  // AI mode (Dan, 2026-07-05: the rule engine still accepted nonsense). The
  // waiter is driven by /api/compose when it's live; on any host without the
  // backend (503/404 — no ANTHROPIC_API_KEY yet, or a local preview) we fall
  // back to the rule engine below. "unknown" until the first send decides.
  const [aiMode, setAiMode] = useState<"unknown" | "ai" | "rules">("unknown");
  const [aiDone, setAiDone] = useState(false);
  const [busy, setBusy] = useState(false);
  // aiOnly scenes have no rule engine: if the backend is missing we show a
  // friendly notice instead of silently accepting nonsense.
  const [unavailable, setUnavailable] = useState(false);
  const startedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const start = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setMessages([{ who: "waiter", text: opening }]);
    setStage("order");
    setOrdered([]);
    setDraft([]);
    setTyped("");
    setNudge(null);
    setAiDone(false);
    speak(opening, lang, { gender: personaVoice });
  };

  useEffect(() => {
    if (startedRef.current) return; // survive dev double-mount
    startedRef.current = true;
    start();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  // The learner's reply = tapped chips + anything they typed.
  const draftText = [joinChips(draft), typed.trim()].filter(Boolean).join(" ").trim();
  const total = ordered.reduce((sum, p) => sum + (CAFE_PRICES[p] ?? 0), 0);
  const done = stage === "done" || aiDone;

  const itemsIn = (text: string): string[] =>
    [...PLATS, ...BOISSONS].flatMap((p) => Array<string>(countIn(text, p)).fill(p));

  // Entry point: try the AI waiter; if the backend isn't there, latch to the
  // rule engine and replay this turn through it (state is still fresh enough).
  async function send() {
    const text = draftText;
    if (!text || done || busy) return;
    setDraft([]);
    setTyped("");
    setNudge(null);

    if (aiMode === "rules") {
      sendRuleBased(text);
      return;
    }

    const withMine: Msg[] = [...messages, { who: "me", text }];
    setMessages(withMine);
    setBusy(true);
    try {
      const r = await fetch("/api/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scene: bank.id,
          messages: withMine.map((m) => ({ role: m.who === "waiter" ? "assistant" : "user", content: m.text })),
        }),
      });
      if ([404, 405, 501, 503].includes(r.status)) {
        setMessages(messages); // roll back the optimistic turn
        if (aiOnly) { setUnavailable(true); return; }
        setAiMode("rules");
        sendRuleBased(text); // café-only rule fallback re-adds the turn
        return;
      }
      const data = (await r.json().catch(() => null)) as { reply?: string; done?: boolean } | null;
      if (!data?.reply) {
        setMessages((m) => [...m, { who: "waiter", text: "Pardon, un petit souci… réessayez !" }]);
        return;
      }
      setAiMode("ai");
      setMessages((m) => [...m, { who: "waiter", text: data.reply! }]);
      speakSequence([{ text, gender: "f" as const }, { text: data.reply, gender: personaVoice }], lang);
      if (data.done) { setAiDone(true); sfx.stage(); awardConversationXp(); } else sfx.correct();
    } catch {
      setMessages(messages);
      if (aiOnly) { setUnavailable(true); return; }
      setAiMode("rules");
      sendRuleBased(text);
    } finally {
      setBusy(false);
    }
  }

  function sendRuleBased(text: string) {
    if (!text || stage === "done") return;

    const hasCommander = COMMANDER.some((p) => text.includes(p));
    const items = itemsIn(text);
    const drinks = items.filter((p) => BOISSONS.includes(p));
    const closing = TERMINER.some((p) => text.includes(p)) || text.includes("merci");

    // Grammar gate: two items side by side need the connector — the bank has
    // an "et" chip for exactly this. "un croissant un coca" is not a French
    // sentence and the waiter must not accept it (Dan, 2026-07-05: "who
    // would accept croissant coca").
    let tokenized = text;
    for (const p of [...PLATS, ...BOISSONS]) tokenized = tokenized.split(p).join("§");
    if (/§\s*§/.test(tokenized)) {
      setNudge("Two things in a row need et between them — un croissant ET un coca.");
      return;
    }

    const exchange = (myText: string, waiterLines: string[], next: Stage, addItems: string[]) => {
      setMessages((m) => [
        ...m,
        { who: "me" as const, text: myText },
        ...waiterLines.map((t) => ({ who: "waiter" as const, text: t })),
      ]);
      if (addItems.length > 0) setOrdered((o) => [...o, ...addItems]);
      setStage(next);
      setDraft([]);
      setNudge(null);
      // Accepted turn → ta-daa; the closing exchange (bonne soirée → recap)
      // gets the stage jingle instead — never both for one send. Nudges stay
      // silent (a buzz would be too harsh for a gentle redirect).
      if (next === "done") { sfx.stage(); awardConversationXp(); } else sfx.correct();
      speakSequence(
        [
          { text: myText, gender: "f" as const },
          ...waiterLines.map((t) => ({ text: t, gender: "m" as const })),
        ],
        lang,
      );
    };

    const billLines = (allOrdered: string[]) => {
      const sum = allOrdered.reduce((s, p) => s + (CAFE_PRICES[p] ?? 0), 0);
      return `Alors… ça fait ${sum} euros.`;
    };

    if (stage === "order") {
      if (!hasCommander || items.length === 0) {
        setNudge("Start with Je voudrais… and tap a dish or drink.");
        return;
      }
      const lines: string[] = [];
      if (text.includes("s'il vous plaît")) lines.push("Parfait, très poli !");
      const nowOrdered = [...ordered, ...items];
      const hasDrink = nowOrdered.some((p) => BOISSONS.includes(p));
      lines.push(hasDrink ? "Très bien. Autre chose ?" : "Et comme boisson ?");
      exchange(text, lines, hasDrink ? "more" : "drink", items);
      return;
    }

    if (stage === "drink") {
      if (drinks.length > 0) {
        exchange(text, ["Très bien. Autre chose ?"], "more", items);
      } else if (closing) {
        exchange(text, [billLines(ordered)], "pay", []);
      } else {
        setNudge("Pick a drink, or refuse with Non, merci.");
      }
      return;
    }

    if (stage === "more") {
      if (items.length > 0) {
        exchange(text, ["Très bien. Autre chose ?"], "more", items);
      } else if (closing) {
        exchange(text, [billLines(ordered)], "pay", []);
      } else {
        setNudge("Order something else, or finish with C'est tout / Non, merci.");
      }
      return;
    }

    // stage === "pay" — any polite close ends the dialogue.
    if (closing) {
      exchange(text, ["Merci à vous, bonne soirée ! 👋"], "done", []);
    } else {
      setNudge("Close politely — merci or Au revoir.");
    }
  };

  const playAll = () => {
    speakSequence(
      messages.map((m) => ({ text: m.text, gender: m.who === "waiter" ? personaVoice : ("f" as const) })),
      lang,
    );
  };

  return (
    <div style={themeVars} className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 text-[color:var(--dlg-ink)]">
      {/* Chat column */}
      <div className="flex flex-col gap-2 rounded-xl border-2 border-[color:var(--dlg-edge)] bg-white/70 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.who === "me" ? "justify-end" : "justify-start"}`}>
            <button
              type="button"
              lang="fr"
              onClick={() => speak(m.text, lang, { gender: m.who === "waiter" ? personaVoice : "f" })}
              title="🔊"
              className={`max-w-[85%] rounded-2xl border-2 px-4 py-2 text-left text-base leading-snug shadow-sm transition hover:brightness-95 ${
                m.who === "waiter"
                  ? "rounded-bl-sm border-[color:var(--dlg-edge)] bg-[var(--dlg-persona-bg)]"
                  : "rounded-br-sm border-[color:var(--dlg-strong)] bg-[var(--dlg-me-bg)]"
              }`}
            >
              {m.who === "waiter" && (
                <span className="mr-1.5" aria-hidden>
                  {personaEmoji}
                </span>
              )}
              {m.text}
            </button>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {unavailable ? (
        /* aiOnly scene with no backend (local preview / key not set): degrade
           gracefully rather than accept nonsense. */
        <div className="rounded-xl border-2 border-[color:var(--dlg-edge)] bg-white p-5 text-center text-[color:var(--dlg-ink)]">
          <p className="text-lg font-black">🔌 L&rsquo;assistant n&rsquo;est pas disponible ici</p>
          <p className="mt-1 text-sm">Cette conversation a besoin d&rsquo;une connexion. Réessayez sur le site en ligne.</p>
          <button
            type="button"
            onClick={() => { setUnavailable(false); start(); }}
            className="mt-4 rounded-xl border-2 border-[color:var(--dlg-strong)] bg-white px-4 py-2 font-black text-[color:var(--dlg-deep)] transition hover:bg-[var(--dlg-persona-bg)]"
          >
            🔁 Réessayer
          </button>
        </div>
      ) : done ? (
        /* Recap card — the rule engine tracked a priced order; the AI waiter
           gave the total in the chat, so its recap is just the replay. */
        <div className="rounded-xl border-2 border-[color:var(--dlg-strong)] bg-white p-5">
          {ordered.length > 0 ? (
            <>
              <h2 lang="fr" className="text-lg font-black">🧾 L&rsquo;addition</h2>
              <ul className="mt-2 flex flex-col gap-1">
                {ordered.map((p, i) => (
                  <li key={`${i}-${p}`} lang="fr" className="flex justify-between text-sm">
                    <span>{p}</span>
                    <span className="font-bold">{CAFE_PRICES[p] ?? 0} €</span>
                  </li>
                ))}
              </ul>
              <p lang="fr" className="mt-2 flex justify-between border-t-2 border-[color:var(--dlg-edge)] pt-2 font-black">
                <span>Total</span>
                <span>{total} €</span>
              </p>
            </>
          ) : (
            <h2 lang="fr" className="text-lg font-black">👋 Merci, à bientôt !</h2>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={playAll}
              className="rounded-xl border-b-4 border-[color:var(--dlg-deep)] bg-[var(--dlg-strong)] px-4 py-2 font-black text-white transition hover:brightness-105"
            >
              ▶️ Écouter le dialogue
            </button>
            <button
              type="button"
              onClick={start}
              className="rounded-xl border-2 border-[color:var(--dlg-strong)] bg-white px-4 py-2 font-black text-[color:var(--dlg-deep)] transition hover:bg-[var(--dlg-persona-bg)]"
            >
              🔁 Rejouer
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Reply under construction: tapped chips + free text (Dan,
              2026-07-05: "a combination of fixed phrases and user input"). */}
          <div className="rounded-xl border-2 border-[color:var(--dlg-edge)] bg-[var(--dlg-persona-bg)] p-4">
            {draft.length === 0 && !typed ? (
              <p className="italic text-[color:var(--dlg-ink)] opacity-60">Tap phrases below and / or type your reply…</p>
            ) : (
              <p lang="fr" className="text-lg leading-relaxed">
                {draftText}
                <span className="animate-pulse" aria-hidden>▏</span>
              </p>
            )}
            {busy && <p className="mt-2 text-sm font-bold text-[color:var(--dlg-deep)]">{personaEmoji} …</p>}
            {nudge && <p className="mt-2 text-sm font-bold text-rose-700">{nudge}</p>}
            <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="mt-3 flex flex-wrap items-center gap-2">
              <input
                lang="fr"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="…ou tapez ici"
                disabled={busy || done}
                className="min-w-[8rem] flex-1 rounded-lg border-2 border-[color:var(--dlg-edge)] bg-white px-3 py-1.5 text-base text-[color:var(--dlg-ink)] outline-none focus:border-[color:var(--dlg-strong)]"
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              <button
                type="button"
                onClick={() => { setDraft((d) => d.slice(0, -1)); setNudge(null); }}
                disabled={draft.length === 0 || busy}
                className="rounded-xl border-2 border-[color:var(--dlg-edge)] bg-white px-3 py-1.5 text-sm font-bold text-[color:var(--dlg-ink)] transition hover:bg-[var(--dlg-persona-bg)] disabled:opacity-40"
              >
                ↶ Undo
              </button>
              <button
                type="submit"
                disabled={!draftText || busy}
                className="rounded-xl border-b-4 border-[color:var(--dlg-deep)] bg-[var(--dlg-strong)] px-4 py-1.5 font-black text-white transition hover:brightness-105 disabled:opacity-40"
              >
                ✔ Je réponds
              </button>
            </form>
          </div>

          {/* Phrase bank */}
          <div className="flex flex-col gap-4">
            {bank.categories.map((cat, i) => (
              <section
                key={cat.label}
                className="overflow-hidden rounded-xl border-2 border-[color:var(--dlg-edge)] bg-white"
              >
                <header
                  className={`px-4 py-2.5 text-sm font-bold uppercase tracking-widest ${categoryHeaderClass(i)}`}
                >
                  {cat.label}
                </header>
                <div className="flex flex-wrap gap-2 p-3">
                  {cat.phrases.map((p) => (
                    <button
                      key={p}
                      type="button"
                      lang="fr"
                      onClick={() => {
                        setDraft((d) => [...d, p]);
                        setNudge(null);
                      }}
                      className={`rounded-lg border-2 px-3 py-2 text-sm font-bold transition ${cat.chip}`}
                      title={`Add ${p}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
