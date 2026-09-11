/**
 * /practice/ecoutexte/<deck>/embed — the lesson's listening, inside the cahier.
 *
 * A server page, so the static export knows the fifty-odd addresses to build;
 * the listening itself is a client component beside it. `"use client"` and
 * `generateStaticParams` cannot live in the same file, and reading the deck
 * from `useParams` instead would leave this route unbuilt.
 */
import { CURATED } from "@/content/collections";
import LessonListening from "../LessonListening";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <LessonListening collectionId={collectionId} />;
}
