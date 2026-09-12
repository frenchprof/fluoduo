"use client";

/**
 * 🛠️ ToolSummon — the in-exercise door to the two tools (Dan, 5 Sep, AMBIENT
 * TOOLS: "ChaTutor as a floating consult, VoixLà summonable wherever French
 * is typed; the OUTILS row is the address, not the life").
 *
 * 🛠️, not 🧰 (Dan, 2026-09-09) — 🧰 was ALSO LexicaLocker's icon (see
 * activities.ts), live on screen at once on exercises that have nothing to
 * do with that game.
 *
 * One floating 🛠️ button (cahier paper, ink border) sits fixed above the
 * green 🐞 feedback bubble. Tapping it opens a small tray — 🔊 VoixLà ·
 * 🤖 ChaTutor — and tapping a row slides a BottomSheet card up OVER the
 * exercise. The exercise NEVER closes or navigates: close the card and it is
 * exactly as left.
 *
 * Audio ownership while a card is open: the exercise's own speech is paused
 * (pauseSpeech — which also reaches cloud clips via the registered hooks) and
 * resumed on close; the summoning trainer is told through onCardOpen /
 * onCardClose so it can park its microphone (WorDrill must not transcribe the
 * card's own voice).
 *
 * Portalled to <body>: the trainers live inside DrillShell / GameFrame, whose
 * inner layout must stay untouched (a parallel lane owns DrillShell) and
 * whose stacking contexts must not swallow a fixed button.
 */
import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import BottomSheet from "@/components/BottomSheet";
import { pauseSpeech, resumeSpeech } from "@/games/letris/speech";
import { stopCloudVoice } from "@/lib/cloudVoice";
import ChaTutorPanel from "./ChaTutorPanel";
import VoixLaPanel from "./VoixLaPanel";

export type ToolContext = {
  /** The activity's learner-visible name, e.g. "ÉcouTexte". (Named `title`,
   *  not `activity` — an `activity:` literal reads as an evidence tag to
   *  verify53, and these never touch the mastery model.) */
  title: string;
  /** The item or sentence the learner is on — ChaTutor's chip. Pass what the
   *  learner can already SEE; never leak a hidden answer here. */
  item?: string;
  /** The learner's current typed (or spoken) French — VoixLà's hand-off. */
  french?: string;
};

type Card = "voixla" | "chatutor";

export default function ToolSummon({
  context,
  tools = ["voixla", "chatutor"],
  onCardOpen,
  onCardClose,
}: {
  context: ToolContext;
  /** Which tools this exercise offers. ÉcouTexte offers ChaTutor only —
   *  Dan, 5 Sep: "Voix-Là is for TTS. and it does NOT make any sense to
   *  have it im EcouTexte": the exercise's whole job is already speaking
   *  French at the learner, and TTS there could read the answer aloud.
   *  With a single tool the 🛠️ opens its card directly — a one-row tray
   *  is a middle step with nothing to choose. */
  tools?: Card[];
  /** A card slid over the exercise — park the mic, hold the audio. */
  onCardOpen?: () => void;
  /** The card closed — the exercise may take its audio back. */
  onCardClose?: () => void;
}) {
  const [tray, setTray] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  // Portals need a document; the server snapshot says "not yet".
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  if (!mounted) return null;

  const openCard = (which: Card) => {
    setTray(false);
    setCard(which);
    // The card owns the audio now: hold the exercise's speech where it is.
    pauseSpeech();
    onCardOpen?.();
  };

  const closeCard = () => {
    setCard(null);
    // Stop whatever the card was voicing, then hand the audio back.
    window.speechSynthesis?.cancel();
    stopCloudVoice();
    resumeSpeech();
    onCardClose?.();
  };

  return createPortal(
    <>
      {/* The door: 46px round, cahier paper + ink border, above the 🐞
          feedback bubble (bottom-right ~20px). */}
      <button
        type="button"
        onClick={() => (tools.length === 1 ? openCard(tools[0]) : setTray((v) => !v))}
        title={tools.length === 1 ? (tools[0] === "chatutor" ? "ChaTutor" : "VoixLà") : "Outils — VoixLà & ChaTutor"}
        aria-label="Outils"
        aria-expanded={tray}
        className="fixed bottom-[132px] right-[14px] z-50 flex fluo-fab items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)] text-xl shadow-lg transition-transform hover:brightness-95 active:scale-95"
        style={{ background: "var(--cahier-paper-raised)" }}
      >
        🛠️
      </button>

      {/* The tray: two rows, one per tool. A tap outside puts it away. */}
      {tray && card === null && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setTray(false)} role="presentation" />
          <div
            className="fixed bottom-[186px] right-[14px] z-50 flex flex-col overflow-hidden rounded-xl border-2 border-[color:var(--cahier-ink)] shadow-lg"
            style={{ background: "var(--cahier-paper-raised)" }}
          >
            {tools.includes("voixla") && (
              <button
                type="button"
                onClick={() => openCard("voixla")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[color:var(--cahier-ink)] transition hover:bg-[color:var(--cahier-ink)]/10"
              >
                <span aria-hidden>🔊</span>VoixLà
              </button>
            )}
            {tools.includes("chatutor") && (
              <button
                type="button"
                onClick={() => openCard("chatutor")}
                className="flex items-center gap-2 border-t-2 border-[color:var(--cahier-rule)] px-4 py-2.5 text-sm font-bold text-[color:var(--cahier-ink)] transition hover:bg-[color:var(--cahier-ink)]/10"
              >
                <span aria-hidden>🤖</span>ChaTutor
              </button>
            )}
          </div>
        </>
      )}

      {/* The card: the tool slides up OVER the exercise, which stays exactly
          as left underneath. */}
      <BottomSheet
        open={card !== null}
        onClose={closeCard}
        title={card === "voixla" ? "🔊 VoixLà" : "🤖 ChaTutor"}
      >
        <div className="flex h-[52dvh] flex-col gap-3 overflow-y-auto">
          {card === "voixla" && (
            <VoixLaPanel correctsFirst initialText={context.french ?? ""} />
          )}
          {card === "chatutor" && (
            <ChaTutorPanel context={{ title: context.title, item: context.item }} />
          )}
        </div>
      </BottomSheet>
    </>,
    document.body,
  );
}
