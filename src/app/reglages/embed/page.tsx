/**
 * /reglages/embed — Settings, running inside the cahier the User page draws
 * (the `/profil/embed` pattern, 2026-09-07). The body is `SettingsContent`, so
 * this and the standalone route cannot drift.
 */
import CahierShell from "@/components/CahierShell";
import SettingsContent from "../SettingsContent";

export const metadata = { title: "Settings — FluOLinGo" };

export default function Page() {
  return (
    <CahierShell active="reglages">
      <SettingsContent />
    </CahierShell>
  );
}
