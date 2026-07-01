import { PRETESTS } from "@/content/pretests";
import PretestContent from "./PretestContent";

export function generateStaticParams() {
  return PRETESTS.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PretestContent id={id} />;
}
