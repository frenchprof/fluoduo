import WelcomeBody from "./WelcomeBody";

/**
 * /welcome — the pre-home landing page (Dan, 8 Sep).
 *
 * IT IS NOT `/`, AND THAT IS ON PURPOSE. Making it the front door moves every
 * learner's Home one click further away and changes the first screen of the
 * app for everybody; Dan has asked to be consulted before decisions of that
 * shape, and he asked to keep pages apart on their own URLs. So it ships as a
 * page he can look at, and promoting it to `/` is one line when he says so.
 *
 * No CahierShell: the notebook frame, the site bar and the bottom bar are the
 * app's furniture, and this page is the door in front of it.
 */
export const metadata = {
  title: "Welcome — FluOLinGo",
  description: "Fluency On Linguistic Goals — fifty goals, one road. Start your journey.",
};

export default function WelcomePage() {
  return <WelcomeBody />;
}
