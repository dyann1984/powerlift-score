"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Sexo = "Masculino" | "Femenino";
type Lift = "Sentadilla" | "Press banca" | "Peso muerto";
type JudgeVote = "white" | "red" | null;

type Athlete = {
  id: string;
  nombre: string;
  sexo: Sexo;
  peso: number;
  categoria: string;
  club: string;
  foto?: string;
};

const ATHLETES_STORAGE_KEY = "powerlift-athletes";

export default function JuecesPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [lift, setLift] = useState<Lift>("Sentadilla");
  const [attempt, setAttempt] = useState(1);
  const [requestedWeight, setRequestedWeight] = useState("120");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [judge1, setJudge1] = useState<JudgeVote>(null);
  const [judge2, setJudge2] = useState<JudgeVote>(null);
  const [judge3, setJudge3] = useState<JudgeVote>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ATHLETES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Athlete[];
        if (Array.isArray(parsed)) {
          setAthletes(parsed);
          if (parsed[0]?.id) setSelectedAthleteId(parsed[0].id);
        }
      }
    } catch {
      setAthletes([]);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const athlete = useMemo(() => {
    return athletes.find((a) => a.id === selectedAthleteId) ?? null;
  }, [athletes, selectedAthleteId]);

  const whiteCount = [judge1, judge2, judge3].filter((v) => v === "white").length;
  const redCount = [judge1, judge2, judge3].filter((v) => v === "red").length;

  const finalResult = useMemo(() => {
    if (whiteCount >= 2) return "VÁLIDO";
    if (redCount >= 2) return "NULO";
    return "EN ESPERA";
  }, [whiteCount, redCount]);

  const resultClass =
    finalResult === "VÁLIDO"
      ? "resultValid"
      : finalResult === "NULO"
      ? "resultInvalid"
      : "resultPending";

  const resetRound = () => {
    setJudge1(null);
    setJudge2(null);
    setJudge3(null);
    setTimeLeft(60);
    setIsRunning(false);
  };

  const nextAthlete = () => {
    if (!athletes.length || !selectedAthleteId) return;
    const currentIndex = athletes.findIndex((a) => a.id === selectedAthleteId);
    const nextIndex = currentIndex >= athletes.length - 1 ? 0 : currentIndex + 1;
    setSelectedAthleteId(athletes[nextIndex].id);
    resetRound();
  };

  const previousAthlete = () => {
    if (!athletes.length || !selectedAthleteId) return;
    const currentIndex = athletes.findIndex((a) => a.id === selectedAthleteId);
    const prevIndex = currentIndex <= 0 ? athletes.length - 1 : currentIndex - 1;
    setSelectedAthleteId(athletes[prevIndex].id);
    resetRound();
  };

  const nextAttempt = () => {
    setAttempt((prev) => (prev >= 3 ? 1 : prev + 1));
    resetRound();
  };

  const previousAttempt = () => {
    setAttempt((prev) => (prev <= 1 ? 1 : prev - 1));
    resetRound();
  };

  const startTimer = () => {
    if (timeLeft <= 0) setTimeLeft(60);
    setIsRunning(true);
  };

  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const timerClass =
    timeLeft <= 10 ? "timerDanger" : timeLeft <= 20 ? "timerWarn" : "timerSafe";

  return (
    <main className="jueces-page">
      <div className="bg-image" />
      <div className="jueces-overlay" />
      <div className="jueces-noise" />

      <section className="jueces-wrap">
        <header className="hero">
          <div className="heroBrand">
            <div className="logoBox">
              <img src="/jaguar-logo.png" alt="Logo Powerlifting" className="logoImg" />
            </div>

            <div className="heroText">
              <p className="eyebrow">JUECES</p>
              <h1>Panel de validación</h1>
              <p>Control visual de luces, cronómetro oficial y resultado en tiempo real</p>
            </div>
          </div>

          <Link href="/" className="volverBtn">
            ← Volver
          </Link>
        </header>

        <section className="dashboardGrid">
          <article className="panel athletePanel">
            <div className="panelGlow" />
            <div className="pill">ATLETA ACTUAL</div>
            <h2>Competidor</h2>

            <div className="athleteCard">
              <div className="athletePhoto">
                {athlete?.foto ? (
                  <img src={athlete.foto} alt={athlete.nombre} />
                ) : (
                  <span>Sin foto</span>
                )}
              </div>

              <div className="athleteInfo">
                <div className="athleteName">{athlete?.nombre || "Sin atletas registrados"}</div>

                <div className="metaGrid">
                  <div className="metaBox">
                    <span className="metaLabel">Club</span>
                    <strong>{athlete?.club || "—"}</strong>
                  </div>
                  <div className="metaBox">
                    <span className="metaLabel">Categoría</span>
                    <strong>{athlete?.categoria || "—"}</strong>
                  </div>
                  <div className="metaBox">
                    <span className="metaLabel">Sexo</span>
                    <strong>{athlete?.sexo || "—"}</strong>
                  </div>
                  <div className="metaBox">
                    <span className="metaLabel">Peso corporal</span>
                    <strong>{athlete ? `${athlete.peso} kg` : "—"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="field compactSpace">
              <label>Seleccionar atleta</label>
              <select
                value={selectedAthleteId}
                onChange={(e) => {
                  setSelectedAthleteId(e.target.value);
                  resetRound();
                }}
              >
                {athletes.length === 0 ? (
                  <option value="">Sin atletas</option>
                ) : (
                  athletes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="navActions">
              <button className="ghostBtn" onClick={previousAthlete}>
                ← Anterior
              </button>
              <button className="ghostBtn" onClick={nextAthlete}>
                Siguiente →
              </button>
            </div>
          </article>

          <article className="panel configPanel">
            <div className="panelGlow" />
            <div className="pill">INTENTO ACTUAL</div>
            <h2>Configuración</h2>

            <div className="field compactSpace">
              <label>Disciplina</label>
              <select value={lift} onChange={(e) => setLift(e.target.value as Lift)}>
                <option value="Sentadilla">Sentadilla</option>
                <option value="Press banca">Press banca</option>
                <option value="Peso muerto">Peso muerto</option>
              </select>
            </div>

            <div className="twoCols">
              <div className="field compactSpace">
                <label>Intento</label>
                <div className="stepper">
                  <button className="miniBtn" onClick={previousAttempt}>
                    −
                  </button>
                  <div className="stepperValue">{attempt}</div>
                  <button className="miniBtn" onClick={nextAttempt}>
                    +
                  </button>
                </div>
              </div>

              <div className="field compactSpace">
                <label>Peso solicitado</label>
                <input
                  type="number"
                  value={requestedWeight}
                  onChange={(e) => setRequestedWeight(e.target.value)}
                  placeholder="Ej. 120"
                />
              </div>
            </div>

            <div className="attemptSummary">
              <div className="summaryBox">
                <span className="summaryLabel">Disciplina</span>
                <strong>{lift}</strong>
              </div>
              <div className="summaryBox">
                <span className="summaryLabel">Intento</span>
                <strong>{attempt}°</strong>
              </div>
              <div className="summaryBox">
                <span className="summaryLabel">Peso</span>
                <strong>{requestedWeight || "0"} kg</strong>
              </div>
            </div>
          </article>

          <article className="panel timerPanel">
            <div className="panelGlow" />
            <div className="pill">CRONÓMETRO</div>
            <h2>Tiempo oficial</h2>

            <div className={`timerDisplay ${timerClass}`}>{formatTime(timeLeft)}</div>

            <div className="timerActions">
              <button className="primaryBtn" onClick={startTimer}>
                Iniciar
              </button>
              <button className="ghostBtn" onClick={pauseTimer}>
                Pausar
              </button>
              <button className="ghostBtn" onClick={resetTimer}>
                Reiniciar
              </button>
            </div>
          </article>

          <article className="panel lightsPanel">
            <div className="panelGlow" />
            <div className="pill">DECISIÓN DE JUECES</div>
            <h2>Luces</h2>

            <div className="lightsGrid">
              <div className="judgeCard">
                <div className="judgeHeader">Juez 1</div>
                <div
                  className={`lightOrb ${
                    judge1 === "white" ? "lightWhite activeWhite" : ""
                  } ${judge1 === "red" ? "lightRed activeRed" : ""}`}
                >
                  {judge1 === "white" ? "⚪" : judge1 === "red" ? "🔴" : "—"}
                </div>
                <div className="judgeButtons">
                  <button className="whiteBtn" onClick={() => setJudge1("white")}>
                    Válido
                  </button>
                  <button className="redBtn" onClick={() => setJudge1("red")}>
                    Nulo
                  </button>
                </div>
              </div>

              <div className="judgeCard">
                <div className="judgeHeader">Juez 2</div>
                <div
                  className={`lightOrb ${
                    judge2 === "white" ? "lightWhite activeWhite" : ""
                  } ${judge2 === "red" ? "lightRed activeRed" : ""}`}
                >
                  {judge2 === "white" ? "⚪" : judge2 === "red" ? "🔴" : "—"}
                </div>
                <div className="judgeButtons">
                  <button className="whiteBtn" onClick={() => setJudge2("white")}>
                    Válido
                  </button>
                  <button className="redBtn" onClick={() => setJudge2("red")}>
                    Nulo
                  </button>
                </div>
              </div>

              <div className="judgeCard">
                <div className="judgeHeader">Juez 3</div>
                <div
                  className={`lightOrb ${
                    judge3 === "white" ? "lightWhite activeWhite" : ""
                  } ${judge3 === "red" ? "lightRed activeRed" : ""}`}
                >
                  {judge3 === "white" ? "⚪" : judge3 === "red" ? "🔴" : "—"}
                </div>
                <div className="judgeButtons">
                  <button className="whiteBtn" onClick={() => setJudge3("white")}>
                    Válido
                  </button>
                  <button className="redBtn" onClick={() => setJudge3("red")}>
                    Nulo
                  </button>
                </div>
              </div>
            </div>

            <div className="resetVotesRow">
              <button className="ghostBtn" onClick={resetRound}>
                Limpiar ronda
              </button>
            </div>
          </article>

          <article className="panel resultPanel">
            <div className="panelGlow" />
            <div className="pill">RESULTADO OFICIAL</div>
            <h2>Veredicto</h2>

            <div className={`finalResult ${resultClass}`}>{finalResult}</div>

            <div className="resultStats">
              <div className="resultStat resultWhite">
                <span>Blancas</span>
                <strong>{whiteCount}</strong>
              </div>
              <div className="resultStat resultRed">
                <span>Rojas</span>
                <strong>{redCount}</strong>
              </div>
            </div>

            <div className="bigInfo">
              <div className="bigInfoRow">
                <span>Atleta</span>
                <strong>{athlete?.nombre || "—"}</strong>
              </div>
              <div className="bigInfoRow">
                <span>Disciplina</span>
                <strong>{lift}</strong>
              </div>
              <div className="bigInfoRow">
                <span>Intento</span>
                <strong>{attempt}°</strong>
              </div>
              <div className="bigInfoRow">
                <span>Peso</span>
                <strong>{requestedWeight || "0"} kg</strong>
              </div>
            </div>
          </article>
        </section>
      </section>

      <style jsx>{`
        .jueces-page {
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

        .jueces-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.7)),
            radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.08), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(0, 120, 255, 0.06), transparent 30%);
        }

        .jueces-noise {
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

        .jueces-wrap {
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
          -webkit-backdrop-filter: blur(10px) saturate(135%);
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

        .heroText {
          min-width: 0;
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
          text-shadow:
            0 0 8px rgba(255, 190, 60, 0.08),
            0 0 12px rgba(255, 130, 0, 0.04);
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
          -webkit-backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          color: #fff;
          white-space: nowrap;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
          transition: all 0.2s ease;
        }

        .dashboardGrid {
          display: grid;
          grid-template-columns: 1.08fr 0.82fr 0.68fr;
          grid-template-areas:
            "athlete config timer"
            "lights lights result";
          gap: 10px;
          align-items: stretch;
        }

        .athletePanel {
          grid-area: athlete;
        }

        .configPanel {
          grid-area: config;
        }

        .timerPanel {
          grid-area: timer;
        }

        .lightsPanel {
          grid-area: lights;
        }

        .resultPanel {
          grid-area: result;
        }

        .panel {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(18, 10, 4, 0.42),
            rgba(0, 0, 0, 0.34)
          );
          backdrop-filter: blur(12px) saturate(140%);
          -webkit-backdrop-filter: blur(12px) saturate(140%);
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
        .athleteCard,
        .field,
        .navActions,
        .attemptSummary,
        .timerDisplay,
        .timerActions,
        .lightsGrid,
        .resetVotesRow,
        .finalResult,
        .resultStats,
        .bigInfo {
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

        .athleteCard {
          display: grid;
          grid-template-columns: 90px 1fr;
          gap: 12px;
          margin-bottom: 10px;
        }

        .athletePhoto {
          width: 90px;
          height: 90px;
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

        .athletePhoto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .athleteInfo {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .athleteName {
          font-size: clamp(20px, 1.8vw, 34px);
          font-weight: 1000;
          color: #fff;
          line-height: 0.95;
        }

        .metaGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .metaBox,
        .summaryBox,
        .resultStat,
        .bigInfoRow {
          background: rgba(0, 0, 0, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.08);
          border-radius: 14px;
          padding: 10px;
          backdrop-filter: blur(6px);
        }

        .metaLabel,
        .summaryLabel {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.64);
          margin-bottom: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .metaBox strong,
        .summaryBox strong,
        .bigInfoRow strong {
          color: #fff;
          font-size: 13px;
        }

        .compactSpace {
          margin-bottom: 8px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-weight: 900;
          font-size: 13px;
          color: #fff;
        }

        .field input,
        .field select {
          width: 100%;
          min-height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(255, 190, 60, 0.12);
          background: rgba(0, 0, 0, 0.42);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #fff;
          padding: 0 12px;
          outline: none;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .field input:focus,
        .field select:focus {
          border-color: rgba(255, 196, 60, 0.24);
          background: rgba(0, 0, 0, 0.5);
          transform: translateY(-1px);
        }

        .twoCols {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 8px;
          margin-bottom: 8px;
        }

        .stepper {
          display: grid;
          grid-template-columns: 42px 1fr 42px;
          gap: 8px;
          align-items: center;
        }

        .stepperValue {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(0, 0, 0, 0.42);
          border: 1px solid rgba(255, 190, 60, 0.12);
          color: #fff;
          font-size: 18px;
          font-weight: 1000;
        }

        .miniBtn,
        .primaryBtn,
        .ghostBtn,
        .whiteBtn,
        .redBtn {
          border: none;
          cursor: pointer;
          font-weight: 1000;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .miniBtn {
          min-height: 42px;
          border-radius: 14px;
          background: rgba(10, 10, 10, 0.42);
          color: #f6d878;
          border: 1px solid rgba(255, 196, 60, 0.12);
          font-size: 22px;
        }

        .primaryBtn,
        .ghostBtn {
          min-height: 42px;
          border-radius: 14px;
          padding: 0 14px;
          font-size: 13px;
        }

        .primaryBtn {
          background: linear-gradient(180deg, #f7d979 0%, #dfa826 100%);
          color: #111;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.24);
        }

        .ghostBtn {
          background: rgba(10, 10, 10, 0.38);
          color: #f6d878;
          border: 1px solid rgba(255, 196, 60, 0.12);
        }

        .navActions {
          display: flex;
          gap: 8px;
        }

        .navActions .ghostBtn {
          flex: 1;
        }

        .attemptSummary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 4px;
        }

        .timerPanel {
          display: flex;
          flex-direction: column;
        }

        .timerDisplay {
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.38);
          border: 1px solid rgba(255, 196, 60, 0.1);
          font-size: clamp(40px, 3.8vw, 70px);
          font-weight: 1000;
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }

        .timerSafe {
          color: #f7d979;
          text-shadow: 0 0 12px rgba(255, 196, 60, 0.1);
        }

        .timerWarn {
          color: #ffbf47;
          text-shadow: 0 0 14px rgba(255, 191, 71, 0.14);
        }

        .timerDanger {
          color: #ff5d57;
          text-shadow: 0 0 16px rgba(255, 93, 87, 0.2);
        }

        .timerActions {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .lightsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .judgeCard {
          background: rgba(0, 0, 0, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.08);
          border-radius: 18px;
          padding: 12px;
          text-align: center;
          backdrop-filter: blur(6px);
        }

        .judgeHeader {
          color: #fff;
          font-weight: 1000;
          font-size: 18px;
          margin-bottom: 10px;
        }

        .lightOrb {
          width: 92px;
          height: 92px;
          margin: 0 auto 10px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 1000;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.08);
          box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.26);
        }

        .lightWhite {
          background: rgba(255, 255, 255, 0.12);
        }

        .lightRed {
          background: rgba(255, 80, 80, 0.18);
        }

        .activeWhite {
          border-color: rgba(255, 255, 255, 0.75);
          box-shadow:
            0 0 20px rgba(255, 255, 255, 0.18),
            inset 0 0 18px rgba(255, 255, 255, 0.16);
        }

        .activeRed {
          border-color: rgba(255, 90, 90, 0.75);
          box-shadow:
            0 0 20px rgba(255, 80, 80, 0.18),
            inset 0 0 18px rgba(255, 80, 80, 0.16);
        }

        .judgeButtons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .whiteBtn,
        .redBtn {
          min-height: 40px;
          border-radius: 12px;
          font-size: 12px;
        }

        .whiteBtn {
          background: linear-gradient(180deg, #ffffff 0%, #dbdbdb 100%);
          color: #111;
          box-shadow: 0 8px 14px rgba(0, 0, 0, 0.22);
        }

        .redBtn {
          background: linear-gradient(180deg, #ff6f61 0%, #db433b 100%);
          color: #fff;
          box-shadow: 0 8px 14px rgba(0, 0, 0, 0.22);
        }

        .resetVotesRow {
          margin-top: 10px;
          display: flex;
          justify-content: flex-end;
        }

        .finalResult {
          min-height: 120px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(28px, 2.4vw, 48px);
          font-weight: 1000;
          margin-bottom: 10px;
          border: 1px solid rgba(255, 196, 60, 0.08);
          background: rgba(0, 0, 0, 0.34);
          text-align: center;
          padding: 12px;
        }

        .resultPending {
          color: #f7d979;
        }

        .resultValid {
          color: #ffffff;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.14),
            rgba(255, 255, 255, 0.06)
          );
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.1);
        }

        .resultInvalid {
          color: #ff8b85;
          background: linear-gradient(
            180deg,
            rgba(255, 80, 80, 0.16),
            rgba(255, 80, 80, 0.06)
          );
          box-shadow: 0 0 18px rgba(255, 80, 80, 0.1);
        }

        .resultStats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }

        .resultStat {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .resultStat span {
          color: rgba(255, 255, 255, 0.74);
          font-weight: 800;
          font-size: 12px;
        }

        .resultStat strong {
          font-size: 22px;
          color: #fff;
        }

        .resultWhite strong {
          color: #ffffff;
        }

        .resultRed strong {
          color: #ff8b85;
        }

        .bigInfo {
          display: grid;
          gap: 8px;
        }

        .bigInfoRow {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .bigInfoRow span {
          color: rgba(255, 255, 255, 0.72);
          font-weight: 800;
          font-size: 12px;
        }

        @media (max-width: 1300px) {
          .dashboardGrid {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "athlete config"
              "timer result"
              "lights lights";
          }
        }

        @media (max-width: 980px) {
          .dashboardGrid {
            grid-template-columns: 1fr;
            grid-template-areas:
              "athlete"
              "config"
              "timer"
              "lights"
              "result";
          }

          .athleteCard {
            grid-template-columns: 1fr;
          }

          .athletePhoto {
            width: 110px;
            height: 110px;
          }

          .lightsGrid {
            grid-template-columns: 1fr;
          }

          .timerActions,
          .attemptSummary,
          .resultStats,
          .twoCols,
          .metaGrid {
            grid-template-columns: 1fr;
          }

          .lightOrb {
            width: 110px;
            height: 110px;
            font-size: 38px;
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

          .navActions,
          .timerActions {
            grid-template-columns: 1fr;
            display: grid;
          }
        }
      `}</style>
    </main>
  );
}