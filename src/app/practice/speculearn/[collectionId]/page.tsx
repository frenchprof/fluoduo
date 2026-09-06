import SpecuLearnContent from "./SpecuLearnContent";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";

export function generateStaticParams() {
  return SPECULEARN_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  // Never AuthGate mid-guess — browsing and guessing need no sign-in.
  // (FINISH_BACKLOG item 3). Flip / games stay behind AuthGate.
  return <SpecuLearnContent collectionId={collectionId} />;
}
