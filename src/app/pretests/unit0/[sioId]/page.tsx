/**
 * /pretests/unit0/SIO-00N — a Unit-0 pre-test as its own page.
 *
 * Dan, 2026-08-31: *"what i want is for each pre-test to now have its own page
 * rather just a pop up"*.
 *
 * Units 1-4 already had pages: their pre-tests are authored `Pretest` objects
 * served by /pretests/[id]. Unit 0's ten were the exception — they are MCQ
 * banks of a different shape (multi-answer picks, a highlighted phrase,
 * SIO-010's three audiences), and they rendered only inside the SIO popup.
 * Measured before building this: **all ten**, SIO-010 included, and not one of
 * them resolves through `getPretestForSio`.
 *
 * That is why this route exists rather than a conversion. Reshaping ten
 * authored banks into the gapfill schema would have thrown away exactly the
 * things Dan asked for in them — "which of these ARE appropriate" takes several
 * answers, "around 7pm" wears a highlighter, SIO-010 picks an audience first.
 * The page mounts the same components the popup mounts; nothing about the
 * questions changes.
 *
 * It also unblocks the popup collapse: the popup can only become a statement
 * and a list of links once every link has somewhere to go, and these ten were
 * the last surfaces with nowhere.
 */
import { notFound } from "next/navigation";
import { SIOS, getSio } from "@/content/sios";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import Unit0PretestPage from "./Content";

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
  // Soft-auth on Class bag Continue / save — never AuthGate mid-guess.
  return <Unit0PretestPage sioId={sioId} />;
}
