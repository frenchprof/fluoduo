import { PRETESTS } from "@/content/pretests";
import PretestContent from "./PretestContent";
import AuthGate from "@/components/AuthGate";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuthGate what="take the pre-test"><PretestContent id={id} /></AuthGate>;
}
