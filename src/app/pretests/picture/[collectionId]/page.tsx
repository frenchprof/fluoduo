import { CURATED } from "@/content/collections";
import PicturePretestContent from "./PicturePretestContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return CURATED.map((c) => ({ collectionId: c.id }));
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="take the pre-test"><PicturePretestContent collectionId={collectionId} /></AuthGate>;
}
