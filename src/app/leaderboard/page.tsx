import UserTabRedirect from "@/components/UserTabRedirect";

/** /leaderboard — the Board tab of the one User page since 2026-09-11.
 *  Forwards there; the board itself is /leaderboard/embed. */
export const metadata = { title: "Board — FluOLinGo" };

export default function Page() {
  return <UserTabRedirect tab="board" />;
}
