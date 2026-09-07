import { notFound } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import ComposeGame from "@/games/compose/ComposeGame";
import GameLanding from "@/components/GameLanding";
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
      {/* Wrapped for the same reason as Match It, the same day — see that file.
          ComposeIt opened on a white game bar with nothing on it but ✕ 🔊 ⛶ ⋯,
          no strip and no name. ⛶ still takes the board full-screen. */}
      <GameLanding activityKey="compose" bleed>
        <ComposeGame bankId={bank.id} />
      </GameLanding>
    </AuthGate>
  );
}
