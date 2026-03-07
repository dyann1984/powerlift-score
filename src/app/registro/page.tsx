"use client";

import Link from "next/link";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";

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

const ATHLETES_KEY = "powerlift_atletas";

function getCategoria(sexo: Sexo, peso: number): string {
  if (!sexo || !peso || peso <= 0) return "";

  if (sexo === "Varonil") {
    if (peso <= 59) return "59 kg";
    if (peso <= 66) return "66 kg";
    if (peso <= 74) return "74 kg";
    if (peso <= 83) return "83 kg";
    if (peso <= 93) return "93 kg";
    if (peso <= 105) return "105 kg";
    if (peso <= 120) return "120 kg";
    return "+120 kg";
  }

  if (sexo === "Femenil") {
    if (peso <= 47) return "47 kg";
    if (peso <= 52) return "52 kg";
    if (peso <= 57) return "57 kg";
    if (peso <= 63) return "63 kg";
    if (peso <= 69) return "69 kg";
    if (peso <= 76) return "76 kg";
    if (peso <= 84) return "84 kg";
    return "+84 kg";
  }

  return "";
}

function toNumber(value: string): number {
  const n = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

function compressImage(
  file: File,
  maxSize = 900,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const result = canvas.toDataURL("image/jpeg", quality);
        resolve(result);
      };

      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error("No se pudo cargar el archivo."));
    reader.readAsDataURL(file);
  });
}

