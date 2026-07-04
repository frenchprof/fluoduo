import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { UNIT_META } from "@/content/sios";
import UnitSection from "../../UnitSection";

export function generateStaticParams() {
  return ["0", "1", "2", "3", "4"].map((unit) => ({ unit }));
}

export default async function UnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  const u = Number(unit);
  const key = `unit-${u}`;
  return (
    <CahierShell
      tabs={tabsWithActive(siteTabs(), key)}
      active={key}
      crumb={`${UNIT_META[u]?.emoji ?? ""} ${UNIT_META[u]?.label ?? `Unité ${u}`}`}
    >
      <div className="mx-auto max-w-3xl px-1 py-2">
        <UnitSection unit={u} />
      </div>
    </CahierShell>
  );
}
