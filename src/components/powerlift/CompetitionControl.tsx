"use client";

import React from "react";
import { LiftType, useMeetStore } from "../../store/useMeetStore";

const liftNames: Record<LiftType, string> = {
  squat: "Sentadilla",
  bench: "Bench Press",
  deadlift: "Peso Muerto",
};

export default function CompetitionControl() {
  const athletes = useMeetStore((s) => s.athletes);
  const currentAttempt = useMeetStore((s) => s.currentAttempt);
  const setCurrentAttempt = useMeetStore((s) => s.setCurrentAttempt);
  const setAttemptWeight = useMeetStore((s) => s.setAttemptWeight);
  const setAttemptStatus = useMeetStore((s) => s.setAttemptStatus);

  const currentAthlete = athletes.find((a) => a.id === currentAttempt.athleteId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 text-xl font-bold text-white">Mesa de control</div>

        <div className="grid gap-4 md:grid-cols-2">
          <select
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            value={currentAttempt.athleteId || ""}
            onChange={(e) => setCurrentAttempt({ athleteId: e.target.value || null })}
          >
            <option value="">Selecciona atleta</option>
            {athletes.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} - {a.category}
              </option>
            ))}
          </select>

          <select
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            value={currentAttempt.lift}
            onChange={(e) => setCurrentAttempt({ lift: e.target.value as LiftType })}
          >
            <option value="squat">Sentadilla</option>
            <option value="bench">Bench Press</option>
            <option value="deadlift">Peso Muerto</option>
          </select>

          <select
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            value={currentAttempt.index}
            onChange={(e) => setCurrentAttempt({ index: Number(e.target.value) })}
          >
            <option value={0}>Intento 1</option>
            <option value={1}>Intento 2</option>
            <option value={2}>Intento 3</option>
          </select>

          <input
            type="number"
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            value={currentAttempt.weight}
            onChange={(e) => setCurrentAttempt({ weight: Number(e.target.value || 0) })}
            placeholder="Peso del intento"
          />
        </div>

        <div className="mt-4">
          <button
            disabled={!currentAttempt.athleteId}
            onClick={() => {
              if (!currentAttempt.athleteId) return;
              setAttemptWeight(
                currentAttempt.athleteId,
                currentAttempt.lift,
                currentAttempt.index,
                currentAttempt.weight
              );
            }}
            className="rounded-2xl bg-cyan-400 px-5 py-3 font-bold text-black disabled:opacity-50"
          >
            Guardar peso del intento
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 text-xl font-bold text-white">Intento actual</div>

        {!currentAthlete ? (
          <div className="text-white/60">Selecciona un atleta.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {currentAthlete.photo ? (
                <img
                  src={currentAthlete.photo}
                  alt={currentAthlete.name}
                  className="h-24 w-24 rounded-3xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 text-white/50">
                  FOTO
                </div>
              )}

              <div>
                <div className="text-2xl font-black text-white">{currentAthlete.name}</div>
                <div className="text-white/70">
                  {currentAthlete.category} · {currentAthlete.bodyweight} kg
                </div>
                <div className="text-sm text-yellow-300">{currentAthlete.club}</div>
              </div>
            </div>

            <div className="rounded-3xl bg-black/30 p-4">
              <div className="text-sm uppercase tracking-[0.3em] text-white/50">
                Levantamiento
              </div>
              <div className="text-3xl font-black text-cyan-300">
                {liftNames[currentAttempt.lift]}
              </div>

              <div className="mt-3 text-sm uppercase tracking-[0.3em] text-white/50">
                Intento
              </div>
              <div className="text-4xl font-black text-white">{currentAttempt.index + 1}</div>

              <div className="mt-3 text-sm uppercase tracking-[0.3em] text-white/50">
                Peso solicitado
              </div>
              <div className="text-5xl font-black text-yellow-300">
                {currentAttempt.weight} kg
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={() => {
                  if (!currentAttempt.athleteId) return;
                  setAttemptStatus(
                    currentAttempt.athleteId,
                    currentAttempt.lift,
                    currentAttempt.index,
                    "valid"
                  );
                }}
                className="rounded-2xl bg-emerald-500 px-5 py-4 text-xl font-black text-white"
              >
                🟢 VÁLIDO
              </button>

              <button
                onClick={() => {
                  if (!currentAttempt.athleteId) return;
                  setAttemptStatus(
                    currentAttempt.athleteId,
                    currentAttempt.lift,
                    currentAttempt.index,
                    "no_lift"
                  );
                }}
                className="rounded-2xl bg-red-500 px-5 py-4 text-xl font-black text-white"
              >
                🔴 NULO
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}