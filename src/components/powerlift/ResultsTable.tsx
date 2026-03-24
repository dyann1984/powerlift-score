"use client";

import React, { useMemo } from "react";
import { Athlete, LiftType, useMeetStore } from "../../store/useMeetStore";

function getBestLift(athlete: Athlete, lift: LiftType) {
  return athlete[lift]
    .filter((a) => a.status === "valid")
    .reduce((max, a) => Math.max(max, a.weight || 0), 0);
}

function medalByRank(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

function rankCardStyle(rank: number) {
  if (rank === 1) {
    return "border-yellow-300/50 bg-[linear-gradient(135deg,rgba(255,215,0,0.16),rgba(255,255,255,0.03))]";
  }
  if (rank === 2) {
    return "border-slate-300/40 bg-[linear-gradient(135deg,rgba(203,213,225,0.14),rgba(255,255,255,0.03))]";
  }
  if (rank === 3) {
    return "border-amber-700/50 bg-[linear-gradient(135deg,rgba(180,83,9,0.16),rgba(255,255,255,0.03))]";
  }
  return "border-white/10 bg-white/[0.03]";
}

export default function ResultsTable() {
  const athletes = useMeetStore((s) => s.athletes);

  const ranking = useMemo(() => {
    return athletes
      .map((athlete) => {
        const squat = getBestLift(athlete, "squat");
        const bench = getBestLift(athlete, "bench");
        const deadlift = getBestLift(athlete, "deadlift");
        const total = squat + bench + deadlift;

        return {
          athlete,
          squat,
          bench,
          deadlift,
          total,
        };
      })
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.athlete.bodyweight - b.athlete.bodyweight;
      })
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }));
  }, [athletes]);

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="text-xs uppercase tracking-[0.45em] text-cyan-300">
            Resultados oficiales
          </div>
          <div className="mt-2 text-2xl font-black text-white md:text-3xl">
            Clasificación general del campeonato
          </div>
        </div>

        {ranking.length === 0 ? (
          <div className="px-6 py-16 text-center text-lg text-white/60">
            Aún no hay resultados.
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {podium.map((row) => (
                <div
                  key={row.athlete.id}
                  className={`rounded-[28px] border p-5 shadow-xl ${rankCardStyle(row.rank)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm uppercase tracking-[0.35em] text-white/60">
                        Posición
                      </div>
                      <div className="mt-2 text-4xl font-black text-white">
                        {medalByRank(row.rank)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm uppercase tracking-[0.35em] text-white/60">
                        Total
                      </div>
                      <div className="mt-2 text-4xl font-black text-cyan-300">
                        {row.total}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    {row.athlete.photo ? (
                      <img
                        src={row.athlete.photo}
                        alt={row.athlete.name}
                        className="h-20 w-20 rounded-[22px] object-cover ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-white/10 text-white/40">
                        FOTO
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="truncate text-2xl font-black text-white">
                        {row.athlete.name}
                      </div>
                      <div className="mt-1 text-white/70">
                        {row.athlete.category} · {row.athlete.bodyweight} kg
                      </div>
                      <div className="text-sm text-yellow-300">{row.athlete.club}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-black/25 p-3 text-center">
                      <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                        SQ
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">{row.squat}</div>
                    </div>
                    <div className="rounded-2xl bg-black/25 p-3 text-center">
                      <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                        BP
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">{row.bench}</div>
                    </div>
                    <div className="rounded-2xl bg-black/25 p-3 text-center">
                      <div className="text-xs uppercase tracking-[0.25em] text-white/50">
                        DL
                      </div>
                      <div className="mt-1 text-2xl font-black text-white">{row.deadlift}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
              <div className="overflow-x-auto">
                <table className="min-w-full text-white">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        Rank
                      </th>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        Atleta
                      </th>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        Categoría
                      </th>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        SQ
                      </th>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        BP
                      </th>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        DL
                      </th>
                      <th className="px-4 py-4 text-left text-sm uppercase tracking-[0.25em] text-white/70">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {ranking.map((row) => (
                      <tr
                        key={row.athlete.id}
                        className={`border-t border-white/10 ${
                          row.rank <= 3 ? "bg-white/[0.03]" : ""
                        }`}
                      >
                        <td className="px-4 py-4 text-lg font-black">
                          <span className="inline-flex min-w-[56px] items-center justify-center rounded-2xl bg-white/10 px-3 py-2">
                            {medalByRank(row.rank)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="font-bold text-white">{row.athlete.name}</div>
                          <div className="text-sm text-white/60">{row.athlete.club}</div>
                        </td>

                        <td className="px-4 py-4">{row.athlete.category}</td>
                        <td className="px-4 py-4 font-semibold">{row.squat}</td>
                        <td className="px-4 py-4 font-semibold">{row.bench}</td>
                        <td className="px-4 py-4 font-semibold">{row.deadlift}</td>
                        <td className="px-4 py-4 text-2xl font-black text-yellow-300">
                          {row.total}
                        </td>
                      </tr>
                    ))}

                    {rest.length === 0 && ranking.length > 0 ? null : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}