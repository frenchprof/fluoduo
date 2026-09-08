/**
 * /practice/speculearn/goal/<SIO-041>/embed — the merged run, inside the cahier.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*.
 *
 * ONE RUNNER, MOUNTED TWICE. This was briefly a second runner of its own, which
 * is the mistake verify117 names in one line: *"two runners is how the app came
 * to have four of them under one name"*. `PretestFeed` had the judge, the
 * keyboard's way on, the bare-item rule and the recap already; it takes the
 * goal now, so this address and the pre-test's old one cannot drift.
 */
import { SIOS } from "@/content/sios";
import PretestFeed from "@/app/practice/speculearn/pretest/[id]/PretestFeed";

export function generateStaticParams() {
  return SIOS.map((s) => ({ sioId: s.id }));
}

export default async function Page({ params }: { params: Promise<{ sioId: string }> }) {
  const { sioId } = await params;
  return <PretestFeed sioId={sioId} />;
}
