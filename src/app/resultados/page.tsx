"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Sexo = "Masculino" | "Femenino";

type Athlete = {
  id: string;
  nombre: string;
  sexo: Sexo;
  peso: number;
  categoria: string;
  club: string;
  created_at?: string;
};

type Attempt = {
  id: string;
  athlete_id: string;
  athlete_name: string;
  movimiento: "Sentadilla" | "Press de banca" | "Peso muerto";
  intento: "Intento 1" | "Intento 2" | "Intento 3";
  peso: number;
  valido: boolean | null;
  created_at?: string;
};

type AthleteResult = {
  athlete: Athlete;
  squat: number;
  bench: number;
  deadlift: number;
  total: number;
};

function formatError(error: unknown) {
  if (!error) return "Error desconocido";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const maybe = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [
      maybe.message,
      maybe.details,
      maybe.hint,
      maybe.code ? `(code: ${maybe.code})` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return "Error desconocido";
}

function getBestValidLift(
  attempts: Attempt[],
  athleteId: string,
  movimiento: Attempt["movimiento"]
) {
  const lifts = attempts.filter(
    (a) =>
      a.athlete_id === athleteId &&
      a.movimiento === movimiento &&
      a.valido !== false
  );

  if (lifts.length === 0) return 0;
  return Math.max(...lifts.map((a) => Number(a.peso) || 0));
}

export default function ResultadosPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [sexo, setSexo] = useState<Sexo>("Masculino");
  const [categoria, setCategoria] = useState("Todas");
  const [athleteId, setAthleteId] = useState("");

  const cargarTodo = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const [athletesRes, attemptsRes] = await Promise.all([
        supabase.from("athletes").select("*").order("created_at", { ascending: false }),
        supabase.from("attempts").select("*").order("created_at", { ascending: false }),
      ]);

      if (athletesRes.error) {
        setErrorMsg(`Error al cargar atletas: ${formatError(athletesRes.error)}`);
        setAthletes([]);
        setAttempts([]);
        return;
      }

      if (attemptsRes.error) {
        setErrorMsg(`Error al cargar intentos: ${formatError(attemptsRes.error)}`);
        setAthletes((athletesRes.data as Athlete[]) || []);
        setAttempts([]);
        return;
      }

      const athletesRows = (athletesRes.data as Athlete[]) || [];
      const attemptsRows = (attemptsRes.data as Attempt[]) || [];

      setAthletes(athletesRows);
      setAttempts(attemptsRows);

      const firstMale = athletesRows.find((a) => a.sexo === "Masculino");
      if (firstMale) {
        setAthleteId(firstMale.id);
      } else {
        const firstAny = athletesRows[0];
        setAthleteId(firstAny?.id || "");
      }
    } catch (error) {
      setErrorMsg(`Error general al cargar resultados: ${formatError(error)}`);
      setAthletes([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarTodo();
  }, []);

  const categoriasDisponibles = useMemo(() => {
    const filtered = athletes.filter((a) => a.sexo === sexo);
    const unique = Array.from(new Set(filtered.map((a) => a.categoria))).sort();
    return ["Todas", ...unique];
  }, [athletes, sexo]);

  const athletesFiltrados = useMemo(() => {
    return athletes.filter((a) => {
      const sameSexo = a.sexo === sexo;
      const sameCategoria = categoria === "Todas" ? true : a.categoria === categoria;
      return sameSexo && sameCategoria;
    });
  }, [athletes, sexo, categoria]);

  useEffect(() => {
    if (athletesFiltrados.length === 0) {
      setAthleteId("");
      return;
    }

    const exists = athletesFiltrados.some((a) => a.id === athleteId);
    if (!exists) {
      setAthleteId(athletesFiltrados[0].id);
    }
  }, [athletesFiltrados, athleteId]);

  const resultados = useMemo<AthleteResult[]>(() => {
    return athletesFiltrados
      .map((athlete) => {
        const squat = getBestValidLift(attempts, athlete.id, "Sentadilla");
        const bench = getBestValidLift(attempts, athlete.id, "Press de banca");
        const deadlift = getBestValidLift(attempts, athlete.id, "Peso muerto");
        const total = squat + bench + deadlift;

        return {
          athlete,
          squat,
          bench,
          deadlift,
          total,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [athletesFiltrados, attempts]);

  const resultadoSeleccionado = useMemo(() => {
    return resultados.find((r) => r.athlete.id === athleteId) || null;
  }, [resultados, athleteId]);

  const handleBorrarResultados = async () => {
    const ok = window.confirm("¿Borrar todos los intentos registrados?");
    if (!ok) return;

    try {
      const { error } = await supabase.from("attempts").delete().not("id", "is", null);

      if (error) {
        alert(`Error al borrar resultados: ${formatError(error)}`);
        return;
      }

      await cargarTodo();
    } catch (error) {
      alert(`Error al borrar resultados: ${formatError(error)}`);
    }
  };

  return (
    <main className="resultados-page">
      <div className="bg-image" />
      <div className="resultados-overlay" />
      <div className="resultados-noise" />

      <section className="resultados-wrap">
        <header className="hero">
          <div>
            <h1>Resultados</h1>
            <p>Selecciona sexo, categoría y competidor para ver sus resultados.</p>
          </div>

          <div className="heroActions">
            <button className="dangerBtn" type="button" onClick={handleBorrarResultados}>
              Borrar resultados
            </button>
            <Link href="/" className="volverBtn">
              ← Volver
            </Link>
          </div>
        </header>

        {errorMsg && <div className="errorBox">{errorMsg}</div>}

        <section className="filtersCard">
          <div className="filtersGrid">
            <div className="field">
              <label>Sexo</label>
              <select value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)}>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="field">
              <label>Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {categoriasDisponibles.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Competidor</label>
              <select
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                disabled={athletesFiltrados.length === 0}
              >
                {athletesFiltrados.length === 0 ? (
                  <option value="">Sin competidores</option>
                ) : (
                  athletesFiltrados.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="emptyBox">Cargando resultados...</div>
          ) : resultados.length === 0 ? (
            <div className="emptyBox">
              No hay resultados para mostrar. Guarda atletas y al menos un intento en competencia.
            </div>
          ) : resultadoSeleccionado ? (
            <div className="resultCard">
              <div className="athleteHead">
                <div>
                  <span className="miniLabel">Competidor</span>
                  <h2>{resultadoSeleccionado.athlete.nombre}</h2>
                </div>

                <div className="headMeta">
                  <div>
                    <span>Club</span>
                    <strong>{resultadoSeleccionado.athlete.club || "—"}</strong>
                  </div>
                  <div>
                    <span>Categoría</span>
                    <strong>{resultadoSeleccionado.athlete.categoria}</strong>
                  </div>
                  <div>
                    <span>Peso corporal</span>
                    <strong>{resultadoSeleccionado.athlete.peso} kg</strong>
                  </div>
                </div>
              </div>

              <div className="marksGrid">
                <div className="markCard">
                  <span>Sentadilla</span>
                  <strong>{resultadoSeleccionado.squat} kg</strong>
                </div>
                <div className="markCard">
                  <span>Press de banca</span>
                  <strong>{resultadoSeleccionado.bench} kg</strong>
                </div>
                <div className="markCard">
                  <span>Peso muerto</span>
                  <strong>{resultadoSeleccionado.deadlift} kg</strong>
                </div>
                <div className="markCard totalCard">
                  <span>Total</span>
                  <strong>{resultadoSeleccionado.total} kg</strong>
                </div>
              </div>

              <div className="rankingBlock">
                <h3>Ranking de la categoría</h3>

                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Lugar</th>
                        <th>Competidor</th>
                        <th>Club</th>
                        <th>Sentadilla</th>
                        <th>Press</th>
                        <th>Peso muerto</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.map((item, index) => (
                        <tr
                          key={item.athlete.id}
                          className={
                            item.athlete.id === resultadoSeleccionado.athlete.id
                              ? "activeRow"
                              : ""
                          }
                        >
                          <td>#{index + 1}</td>
                          <td>{item.athlete.nombre}</td>
                          <td>{item.athlete.club || "—"}</td>
                          <td>{item.squat} kg</td>
                          <td>{item.bench} kg</td>
                          <td>{item.deadlift} kg</td>
                          <td>{item.total} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="emptyBox">No hay resultados para mostrar.</div>
          )}
        </section>
      </section>

      <style jsx>{`
        .resultados-page {
          position: relative;
          min-height: 100vh;
          padding: 16px;
          overflow: hidden;
        }

        .bg-image {
          position: fixed;
          inset: 0;
          background-image: url("/fondo.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transform: scale(1.02);
          filter: brightness(0.76) saturate(1);
        }

        .resultados-overlay {
          position: fixed;
          inset: 0;
          background:
            linear-gradient(rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.72)),
            radial-gradient(circle at 20% 20%, rgba(255, 170, 0, 0.08), transparent 30%),
            radial-gradient(circle at 80% 30%, rgba(0, 120, 255, 0.08), transparent 28%);
        }

        .resultados-noise {
          position: fixed;
          inset: 0;
          opacity: 0.035;
          background-image:
            radial-gradient(circle, rgba(255, 220, 140, 0.95) 1px, transparent 1.7px),
            radial-gradient(circle, rgba(255, 160, 0, 0.2) 1px, transparent 2px);
          background-size: 180px 180px, 260px 260px;
          background-position: 0 0, 60px 90px;
          pointer-events: none;
        }

        .resultados-wrap {
          position: relative;
          z-index: 1;
          width: min(100%, 1380px);
          margin: 0 auto;
          border-radius: 34px;
          padding: 28px;
          background: linear-gradient(135deg, rgba(18, 10, 4, 0.72), rgba(0, 0, 0, 0.52));
          backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(255, 190, 60, 0.16);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.34),
            inset 0 0 18px rgba(255, 166, 0, 0.035);
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 22px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 76px);
          line-height: 0.95;
          color: #fff7df;
          font-weight: 1000;
        }

        .hero p {
          margin: 10px 0 0;
          color: rgba(255, 255, 255, 0.88);
          font-size: 18px;
        }

        .heroActions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .dangerBtn,
        .volverBtn {
          min-height: 48px;
          padding: 0 18px;
          border-radius: 16px;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }

        .dangerBtn {
          border: 1px solid rgba(255, 90, 90, 0.25);
          background: rgba(50, 10, 10, 0.36);
          color: #ffb8b8;
          cursor: pointer;
        }

        .volverBtn {
          color: #fff;
        }

        .errorBox {
          margin-bottom: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(140, 20, 20, 0.5);
          border: 1px solid rgba(255, 110, 110, 0.35);
          color: #fff;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }

        .filtersCard {
          border-radius: 26px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 190, 60, 0.1);
          padding: 18px;
        }

        .filtersGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 16px;
          font-weight: 900;
          color: #fff;
        }

        .field select {
          width: 100%;
          min-height: 56px;
          border-radius: 18px;
          border: 1px solid rgba(255, 190, 60, 0.14);
          background: rgba(0, 0, 0, 0.42);
          color: #fff;
          padding: 0 18px;
          outline: none;
        }

        .emptyBox {
          margin-top: 18px;
          min-height: 110px;
          border-radius: 22px;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.24);
          border: 1px solid rgba(255, 190, 60, 0.08);
          color: rgba(255, 255, 255, 0.9);
          font-size: 18px;
          font-weight: 700;
          text-align: center;
          padding: 20px;
        }

        .resultCard {
          margin-top: 18px;
        }

        .athleteHead {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 20px;
          border-radius: 22px;
          background: rgba(0, 0, 0, 0.24);
          border: 1px solid rgba(255, 190, 60, 0.08);
        }

        .miniLabel {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #f5cf72;
        }

        .athleteHead h2 {
          margin: 0;
          color: #fff;
          font-size: 36px;
          font-weight: 1000;
        }

        .headMeta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          min-width: 520px;
        }

        .headMeta span {
          display: block;
          margin-bottom: 6px;
          color: #f5cf72;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .headMeta strong {
          color: #fff;
          font-size: 18px;
        }

        .marksGrid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .markCard {
          padding: 20px;
          border-radius: 22px;
          background: rgba(0, 0, 0, 0.24);
          border: 1px solid rgba(255, 190, 60, 0.08);
        }

        .markCard span {
          display: block;
          margin-bottom: 8px;
          color: #f5cf72;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .markCard strong {
          color: #fff;
          font-size: 34px;
          font-weight: 1000;
        }

        .totalCard {
          background: linear-gradient(180deg, rgba(247, 217, 121, 0.14), rgba(223, 168, 38, 0.14));
          border: 1px solid rgba(247, 217, 121, 0.18);
        }

        .rankingBlock {
          margin-top: 18px;
          padding: 20px;
          border-radius: 22px;
          background: rgba(0, 0, 0, 0.24);
          border: 1px solid rgba(255, 190, 60, 0.08);
        }

        .rankingBlock h3 {
          margin: 0 0 14px;
          color: #fff;
          font-size: 28px;
          font-weight: 1000;
        }

        .tableWrap {
          overflow: auto;
          border-radius: 18px;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        thead th {
          text-align: left;
          padding: 16px 14px;
          color: #f7d77a;
          font-size: 15px;
          font-weight: 1000;
          background:
            linear-gradient(
              90deg,
              rgba(14, 8, 0, 0.9),
              rgba(42, 22, 2, 0.86),
              rgba(10, 16, 28, 0.84)
            );
        }

        tbody td {
          padding: 14px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.045);
          color: rgba(255, 255, 255, 0.96);
          font-size: 14px;
          background: rgba(0, 0, 0, 0.18);
        }

        .activeRow td {
          background: rgba(247, 217, 121, 0.12);
        }

        @media (max-width: 1100px) {
          .filtersGrid,
          .marksGrid,
          .headMeta {
            grid-template-columns: 1fr;
          }

          .athleteHead {
            flex-direction: column;
          }
        }

        @media (max-width: 760px) {
          .hero {
            flex-direction: column;
          }

          .heroActions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </main>
  );
}