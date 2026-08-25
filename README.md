# Anatomy of a Repetition

**See the work, not just the shape.**

A movement visualisation study from **Zee Palm Labs**.
Built by [Zee Palm](https://zeepalm.com).

The mark is a muscle belly drawn between its origin and its insertion — the one
idea the whole site is built on, at 16px.

A diagram shows you the shape of a lift. This shows you the **work** — which
muscles are firing, how hard, and at which inch of the range.

Pick a movement, watch a repetition loop, scrub to any point in it, and hover any
muscle to see what it does across the whole repetition rather than just right now.

> **Illustrative, not measured.** Activation values are hand-authored to match
> the shape of a repetition — they are not EMG data. Guidance for the curious, not
> medical, coaching or rehabilitation advice.

## What it does

- Six movements: **back squat, deadlift, push-up, pull-up, overhead press,
  split lunge**
- Thirteen muscle groups, each shaded live by how hard it is working
- **Contraction is geometry, not colour.** A working muscle's belly thickens and
  its ends draw together, because the activation value drives the path itself
- A **phase track** under the figure showing how the repetition divides into eccentric,
  bottom, concentric and lockout — click anywhere on it to jump there
- Hover or tap a muscle to get its **activation curve across the whole repetition**,
  with a playhead showing where you are
- Scrub the repetition by hand, or set the tempo anywhere from 1.2s to 9s
- Starts paused when the browser asks for reduced motion

### The pages

| Route | What it is |
| ----- | ---------- |
| `/` | The animated study, the six lifts at peak, and a way in to coverage |
| `/lifts/[id]` | One page per movement — the figure, what it trains, and how it ranks against the other five. Statically generated |
| `/coverage` | A session builder that names what your selection leaves alone, plus the full muscle × exercise matrix |
| `/method` | How the rig works, in diagrams |

Every page reads from the same activation curves, so the animation, the matrix
and the session builder can never disagree with one another.

## How it's built

No sprite sheets, no video, no per-frame artwork.

A **forward-kinematic rig** resolves joint positions from a handful of keyframed
angles, interpolated with a smoothstep. Every muscle is a path *derived from
those joints* — it hangs off a named bone segment and is rebuilt each frame — so
the anatomy and the movement cannot fall out of step. Change the pose and the
muscles follow for free.

Where a hand has to stay put — palms on the floor in a push-up, grip on the bar
in a pull-up — the arm is solved with **two-bone IK** against the contact point
rather than hand-authored. Guessing the exact elbow bend that lands a palm on
the floor is how figures end up hovering a few pixels above it.

Colour is not decoration. The activation ramp starts a shade above the body
colour, so a resting muscle sinks into the figure and only working muscle is
visible — on a light ground salience comes from saturation, not brightness. All
of it lives in `lib/palette.ts`.

Framing is solved once per exercise across the entire repetition, not per frame. A
squat is tall and narrow and a push-up is short and wide; each gets fitted to
the stage, and because the fit is computed over every frame at once the figure
never drifts or rescales mid-repetitionetition.

## What it isn't

Deliberately out of scope, so you know what you are and aren't getting:

- **Not EMG data.** The activation curves are authored to match the shape of a
  repetition. They are plausible, not measured, and no two bodies would agree anyway
- **Not a form check.** One idealised repetition, seen from one side. It cannot see
  what you are doing
- **Not per-side.** Muscles are drawn as groups; the left and right of the body
  always read the same value. In a split lunge the two legs really are doing
  different jobs, and this does not show that
- **Not a full anatomy.** Thirteen groups, chosen because they are the ones that
  change visibly between these six lifts
- **Not medical, coaching or rehabilitation advice.** If something hurts, this
  is not the tool for it

## Brand

The site runs **fully dark**. That is not a style preference: a working muscle is
meant to glow, and bloom is physically invisible on white — on a light ground a
muscle at 97% and one at 60% read almost the same. Dark is also on-brand, since
zeepalm.com ships its own dark palette (`--accent: #21B083`).

| Token | Value | Carries |
| ----- | ----- | ------- |
| Ground | `#070B12` | the page |
| Surface | `#0F1724` | every card |
| Brand | `#21B083` | Zee Palm and the interface — nav, controls, buttons |
| Data | `#384457 → #FF6C4A` | effort, and nothing else |

Brand colours live in `lib/ui.ts`, data colours in `lib/palette.ts`. Both themes
are still defined in `THEME.light` / `THEME.dark`, so the figure can be rendered
on either ground without touching its geometry.

The mark is a muscle belly between its origin and its insertion.

## Running it

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

```bash
npm run build      # production build
npm run test       # vitest — rig invariants
npm run lint       # eslint, flat config
npm run typecheck  # tsc --noEmit
```

## Tests

The geometry is the product, so it is the part under test. `lib/rig.test.ts`
asserts invariants rather than snapshots, and every case in it is a defect that
actually reached a screenshot:

- **No bone is ever stretched** — forward kinematics preserves segment lengths
- **No knee hyperextends** — the far-side depth offset used to push a straight
  knee past straight
- **Feet stay on the floor** for every foot-anchored lift, at every frame
- **Palms stay planted** through the whole push-up, and **both hands stay on the
  bar** through the whole pull-up
- **Two-bone IK** hits any reachable target exactly, and clamps rather than
  returning `NaN` when a target is out of reach
- **Activation stays in 0..1**, and every curve closes its loop so a repetition does not
  jump when it repeats
- **Declared prime movers really are** among the hardest-worked muscles of their
  own lift
- **Coverage takes the max, never the sum**, across selected lifts
- **No muscle path folds through itself** — the tangent-overshoot bound that
  caused hatched spikes at the tendons
- **Framing is finite and stable**, so the figure cannot drift mid-repetitionetition

Writing them found a real one: the IK clamped reach to 99.9% of full extension,
which left the pull-up grip up to 0.16 units off the bar at dead hang. `acos` is
already clamped, so the margin bought nothing — it is gone, and full extension
now resolves exactly.

## Accessibility

- Every muscle in the studio is a real control: focusable, operable with
  Enter/Space, labelled with its live value (`"Glutes, 93 percent"`)
- Thumbnails are marked decorative, so the six lift tiles add **no** tab stops
  rather than 78
- Visible `:focus-visible` rings, tuned for the dark studio as well as the light
  pages
- The phase readout is a polite live region
- Motion preference is read as an external store, and honoured globally

## Deploying

One environment variable, and only because canonical URLs and the social card
have to be absolute:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

There is an `.env.example` to copy. It is the only variable the project reads.

A bare host works — `zeepalm.com` becomes `https://zeepalm.com` — and paths and
trailing slashes are stripped. If it is empty or malformed the build falls back
to a placeholder rather than failing: `metadataBase` is constructed from this
value, and an invalid one throws during Next's config collection, which surfaces
as `Failed to collect configuration for /_not-found — TypeError: Invalid URL`
without naming the variable at fault.

Set it before the first deploy and every canonical link, the sitemap and the
Open Graph image follow from `lib/site.ts`. Everything is statically
prerendered — the six lift pages included — so there is nothing else to
configure.

Generated for you already: `/opengraph-image` (the 1200×630 card that renders
when the link is pasted), `/icon.svg`, `/sitemap.xml` and `/robots.txt`.

## Layout

| Path | What lives there |
| ---- | ---------------- |
| `lib/anatomy.ts` | The rig — segment lengths, forward kinematics, two-bone IK |
| `lib/muscles.ts` | Muscle definitions, path generation, the activation colour ramp |
| `lib/exercises.ts` | The six movements: pose keyframes, activation curves, phases |
| `lib/palette.ts` | Every colour the figure uses — body, ramp, equipment, accent |
| `lib/analysis.ts` | Peak activation and peak-moment search over the curves |
| `components/Figure.tsx` | Framing, anchoring, and the SVG itself |
| `components/ActivationPanel.tsx` | The live readout and per-muscle repetition curve |
| `components/SmallMultiples.tsx` | The six lifts, each frozen at its peak |
| `components/CoverageMatrix.tsx` | The muscle × exercise heatmap |
| `components/PhaseTrack.tsx` | The repetition timeline under the figure |
| `components/RepStudio.tsx` | The interactive stage, shared by `/` and every lift page |
| `components/SessionBuilder.tsx` | Combined coverage and gap-finding |
| `components/MethodDiagrams.tsx` | The four inline SVG diagrams on `/method` |

## Licence

MIT.
# zeepalm-anatomy-of-a-repetition
