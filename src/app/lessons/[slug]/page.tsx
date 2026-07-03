import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { LESSONS } from "@/content/lessons";

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
      <div className="flex h-screen flex-col">
        <div className="flex items-center justify-between border-b-2 border-[color:var(--fluo-line)] bg-[#fce8d4]/90 px-4 py-2 text-sm font-bold">
          <Link href="/" className="fluo-hl font-black">← FluoLingo</Link>
          <span lang="fr" className="text-[color:var(--fluo-ink-soft)]">{lesson.title}</span>
        </div>
        <iframe
          src={`/lessons/${lesson.file}`}
          title={lesson.title}
          className="w-full flex-1 border-0"
        />
      </div>
    </AuthGate>
  );
}
