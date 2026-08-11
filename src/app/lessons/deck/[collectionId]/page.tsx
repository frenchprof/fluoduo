import { CURATED } from "@/content/collections";
import AuthGate from "@/components/AuthGate";
import LessonPager from "@/app/lessons/pager/LessonPager";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  // Patch 22: the lesson is the full-screen card pager, not a popup on the
  // unit map.
  return (
    <AuthGate what="open the lesson">
      <LessonPager collectionId={collectionId} />
    </AuthGate>
  );
}
