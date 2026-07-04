import { CURATED } from "@/content/collections";
import PracticeContent from "./PracticeContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="practise"><PracticeContent collectionId={collectionId} /></AuthGate>;
}