export default function RegistroPage() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);

  const [nombre, setNombre] = useState("");
  const [club, setClub] = useState("");
  const [edad, setEdad] = useState("");
  const [sexo, setSexo] = useState<Sexo>("");
  const [peso, setPeso] = useState("");
  const [foto, setFoto] = useState<string>("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ATHLETES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setAtletas(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAtletas([]);
    }
  }, []);

  const pesoNum = useMemo(() => toNumber(peso), [peso]);
  const edadNum = useMemo(() => toNumber(edad), [edad]);
  const categoria = useMemo(() => getCategoria(sexo, pesoNum), [sexo, pesoNum]);

  function persistir(lista: Atleta[]) {
    setAtletas(lista);
    localStorage.setItem(ATHLETES_KEY, JSON.stringify(lista));
  }

  function limpiarFormulario() {
    setNombre("");
    setClub("");
    setEdad("");
    setSexo("");
    setPeso("");
    setFoto("");
    setError("");
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    setMensaje("");
    setError("");

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen válida.");
      return;
    }

    try {
      setSubiendoFoto(true);
      const base64 = await compressImage(file, 900, 0.8);
      setFoto(base64);
      setMensaje("Foto cargada correctamente.");
    } catch {
      setError("No se pudo procesar la foto.");
    } finally {
      setSubiendoFoto(false);
      e.target.value = "";
    }
  }

  function guardarAtleta() {
    setMensaje("");
    setError("");

    if (!nombre.trim()) {
      setError("Escribe el nombre del atleta.");
      return;
    }

    if (!edadNum || edadNum <= 0) {
      setError("Captura una edad válida.");
      return;
    }

    if (!sexo) {
      setError("Selecciona el sexo.");
      return;
    }

    if (!pesoNum || pesoNum <= 0) {
      setError("Captura un peso corporal válido.");
      return;
    }

    const nuevo: Atleta = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      nombre: nombre.trim().toUpperCase(),
      club: club.trim().toUpperCase(),
      edad: edadNum,
      sexo,
      peso: pesoNum,
      categoria,
      foto,
      createdAt: new Date().toISOString(),
    };

    const lista = [nuevo, ...atletas];
    persistir(lista);
    setMensaje(`Atleta registrado en categoría ${categoria}.`);
    limpiarFormulario();
  }

  function eliminarAtleta(id: string) {
    const lista = atletas.filter((a) => a.id !== id);
    persistir(lista);
    setMensaje("Atleta eliminado.");
    setError("");
  }

  function borrarLista() {
    setAtletas([]);
    localStorage.removeItem(ATHLETES_KEY);
    setMensaje("Lista borrada.");
    setError("");
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
              Registro de atletas
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
            <Link href="/resultados" className="rounded-xl border border-cyan-500/30 bg-[#1b1f29] px-4 py-2 text-sm font-bold text-white transition hover:border-cyan-400/60 hover:bg-[#232938]">
              Resultados
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_.85fr]">
          <section className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.22)]">
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                Captura
              </p>
              <h2 className="text-3xl font-black text-white md:text-4xl">
                Panel de registro
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-300 md:text-base">
                Registra al atleta, súbele su foto o tómala desde el celular y el sistema la mostrará también en competencia y marcador.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Nombre completo
                </label>
                <input
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    setMensaje("");
                    setError("");
                  }}
                  placeholder="Nombre completo"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Club o equipo
                </label>
                <input
                  value={club}
                  onChange={(e) => {
                    setClub(e.target.value);
                    setMensaje("");
                    setError("");
                  }}
                  placeholder="Club o equipo"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Edad
                </label>
                <input
                  type="number"
                  min="1"
                  value={edad}
                  onChange={(e) => {
                    setEdad(e.target.value);
                    setMensaje("");
                    setError("");
                  }}
                  placeholder="Edad"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Sexo
                </label>
                <select
                  value={sexo}
                  onChange={(e) => {
                    setSexo(e.target.value as Sexo);
                    setMensaje("");
                    setError("");
                  }}
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="">Selecciona</option>
                  <option value="Varonil">Varonil</option>
                  <option value="Femenil">Femenil</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                  Peso corporal (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={peso}
                  onChange={(e) => {
                    setPeso(e.target.value);
                    setMensaje("");
                    setError("");
                  }}
                  placeholder="Peso corporal (kg)"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-300">
                  Categoría automática
                </p>
                <p className="mt-2 text-2xl font-black text-cyan-100 md:text-3xl">
                  {categoria || "--"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/15">
                Subir foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/15">
                Tomar foto
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={guardarAtleta}
                className="rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-black transition hover:brightness-110 md:text-base"
              >
                Guardar atleta
              </button>

              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08] md:text-base"
              >
                Limpiar
              </button>

              <button
                type="button"
                onClick={borrarLista}
                className="rounded-xl border border-red-500/30 bg-red-500/15 px-5 py-3 text-sm font-bold text-red-200 transition hover:bg-red-500/20 md:text-base"
              >
                Borrar lista
              </button>
            </div>

            {subiendoFoto ? (
              <div className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200">
                Procesando foto...
              </div>
            ) : null}

            {mensaje ? (
              <div className="mt-4 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-200">
                {mensaje}
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-200">
                {error}
              </div>
            ) : null}
          </section>

          <aside className="rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(180deg,#080b14_0%,#080b14_65%,#06141a_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
            <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
              Vista previa
            </p>

            <div className="mt-4 rounded-[22px] border border-white/10 bg-black/45 p-4">
              <div className="mb-4 flex justify-center">
                {foto ? (
                  <img
                    src={foto}
                    alt="Foto del atleta"
                    className="h-36 w-36 rounded-3xl border border-cyan-400/30 object-cover shadow-[0_0_22px_rgba(0,180,255,.18)]"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.03] text-center text-sm text-zinc-500">
                    Sin foto
                  </div>
                )}
              </div>

              <p className="text-sm text-zinc-400">Atleta</p>
              <h3 className="mt-2 text-3xl font-black leading-tight text-white md:text-4xl">
                {nombre.trim() || "Nombre del atleta"}
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Club</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {club.trim() || "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Edad</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {edad || "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Sexo</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {sexo || "--"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#c8a46b]">Peso</p>
                  <p className="mt-2 text-xl font-black text-white md:text-2xl">
                    {peso ? `${peso} kg` : "--"}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                  Categoría asignada
                </p>
                <p className="mt-2 text-2xl font-black text-cyan-200 md:text-3xl">
                  {categoria || "--"}
                </p>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-[24px] border border-cyan-500/20 bg-[linear-gradient(135deg,#060812_0%,#0b1020_55%,#0d1120_100%)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.2)]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.42em] text-cyan-400">
                Lista
              </p>
              <h2 className="text-2xl font-black text-white md:text-3xl">
                Atletas registrados
              </h2>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300">
              Total: {atletas.length}
            </div>
          </div>

          {atletas.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-white/10 bg-black/25 p-8 text-center text-zinc-400">
              Aún no hay atletas registrados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[20px] border border-white/10 bg-black/25">
              <table className="min-w-full text-left">
                <thead className="border-b border-white/10 text-sm text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Foto</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Club</th>
                    <th className="px-4 py-3 font-semibold">Edad</th>
                    <th className="px-4 py-3 font-semibold">Sexo</th>
                    <th className="px-4 py-3 font-semibold">Peso</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {atletas.map((a) => (
                    <tr key={a.id} className="border-b border-white/5 text-white transition hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        {a.foto ? (
                          <img
                            src={a.foto}
                            alt={a.nombre}
                            className="h-14 w-14 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-zinc-500">
                            Sin foto
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold">{a.nombre}</td>
                      <td className="px-4 py-3 text-zinc-300">{a.club || "--"}</td>
                      <td className="px-4 py-3">{a.edad}</td>
                      <td className="px-4 py-3">{a.sexo}</td>
                      <td className="px-4 py-3">{a.peso} kg</td>
                      <td className="px-4 py-3 text-cyan-300">{a.categoria}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => eliminarAtleta(a.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/20"
                        >
                          Eliminar
                        </button>
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