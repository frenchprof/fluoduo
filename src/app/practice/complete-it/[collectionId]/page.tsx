import { CURATED } from "@/content/collections";
import CompleteItContent from "./CompleteItContent";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <CompleteItContent collectionId={collectionId} />;
}
