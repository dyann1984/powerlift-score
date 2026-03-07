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

type MovimientoKey = "sentadilla" | "banca" | "muerto";

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
const PESO_MINIMO = 20;
const PASO_PESO = 0.5;

const MOVIMIENTOS: { key: MovimientoKey; titulo: string; corto: string }[] = [
  { key: "sentadilla", titulo: "Sentadilla", corto: "SQ" },
  { key: "banca", titulo: "Press banca", corto: "BP" },
  { key: "muerto", titulo: "Peso muerto", corto: "DL" },
];

function createIntentos(): Intento[] {
  return [
    { peso: "", valido: true },
    { peso: "", valido: true },
    { peso: "", valido: true },
  ];
}

function safeNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

function sanitizePesoInput(value: string): string {
  if (!value) return "";
  const clean = value.replace(",", ".").trim();
  const n = Number(clean);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(n);
}

function bestValidLift(intentos: Intento[]): number {
  return intentos.reduce((best, intento) => {
    const peso = safeNumber(intento.peso);
    if (!intento.valido) return best;
    if (peso < PESO_MINIMO) return best;
    return peso > best ? peso : best;
  }, 0);
}

function formatKg(value: number): string {
  return value > 0 ? `${value} kg` : "--";
}

function getExistingResult(
  atletaId: string,
  resultados: ResultadoAtleta[]
): ResultadoAtleta | null {
  return resultados.find((r) => r.atletaId === atletaId) ?? null;
}

