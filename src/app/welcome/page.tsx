import WelcomeRedirect from "./WelcomeRedirect";

/** /welcome — retired as an address on 2026-09-09; the page it held is now
 *  the root. See WelcomeRedirect for why the URL survives as a forward. */
export const metadata = {
  title: "Welcome — FluOLinGo",
  description: "Fluency On Linguistic Goals — fifty goals, one road. Start your journey.",
};

export default function WelcomePage() {
  return <WelcomeRedirect />;
}
