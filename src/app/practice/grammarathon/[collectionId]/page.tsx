import { CURATED } from "@/content/collections";
import GramMarathonContent from "./GramMarathonContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

// The drill, full-screen in DrillShell (patch 20–21). This route used to
// render the whole unit map with a resizable popup on top.
export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <AuthGate what="practise">
      <GramMarathonContent collectionId={collectionId} />
    </AuthGate>
  );
}
