import { CURATED } from "@/content/collections";
import AuthGate from "@/components/AuthGate";
import UnitActivityPage from "@/app/UnitActivityPage";
import LessonFlow from "@/app/lessons/LessonFlow";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return (
    <UnitActivityPage
      collectionId={collectionId}
      view="lesson"
      fallback={<AuthGate what="open the lesson"><LessonFlow collectionId={collectionId} /></AuthGate>}
    />
  );
}
