import type { Metadata } from "next";
import Eyebrow from "@/components/Eyebrow";
import {
  RigDiagram,
  MuscleDiagram,
  IkDiagram,
  FramingDiagram,
} from "@/components/MethodDiagrams";
import { CARD } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How the figure is built: a forward-kinematic rig, muscles derived from joints, two-bone IK for planted hands, and where the numbers come from.",
  alternates: { canonical: "/method" },
};

const SECTIONS = [
  {
    n: "01",
    h: "A rig, not a flipbook",
    p: "Five poses are authored per movement. Everything between them is computed, so you can stop anywhere in the repetition and get a pose that holds together.",
    D: RigDiagram,
  },
  {
    n: "02",
    h: "Muscles hang off bones",
    p: "Each muscle is a path derived from the bone it spans — offset along the normal, shaped by a profile. Contraction thickens the belly and pulls the ends in, because activation drives the geometry itself.",
    D: MuscleDiagram,
  },
  {
    n: "03",
    h: "Contact points are solved",
    p: "A planted palm is solved with two-bone IK, not hand-authored. Both elbow positions reach the floor; the rig picks the one a body would use.",
    D: IkDiagram,
  },
  {
    n: "04",
    h: "Framing is per movement",
    p: "A squat is tall and narrow, a push-up short and wide. Each is fitted to the stage using every frame of its own repetition, so nothing drifts or rescales mid-motion.",
    D: FramingDiagram,
  },
];

export default function MethodPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1560px] px-5 pt-10 sm:px-8 xl:px-12 lg:pt-16">
      <header className="mb-12">
        <Eyebrow>Method</Eyebrow>
        <h1 className="font-display max-w-[16ch] text-[42px] font-normal leading-[1.02] tracking-[-0.02em] text-slate-50 sm:text-[58px]">
          How the figure is built
        </h1>
        <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.65] text-slate-500 sm:text-[18px]">
          Nothing here is a drawing of a body. It is a rig, with anatomy derived from
          it — which is why the movement and the muscles stay honest to each other.
        </p>
      </header>

      <div className="mb-14 grid gap-4 md:grid-cols-2">
        {SECTIONS.map(({ n, h, p, D }) => (
          <section key={n} className={`${CARD} overflow-hidden`}>
            <div className="border-b border-white/[0.06] bg-white/[0.03] px-5 pb-2 pt-5">
              <D />
            </div>
            <div className="p-6">
              <Eyebrow n={n}>Method</Eyebrow>
              <h2 className="font-display text-[20px] leading-snug text-slate-50">{h}</h2>
              <p className="mt-2.5 max-w-[52ch] text-[15px] leading-[1.65] text-slate-500">
                {p}
              </p>
            </div>
          </section>
        ))}
      </div>

      <section className="mb-10 rounded-2xl border border-data-lit/20 bg-data-lit/[0.035] p-6 sm:p-8">
        <Eyebrow>Where the numbers come from</Eyebrow>
        <p className="max-w-[70ch] text-[16px] leading-[1.68] text-slate-300">
          The activation curves are hand-authored to match the shape of a repetition. Not
          EMG, not measured off a body, and no two bodies would agree anyway. They
          feed the animation and the coverage matrix from one source — so the site
          can never contradict itself, but it can be wrong in the same direction
          everywhere.
        </p>
        <p className="mt-3 max-w-[70ch] text-[16px] leading-[1.68] text-slate-500">
          Treat the shapes as the argument and the numbers as illustration.
        </p>
      </section>
    </main>
  );
}
