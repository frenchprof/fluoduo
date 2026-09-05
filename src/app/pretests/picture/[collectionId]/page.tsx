import { CURATED } from "@/content/collections";
import PicturePretestContent from "./PicturePretestContent";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  // Soft-auth on Class bag Continue / save — never AuthGate mid-guess.
  return <PicturePretestContent collectionId={collectionId} />;
}
