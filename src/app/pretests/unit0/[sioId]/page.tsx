/**
 * /pretests/unit0/SIO-00N — THE OLD ADDRESS, kept alive as a forward.
 *
 * WHAT THIS PAGE USED TO BE, and why it is not that any more. Dan asked on
 * 2026-08-31 for *"each pre-test to now have its own page rather just a pop
 * up"*, and Unit 0's ten banks were the exception that needed one built by
 * hand: they are a different shape from the authored pre-tests of units 1–4,
 * so a page was written that mounted the popup's components. It stacked every
 * question of a bank down one scroll — measured at 2602px on an 844px phone,
 * three screens of questions — and it was a beginner's FIRST contact with the
 * app.
 *
 * WHAT REPLACED IT. `speculearnPool` (2026-09-07, Dan: *"they CAN be and MUST
 * NOW BE MERGED AS ONE!"*) folds a goal's unit-0 bank into the same pool as
 * its authored and generated questions, and `PretestFeed` runs that pool one
 * question per screen with the magnet stopping on each. Driven before this
 * change, all ten stops already served their questions that way:
 *
 *     SIO-001 10   SIO-002 13   SIO-003  8   SIO-004 12   SIO-005 24
 *     SIO-006 25   SIO-007 19   SIO-008 19   SIO-009 10   SIO-010 22
 *
 * NOTHING IS LOST IN THE FORWARD, and that is a measurement rather than a
 * hope. `speculearnPool` drops `multi` questions — graded on the exact SET of
 * picks, which is not multiple choice — and Unit 0 no longer has one: Dan
 * rewrote SIO-010's three himself on 2026-09-08, and `multi: true` now appears
 * zero times in unit0-questions.ts.
 *
 * SO WHY KEEP THE ROUTE AT ALL. Every surface in the app already pointed past
 * it — `unit0PretestHref()` has returned the merged run since the merge, so
 * the stop popup and the unit list never draw this address. What still names
 * it is paper: the stop ids are frozen precisely because a QR sheet does not
 * get re-issued. An old link lands on the run, not on a 404.
 */
import { notFound } from "next/navigation";
import { SIOS, getSio } from "@/content/sios";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { speculearnHref } from "@/lib/speculearn/route";
import Forward from "@/components/Forward";

/** The Unit-0 stops that actually have a bank. Derived, never a list: a stop
 *  that gains or loses questions changes what builds, with nothing to update. */
export function generateStaticParams() {
  return SIOS.filter((s) => s.unit === 0 && (UNIT0_QUESTIONS[s.id] ?? []).length > 0)
    .map((s) => ({ sioId: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ sioId: string }> }) {
  const { sioId } = await params;
  const sio = getSio(sioId);
  return { title: sio ? `Pre-test · ${sio.topic}` : "Pre-test" };
}

export default async function Page({ params }: { params: Promise<{ sioId: string }> }) {
  const { sioId } = await params;
  const sio = getSio(sioId);
  if (!sio || sio.unit !== 0 || (UNIT0_QUESTIONS[sioId] ?? []).length === 0) notFound();
  return <Forward to={speculearnHref(sioId)} />;
}
