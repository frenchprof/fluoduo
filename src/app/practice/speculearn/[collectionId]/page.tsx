import SpecuLearnContent from "./SpecuLearnContent";
import AuthGate from "@/components/AuthGate";
import { SPECULEARN_READY } from "@/lib/collections/speculearnReady";

export function generateStaticParams() {
  return SPECULEARN_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="play SpecuLearn"><SpecuLearnContent collectionId={collectionId} /></AuthGate>;
}
