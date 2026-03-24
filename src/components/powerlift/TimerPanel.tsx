"use client";

import React, { useEffect } from "react";
import { useMeetStore } from "../../store/useMeetStore";

export default function TimerPanel() {
  const timerSeconds = useMeetStore((s) => s.timerSeconds);
  const timerState = useMeetStore((s) => s.timerState);
  const startTimer = useMeetStore((s) => s.startTimer);
  const pauseTimer = useMeetStore((s) => s.pauseTimer);
  const resetTimer = useMeetStore((s) => s.resetTimer);
  const tick = useMeetStore((s) => s.tick);

  useEffect(() => {
    const id = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(id);
  }, [tick]);

  const mm = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
  const ss = String(timerSeconds % 60).padStart(2, "0");
  const isDanger = timerSeconds <= 10;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-2 text-sm uppercase tracking-[0.3em] text-white/60">
        Tiempo de intento
      </div>

      <div
        className={`rounded-3xl border px-6 py-8 text-center text-6xl font-black md:text-8xl ${
          isDanger
            ? "border-red-400 bg-red-500/15 text-red-300"
            : "border-emerald-400 bg-emerald-500/10 text-emerald-300"
        }`}
      >
        {mm}:{ss}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <button
          onClick={startTimer}
          className="rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-white"
        >
          Iniciar
        </button>

        <button
          onClick={pauseTimer}
          className="rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black"
        >
          Pausar
        </button>

        <button
          onClick={resetTimer}
          className="rounded-2xl bg-white/10 px-4 py-3 font-bold text-white"
        >
          Reiniciar
        </button>
      </div>

      <div className="mt-3 text-center text-sm text-white/60">
        Estado: <span className="font-semibold text-white">{timerState}</span>
      </div>
    </div>
  );
}