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

const ATHLETES_KEY = "powerlift_atletas";
const RESULTS_KEY = "powerlift_resultados";

function formatKg(value: number | null | undefined): string {
  return value && value > 0 ? `${value} kg` : "--";
}

function getMedal(position: number): string {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return `${position}°`;
}

export default function ResultadosPage() {
  const [athletes, setAthletes] = useState<Atleta[]>([]);
  const [results, setResults] = useState<ResultadoAtleta[]>([]);

  useEffect(() => {
    function loadData() {
      try {
        const rawAthletes = localStorage.getItem(ATHLETES_KEY);
        const parsedAthletes: Atleta[] = rawAthletes ? JSON.parse(rawAthletes) : [];
        setAthletes(Array.isArray(parsedAthletes) ? parsedAthletes : []);

        const rawResults = localStorage.getItem(RESULTS_KEY);
        const parsedResults: ResultadoAtleta[] = rawResults ? JSON.parse(rawResults) : [];
        setResults(Array.isArray(parsedResults) ? parsedResults : []);
      } catch {
        setAthletes([]);
        setResults([]);
      }
    }

    loadData();
    const interval = setInterval(loadData, 1500);
    return () => clearInterval(interval);
  }, []);

  const fotoPorAtleta = useMemo(() => {
    const map = new Map<string, string>();
    for (const atleta of athletes) {
      if (atleta.foto) map.set(atleta.id, atleta.foto);
    }
    return map;
  }, [athletes]);

  const categoriasAgrupadas = useMemo(() => {
    const map = new Map<string, ResultadoAtleta[]>();

    results.forEach((resultado) => {
      const categoria = resultado.categoria || "Sin categoría";
      if (!map.has(categoria)) map.set(categoria, []);
      map.get(categoria)!.push(resultado);
    });

    const entries = Array.from(map.entries()).map(([categoria, lista]) => {
      const ordenados = [...lista].sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        if (a.pesoCorporal !== b.pesoCorporal) return a.pesoCorporal - b.pesoCorporal;
        return a.atletaNombre.localeCompare(b.atletaNombre, "es");
      });

      return { categoria, atletas: ordenados };
    });

    return entries.sort((a, b) => a.categoria.localeCompare(b.categoria, "es"));
  }, [results]);

  const totalCategorias = categoriasAgrupadas.length;
  const totalResultados = results.length;
  const totalAtletas = athletes.length;

  return (
    <main className="min-h-screen bg-[#eef2f6] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#3f3f41]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-cyan-400">
              Powerlift Tlalmanalco
            </p>
            <h1 className="text-2xl font-black leading-none text-white md:text-3xl">
              Resultados oficiales
            </h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Inicio
            </Link>
            <Link href="/competencia" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Competencia
            </Link>
            <Link href="/marcador" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Marcador
            </Link>
            <Link href="/resultados" className="rounded-xl border border-cyan-400/50 bg-[#101622] px-4 py-2 text-sm font-bold text-white shadow-[0_0_14px_rgba(0,180,255,.16)]">
              Resultados
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-400">
                Atletas registrados
              </p>
              <p className="mt-2 text-4xl font-black text-white md:text-5xl">{totalAtletas}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-400">
                Resultados guardados
              </p>
              <p className="mt-2 text-4xl font-black text-white md:text-5xl">{totalResultados}</p>
            </div>

            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-300">
                Categorías activas
              </p>
              <p className="mt-2 text-4xl font-black text-cyan-100 md:text-5xl">{totalCategorias}</p>
            </div>
          </div>
        </section>

        {results.length === 0 ? (
          <section className="mt-6 rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,.2)]">
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Aún no hay resultados oficiales
            </h2>
            <p className="mt-3 text-zinc-400">
              Primero guarda resultados desde la pantalla de Competencia.
            </p>
            <div className="mt-5">
              <Link
                href="/competencia"
                className="inline-flex rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500/20"
              >
                Ir a Competencia
              </Link>
            </div>
          </section>
        ) : (
          <div className="mt-6 space-y-6">
            {categoriasAgrupadas.map((grupo) => (
              <section
                key={grupo.categoria}
                className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                      Categoría
                    </p>
                    <h2 className="text-2xl font-black text-white md:text-3xl">
                      {grupo.categoria}
                    </h2>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300">
                    Competidores: {grupo.atletas.length}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-[20px] border border-white/10 bg-black/25">
                  <table className="min-w-full text-left">
                    <thead className="border-b border-white/10 text-sm text-zinc-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Posición</th>
                        <th className="px-4 py-3 font-semibold">Foto</th>
                        <th className="px-4 py-3 font-semibold">Atleta</th>
                        <th className="px-4 py-3 font-semibold">Club</th>
                        <th className="px-4 py-3 font-semibold">Sexo</th>
                        <th className="px-4 py-3 font-semibold">Peso corporal</th>
                        <th className="px-4 py-3 font-semibold">Sentadilla</th>
                        <th className="px-4 py-3 font-semibold">Banca</th>
                        <th className="px-4 py-3 font-semibold">Muerto</th>
                        <th className="px-4 py-3 font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupo.atletas.map((r, index) => (
                        <tr
                          key={r.atletaId}
                          className="border-b border-white/5 text-white transition hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-3 text-lg font-black">{getMedal(index + 1)}</td>
                          <td className="px-4 py-3">
                            {fotoPorAtleta.get(r.atletaId) ? (
                              <img
                                src={fotoPorAtleta.get(r.atletaId)}
                                alt={r.atletaNombre}
                                className="h-12 w-12 rounded-xl border border-white/10 object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-white/10 text-[10px] text-zinc-500">
                                Sin foto
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold">{r.atletaNombre}</td>
                          <td className="px-4 py-3 text-zinc-300">{r.club || "--"}</td>
                          <td className="px-4 py-3">{r.sexo || "--"}</td>
                          <td className="px-4 py-3">{formatKg(r.pesoCorporal)}</td>
                          <td className="px-4 py-3">{formatKg(r.mejorSentadilla)}</td>
                          <td className="px-4 py-3">{formatKg(r.mejorBanca)}</td>
                          <td className="px-4 py-3">{formatKg(r.mejorMuerto)}</td>
                          <td className="px-4 py-3 text-lg font-black text-cyan-300 md:text-xl">
                            {formatKg(r.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}