import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import AuthGate from "@/components/AuthGate";
import NumBus from "@/games/numbus/NumBus";
import { getLine, NUMBUS_LINES } from "@/games/numbus/lines";

export function generateStaticParams() {
  return NUMBUS_LINES.map((l) => ({ lineId: l.id }));
}

const BACKDROP_WASH: Record<string, string> = {
  jour: "linear-gradient(180deg,#cfe9fb 0%,#eaf6ff 45%,#f7fcff 100%)",
  crepuscule: "linear-gradient(180deg,#e9d3dd 0%,#f9e7d6 45%,#fdf6ee 100%)",
  gare: "linear-gradient(180deg,#dbe3ec 0%,#eef3f8 45%,#f8fafc 100%)",
  nuit: "linear-gradient(180deg,#c7ccdf 0%,#e4e7f2 45%,#f5f6fa 100%)",
};

export default async function NumBusLinePage({
  params,
}: {
  params: Promise<{ lineId: string }>;
}) {
  const { lineId } = await params;
  const line = getLine(lineId);
  if (!line) notFound();

  return (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: BACKDROP_WASH[line.backdrop] }}>
        <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
            <BackLink fallback="/games/numbus" className="text-[#c94070] hover:text-[#a92f5a]">
              ← Back
            </BackLink>
            <span className="flex items-center gap-2 text-slate-600">
              🚌 {line.place} <HelpDot />
            </span>
          </div>
        </div>
        <NumBus lineId={line.id} />
      </main>
    </AuthGate>
  );
}
