"use client";

/**
 * Compose It — dialogue mode (Au café). A scripted waiter walks the learner
 * through ordering: greet → order → drink → anything else → bill → goodbye.
 * The learner composes every reply from the same chip UI as solo mode; sent
 * lines and waiter lines are spoken (waiter voice pitched male, learner
 * female). All copy stays French except the small English nudges shown when
 * a reply doesn't move the script forward.
 */

import { useEffect, useRef, useState } from "react";
import { sfx } from "@/games/audio/sfx";
import { speak, speakSequence } from "@/games/letris/speech";
import { CAFE_PRICES, categoryHeaderClass, type ComposeBank } from "@/games/compose/banks";

type Msg = { who: "waiter" | "me"; text: string };
type Stage = "order" | "drink" | "more" | "pay" | "done";

const OPENING = "Bonsoir ! Vous désirez ?";

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
  const [nudge, setNudge] = useState<string | null>(null);
  const startedRef = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  const start = () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setMessages([{ who: "waiter", text: OPENING }]);
    setStage("order");
    setOrdered([]);
    setDraft([]);
    setNudge(null);
    speak(OPENING, lang, { gender: "m" });
  };

  useEffect(() => {
    if (startedRef.current) return; // survive dev double-mount
    startedRef.current = true;
    start();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages]);

  const draftText = joinChips(draft);
  const total = ordered.reduce((sum, p) => sum + (CAFE_PRICES[p] ?? 0), 0);

  const itemsIn = (text: string): string[] =>
    [...PLATS, ...BOISSONS].flatMap((p) => Array<string>(countIn(text, p)).fill(p));

  const send = () => {
    const text = draftText;
    if (!text || stage === "done") return;

    const hasCommander = COMMANDER.some((p) => text.includes(p));
    const items = itemsIn(text);
    const drinks = items.filter((p) => BOISSONS.includes(p));
    const closing = TERMINER.some((p) => text.includes(p)) || text.includes("merci");

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
      if (next === "done") sfx.stage(); else sfx.correct();
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
      messages.map((m) => ({ text: m.text, gender: m.who === "waiter" ? ("m" as const) : ("f" as const) })),
      lang,
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 text-[#4a2c14]">
      {/* Chat column */}
      <div className="flex flex-col gap-2 rounded-xl border-2 border-[#e8c49a] bg-white/70 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.who === "me" ? "justify-end" : "justify-start"}`}>
            <button
              type="button"
              lang="fr"
              onClick={() => speak(m.text, lang, { gender: m.who === "waiter" ? "m" : "f" })}
              title="🔊"
              className={`max-w-[85%] rounded-2xl border-2 px-4 py-2 text-left text-base leading-snug shadow-sm transition hover:brightness-95 ${
                m.who === "waiter"
                  ? "rounded-bl-sm border-[#e8c49a] bg-[#fff8ef]"
                  : "rounded-br-sm border-[#d98e46] bg-[#ffdcb3]"
              }`}
            >
              {m.who === "waiter" && (
                <span className="mr-1.5" aria-hidden>
                  🤵
                </span>
              )}
              {m.text}
            </button>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {stage === "done" ? (
        /* Recap card */
        <div className="rounded-xl border-2 border-[#d98e46] bg-white p-5">
          <h2 lang="fr" className="text-lg font-black">
            🧾 L&rsquo;addition
          </h2>
          <ul className="mt-2 flex flex-col gap-1">
            {ordered.map((p, i) => (
              <li key={`${i}-${p}`} lang="fr" className="flex justify-between text-sm">
                <span>{p}</span>
                <span className="font-bold">{CAFE_PRICES[p] ?? 0} €</span>
              </li>
            ))}
          </ul>
          <p lang="fr" className="mt-2 flex justify-between border-t-2 border-[#e8c49a] pt-2 font-black">
            <span>Total</span>
            <span>{total} €</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={playAll}
              className="rounded-xl border-b-4 border-[#b96f2e] bg-[#d98e46] px-4 py-2 font-black text-white transition hover:brightness-105"
            >
              ▶️ Écouter le dialogue
            </button>
            <button
              type="button"
              onClick={start}
              className="rounded-xl border-2 border-[#d98e46] bg-white px-4 py-2 font-black text-[#b96f2e] transition hover:bg-[#fff3e0]"
            >
              🔁 Rejouer
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Reply under construction */}
          <div className="rounded-xl border-2 border-[#e8c49a] bg-[#fff8ef] p-4">
            {draft.length === 0 ? (
              <p className="italic text-[#4a2c14]/60">Tap phrases below to build your reply…</p>
            ) : (
              <p lang="fr" className="text-lg leading-relaxed">
                {draftText}
                <span className="animate-pulse" aria-hidden>
                  ▏
                </span>
              </p>
            )}
            {nudge && <p className="mt-2 text-sm font-bold text-rose-700">{nudge}</p>}
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft((d) => d.slice(0, -1));
                  setNudge(null);
                }}
                disabled={draft.length === 0}
                className="rounded-xl border-2 border-[#e8c49a] bg-white px-3 py-1.5 text-sm font-bold text-[#4a2c14] transition hover:bg-[#fff3e0] disabled:opacity-40"
              >
                ↶ Undo
              </button>
              <button
                type="button"
                onClick={send}
                disabled={draft.length === 0}
                className="rounded-xl border-b-4 border-[#b96f2e] bg-[#d98e46] px-4 py-1.5 font-black text-white transition hover:brightness-105 disabled:opacity-40"
              >
                ✔ Je réponds
              </button>
            </div>
          </div>

          {/* Phrase bank */}
          <div className="flex flex-col gap-4">
            {bank.categories.map((cat, i) => (
              <section
                key={cat.label}
                className="overflow-hidden rounded-xl border-2 border-[#e8c49a] bg-white"
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
