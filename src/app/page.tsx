import WelcomeBody from "./welcome/WelcomeBody";

/**
 * `/` — the welcome page. The first thing anyone sees.
 *
 * Dan, 2026-09-09: *"whether it is welcome or not, the first i see must be the
 * one with Welcome to FluOLinGo in the horizon"*, and, asked directly whether
 * that should greet him on every visit or only before he has started: **every
 * time**. So this is not a first-run gate — the root IS this page, and the
 * learner steps through the ENTER coin to their Home at `/home`.
 *
 * IT USED TO BE `/welcome`, ON PURPOSE, and the page it replaced said so in
 * this spot: *"Making it the front door moves every learner's Home one click
 * further away and changes the first screen of the app for everybody; Dan has
 * asked to be consulted before decisions of that shape."* He was consulted,
 * shown what it costs — one extra tap before your goal, on every single visit
 * — and chose it anyway. Recorded here so the next session reads a decision
 * rather than an accident.
 *
 * THE HALF THAT IS NOT ONE LINE. A bare link to the root meant "Home" in
 * fifteen places across the app — the wordmark, the 🏠 button, "← Back to the
 * path", the deck pages' "Home", the 404's button, the guide's Continue —
 * plus one router push. Every one of them names `/home` now. The ENTER coin on
 * this very page pointed at the root too, which would have bounced a learner
 * straight back here: the front door returning you to itself is the one way
 * this change can fail, and it fails silently, because every link still
 * resolves.
 *
 * No CahierShell: the notebook frame, the site bar and the bottom bar are the
 * app's furniture, and this page is the door in front of it.
 */
export const metadata = {
  title: "FluOLinGo — Fluency On Linguistic Goals",
  description: "Fluency On Linguistic Goals — fifty goals, one road. Start your journey.",
};

export default function RootWelcomePage() {
  return <WelcomeBody />;
}
