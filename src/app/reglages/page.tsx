import UserTabRedirect from "@/components/UserTabRedirect";

/** /reglages — the Settings tab of the one User page since 2026-09-11.
 *  Forwards there; the settings themselves are /reglages/embed. */
export const metadata = { title: "Settings — FluOLinGo" };

export default function Page() {
  return <UserTabRedirect tab="settings" />;
}
