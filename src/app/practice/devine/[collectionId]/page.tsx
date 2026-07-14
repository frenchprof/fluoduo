import DevineContent from "./DevineContent";
import AuthGate from "@/components/AuthGate";
import { DEVINE_READY } from "@/lib/collections/devineReady";

export function generateStaticParams() {
  return DEVINE_READY.map((collectionId) => ({ collectionId }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="play Devine d'abord"><DevineContent collectionId={collectionId} /></AuthGate>;
}
