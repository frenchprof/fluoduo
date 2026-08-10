import { CURATED } from "@/content/collections";
import CompleteItContent from "./CompleteItContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

// The drill, full-screen in DrillShell (patch 20–21). This route used to
// render the whole unit map with a resizable popup on top — 36–44% of a
// phone spent before the first question.
export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <AuthGate what="practise">
      <CompleteItContent collectionId={collectionId} />
    </AuthGate>
  );
}
