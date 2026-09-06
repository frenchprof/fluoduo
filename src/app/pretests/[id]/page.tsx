import { PRETESTS } from "@/content/pretests";
import PretestContent from "./PretestContent";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Never AuthGate mid-guess — browsing and guessing need no sign-in.
  // (FINISH_BACKLOG item 3 / docs/CLASS_BAG.md).
  return <PretestContent id={id} />;
}
