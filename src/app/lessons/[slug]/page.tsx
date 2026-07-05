import AuthGate from "@/components/AuthGate";
import { LESSONS, deckForLesson } from "@/content/lessons";
import UnitActivityPage from "@/app/UnitActivityPage";
import LessonFlow from "@/app/lessons/LessonFlow";
import NativeLessonView from "../NativeLessonView";

export function generateStaticParams() {
  return Object.keys(LESSONS).map((slug) => ({ slug }));
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) {
    return <main className="p-6 text-[color:var(--fluo-ink)]">No lesson <code>{slug}</code>.</main>;
  }
  const deckId = deckForLesson(slug);
  if (!deckId) {
    // Cross-unit revisions have no single deck home — standalone memo + trainers.
    return (
      <AuthGate what="open the lesson">
        <NativeLessonView slug={slug} title={lesson.title} unit={lesson.unit} />
      </AuthGate>
    );
  }
  // Deck lessons render as the unified Lesson flow of their deck (2026-07-05).
  return (
    <UnitActivityPage
      collectionId={deckId}
      view="lesson"
      fallback={<AuthGate what="open the lesson"><LessonFlow collectionId={deckId} /></AuthGate>}
    />
  );
}
