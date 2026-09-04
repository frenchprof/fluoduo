"use client";

/**
 * The body of a SIO popup: the can-do statement. That is the whole of it.
 *
 * Dan, 2026-07-01: "STICK TO THE ESSENTIALS. SHORT AND SWEET. EFFICIENT" — no
 * "Statement of SIO" / "Measurable Language Competency" headers, one merged
 * sentence via sioStatement(). Then 2026-08-31: "collapse the interfaces to
 * ONLY reveal the SIO spelled out fully, then the links to the relevant items
 * within the stop. THAT IS IT."
 *
 * THE ATELIERS ESCAPED THAT COLLAPSE (#99), and this closes it. The collapse
 * emptied three of this file's four branches; the fourth fired only when
 * `sio.isProduction`, so the six atelier stops kept printing their whole model
 * dialogue — six to ten lines of French and English, with play buttons — above
 * the link list. Nobody saw it because no other stop takes that branch.
 *
 * That is not just duplication. THE MODEL DIALOGUE IS THE PRE-TEST'S ANSWER
 * KEY. An atelier pre-test asks "which French line says « The flag has two
 * colours: red and white »?" and offers four lines OF THAT DIALOGUE
 * (content/pretests/ateliers.gen.ts) — all of which were printed on screen,
 * immediately above the button that starts it. A cold guess was impossible to
 * make, so the one thing the pre-test measures could not be measured.
 *
 * The dialogue is not lost and does not need a new page: it is the atelier
 * deck's Mémo — « Le modèle », built from the same ATELIER_DIALOGUES so it
 * cannot drift (content/memos.tsx) — which is link ② in the very list this
 * body sits above. Read it when you choose to, not before the guess.
 *
 * Dan, 2026-08-31: "i would rather the SIO and the items (however few) not be
 * lumped into the same space anymore."
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSio, sioStatement, type Sio } from "@/content/sios";
import { missesForSio, PRETEST_RECORD_EVENT } from "@/lib/pretestRecord";
import { useAuthUser } from "@/lib/firebase/auth";
import SoftAuthModal, { type SoftAuthProceed } from "@/components/SoftAuthModal";

export default function SioDetail({ sio }: { sio: Sio }) {
  return (
    <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
      <span className="fluo-hl">{sioStatement(sio)}</span>
    </p>
  );
}

/* AfterPretest is gone with the chips it gated. It hid the lesson buttons
 * until the popup's inline pre-test fired `fluolingo:pretest-complete`, so a
 * learner could not be tempted away mid-guess (Dan, 2026-07-05: pre-test
 * first, lesson after). Neither the inline pre-test nor the chips render here
 * any more — the rule it enforced is now structural rather than conditional:
 * the popup shows no lesson at all, only a link to one. PretestQuiz still
 * fires the event; the pre-test PAGE is what listens.
 */

const FOLD_AT = 5;
const SKIP_SAVE_KEY = "fluolingo:class-bag.skip-save";

function youCanEn(canDo: string): string {
  return canDo.replace(/^I can\s+/i, "").replace(/\.\s*$/, "");
}

function missChipFr(m: { stem: string; answer: string }): string {
  // Prefer the French answer (target). If the stem is already a French
  // sentence with a blank, show the filled answer alone — don't truncate.
  return m.answer.trim() || m.stem.trim();
}

function missChipGloss(m: { stem: string; answer: string }): string | null {
  const stem = m.stem.trim();
  const ans = m.answer.trim();
  if (!stem || stem === ans) return null;
  // Unit-0 stems are often EN prompts; U1–4 stems are gapped FR. Gloss only
  // when the stem adds something the chip does not already say.
  if (stem.includes("___")) return stem.replace(/\s+/g, " ");
  // EN-looking stem (no accented letters + mostly Latin words) → gloss.
  if (!/[àâäéèêëïîôùûüçœæ]/i.test(stem) && /[A-Za-z]{3,}/.test(stem)) return stem;
  return null;
}

function listText(misses: Array<{ stem: string; answer: string }>): string {
  return misses.map((m) => missChipFr(m)).join("\n");
}

/** Class bag — post-SpecuLearn / pretest gap artifact (docs/CLASS_BAG.md).
 *  Export name stays BringToClass so verify40's Recap mount pin holds. */
