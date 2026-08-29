import { notFound } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import ComposeGame from "@/games/compose/ComposeGame";
import { getComposeBank, listComposeBanks } from "@/games/compose/banks";

export function generateStaticParams() {
  return listComposeBanks().map((b) => ({ bankId: b.id }));
}

// Both engines (solo, dialogue) wear their own GameFrame (patch 23); the page
// adds only the sign-in wall.
export default async function ComposePage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const bank = getComposeBank(bankId);
  if (!bank) notFound();

  return (
    <AuthGate what="play">
      <ComposeGame bankId={bank.id} />
    </AuthGate>
  );
}
