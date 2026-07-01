import { CURATED } from "@/content/collections";
import Content from "./Content";

export function generateStaticParams() {
  return CURATED.map((c) => ({ id: c.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Content id={id} />;
}
