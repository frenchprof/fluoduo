/**
 * THE ADDRESSES THAT MOVED, IN ONE PLACE.
 *
 * On 2026-09-09 the welcome page took the root and Home moved to `/home`
 * (#255). That is one line in the router and a long tail everywhere else: a
 * bare link to `/` had meant "Home" since the app was built, and every one of
 * those links kept resolving afterwards — to the front door.
 *
 * The sweep that came with the move caught the EXPLICIT links: the wordmark,
 * the 🏠 button, « ← Back to the path », the deck pages' Home, the 404's
 * button, the guide's Continue. Its own note says fifteen of them.
 *
 * IT MISSED THE DEFAULTS, and defaults are where this hides. Nobody writes
 * `href="/"` in `exitHref = "/"` or `next?.href ?? "/"`; they write a fallback
 * once, years earlier, and it is correct until the day the root changes
 * meaning. Seventeen of them survived, and the symptom reached Dan as
 * 2026-09-11: *"Closing each of the pages is not supposed to jump to the Enter
 * page."* The ✕ on every page is `PageBand`'s `exitHref`, and its default was
 * `/`.
 *
 * So the address lives here once. A move like the last one is now this file
 * plus whatever genuinely means the door, and `verify172-home-href.py` fails
 * the build if a bare `/` is used as a Home link or default again.
 *
 * WHAT IS NOT HERE: the door itself. `/` is the welcome page, and the two
 * places that mean it — the root route and `/welcome`'s forward — say `/`
 * literally, because they are the thing rather than a reference to it.
 */

/** Home — the learner's own page, behind the ENTER coin. */
export const HOME_HREF = "/home";
