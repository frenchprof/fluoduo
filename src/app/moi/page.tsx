import UserTabRedirect from "@/components/UserTabRedirect";

/** /moi — the same page as /profil since the 2026-08-22 merge, and since
 *  2026-09-11 the Me tab of the one User page. Forwards there. */
export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return <UserTabRedirect tab="me" />;
}
