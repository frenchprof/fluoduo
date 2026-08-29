import ActivityLanding from "@/components/ActivityLanding";

/** /practice/flip-it — 4Mémoire's own landing: every stop that has it, in course
 *  order, one unit open at a time. It used to bounce into the Index, which Dan
 *  retired on 2026-08-29 ("we shouldn't have to land on the index page at
 *  all"). The map stays the front door for choosing a STOP; this is the door
 *  for someone who has already chosen the ACTIVITY. */
export default function Page() {
  return <ActivityLanding activityKey="flip" />;
}
