import { CURATED } from "@/content/collections";
import GramMarathonContent from "./GramMarathonContent";
import AuthGate from "@/components/AuthGate";
import UnitActivityPage from "@/app/UnitActivityPage";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <UnitActivityPage
      collectionId={collectionId}
      view="grammarathon"
      fallback={<AuthGate what="practise"><GramMarathonContent collectionId={collectionId} /></AuthGate>}
    />
  );
}
