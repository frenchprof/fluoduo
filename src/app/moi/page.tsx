import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import MoiContent from "./MoiContent";

/** 📊 « Mes progrès » — the student's own learning data, shown back to them
 *  in friendly colourful tabs (Dan, 2026-07-23). */
export const metadata = { title: "My Progress — FluoLingo" };

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="moi" crumb="📊 My Progress">
      <div className="mx-auto max-w-2xl px-4 py-2">
        <MoiContent />
      </div>
    </CahierShell>
  );
}
