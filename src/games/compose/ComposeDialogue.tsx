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
import { logEvent } from "@/lib/firebase/usage";
import { sfx } from "@/games/audio/sfx";
// Cloud (Google Neural2) speech with automatic browser fallback — the
// dialogues sound identical on every device (Dan, 2026-07-18).
import { speakCloud as speak, speakSequenceCloud as speakSequence, stopCloudVoice } from "@/lib/cloudVoice";
import { awardConversationXp } from "@/lib/progress";
import { recordResponse } from "@/lib/firebase/responses";
import { CAFE_PRICES, categoryHeaderClass, type ComposeBank } from "@/games/compose/banks";
import ChatThread, { type ChatMessage } from "@/components/chat/ChatThread";
import ChatComposer from "@/components/chat/ChatComposer";
import GameFrame from "@/components/GameFrame";
import GameOver from "@/components/GameOver";
import ToolSummon from "@/components/tools/ToolSummon";
import { drillExitHref } from "@/components/DrillShell";
import { buildEvidence } from "@/lib/evidence";

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
  useEffect(() => {
    void logEvent("game.start", { game: "compose", collectionId: bank.id });
  }, [bank.id]);
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
    /* THE SIX PERSONA COLOURWAYS SURVIVE THE MOVE. Each scene has had its own
       palette since the dialogue banks were written — the café warm brown, the
       lost-property desk blue, Léa green — and the shared messenger reads
       `--bub-*`, so the two are wired together here rather than the themes
       being quietly dropped for one house colour. `*-foot` is the tail, which
       is a border-triangle and so can only be a flat colour: these fills are
       flat already, so it is the same value. */
    "--bub-them-bg": theme.personaBg,
    "--bub-them-foot": theme.personaBg,
    "--bub-them-edge": theme.edge,
    "--bub-me-bg": theme.meBg,
    "--bub-me-foot": theme.meBg,
    "--bub-me-edge": theme.strong,
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
  /* ONE COMPOSER, NOT TWO. The reply used to live in two places at once — an
     array of tapped chips rendered in a box of its own, and a separate text
     input beside it — which is why the screen had a "reply under construction"
     panel that no messenger has. A tapped chip now lands IN the field, exactly
     as a predictive-text suggestion does, and `undo` is a stack of the field's
     previous values rather than a stack of chips (so it undoes typing too). */
  const [typed, setTyped] = useState("");
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [nudge, setNudge] = useState<string | null>(null);
  // AI mode (Dan, 2026-07-05: the rule engine still accepted nonsense). The
  // waiter is driven by /api/compose when it's live; on any host without the
  // backend (503/404 — no MISTRAL_API_KEY yet, or a local preview) we fall
  // back to the rule engine below. "unknown" until the first send decides.
  const [aiMode, setAiMode] = useState<"unknown" | "ai" | "rules">("unknown");
  const [aiDone, setAiDone] = useState(false);
  const [busy, setBusy] = useState(false);
  // Post-roleplay debrief (Dan, 2026-07-10: the roleplay carried on through
  // serious mistakes with no learning points at the end). Fetched once the
  // dialogue is done; the persona never breaks character — the BILAN does
  // the teaching. English + French mixed, so it is NEVER wired to TTS.
  const [debrief, setDebrief] = useState<string | null>(null);
  const [debriefBusy, setDebriefBusy] = useState(false);
  // aiOnly scenes have no rule engine: if the backend is missing we show a
  // friendly notice instead of silently accepting nonsense.
  const [unavailable, setUnavailable] = useState(false);
  const startedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const start = () => {
    if (typeof window !== "undefined") { window.speechSynthesis?.cancel(); stopCloudVoice(); }
    setMessages([{ who: "waiter", text: opening }]);
    setStage("order");
    setOrdered([]);
    setUndoStack([]);
    setTyped("");
    setNudge(null);
    setAiDone(false);
    setDebrief(null);
    setDebriefBusy(false);
    speak(opening, lang, { gender: personaVoice });
  };

  // The learner can ask for the bilan any time; it also auto-loads when the
  // dialogue ends (see the recap card). Works whenever the AI backend is up —
  // including café sessions that ran on the rule engine.
  async function fetchDebrief(transcript: Msg[]) {
    if (debriefBusy || transcript.length < 2) return;
    setDebriefBusy(true);
    try {
      const r = await fetch("/api/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          scene: bank.id,
          debrief: true,
          messages: transcript.map((m) => ({ role: m.who === "waiter" ? "assistant" : "user", content: m.text })),
        }),
      });
      const data = (await r.json().catch(() => null)) as { reply?: string } | null;
      if (r.ok && data?.reply) setDebrief(data.reply);
      else setDebrief(null);
    } catch {
      setDebrief(null);
    } finally {
      setDebriefBusy(false);
    }
  }

  useEffect(() => {
    if (startedRef.current) return; // survive dev double-mount
    startedRef.current = true;
    start();
  // Run-once by design (startedRef survives the dev double-mount); adding
  // `start` would restart the whole dialogue whenever its identity changes.
  // Reviewed with Dan 2026-08-31: disable, not fix.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  // Dialogue over → pull the teacher's bilan automatically.
  const done = stage === "done" || aiDone;
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fires a network fetch when the conversation ends; the state it sets arrives from outside React.
    if (done && debrief === null && !debriefBusy && messages.length >= 2) void fetchDebrief(messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // The learner's reply — chips and typing are the same string now.
  const draftText = typed.trim();
  const total = ordered.reduce((sum, p) => sum + (CAFE_PRICES[p] ?? 0), 0);

  const itemsIn = (text: string): string[] =>
    [...PLATS, ...BOISSONS].flatMap((p) => Array<string>(countIn(text, p)).fill(p));

  // Entry point: try the AI waiter; if the backend isn't there, latch to the
  // rule engine and replay this turn through it (state is still fresh enough).
  async function send() {
    const text = draftText;
    if (!text || done || busy) return;
    setUndoStack([]);
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
        setMessages((m) => [...m, { who: "waiter", text: "Something went wrong — try again." }]);
        return;
      }
      setAiMode("ai");
      setMessages((m) => [...m, { who: "waiter", text: data.reply! }]);
      speakSequence([{ text, gender: "f" as const }, { text: data.reply, gender: personaVoice }], lang);
      if (data.done) {
        setAiDone(true);
        sfx.stage();
        awardConversationXp();
        recordResponse(bank.id, true, {
          activity: `compose:${bank.id}`,
          // awardConversationXp() above is this game's payment; routing through
          // recordItemResult would pay a second time.
          evidence: buildEvidence(bank.id, `compose:${bank.id}`),
        });
        void logEvent("game.end", { game: "compose", collectionId: bank.id });
      } else sfx.correct();
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
      setUndoStack([]);
      setTyped("");
      setNudge(null);
      // Accepted turn → ta-daa; the closing exchange (bonne soirée → recap)
      // gets the stage jingle instead — never both for one send. Nudges stay
      // silent (a buzz would be too harsh for a gentle redirect).
      if (next === "done") {
        sfx.stage();
        awardConversationXp();
        recordResponse(bank.id, true, {
          activity: `compose:${bank.id}`,
          // awardConversationXp() above is this game's payment; routing through
          // recordItemResult would pay a second time.
          evidence: buildEvidence(bank.id, `compose:${bank.id}`),
        });
        void logEvent("game.end", { game: "compose", collectionId: bank.id });
      } else sfx.correct();
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

  const exitHref = drillExitHref(bank.deckId);
  const stageIdx = ["order", "drink", "more", "pay", "done"].indexOf(stage);
  const help = (
    <>
      <p>{personaEmoji} speaks first. Compose your reply from the phrases below and / or type it, then ✔ Reply. Every line can be replayed with a tap.</p>
    </>
  );
  const record = (
    <ol className="flex flex-col gap-1.5">
      {messages.filter((m) => m.who === "me").map((m, i) => (
        <li key={i} lang="fr" className="rounded-lg border-2 border-[color:var(--cahier-line)] px-2 py-1 text-sm">{m.text}</li>
      ))}
    </ol>
  );

  return (
    <GameFrame
      title={`${bank.emoji} ${bank.title}`}
      exitHref={exitHref}
      progress={aiOnly ? null : { done: done ? 4 : Math.max(0, stageIdx), total: 4 }}
      score={messages.filter((m) => m.who === "me").length > 0 ? <>{messages.filter((m) => m.who === "me").length} ✎</> : undefined}
      help={help}
      hintKey="compose"
      menu={[
        { label: "Restart", onClick: start },
        { label: "▶️ Listen to the dialogue", onClick: playAll },
      ]}
      record={record}
      recordTitle="✎ Your lines"
    >
    <div
      style={themeVars}
      /* THE MESSENGER OWNS THE HEIGHT. This used to be `overflow-y-auto` with
         the chat, the draft box and the whole phrase bank stacked inside it,
         so on a long conversation the place you type scrolled off the bottom.
         Now the frame does not scroll at all — the thread does, and the tray
         does, and the composer stays put. (Dan, 2026-09-13: *"adopt the UI UX
         of how modern messenger works"*.) */
      className="msgr mx-auto h-full w-full max-w-3xl overflow-hidden text-[color:var(--dlg-ink)]"
    >
      {/* The header: who you are talking to, and what this conversation is.
          Dan asked for the scene reminder to stay on the board (2026-07-19:
          *"there is a need to remind users that we are in the context of ___"*)
          — a messenger already has the place for it, under the name. */}
      <div className="msgr-head">
        <span className="msgr-avatar" aria-hidden>{personaEmoji}</span>
        <div className="min-w-0">
          <p className="msgr-head-name truncate">{bank.title}</p>
          {/* The status line every messenger has, and it says something true:
              it flips to « écrit… » while the reply is on its way. French,
              which the 6 Sep rule allows — nobody is STUCK in front of a
              status line, and it is the app's character. */}
          <p className="msgr-head-sub">{busy ? "écrit…" : "en ligne"}</p>
        </div>
      </div>

      {unavailable ? (
        /* aiOnly scene with no backend (local preview / key not set): degrade
           gracefully rather than accept nonsense. */
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="rounded-xl border-2 border-[color:var(--dlg-edge)] bg-white p-5 text-center text-[color:var(--dlg-ink)]">
            <p className="text-lg font-black">🔌 The assistant isn&rsquo;t available here</p>
            <p className="mt-1 text-sm">This conversation needs a connection. Try again on the live site.</p>
            <button
              type="button"
              onClick={() => { setUnavailable(false); start(); }}
              className="mt-4 rounded-xl border-2 border-[color:var(--dlg-strong)] bg-white px-4 py-2 font-black text-[color:var(--dlg-deep)] transition hover:bg-[var(--dlg-persona-bg)]"
            >
              Retry
            </button>
          </div>
        </div>
      ) : done ? (
        /* The post-mortem (patch 23): the bill the rule engine tracked (the AI
           waiter gave the total in the chat), and le bilan du prof — the
           debrief the roleplay itself never gives. English + French mixed, so
           deliberately NOT a speak button. */
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <GameOver
          activityKey="compose"
            emoji={personaEmoji}
            title={ordered.length > 0 ? "L\u2019addition" : "Merci, à bientôt !"}
            won
            misses={[]}
            onReplay={start}
            exitHref={exitHref}
            extra={
              <div className="mt-3">
                {ordered.length > 0 && (
                  <>
                    <ul className="flex flex-col gap-1">
                      {ordered.map((p, i) => (
                        <li key={`${i}-${p}`} lang="fr" className="flex justify-between text-sm">
                          <span>{p}</span>
                          <span className="font-bold">{CAFE_PRICES[p] ?? 0} €</span>
                        </li>
                      ))}
                    </ul>
                    <p lang="fr" className="mt-2 flex justify-between border-t-2 border-[color:var(--cahier-line)] pt-2 font-black">
                      <span>Total</span>
                      <span>{total} €</span>
                    </p>
                  </>
                )}
                {(debrief || debriefBusy) && (
                  <div className="mt-3 rounded-xl border-2 border-dashed border-[color:var(--cahier-gold)] bg-[color:var(--cahier-gold)]/10 p-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[color:var(--cahier-ink-soft)]">✍️ Le bilan du prof</h3>
                    {debriefBusy ? (
                      <p className="mt-2 animate-pulse text-sm">Reviewing your conversation…</p>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{debrief}</p>
                    )}
                  </div>
                )}
                <button type="button" onClick={playAll} className="cahier-btn cahier-btn-sm mt-3">▶️ Listen to the dialogue</button>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {/* THE THREAD. Every line still replays on demand — the 🔊 moved from
              the bubble to the meta row under it, because a bubble that is a
              <button> cannot have its French selected and copied (Dan,
              2026-07-27), and because a messenger does not make the message
              itself a control. */}
          <ChatThread
            avatar={personaEmoji}
            typing={busy}
            /* The scene reminder Dan asked to keep on the board (2026-07-19:
               *"there is a need to remind users that we are in the context of
               ___"*). It sat in the header for one build and ate four of the
               frame's lines, leaving the thread about 170px on a phone —
               measured. At the head of the thread it is complete, it is the
               first thing read, and it gives the room back. */
            intro={bank.scene?.contextEn ? <>{bank.emoji} {bank.scene.contextEn}</> : undefined}
            messages={messages.map((m, i): ChatMessage => ({
              key: `${i}`,
              side: m.who === "waiter" ? "them" : "me",
              body: m.text,
              actions: (
                <button
                  type="button"
                  className="msgr-mini"
                  onClick={() => speak(m.text, lang, { gender: m.who === "waiter" ? personaVoice : "f" })}
                  aria-label="Listen"
                  title="🔊"
                >
                  🔊
                </button>
              ),
            }))}
          />

          {/* A refused turn. The rule engine's nudges used to sit inside the
              draft box; in a messenger a rejected message is called out just
              above where you type, which is where the eye already is. */}
          {nudge && <p className="msgr-note">{nudge}</p>}

          {/* THE TRAY — every chip, still all on screen, now above the
              composer instead of below the fold. Tapping one appends it to the
              field rather than to a separate "reply under construction" box. */}
          <div className="msgr-tray">
            {bank.categories.map((cat, i) => (
              <div key={cat.label} className="msgr-tray-group">
                <span className={`msgr-tray-label ${categoryHeaderClass(i)} rounded-full px-2 py-0.5`}>{cat.label}</span>
                {cat.phrases.map((p) => (
                  <button
                    key={p}
                    type="button"
                    lang="fr"
                    className={`msgr-chip ${cat.chip}`}
                    onClick={() => {
                      setUndoStack((u) => [...u, typed]);
                      setTyped((t) => joinChips([t, p].filter(Boolean)));
                      setNudge(null);
                    }}
                    title={`Add ${p}`}
                  >
                    {p === ", " ? ",  (comma)" : p}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <ChatComposer
            className="has-fab"
            value={typed}
            /* TYPING DOES NOT PUSH THE UNDO STACK — a per-keystroke stack
               makes ↶ undo one letter at a time, which is not what the button
               means here. It steps back one TAPPED PHRASE, the thing a finger
               puts in by accident; the keyboard's own undo still handles
               typing. */
            onChange={(v) => { setTyped(v); setNudge(null); }}
            onSend={() => void send()}
            placeholder="Tap or type…"
            disabled={busy}
            sendLabel="Reply"
            inside={
              <button
                type="button"
                className="msgr-mini"
                onClick={() => { setUndoStack((u) => u.slice(0, -1)); setTyped(undoStack[undoStack.length - 1] ?? ""); setNudge(null); }}
                disabled={undoStack.length === 0 || busy}
                aria-label="Undo"
                title="↶ Undo"
              >
                ↶
              </button>
            }
          />
        </>
      )}

      {/* 🛠️ The summonable tools (5 Sep): VoixLà is handed the reply being
          composed (or the learner's last sent line); ChaTutor is told which
          scene this is. */}
      <ToolSummon
        context={{
          title: `ComposeIt — ${bank.title}`,
          item: bank.scene?.contextEn ?? opening,
          french: draftText || [...messages].reverse().find((m) => m.who === "me")?.text || "",
        }}
      />
    </div>
    </GameFrame>
  );
}
