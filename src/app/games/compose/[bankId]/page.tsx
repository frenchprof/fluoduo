import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import SoundControl from "@/components/SoundControl";
import AuthGate from "@/components/AuthGate";
import ComposeGame from "@/games/compose/ComposeGame";
import { getComposeBank, listComposeBanks } from "@/games/compose/banks";
import GameBar from "@/components/GameBar";

export function generateStaticParams() {
  return listComposeBanks().map((b) => ({ bankId: b.id }));
}

/** Per-bank full-bleed theme: street-ish light for directions, warm bistro for the café. */
const THEMES: Record<string, { bg: string; bar: string; crumb: string }> = {
  directions: {
    bg: "linear-gradient(180deg,#e8ecf1 0%,#f4f6f8 55%,#ffffff 100%)",
    bar: "text-slate-600 hover:text-slate-900",
    crumb: "text-slate-800/60",
  },
  cafe: {
    bg: "linear-gradient(180deg,#fff3e0,#ffe0c2)",
    bar: "text-[#b96f2e] hover:text-[#8a4f1d]",
    crumb: "text-[#4a2c14]/60",
  },
};

export default async function ComposePage({
  params,
}: {
  params: Promise<{ bankId: string }>;
}) {
  const { bankId } = await params;
  const bank = getComposeBank(bankId);
  if (!bank) notFound();
  const theme = THEMES[bank.id] ?? THEMES.directions;

  return (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: theme.bg }}>
        <GameBar title={`${bank.emoji} ${bank.title}`} up="/games/compose" />
        <ComposeGame bankId={bank.id} />
      </main>
    </AuthGate>
  );
}
