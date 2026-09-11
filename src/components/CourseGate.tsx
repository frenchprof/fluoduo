"use client";

/**
 * WHICH COURSE IS THIS ADDRESS? — decided once, for every page.
 *
 * Dan, 2026-09-11: *"do the wiring so f1 to f4 mean different courses"*. Four
 * addresses exist (f1.fluolingo.com is live; f2–f4 are his to add), and until
 * this file they were four doors into one room: nothing in the app read its
 * own hostname, so f2.fluolingo.com would have shown French 1 under a name
 * that said French 2.
 *
 * WHAT IT DOES. After mount it reads `window.location.hostname` and asks the
 * registry (`content/courses.ts`) which course that is:
 *
 *   f1.fluolingo.com        French 1, live     -> the app, as built
 *   fluoli.ngo, withdrchan  no course named    -> the app, as built (French 1
 *                                                 is the default course)
 *   f2 / f3 / f4            a course, not live -> THE CLOSED DOOR below, on
 *                                                 every route, instead of the
 *                                                 page
 *
 * The closed door is the only honest thing an address can show for a course
 * whose material is not written: the course's name and level, one line saying
 * it is not open, and the way to the course that is. Nothing of French 1
 * leaks onto an address that says French 2.
 *
 * DECIDED AFTER MOUNT, NOT DURING RENDER, for the same reason as
 * `TopLevelOnly`: this is a static export, one HTML file served to all five
 * addresses, so the prerender cannot know and the first client render must
 * match it. The page renders as built on the first pass and the gate swaps in
 * the door on the second — one tick, on hosts that have no learners yet.
 *
 * THE COURSE IS ALSO PUBLISHED ON <html data-course="f1">, so CSS can style
 * by it; a component that wants to name the course (the welcome page's tag)
 * calls `useCourse()`, which also says whether the ADDRESS named it — the tag
 * shows only then, so fluoli.ngo looks exactly as it did.
 */
import { useEffect, useState, type ReactNode } from "react";
import { courseFromHost, courseOrigin, COURSES, DEFAULT_COURSE, type Course } from "@/content/courses";

/** The course this page runs as, once known. `null` until mount — a static
 *  export cannot know its hostname during prerender, and every caller must
 *  render the same thing on the server and on the first client pass. */
export function useCourse(): { course: Course | null; named: boolean } {
  const [state, setState] = useState<{ course: Course | null; named: boolean }>({ course: null, named: false });
  useEffect(() => {
    const named = courseFromHost(window.location.hostname);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the hostname cannot be known during render on a static export, see above
    setState({ course: named ?? DEFAULT_COURSE, named: named !== null });
  }, []);
  return state;
}

export default function CourseGate({ children }: { children: ReactNode }) {
  const { course } = useCourse();
  useEffect(() => {
    if (course) document.documentElement.dataset.course = course.key;
  }, [course]);
  if (course && !course.live) return <ClosedCourse course={course} />;
  return <>{children}</>;
}

/** THE CLOSED DOOR. A page for an address whose course is not written yet.
 *  Dependency-light on purpose, like the 404: no progress read, no auth, no
 *  notebook chrome — it must render on a host that has nothing else. */
function ClosedCourse({ course }: { course: Course }) {
  const open = COURSES.filter((c) => c.live);
  const host = typeof window === "undefined" ? "" : window.location.host;
  const protocol = typeof window === "undefined" ? "https:" : window.location.protocol;
  return (
    <main
      data-course-closed={course.key}
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-6 text-center"
    >
      <p className="home-map-bob text-5xl" aria-hidden>
        🚧
      </p>
      <h1
        className="cahier-hand cahier-display text-3xl font-normal text-[color:var(--cahier-ink)]"
      >
        {course.name} · {course.level}
      </h1>
      <p className="cahier-body text-sm italic leading-relaxed text-[color:var(--fluo-ink-soft)]">
        <span lang="en">This course is not open yet.</span>
      </p>
      {/* Content-sized, never full width (the standing rule). One link per
          open course; today that is one. */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {open.map((c) => (
          <a key={c.key} href={courseOrigin(c, host, protocol)} className="fluo-btn">
            <span lang="en">Go to {c.name}</span> ›
          </a>
        ))}
      </div>
    </main>
  );
}
