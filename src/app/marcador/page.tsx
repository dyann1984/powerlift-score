"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type Sexo = "Varonil" | "Femenil" | "";

type Atleta = {
  id: string;
  nombre: string;
  club: string;
  edad: number;
  sexo: Sexo;
  peso: number;
  categoria: string;
  foto?: string;
  createdAt?: string;
};

type Intento = {
  peso: string;
  valido: boolean;
};

type ResultadoAtleta = {
  atletaId: string;
  atletaNombre: string;
  club: string;
  sexo: Sexo;
  categoria: string;
  pesoCorporal: number;
  sentadilla: Intento[];
  banca: Intento[];
  muerto: Intento[];
  mejorSentadilla: number;
  mejorBanca: number;
  mejorMuerto: number;
  total: number;
  updatedAt: string;
};

type MovimientoKey = "sentadilla" | "banca" | "muerto";

const ATHLETES_KEY = "powerlift_atletas";
const RESULTS_KEY = "powerlift_resultados";

const MOVIMIENTO_LABELS: Record<MovimientoKey, string> = {
  sentadilla: "Sentadilla",
  banca: "Press banca",
  muerto: "Peso muerto",
};

function safeNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

export default function MarcadorPage() {
  const [athletes, setAthletes] = useState<Atleta[]>([]);
  const [results, setResults] = useState<ResultadoAtleta[]>([]);

  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [selectedMovimiento, setSelectedMovimiento] =
    useState<MovimientoKey>("sentadilla");
  const [selectedIntento, setSelectedIntento] = useState(0);

  useEffect(() => {
    function loadData() {
      try {
        const rawAthletes = localStorage.getItem(ATHLETES_KEY);
        const parsedAthletes: Atleta[] = rawAthletes ? JSON.parse(rawAthletes) : [];
        const athletesSafe = Array.isArray(parsedAthletes) ? parsedAthletes : [];
        setAthletes(athletesSafe);

        const rawResults = localStorage.getItem(RESULTS_KEY);
        const parsedResults: ResultadoAtleta[] = rawResults ? JSON.parse(rawResults) : [];
        setResults(Array.isArray(parsedResults) ? parsedResults : []);

        if (athletesSafe.length > 0 && !selectedAthleteId) {
          setSelectedAthleteId(athletesSafe[0].id);
        }
      } catch {
        setAthletes([]);
        setResults([]);
      }
    }

    loadData();
    const interval = setInterval(loadData, 1200);
    return () => clearInterval(interval);
  }, [selectedAthleteId]);

  const atleta = useMemo(
    () => athletes.find((a) => a.id === selectedAthleteId) ?? null,
    [athletes, selectedAthleteId]
  );

  const resultado = useMemo(
    () => results.find((r) => r.atletaId === selectedAthleteId) ?? null,
    [results, selectedAthleteId]
  );

  const intentosMovimiento = useMemo(() => {
    if (!resultado) return [];
    if (selectedMovimiento === "sentadilla") return resultado.sentadilla ?? [];
    if (selectedMovimiento === "banca") return resultado.banca ?? [];
    return resultado.muerto ?? [];
  }, [resultado, selectedMovimiento]);

  const intentoActual = useMemo(() => {
    return intentosMovimiento[selectedIntento] ?? null;
  }, [intentosMovimiento, selectedIntento]);

  const pesoActual = useMemo(() => {
    const n = safeNumber(intentoActual?.peso);
    return n > 0 ? `${n} kg` : "--";
  }, [intentoActual]);

  const estadoActual = useMemo(() => {
    if (!intentoActual) return "--";
    return intentoActual.valido ? "Válido" : "Nulo";
  }, [intentoActual]);

  const colorEstado = intentoActual?.valido
    ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
    : intentoActual
      ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
      : "border-white/10 bg-white/[0.04] text-zinc-300";

  function cambiarAtleta(nextId: string) {
    setSelectedAthleteId(nextId);
  }

  function atletaAnterior() {
    if (athletes.length === 0) return;
    const index = athletes.findIndex((a) => a.id === selectedAthleteId);
    if (index > 0) {
      setSelectedAthleteId(athletes[index - 1].id);
    }
  }

  function atletaSiguiente() {
    if (athletes.length === 0) return;
    const index = athletes.findIndex((a) => a.id === selectedAthleteId);
    if (index >= 0 && index < athletes.length - 1) {
      setSelectedAthleteId(athletes[index + 1].id);
    }
  }

  return (
    <main className="min-h-screen bg-[#eef2f6] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#3f3f41]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-cyan-400">
              Powerlift Tlalmanalco
            </p>
            <h1 className="text-2xl font-black leading-none text-white md:text-3xl">
              Marcador en vivo
            </h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]"
            >
              Inicio
            </Link>
            <Link
              href="/competencia"
              className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]"
            >
              Competencia
            </Link>
            <Link
              href="/marcador"
              className="rounded-xl border border-cyan-400/50 bg-[#101622] px-4 py-2 text-sm font-bold text-white shadow-[0_0_14px_rgba(0,180,255,.16)]"
            >
              Marcador
            </Link>
            <Link
              href="/resultados"
              className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]"
            >
              Resultados
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {athletes.length === 0 ? (
          <section className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,.2)]">
            <h2 className="text-2xl font-black text-white md:text-3xl">
              No hay atletas registrados
            </h2>
            <p className="mt-3 text-zinc-400">
              Primero registra atletas y captura resultados en Competencia.
            </p>
            <div className="mt-5">
              <Link
                href="/registro"
                className="inline-flex rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Ir a Registro
              </Link>
            </div>
          </section>
        ) : (
          <div className="space-y-5">
            <section className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr_1fr_.9fr]">
                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Atleta
                  </label>
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => cambiarAtleta(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    {athletes.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombre} · {a.categoria} · {a.club || "Sin club"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Movimiento
                  </label>
                  <select
                    value={selectedMovimiento}
                    onChange={(e) =>
                      setSelectedMovimiento(e.target.value as MovimientoKey)
                    }
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value="sentadilla">Sentadilla</option>
                    <option value="banca">Press banca</option>
                    <option value="muerto">Peso muerto</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    Intento
                  </label>
                  <select
                    value={selectedIntento}
                    onChange={(e) => setSelectedIntento(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <option value={0}>Intento 1</option>
                    <option value={1}>Intento 2</option>
                    <option value={2}>Intento 3</option>
                  </select>
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={atletaAnterior}
                    className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={atletaSiguiente}
                    className="flex-1 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/15"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_.65fr]">
              <section className="rounded-[30px] border border-cyan-500/20 bg-[linear-gradient(180deg,#050813_0%,#08101d_70%,#061722_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,.22)]">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_1fr]">
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex h-full flex-col items-center justify-center">
                      {atleta?.foto ? (
                        <img
                          src={atleta.foto}
                          alt={atleta.nombre}
                          className="h-72 w-full rounded-[22px] border border-cyan-400/30 object-cover shadow-[0_0_28px_rgba(0,180,255,.18)]"
                        />
                      ) : (
                        <div className="flex h-72 w-full items-center justify-center rounded-[22px] border border-dashed border-white/15 bg-black/25 text-center text-2xl text-zinc-500">
                          Sin foto
                        </div>
                      )}

                      <div className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-center">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                          Categoría
                        </p>
                        <p className="mt-2 text-3xl font-black text-white">
                          {atleta?.categoria || "--"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.38em] text-cyan-400">
                          Plataforma
                        </p>
                        <h2 className="mt-2 text-7xl font-black leading-none text-white md:text-8xl">
                          {atleta?.nombre || "ATLETA"}
                        </h2>
                      </div>

                      <div
                        className={`rounded-2xl border px-4 py-3 text-lg font-black md:text-2xl ${colorEstado}`}
                      >
                        {estadoActual}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_1.2fr]">
                      <div className="flex min-h-[210px] flex-col justify-center rounded-[22px] border border-white/10 bg-white/[0.04] p-5">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                          Movimiento
                        </p>
                        <p className="mt-3 break-words text-[2.1rem] font-black leading-[0.95] text-white xl:text-[2.5rem]">
                          {MOVIMIENTO_LABELS[selectedMovimiento]}
                        </p>
                      </div>

                      <div className="flex min-h-[210px] flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.04] p-5 text-center">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                          Intento
                        </p>
                        <p className="mt-3 text-5xl font-black leading-none text-cyan-300 xl:text-6xl">
                          {selectedIntento + 1}
                        </p>
                      </div>

                      <div className="flex min-h-[210px] flex-col justify-center rounded-[22px] border border-cyan-500/25 bg-[linear-gradient(135deg,rgba(6,182,212,.16),rgba(14,116,144,.22))] p-5">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
                          Peso solicitado
                        </p>
                        <p className="mt-3 text-6xl font-black leading-none text-cyan-300 xl:text-7xl">
                          {pesoActual}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#c8a46b]">
                          Club
                        </p>
                        <p className="mt-2 text-3xl font-black text-white md:text-4xl">
                          {atleta?.club || "--"}
                        </p>
                      </div>

                      <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#c8a46b]">
                          Peso corporal
                        </p>
                        <p className="mt-2 text-3xl font-black text-white md:text-4xl">
                          {atleta ? `${atleta.peso} kg` : "--"}
                        </p>
                      </div>

                      <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
                        <p className="text-[10px] uppercase tracking-[0.26em] text-[#c8a46b]">
                          Sexo
                        </p>
                        <p className="mt-2 break-words text-2xl font-black leading-tight text-white md:text-3xl">
                          {atleta?.sexo || "--"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="rounded-[30px] border border-cyan-500/20 bg-[linear-gradient(180deg,#080b14_0%,#080b14_65%,#06141a_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,.2)]">
                <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                  Resumen
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-zinc-500">
                      Sentadilla
                    </p>
                    <p className="mt-2 text-3xl font-black text-white md:text-4xl">
                      {resultado?.mejorSentadilla
                        ? `${resultado.mejorSentadilla} kg`
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-zinc-500">
                      Press banca
                    </p>
                    <p className="mt-2 text-3xl font-black text-white md:text-4xl">
                      {resultado?.mejorBanca ? `${resultado.mejorBanca} kg` : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-zinc-500">
                      Peso muerto
                    </p>
                    <p className="mt-2 text-3xl font-black text-white md:text-4xl">
                      {resultado?.mejorMuerto ? `${resultado.mejorMuerto} kg` : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <p className="text-[10px] uppercase tracking-[0.26em] text-cyan-300">
                      Total oficial
                    </p>
                    <p className="mt-2 text-5xl font-black text-cyan-100 md:text-6xl">
                      {resultado?.total ? `${resultado.total} kg` : "--"}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}