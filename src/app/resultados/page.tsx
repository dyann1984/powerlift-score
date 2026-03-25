"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Sexo = "Masculino" | "Femenino";
type Lift = "Sentadilla" | "Press banca" | "Peso muerto";

type Athlete = {
  id: string;
  nombre: string;
  sexo: Sexo;
  peso: number;
  categoria: string;
  club: string;
  foto?: string;
};

type AttemptValues = {
  squat1: number | null;
  squat2: number | null;
  squat3: number | null;
  bench1: number | null;
  bench2: number | null;
  bench3: number | null;
  deadlift1: number | null;
  deadlift2: number | null;
  deadlift3: number | null;
};

type AthleteResult = Athlete & AttemptValues;

const ATHLETES_STORAGE_KEY = "powerlift-athletes";

function bestOf(values: Array<number | null>) {
  return Math.max(...values.map((v) => v ?? 0), 0);
}

function totalOf(a: AthleteResult) {
  return (
    bestOf([a.squat1, a.squat2, a.squat3]) +
    bestOf([a.bench1, a.bench2, a.bench3]) +
    bestOf([a.deadlift1, a.deadlift2, a.deadlift3])
  );
}

function dots(value: number) {
  return Number((value * 0.62).toFixed(2));
}

function emptyAttempts(): AttemptValues {
  return {
    squat1: null,
    squat2: null,
    squat3: null,
    bench1: null,
    bench2: null,
    bench3: null,
    deadlift1: null,
    deadlift2: null,
    deadlift3: null,
  };
}

