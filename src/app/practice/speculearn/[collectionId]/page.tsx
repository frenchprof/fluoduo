import SpecuLearnContent from "./SpecuLearnContent";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";

export function generateStaticParams() {
  return SPECULEARN_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  // Soft-auth on Class bag Continue / save — never AuthGate mid-guess
  // (FINISH_BACKLOG item 3). Flip / games stay behind AuthGate.
  return <SpecuLearnContent collectionId={collectionId} />;
}
