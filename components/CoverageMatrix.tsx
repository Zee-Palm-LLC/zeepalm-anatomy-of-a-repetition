"use client";

import { Fragment, memo, useState } from "react";
import { EXERCISES } from "@/lib/exercises";
import { activationColor, GROUP_LABEL, MUSCLES, type MuscleGroup } from "@/lib/muscles";
import { buildMatrix, bestLiftFor } from "@/lib/analysis";
import { GROUP_COLOR_DARK as GROUP_COLOR } from "@/lib/palette";

const GROUPS: MuscleGroup[] = ["posterior", "anterior", "upper"];
const ROWS = buildMatrix();

function CoverageMatrix() {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  const rowsFor = (g: MuscleGroup) =>
    ROWS.map((row, i) => ({ row, i })).filter(
      ({ i }) => MUSCLES[i].group === g,
    );

  const active = hover ? ROWS[hover.r] : null;
  const activeEx = hover ? EXERCISES[hover.c] : null;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-[150px]" />
              {EXERCISES.map((ex, c) => (
                <th key={ex.id} className="px-1 pb-3 align-bottom">
                  <div
                    className={`font-display text-[14px] leading-tight transition-colors ${
                      hover?.c === c ? "text-data-lit" : "text-slate-300"
                    }`}
                  >
                    {ex.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => (
              <Fragment key={g}>
                <tr>
                  <td
                    colSpan={EXERCISES.length + 1}
                    className="pb-1.5 pt-4 font-mono text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: GROUP_COLOR[g] }}
                  >
                    <span
                      className="mr-1.5 inline-block h-[5px] w-[5px] rounded-full align-middle"
                      style={{ backgroundColor: GROUP_COLOR[g] }}
                    />
                    {GROUP_LABEL[g]}
                  </td>
                </tr>
                {rowsFor(g).map(({ row, i }) => (
                  <tr key={row.id}>
                    <td
                      className={`py-[3px] pr-3 text-right text-[13px] transition-colors ${
                        hover?.r === i ? "text-slate-50" : "text-slate-500"
                      }`}
                    >
                      {row.label}
                    </td>
                    {row.peaks.map((v, c) => (
                      <td key={c} className="px-[3px] py-[3px]">
                        <div
                          onMouseEnter={() => setHover({ r: i, c })}
                          onMouseLeave={() => setHover(null)}
                          className="relative h-[26px] w-full cursor-default rounded-[5px] transition-transform duration-200"
                          style={{
                            backgroundColor: activationColor(v),
                            transform:
                              hover?.r === i && hover?.c === c ? "scale(1.12)" : undefined,
                            boxShadow:
                              hover?.r === i && hover?.c === c
                                ? "0 4px 14px -4px rgba(15,23,42,0.4)"
                                : undefined,
                          }}
                        >
                          <span
                            className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tabular-nums"
                            style={{ color: v > 0.5 ? "#FFF1EC" : "#93A1B5" }}
                          >
                            {Math.round(v * 100)}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 min-h-[42px] rounded-lg border border-white/[0.07] bg-white/[0.035] px-4 py-2.5 text-[14px] text-slate-500">
        {active && activeEx ? (
          <>
            <span className="text-slate-50">{active.label}</span> peaks at{" "}
            <span className="font-mono text-data-lit">
              {Math.round(ROWS[hover!.r].peaks[hover!.c] * 100)}
            </span>{" "}
            during the {activeEx.name.toLowerCase()}. Hardest across all six:{" "}
            <span className="text-slate-50">{bestLiftFor(active).name}</span> at{" "}
            <span className="font-mono">
              {Math.round(bestLiftFor(active).value * 100)}
            </span>
            .
          </>
        ) : (
          <>Hover any cell. Rows are muscles, columns are lifts, and each square is that muscle&apos;s hardest moment in the repetition.</>
        )}
      </div>
    </div>
  );
}

export default memo(CoverageMatrix);
