import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import AuthGate from "@/components/AuthGate";
import NumBus from "@/games/numbus/NumBus";
import { getRoute, NUMBUS_ROUTES, type NumBusMode } from "@/games/numbus/lines";

export function generateStaticParams() {
  return NUMBUS_ROUTES.map((l) => ({ lineId: l.id }));
}

const MODE_WASH: Record<NumBusMode, string> = {
  bus: "linear-gradient(180deg,#cfe9fb 0%,#eaf6ff 45%,#f7fcff 100%)",
  time: "linear-gradient(180deg,#dbe3ec 0%,#eef3f8 45%,#f8fafc 100%)",
  price: "linear-gradient(180deg,#fff3e0 0%,#ffe0b2 45%,#fff8e1 100%)",
  phone: "linear-gradient(180deg,#eceff1 0%,#cfd8dc 45%,#f5f5f5 100%)",
};

export default async function NumBusLinePage({
  params,
}: {
  params: Promise<{ lineId: string }>;
}) {
  const { lineId } = await params;
  const route = getRoute(lineId);
  if (!route) notFound();

  return (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: MODE_WASH[route.mode] }}>
        <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
            <BackLink fallback="/games/numbus" className="text-[#c94070] hover:text-[#a92f5a]">
              ← Back
            </BackLink>
            <span className="flex items-center gap-2 text-slate-600">
              {route.emoji} {route.brand} <HelpDot />
            </span>
          </div>
        </div>
        <NumBus lineId={route.id} />
      </main>
    </AuthGate>
  );
}
