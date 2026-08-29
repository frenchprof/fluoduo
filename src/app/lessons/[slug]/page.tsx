import AuthGate from "@/components/AuthGate";
import { LESSONS, deckForLesson } from "@/content/lessons";
import LessonPager from "@/app/lessons/pager/LessonPager";

export function generateStaticParams() {
  return Object.keys(LESSONS).map((slug) => ({ slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) {
    return <main className="p-6 text-[color:var(--fluo-ink)]">No lesson <code>{slug}</code>.</main>;
  }
  // Patch 22: every lesson is the full-screen card pager — deck lessons draw
  // from both supplies, the deckless revisions ride the generator alone.
  const deckId = deckForLesson(slug);
  return (
    <AuthGate what="open the lesson">
      <LessonPager collectionId={deckId ?? undefined} lessonSlug={slug} />
    </AuthGate>
  );
}