export function BringToClass({
  sioId,
  showEmpty = false,
  continueHref = "/",
}: {
  sioId: string;
  /** When true, empty bag shows "Nothing to check — you're ready." (Recap /
   *  SpecuLearn end / after Skip pretest). Mid-quiz mounts leave this false
   *  so an unfinished run does not claim readiness. */
  showEmpty?: boolean;
  continueHref?: string;
}) {
  const sio = getSio(sioId);
  const user = useAuthUser();
  const [misses, setMisses] = useState<ReturnType<typeof missesForSio>>([]);
  const [showMode, setShowMode] = useState(false);
  const [softOpen, setSoftOpen] = useState(false);
  const [pending, setPending] = useState<"continue" | "show" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const read = () => setMisses(missesForSio(sioId));
    read();
    window.addEventListener(PRETEST_RECORD_EVENT, read);
    return () => window.removeEventListener(PRETEST_RECORD_EVENT, read);
  }, [sioId]);

  if (misses.length === 0 && !showEmpty) return null;

  const canDoLine = sio ? youCanEn(sio.canDo) : "";
  const frLine = sio?.fr?.trim() || "";
  const empty = misses.length === 0;
  const fold = misses.length >= FOLD_AT;

  function skipSaveRemembered(): boolean {
    try {
      return sessionStorage.getItem(SKIP_SAVE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function needsSoftAuth(): boolean {
    // undefined = still resolving — don't interrupt; treat as signed-out only
    // once auth has answered null. Soft-auth is never mid-guess.
    if (user) return false;
    if (user === undefined) return false;
    return !skipSaveRemembered();
  }

  function requestAction(kind: "continue" | "show") {
    if (needsSoftAuth()) {
      setPending(kind);
      setSoftOpen(true);
      return;
    }
    runAction(kind);
  }

  function runAction(kind: "continue" | "show") {
    if (kind === "show") setShowMode(true);
    else if (typeof window !== "undefined") window.location.assign(continueHref);
  }

  function onSoftDone(how: SoftAuthProceed) {
    setSoftOpen(false);
    if (how === "without-saving") {
      try {
        sessionStorage.setItem(SKIP_SAVE_KEY, "1");
      } catch {}
    }
    const kind = pending;
    setPending(null);
    if (kind) runAction(kind);
  }

  async function copyList() {
    try {
      await navigator.clipboard.writeText(listText(misses));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard denied — silent; Show in class still works
    }
  }

  const chips = (
    <ul className="flex flex-wrap gap-2">
      {misses.map((m) => {
        const fr = missChipFr(m);
        const gloss = missChipGloss(m);
        return (
          <li key={m.itemId}>
            <span
              className="inline-flex max-w-full flex-col items-start rounded-full border-2 border-b-4 px-3 py-1.5"
              style={{
                borderColor: "var(--cahier-ink)",
                background: "var(--cahier-paper-raised)",
                color: "var(--cahier-ink)",
                boxShadow: "0 1px 0 color-mix(in oklab, var(--cahier-ink) 18%, transparent)",
              }}
            >
              <span lang="fr" className="text-sm font-bold leading-snug">
                {fr}
              </span>
              {gloss && (
                <span className="text-[0.65rem] italic leading-snug text-[color:var(--cahier-ink-soft)]">
                  {gloss}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );

  const body = (
    <div
      className="rounded-2xl border-2 border-b-4 p-4"
      style={{
        borderColor: "var(--cahier-line-strong)",
        background: "var(--cahier-paper-raised)",
      }}
      data-class-bag
    >
      <h2 className="fluo-serif text-lg font-black text-[color:var(--cahier-ink)]">Class bag</h2>

      {canDoLine && (
        <p className="mt-2 text-sm font-bold leading-snug text-[color:var(--cahier-ink)]">
          You can: {canDoLine}
        </p>
      )}
      {frLine && (
        <p lang="fr" className="mt-0.5 text-sm italic leading-snug text-[color:var(--cahier-ink-soft)]">
          {frLine}
        </p>
      )}

      {empty ? (
        <p className="mt-3 text-sm font-bold text-[color:var(--cahier-ink)]">
          Nothing to check — you&rsquo;re ready.
        </p>
      ) : fold ? (
        <details className="mt-3 group">
          <summary className="cursor-pointer list-none text-sm font-bold text-[color:var(--cahier-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="underline-offset-2 group-open:hidden">{misses.length} to check</span>
            <span className="hidden group-open:inline">Hide list</span>
          </summary>
          <div className="mt-2">{chips}</div>
        </details>
      ) : (
        <div className="mt-3">{chips}</div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {empty ? (
          <button
            type="button"
            onClick={() => requestAction("continue")}
            className="fluo-btn fluo-btn-sm"
          >
            Continue
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => requestAction("show")}
              className="fluo-btn fluo-btn-sm"
            >
              Show in class
            </button>
            <button
              type="button"
              onClick={copyList}
              className="fluo-btn fluo-btn-ghost fluo-btn-sm"
            >
              {copied ? "Copied" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={() => requestAction("continue")}
              className="fluo-btn fluo-btn-ghost fluo-btn-sm"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {body}
      <SoftAuthModal open={softOpen} onDone={onSoftDone} />
      {showMode && (
        <div
          className="fixed inset-0 z-[85] flex flex-col bg-[color:var(--cahier-paper-raised)] px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label="Class bag — show in class"
        >
          <div className="mx-auto flex w-full max-w-lg flex-1 flex-col">
            <h2 className="fluo-serif text-2xl font-black text-[color:var(--cahier-ink)]">Class bag</h2>
            {canDoLine && (
              <p className="mt-2 text-base font-bold text-[color:var(--cahier-ink)]">
                You can: {canDoLine}
              </p>
            )}
            {frLine && (
              <p lang="fr" className="mt-0.5 text-base italic text-[color:var(--cahier-ink-soft)]">
                {frLine}
              </p>
            )}
            <div className="mt-6 flex-1 overflow-y-auto">{chips}</div>
            <button
              type="button"
              onClick={() => setShowMode(false)}
              className="fluo-btn fluo-btn-sm mt-4 self-center"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {/* Keep a quiet home escape for screen readers when Continue uses assign */}
      <span className="sr-only">
        <Link href={continueHref}>Continue</Link>
      </span>
    </>
  );
}

/* PracticeChips is gone with the "Post-Class Practice" tile it filled. It
 * derived its chips from deckActivityTabs so they could not drift from the
 * popup's own links — which is the same list the popup now draws directly, one
 * copy instead of two. Deriving both from one source was the right fix for
 * 2026-08-02; showing one of them is the right fix for the collapse.
 */
