import CahierShell from "@/components/CahierShell";
import EmbedFrame from "@/components/EmbedFrame";

/** MémoiRecall over every deck the test reaches — the curated path's step 3.
 *  The cahier hosts it in a frame like every other station (7 Sep). */
export default function Page() {
  return (
    <CahierShell active="flip" band={false}>
      <EmbedFrame src="/practice/flip-it/revision/embed" title="MémoiRecall — revision" />
    </CahierShell>
  );
}