export default function ResultadosPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [results, setResults] = useState<Record<string, AttemptValues>>({});
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedSexo, setSelectedSexo] = useState("Todos");
  const [selectedLift, setSelectedLift] = useState<Lift>("Sentadilla");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ATHLETES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Athlete[];
        if (Array.isArray(parsed)) {
          setAthletes(parsed);

          const initialResults: Record<string, AttemptValues> = {};
          parsed.forEach((a) => {
            initialResults[a.id] = {
              squat1: null,
              squat2: null,
              squat3: null,
              bench1: null,
              bench2: null,
              bench3: null,
              deadlift1: null,
              deadlift2: null,
              deadlift3: null,
            };
          });
          setResults(initialResults);
        }
      }
    } catch {
      setAthletes([]);
      setResults({});
    }
  }, []);

  const categories = useMemo(() => {
    const all = Array.from(new Set(athletes.map((a) => a.categoria).filter(Boolean)));
    return ["Todas", ...all];
  }, [athletes]);

  const rows = useMemo(() => {
    const merged: AthleteResult[] = athletes.map((a) => ({
      ...a,
      ...(results[a.id] ?? emptyAttempts()),
    }));

    const filtered = merged.filter((a) => {
      const passCategory = selectedCategory === "Todas" || a.categoria === selectedCategory;
      const passSexo = selectedSexo === "Todos" || a.sexo === selectedSexo;
      return passCategory && passSexo;
    });

    const ranked = [...filtered].sort((a, b) => totalOf(b) - totalOf(a));

    return ranked.map((a, index) => ({
      ...a,
      rank: index + 1,
      squatBest: bestOf([a.squat1, a.squat2, a.squat3]),
      benchBest: bestOf([a.bench1, a.bench2, a.bench3]),
      deadliftBest: bestOf([a.deadlift1, a.deadlift2, a.deadlift3]),
      total: totalOf(a),
      dots: dots(totalOf(a)),
    }));
  }, [athletes, results, selectedCategory, selectedSexo]);

  const leader = rows[0] ?? null;

  const updateAttempt = (athleteId: string, key: keyof AttemptValues, value: string) => {
    const num = value.trim() === "" ? null : Number(value);
    setResults((prev) => ({
      ...prev,
      [athleteId]: {
        ...(prev[athleteId] ?? emptyAttempts()),
        [key]: Number.isNaN(num) ? null : num,
      },
    }));
  };

  const currentLiftCols = useMemo(() => {
    if (selectedLift === "Sentadilla") {
      return {
        keys: ["squat1", "squat2", "squat3"] as Array<keyof AttemptValues>,
        bestKey: "squatBest" as const,
      };
    }
    if (selectedLift === "Press banca") {
      return {
        keys: ["bench1", "bench2", "bench3"] as Array<keyof AttemptValues>,
        bestKey: "benchBest" as const,
      };
    }
    return {
      keys: ["deadlift1", "deadlift2", "deadlift3"] as Array<keyof AttemptValues>,
      bestKey: "deadliftBest" as const,
    };
  }, [selectedLift]);

  return (
    <main className="resultados-page">
      <div className="bg-image" />
      <div className="resultados-overlay" />
      <div className="resultados-noise" />

      <section className="resultados-wrap">
        <header className="hero">
          <div className="heroBrand">
            <div className="logoBox">
              <img src="/jaguar-logo.png" alt="Logo Powerlifting" className="logoImg" />
            </div>

            <div className="heroText">
              <p className="eyebrow">RESULTADOS</p>
              <h1>Ranking de competencia</h1>
              <p>Clasificación, intentos, mejores marcas y total general en un solo tablero</p>
            </div>
          </div>

          <Link href="/" className="volverBtn">
            ← Volver
          </Link>
        </header>

        <section className="topGrid">
          <article className="panel leaderPanel">
            <div className="panelGlow" />
            <div className="pill">LÍDER ACTUAL</div>
            <h2>Primer lugar</h2>

            {leader ? (
              <div className="leaderCard">
                <div className="leaderPhoto">
                  {leader.foto ? <img src={leader.foto} alt={leader.nombre} /> : <span>Sin foto</span>}
                </div>

                <div className="leaderInfo">
                  <div className="leaderName">{leader.nombre}</div>

                  <div className="leaderStats">
                    <div className="statBox">
                      <span>Categoría</span>
                      <strong>{leader.categoria}</strong>
                    </div>
                    <div className="statBox">
                      <span>Club</span>
                      <strong>{leader.club || "—"}</strong>
                    </div>
                    <div className="statBox">
                      <span>Total</span>
                      <strong>{leader.total} kg</strong>
                    </div>
                    <div className="statBox">
                      <span>Puntos</span>
                      <strong>{leader.dots}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="emptyLeader">Sin atletas registrados</div>
            )}
          </article>

          <article className="panel filtersPanel">
            <div className="panelGlow" />
            <div className="pill">FILTROS</div>
            <h2>Vista</h2>

            <div className="field">
              <label>Categoría</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Sexo</label>
              <select value={selectedSexo} onChange={(e) => setSelectedSexo(e.target.value)}>
                <option value="Todos">Todos</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="field">
              <label>Disciplina editable</label>
              <select value={selectedLift} onChange={(e) => setSelectedLift(e.target.value as Lift)}>
                <option value="Sentadilla">Sentadilla</option>
                <option value="Press banca">Press banca</option>
                <option value="Peso muerto">Peso muerto</option>
              </select>
            </div>
          </article>

          <article className="panel summaryPanel">
            <div className="panelGlow" />
            <div className="pill">RESUMEN</div>
            <h2>Competencia</h2>

            <div className="summaryGrid">
              <div className="summaryBox">
                <span>Atletas</span>
                <strong>{rows.length}</strong>
              </div>
              <div className="summaryBox">
                <span>Disciplina</span>
                <strong>{selectedLift}</strong>
              </div>
              <div className="summaryBox">
                <span>Mejor total</span>
                <strong>{leader ? `${leader.total} kg` : "0 kg"}</strong>
              </div>
              <div className="summaryBox">
                <span>Mejor puntaje</span>
                <strong>{leader ? leader.dots : 0}</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="bottomGrid">
          <article className="panel tablePanel">
            <div className="panelGlow" />
            <div className="pill">TABLERO GENERAL</div>
            <h2>Clasificación</h2>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th className="colRank">Rank</th>
                    <th className="colFoto">Foto</th>
                    <th>Nombre</th>
                    <th>Club</th>
                    <th>Categoría</th>
                    <th>Peso</th>
                    <th>I1</th>
                    <th>I2</th>
                    <th>I3</th>
                    <th>Mejor</th>
                    <th>Total</th>
                    <th>Puntos</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="emptyCell">
                        ⚠️ Sin datos para mostrar
                      </td>
                    </tr>
                  ) : (
                    rows.map((a) => (
                      <tr key={a.id}>
                        <td className="rankCell">{a.rank}</td>
                        <td className="colFoto">
                          {a.foto ? (
                            <img src={a.foto} alt={a.nombre} className="miniFoto" />
                          ) : (
                            <div className="miniFoto miniFotoEmpty">FOTO</div>
                          )}
                        </td>
                        <td className="nameCell">{a.nombre}</td>
                        <td>{a.club || "—"}</td>
                        <td>{a.categoria}</td>
                        <td>{a.peso} kg</td>

                        {currentLiftCols.keys.map((key) => (
                          <td key={key}>
                            <input
                              className="attemptInput"
                              type="number"
                              value={results[a.id]?.[key] ?? ""}
                              onChange={(e) => updateAttempt(a.id, key, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                        ))}

                        <td className="bestCell">{a[currentLiftCols.bestKey]} kg</td>
                        <td className="totalCell">{a.total} kg</td>
                        <td className="pointsCell">{a.dots}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </section>

      <style jsx>{`
        .resultados-page {
          position: relative;
          min-height: 100vh;
          padding: 10px;
          overflow: hidden;
        }

        .bg-image {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image: url("/fondo.png");
          background-size: cover;
          background-position: center top;
          background-repeat: no-repeat;
          transform: scale(1.01);
          filter: brightness(0.76) saturate(0.95);
        }

        .resultados-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.72)),
            radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.08), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(0, 120, 255, 0.06), transparent 30%);
        }

        .resultados-noise {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.03;
          background-image:
            radial-gradient(circle, rgba(255, 220, 140, 0.95) 1px, transparent 1.7px),
            radial-gradient(circle, rgba(255, 160, 0, 0.2) 1px, transparent 2px);
          background-size: 180px 180px, 260px 260px;
          background-position: 0 0, 60px 90px;
        }

        .resultados-wrap {
          position: relative;
          z-index: 1;
          width: min(100%, 1580px);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          padding: 2px 4px 0;
        }

        .heroBrand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .logoBox {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          background: rgba(10, 10, 10, 0.34);
          backdrop-filter: blur(10px) saturate(135%);
          border: 1px solid rgba(255, 196, 60, 0.16);
          display: grid;
          place-items: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow:
            0 10px 22px rgba(0, 0, 0, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .logoImg {
          width: 42px;
          height: 42px;
          object-fit: contain;
          filter: drop-shadow(0 0 8px rgba(255, 196, 60, 0.14));
        }

        .eyebrow {
          margin: 0 0 4px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.3em;
          color: #f5cf72;
        }

        .heroText h1 {
          margin: 0;
          font-size: clamp(26px, 2.8vw, 56px);
          line-height: 0.95;
          font-weight: 1000;
          color: #fff7df;
        }

        .heroText p {
          margin: 4px 0 0;
          font-size: clamp(12px, 0.9vw, 15px);
          color: rgba(255, 255, 255, 0.88);
        }

        .volverBtn {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 14px;
          background: rgba(10, 10, 10, 0.34);
          backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          color: #fff;
          white-space: nowrap;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        }

        .topGrid {
          display: grid;
          grid-template-columns: 1.1fr 0.75fr 0.75fr;
          gap: 10px;
        }

        .bottomGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .panel {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(18, 10, 4, 0.42),
            rgba(0, 0, 0, 0.34)
          );
          backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(255, 190, 60, 0.14);
          border-radius: 24px;
          padding: 12px;
          overflow: hidden;
          box-shadow:
            0 14px 28px rgba(0, 0, 0, 0.3),
            inset 0 0 14px rgba(255, 166, 0, 0.03);
        }

        .panelGlow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at top left, rgba(255, 196, 60, 0.03), transparent 20%),
            radial-gradient(circle at bottom right, rgba(0, 136, 255, 0.025), transparent 24%);
          z-index: 0;
        }

        .pill,
        .panel h2,
        .leaderCard,
        .field,
        .summaryGrid,
        .tableWrap,
        .emptyLeader {
          position: relative;
          z-index: 1;
        }

        .pill {
          display: inline-flex;
          width: fit-content;
          padding: 5px 10px;
          border-radius: 999px;
          background: rgba(70, 46, 10, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.16);
          color: #f5d27c;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
        }

        .panel h2 {
          margin: 8px 0 10px;
          font-size: clamp(22px, 1.9vw, 40px);
          line-height: 1;
          color: #ffffff;
          font-weight: 1000;
        }

        .leaderCard {
          display: grid;
          grid-template-columns: 92px 1fr;
          gap: 12px;
        }

        .leaderPhoto {
          width: 92px;
          height: 92px;
          border-radius: 18px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.46);
          border: 1px solid rgba(255, 196, 60, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.88);
          font-size: 12px;
          font-weight: 900;
        }

        .leaderPhoto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .leaderInfo {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .leaderName {
          font-size: clamp(20px, 1.8vw, 34px);
          font-weight: 1000;
          color: #fff;
          line-height: 0.95;
        }

        .leaderStats,
        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .statBox,
        .summaryBox {
          background: rgba(0, 0, 0, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.08);
          border-radius: 14px;
          padding: 10px;
          backdrop-filter: blur(6px);
        }

        .statBox span,
        .summaryBox span {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.64);
          margin-bottom: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .statBox strong,
        .summaryBox strong {
          color: #fff;
          font-size: 13px;
        }

        .emptyLeader {
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.86);
          font-weight: 900;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 8px;
        }

        .field label {
          font-weight: 900;
          font-size: 13px;
          color: #fff;
        }

        .field select {
          width: 100%;
          min-height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(255, 190, 60, 0.12);
          background: rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(6px);
          color: #fff;
          padding: 0 12px;
          outline: none;
          font-size: 13px;
        }

        .tableWrap {
          overflow: auto;
          border-radius: 18px;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
          min-width: 1180px;
        }

        thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          text-align: left;
          padding: 14px 10px;
          color: #f7d77a;
          font-size: 14px;
          font-weight: 1000;
          background:
            linear-gradient(
              90deg,
              rgba(14, 8, 0, 0.9),
              rgba(42, 22, 2, 0.86),
              rgba(10, 16, 28, 0.84)
            );
          backdrop-filter: blur(10px) saturate(140%);
          border-bottom: 1px solid rgba(255, 220, 140, 0.12);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.2);
        }

        tbody td {
          padding: 12px 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.045);
          vertical-align: middle;
          color: rgba(255, 255, 255, 0.96);
          font-size: 13px;
          background: rgba(0, 0, 0, 0.18);
        }

        tbody tr:hover {
          background: rgba(255, 166, 0, 0.035);
        }

        .colRank {
          width: 64px;
        }

        .colFoto {
          width: 84px;
        }

        .rankCell {
          font-weight: 1000;
          color: #f7d77a;
        }

        .nameCell,
        .bestCell,
        .totalCell,
        .pointsCell {
          font-weight: 900;
        }

        .miniFoto {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          object-fit: cover;
          background: rgba(16, 16, 16, 0.45);
          border: 1px solid rgba(255, 196, 60, 0.1);
        }

        .miniFotoEmpty {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.76);
          font-size: 11px;
          font-weight: 900;
        }

        .attemptInput {
          width: 100%;
          min-height: 38px;
          border-radius: 12px;
          border: 1px solid rgba(255, 190, 60, 0.1);
          background: rgba(0, 0, 0, 0.36);
          color: #fff;
          padding: 0 10px;
          outline: none;
          font-size: 13px;
        }

        .attemptInput:focus {
          border-color: rgba(255, 196, 60, 0.24);
          background: rgba(0, 0, 0, 0.5);
        }

        .emptyCell {
          text-align: center;
          padding: 56px 20px !important;
          font-size: 18px;
          color: rgba(255, 220, 150, 0.96);
          font-weight: 1000;
          background: rgba(0, 0, 0, 0.16);
        }

        @media (max-width: 1200px) {
          .topGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .logoBox {
            width: 54px;
            height: 54px;
          }

          .logoImg {
            width: 38px;
            height: 38px;
          }

          .heroText h1 {
            font-size: clamp(28px, 8vw, 44px);
          }

          .heroText p {
            font-size: 13px;
          }

          .panel {
            padding: 12px;
            border-radius: 20px;
          }

          .panel h2 {
            font-size: 26px;
          }

          .leaderCard,
          .leaderStats,
          .summaryGrid {
            grid-template-columns: 1fr;
          }

          .leaderPhoto {
            width: 110px;
            height: 110px;
          }
        }
      `}</style>
    </main>
  );
}