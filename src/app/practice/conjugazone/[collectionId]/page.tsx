import { CURATED } from "@/content/collections";
import ConjugaZoneContent from "./ConjugaZoneContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="practise"><ConjugaZoneContent collectionId={collectionId} /></AuthGate>;
}
