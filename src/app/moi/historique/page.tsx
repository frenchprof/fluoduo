import UserTabRedirect from "@/components/UserTabRedirect";

/** /moi/historique — the History tab of the one User page since 2026-09-11.
 *  Forwards there; the list itself is /moi/historique/embed. */
export const metadata = { title: "My History — FluOLinGo" };

export default function Page() {
  return <UserTabRedirect tab="history" />;
}
