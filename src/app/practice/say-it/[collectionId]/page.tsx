import { CURATED } from "@/content/collections";
import SayItContent from "./SayItContent";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <SayItContent collectionId={collectionId} />;
}