export default function CompetenciaPage() {
  const [athletes, setAthletes] = useState<Atleta[]>([]);
  const [results, setResults] = useState<ResultadoAtleta[]>([]);
  const [selectedId, setSelectedId] = useState("");

  const [sentadilla, setSentadilla] = useState<Intento[]>(createIntentos());
  const [banca, setBanca] = useState<Intento[]>(createIntentos());
  const [muerto, setMuerto] = useState<Intento[]>(createIntentos());

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const rawAthletes = localStorage.getItem(ATHLETES_KEY);
      const parsedAthletes: Atleta[] = rawAthletes ? JSON.parse(rawAthletes) : [];
      const athletesSafe = Array.isArray(parsedAthletes) ? parsedAthletes : [];
      setAthletes(athletesSafe);

      const rawResults = localStorage.getItem(RESULTS_KEY);
      const parsedResults: ResultadoAtleta[] = rawResults ? JSON.parse(rawResults) : [];
      setResults(Array.isArray(parsedResults) ? parsedResults : []);

      if (athletesSafe.length > 0) {
        setSelectedId(athletesSafe[0].id);
      }
    } catch {
      setAthletes([]);
      setResults([]);
    }
  }, []);

  const atletaSeleccionado = useMemo(
    () => athletes.find((a) => a.id === selectedId) ?? null,
    [athletes, selectedId]
  );

  const athleteIndex = useMemo(
    () => athletes.findIndex((a) => a.id === selectedId),
    [athletes, selectedId]
  );

  useEffect(() => {
    if (!selectedId) {
      setSentadilla(createIntentos());
      setBanca(createIntentos());
      setMuerto(createIntentos());
      return;
    }

    const previo = getExistingResult(selectedId, results);

    if (previo) {
      setSentadilla(previo.sentadilla?.length === 3 ? previo.sentadilla : createIntentos());
      setBanca(previo.banca?.length === 3 ? previo.banca : createIntentos());
      setMuerto(previo.muerto?.length === 3 ? previo.muerto : createIntentos());
    } else {
      setSentadilla(createIntentos());
      setBanca(createIntentos());
      setMuerto(createIntentos());
    }
  }, [selectedId, results]);

  const mejorSentadilla = useMemo(() => bestValidLift(sentadilla), [sentadilla]);
  const mejorBanca = useMemo(() => bestValidLift(banca), [banca]);
  const mejorMuerto = useMemo(() => bestValidLift(muerto), [muerto]);
  const total = mejorSentadilla + mejorBanca + mejorMuerto;

  function updateIntento(
    movimiento: MovimientoKey,
    index: number,
    field: keyof Intento,
    value: string | boolean
  ) {
    const setterMap = {
      sentadilla: setSentadilla,
      banca: setBanca,
      muerto: setMuerto,
    };

    const stateMap = {
      sentadilla,
      banca,
      muerto,
    };

    const current = stateMap[movimiento];
    const updated = current.map((item, i) => {
      if (i !== index) return item;
      if (field === "peso" && typeof value === "string") {
        return { ...item, peso: sanitizePesoInput(value) };
      }
      return { ...item, [field]: value };
    });

    setterMap[movimiento](updated);
    setMensaje("");
    setError("");
  }

  function limpiarIntentos() {
    setSentadilla(createIntentos());
    setBanca(createIntentos());
    setMuerto(createIntentos());
    setMensaje("");
    setError("");
  }

  function validarIntentos(intentos: Intento[], nombre: string): string | null {
    const pesos = intentos.map((i) => safeNumber(i.peso)).filter((n) => n > 0);
    for (const peso of pesos) {
      if (peso < PESO_MINIMO) {
        return `${nombre}: el peso mínimo permitido es ${PESO_MINIMO} kg.`;
      }
    }
    return null;
  }

  function guardarResultadoInterno(): boolean {
    setMensaje("");
    setError("");

    if (!atletaSeleccionado) {
      setError("Selecciona un atleta antes de guardar.");
      return false;
    }

    const errSq = validarIntentos(sentadilla, "Sentadilla");
    if (errSq) return setErr(errSq);
    const errBp = validarIntentos(banca, "Press banca");
    if (errBp) return setErr(errBp);
    const errDl = validarIntentos(muerto, "Peso muerto");
    if (errDl) return setErr(errDl);

    const payload: ResultadoAtleta = {
      atletaId: atletaSeleccionado.id,
      atletaNombre: atletaSeleccionado.nombre,
      club: atletaSeleccionado.club,
      sexo: atletaSeleccionado.sexo,
      categoria: atletaSeleccionado.categoria,
      pesoCorporal: atletaSeleccionado.peso,
      sentadilla,
      banca,
      muerto,
      mejorSentadilla,
      mejorBanca,
      mejorMuerto,
      total,
      updatedAt: new Date().toISOString(),
    };

    const next = [...results];
    const idx = next.findIndex((r) => r.atletaId === atletaSeleccionado.id);

    if (idx >= 0) next[idx] = payload;
    else next.push(payload);

    setResults(next);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(next));
    setMensaje(`Resultado guardado para ${atletaSeleccionado.nombre}.`);
    return true;
  }

  function setErr(msg: string) {
    setError(msg);
    return false;
  }

  function guardarResultado() {
    guardarResultadoInterno();
  }

  function irSiguienteAtleta() {
    if (athletes.length === 0 || athleteIndex < 0) return;
    const nextIndex = athleteIndex + 1;
    if (nextIndex < athletes.length) {
      setSelectedId(athletes[nextIndex].id);
      setMensaje("");
      setError("");
    } else {
      setMensaje("Ya estás en el último atleta.");
      setError("");
    }
  }

  function guardarYSiguiente() {
    const ok = guardarResultadoInterno();
    if (!ok) return;

    if (athleteIndex < 0) return;
    const nextIndex = athleteIndex + 1;

    if (nextIndex < athletes.length) {
      setSelectedId(athletes[nextIndex].id);
      setMensaje("Resultado guardado. Atleta siguiente cargado.");
      setError("");
    } else {
      setMensaje("Resultado guardado. No hay más atletas.");
      setError("");
    }
  }

  function renderIntentoCard(
    movimiento: MovimientoKey,
    titulo: string,
    corto: string,
    intentos: Intento[]
  ) {
    return (
      <section
        key={movimiento}
        className="rounded-[22px] border border-cyan-500/20 bg-[#090c16] p-4 shadow-[0_0_32px_rgba(0,180,255,.07)]"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-400/90">
              Movimiento
            </p>
            <h3 className="text-xl font-black text-white md:text-2xl">{titulo}</h3>
          </div>

          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 md:text-sm">
            {corto}
          </div>
        </div>

        <div className="space-y-3">
          {intentos.map((item, index) => (
            <div
              key={`${movimiento}-${index}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Intento
                  </p>
                  <p className="text-2xl font-black text-white md:text-3xl">{index + 1}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                    Peso (kg)
                  </p>
                  <input
                    type="number"
                    min={PESO_MINIMO}
                    step={PASO_PESO}
                    value={item.peso}
                    onChange={(e) => updateIntento(movimiento, index, "peso", e.target.value)}
                    placeholder={`${PESO_MINIMO}`}
                    className="mt-2 w-24 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-center text-base font-bold text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20 md:w-28 md:text-lg"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                  Estado
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateIntento(movimiento, index, "valido", true)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                      item.valido
                        ? "border border-emerald-400/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,.15)]"
                        : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    Válido
                  </button>

                  <button
                    type="button"
                    onClick={() => updateIntento(movimiento, index, "valido", false)}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                      !item.valido
                        ? "border border-rose-400/50 bg-rose-500/20 text-rose-300 shadow-[0_0_16px_rgba(244,63,94,.15)]"
                        : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    Nulo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
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
              Competencia
            </h1>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Inicio
            </Link>
            <Link href="/competencia" className="rounded-xl border border-cyan-400/50 bg-[#101622] px-4 py-2 text-sm font-bold text-white shadow-[0_0_14px_rgba(0,180,255,.16)]">
              Competencia
            </Link>
            <Link href="/marcador" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Marcador
            </Link>
            <Link href="/resultados" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Resultados
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_.8fr]">
          <section className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                  Captura de intentos
                </p>
                <h2 className="text-3xl font-black text-white md:text-4xl">
                  Panel de competencia
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-300 md:text-base">
                  Selecciona un atleta y captura sus tres intentos por movimiento. El sistema toma el mejor intento válido y calcula el total.
                </p>
              </div>

              <div className="w-full max-w-md">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Seleccionar atleta
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setMensaje("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                >
                  {athletes.length === 0 ? (
                    <option value="">No hay atletas registrados</option>
                  ) : (
                    athletes.map((atleta) => (
                      <option key={atleta.id} value={atleta.id}>
                        {atleta.nombre} · {atleta.categoria} · {atleta.club || "Sin club"}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {athletes.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-cyan-500/20 bg-black/30 p-8 text-center">
                <p className="text-xl font-bold text-white">No hay atletas registrados</p>
                <p className="mt-2 text-zinc-400">
                  Primero registra atletas en la pantalla de Registro.
                </p>
                <div className="mt-5">
                  <Link
                    href="/registro"
                    className="inline-flex rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    Ir a Registro
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-100">
                  Peso mínimo permitido por intento: <strong>{PESO_MINIMO} kg</strong>. Incremento sugerido: <strong>{PASO_PESO} kg</strong>.
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {MOVIMIENTOS.map((mov) => {
                    const intentos =
                      mov.key === "sentadilla"
                        ? sentadilla
                        : mov.key === "banca"
                        ? banca
                        : muerto;

                    return renderIntentoCard(mov.key, mov.titulo, mov.corto, intentos);
                  })}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={guardarResultado}
                    className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-black transition hover:brightness-110 md:text-base"
                  >
                    Guardar resultado
                  </button>

                  <button
                    type="button"
                    onClick={guardarYSiguiente}
                    className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/20 md:text-base"
                  >
                    Guardar y siguiente
                  </button>

                  <button
                    type="button"
                    onClick={irSiguienteAtleta}
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/15 md:text-base"
                  >
                    Siguiente atleta
                  </button>

                  <button
                    type="button"
                    onClick={limpiarIntentos}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] md:text-base"
                  >
                    Limpiar intentos
                  </button>
                </div>

                {mensaje ? (
                  <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200">
                    {mensaje}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
                    {error}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <aside className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(180deg,#080b14_0%,#080b14_65%,#06141a_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
            <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
              Vista previa
            </p>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-black/45 p-4">
              <div className="mb-4 flex justify-center">
                {atletaSeleccionado?.foto ? (
                  <img
                    src={atletaSeleccionado.foto}
                    alt={atletaSeleccionado.nombre}
                    className="h-32 w-32 rounded-3xl border border-cyan-400/30 object-cover shadow-[0_0_22px_rgba(0,180,255,.18)]"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] text-center text-sm text-zinc-500">
                    Sin foto
                  </div>
                )}
              </div>

              <p className="text-sm text-zinc-400">Atleta</p>
              <h3 className="mt-2 text-3xl font-black leading-tight text-white md:text-4xl">
                {atletaSeleccionado?.nombre || "Nombre del atleta"}
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Club</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {atletaSeleccionado?.club || "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Edad</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {atletaSeleccionado?.edad ?? "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Sexo</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {atletaSeleccionado?.sexo || "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Peso</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {atletaSeleccionado ? `${atletaSeleccionado.peso} kg` : "--"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                  Categoría asignada
                </p>
                <p className="mt-2 text-2xl font-black text-cyan-200 md:text-3xl">
                  {atletaSeleccionado?.categoria || "--"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-white/10 bg-black/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                Mejores levantamientos
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-300">Sentadilla</span>
                  <strong className="text-lg text-white">{formatKg(mejorSentadilla)}</strong>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-300">Press banca</span>
                  <strong className="text-lg text-white">{formatKg(mejorBanca)}</strong>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-sm text-zinc-300">Peso muerto</span>
                  <strong className="text-lg text-white">{formatKg(mejorMuerto)}</strong>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-[linear-gradient(135deg,rgba(6,182,212,.18),rgba(14,116,144,.22))] p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">
                  Total oficial
                </p>
                <p className="mt-2 text-4xl font-black text-white md:text-5xl">
                  {total > 0 ? `${total} kg` : "--"}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                Guardados
              </p>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                Resultados registrados
              </h2>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300">
              Total: {results.length}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/10 bg-black/25 p-8 text-center text-zinc-400">
              Aún no hay resultados guardados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[20px] border border-white/10 bg-black/25">
              <table className="min-w-full text-left">
                <thead className="border-b border-white/10 text-sm text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Atleta</th>
                    <th className="px-4 py-3 font-semibold">Club</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">SQ</th>
                    <th className="px-4 py-3 font-semibold">BP</th>
                    <th className="px-4 py-3 font-semibold">DL</th>
                    <th className="px-4 py-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.atletaId} className="border-b border-white/5 text-white transition hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-bold">{r.atletaNombre}</td>
                      <td className="px-4 py-3 text-zinc-300">{r.club || "--"}</td>
                      <td className="px-4 py-3 text-cyan-300">{r.categoria}</td>
                      <td className="px-4 py-3">{r.mejorSentadilla || "--"}</td>
                      <td className="px-4 py-3">{r.mejorBanca || "--"}</td>
                      <td className="px-4 py-3">{r.mejorMuerto || "--"}</td>
                      <td className="px-4 py-3 text-lg font-black text-white">
                        {r.total || "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}