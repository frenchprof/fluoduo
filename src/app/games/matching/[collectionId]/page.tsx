import { CURATED } from "@/content/collections";
import MatchingContent from "./MatchingContent";

export function generateStaticParams() {
  return CURATED.filter((c) => (c.gameConfig?.matching?.pairs?.length ?? 0) > 0).map((c) => ({
    collectionId: c.id,
  }));
}

export default async function MatchingPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = await params;
  return <MatchingContent collectionId={collectionId} />;
}
