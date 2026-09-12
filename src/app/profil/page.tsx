import UserPage from "./UserPage";

/** The 👤 User page — Me · Board · History · Settings in one page with four
 *  tabs (Dan, 2026-09-11). See UserPage for why the four became one. */
export const metadata = { title: "My Profile — FluOLinGo" };

export default function Page() {
  return <UserPage />;
}
