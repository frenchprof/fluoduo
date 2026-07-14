import DevineContent from "./DevineContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  // Only the aliments deck has Devine data today; add ids here as more
  // photo banks are authored.
  return [{ collectionId: "aliments" }];
}

export default async function Page({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  return <AuthGate what="play Devine d'abord"><DevineContent collectionId={collectionId} /></AuthGate>;
}
