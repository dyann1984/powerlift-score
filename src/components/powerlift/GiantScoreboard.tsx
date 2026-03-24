"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { LiftType, Athlete, useMeetStore } from "../../store/useMeetStore";

const liftNames: Record<LiftType, string> = {
  squat: "SENTADILLA",
  bench: "BENCH PRESS",
  deadlift: "PESO MUERTO",
};

function getBestLift(athlete: Athlete, lift: LiftType) {
  return athlete[lift]
    .filter((a) => a.status === "valid")
    .reduce((max, a) => Math.max(max, a.weight || 0), 0);
}

export default function GiantScoreboard() {
  const athletes = useMeetStore((s) => s.athletes);
  const currentAttempt = useMeetStore((s) => s.currentAttempt);
  const timerSeconds = useMeetStore((s) => s.timerSeconds);

  const ranking = useMemo(() => {
    return athletes
      .map((athlete) => {
        const squat = getBestLift(athlete, "squat");
        const bench = getBestLift(athlete, "bench");
        const deadlift = getBestLift(athlete, "deadlift");
        const total = squat + bench + deadlift;

        return { athlete, squat, bench, deadlift, total };
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

  const athlete = athletes.find((a) => a.id === currentAttempt.athleteId);
  const currentStatus =
    athlete?.[currentAttempt.lift]?.[currentAttempt.index]?.status || "pending";

  const mm = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const ss = String(timerSeconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#122242_0%,#060913_44%,#010308_100%)] p-4 text-white">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 flex justify-end">
          <Link
            href="/inicio"
            className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 font-bold text-white"
          >
            ⬅ Salir
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#0c1428,#101a33)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-5 flex items-center gap-3">
              <img
                src="/logo.png"
                alt="logo"
                className="h-10 w-10 object-contain"
              />
              <div>
                <div className="text-xs tracking-[0.45em] text-yellow-400">
                  CAMPEONATO PROFESIONAL
                </div>
                <div className="text-3xl font-black md:text-4xl">
                  Powerlifting Scoreboard
                </div>
              </div>
            </div>

            {athlete ? (
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="rounded-[24px] border border-white/10 bg-black/30 p-4">
                  {athlete.photo ? (
                    <img
                      src={athlete.photo}
                      alt={athlete.name}
                      className="h-[300px] w-full rounded-[18px] object-cover"
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center rounded-[18px] bg-white/10 text-3xl font-bold text-white/40">
                      FOTO
                    </div>
                  )}
                </div>

                <div className="rounded-[24px] border border-white/10 bg-black/30 p-5">
                  <div className="text-sm tracking-[0.35em] text-white/50">
                    ATLETA EN PLATAFORMA
                  </div>

                  <div className="mt-2 text-5xl font-black leading-none md:text-7xl">
                    {athlete.name}
                  </div>

                  <div className="mt-3 text-xl text-cyan-300 md:text-2xl">
                    {athlete.category} · {athlete.bodyweight} kg · {athlete.club}
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[18px] bg-white/10 p-4">
                      <div className="text-xs tracking-[0.25em] text-white/55">
                        LEVANTAMIENTO
                      </div>
                      <div className="mt-2 text-2xl font-black text-yellow-400 md:text-3xl">
                        {liftNames[currentAttempt.lift]}
                      </div>
                    </div>

                    <div className="rounded-[18px] bg-white/10 p-4">
                      <div className="text-xs tracking-[0.25em] text-white/55">
                        INTENTO
                      </div>
                      <div className="mt-2 text-4xl font-black md:text-5xl">
                        {currentAttempt.index + 1}
                      </div>
                    </div>

                    <div className="rounded-[18px] bg-white/10 p-4">
                      <div className="text-xs tracking-[0.25em] text-white/55">
                        PESO
                      </div>
                      <div className="mt-2 text-5xl font-black text-cyan-300 md:text-6xl">
                        {currentAttempt.weight} kg
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div
                      className={`rounded-[18px] p-5 text-center text-4xl font-black md:text-5xl ${
                        timerSeconds <= 10
                          ? "bg-red-500/20 text-red-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {mm}:{ss}
                    </div>

                    <div
                      className={`rounded-[18px] p-5 text-center text-3xl font-black md:text-4xl ${
                        currentStatus === "valid"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : currentStatus === "no_lift"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-400/15 text-yellow-300"
                      }`}
                    >
                      {currentStatus === "valid"
                        ? "● VÁLIDO"
                        : currentStatus === "no_lift"
                        ? "● NULO"
                        : "● EN ESPERA"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[60vh] items-center justify-center rounded-[24px] border border-dashed border-white/10 text-4xl text-white/40">
                Esperando atleta...
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,#0b111f,#131f3d)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-5 text-sm tracking-[0.35em] text-white/50">
              RANKING EN VIVO
            </div>

            <div className="space-y-3">
              {ranking.slice(0, 6).map((row) => (
                <div
                  key={row.athlete.id}
                  className={`rounded-[18px] border p-4 ${
                    row.rank === 1
                      ? "border-yellow-400 bg-yellow-400/10"
                      : "border-white/10 bg-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-2xl font-black">
                        #{row.rank} {row.athlete.name}
                      </div>
                      <div className="text-sm text-white/60">
                        {row.athlete.category}
                      </div>
                    </div>

                    <div className="text-4xl font-black text-cyan-300">
                      {row.total}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-white/60">
                    SQ {row.squat} · BP {row.bench} · DL {row.deadlift}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}