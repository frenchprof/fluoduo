import AuthGate from "@/components/AuthGate";
import { LESSONS } from "@/content/lessons";
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
  return (
    <AuthGate what="open the lesson">
      <NativeLessonView slug={slug} title={lesson.title} unit={lesson.unit} />
    </AuthGate>
  );
}
