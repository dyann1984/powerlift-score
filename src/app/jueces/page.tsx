"use client";

import "./jueces.css";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type LiftType = "Sentadilla" | "Press banca" | "Peso muerto";
type JudgeDecision = "white" | "red" | null;

type AthleteAttempt = {
  id: number;
  atleta: string;
  club: string;
  categoria: string;
  levantamiento: LiftType;
  intento: 1 | 2 | 3;
  peso: number;
};

const colaInicial: AthleteAttempt[] = [
  {
    id: 1,
    atleta: "Juan García",
    club: "Atlas Gym",
    categoria: "83 kg",
    levantamiento: "Sentadilla",
    intento: 1,
    peso: 180,
  },
  {
    id: 2,
    atleta: "Ana Gómez",
    club: "Titan Club",
    categoria: "57 kg",
    levantamiento: "Press banca",
    intento: 2,
    peso: 72,
  },
  {
    id: 3,
    atleta: "Luis Martínez",
    club: "Power House",
    categoria: "93 kg",
    levantamiento: "Peso muerto",
    intento: 1,
    peso: 240,
  },
];

function getResultado(
  j1: JudgeDecision,
  j2: JudgeDecision,
  j3: JudgeDecision
) {
  const votes = [j1, j2, j3];
  const blancos = votes.filter((v) => v === "white").length;
  const rojos = votes.filter((v) => v === "red").length;

  if (blancos + rojos < 3) {
    return "Pendiente";
  }

  return blancos >= 2 ? "Válido" : "Nulo";
}

export default function JuecesPage() {
  const [cola, setCola] = useState<AthleteAttempt[]>(colaInicial);
  const [historial, setHistorial] = useState<
    Array<AthleteAttempt & { resultado: string }>
  >([]);

  const [judge1, setJudge1] = useState<JudgeDecision>(null);
  const [judge2, setJudge2] = useState<JudgeDecision>(null);
  const [judge3, setJudge3] = useState<JudgeDecision>(null);

  const actual = cola[0] ?? null;

  const resultado = useMemo(
    () => getResultado(judge1, judge2, judge3),
    [judge1, judge2, judge3]
  );

  const reiniciarVotacion = () => {
    setJudge1(null);
    setJudge2(null);
    setJudge3(null);
  };

  const registrarResultado = () => {
    if (!actual) return;
    if (resultado === "Pendiente") {
      alert("Faltan decisiones de los jueces.");
      return;
    }

    setHistorial((prev) => [
      {
        ...actual,
        resultado,
      },
      ...prev,
    ]);

    setCola((prev) => prev.slice(1));
    reiniciarVotacion();
  };

  const saltarTurno = () => {
    if (!actual) return;

    setCola((prev) => {
      if (prev.length <= 1) return prev;
      return [...prev.slice(1), prev[0]];
    });

    reiniciarVotacion();
  };

  return (
    <main className="jueces-page">
      <div className="jueces-shell">
        <header className="jueces-header">
          <div className="jueces-brand">
            <div className="jueces-logo-box">
              <Image
                src="/jaguar-logo.png"
                alt="Powerlift Tlalmanalco"
                width={82}
                height={82}
                className="jueces-logo"
                priority
              />
            </div>

            <div className="jueces-title-wrap">
              <p className="jueces-kicker">PANEL DE JUECES</p>
              <h1 className="jueces-title">Calificación oficial</h1>
              <p className="jueces-subtitle">
                Control de intentos, decisión de jueces y avance del siguiente competidor
              </p>
            </div>
          </div>

          <Link href="/" className="jueces-back-btn">
            ← Volver
          </Link>
        </header>

        <section className="jueces-grid">
          <article className="j-card j-main-card">
            <div className="j-tag">TURNO ACTUAL</div>

            {actual ? (
              <>
                <div className="j-atleta-head">
                  <div>
                    <h2>{actual.atleta}</h2>
                    <p>
                      {actual.club} · {actual.categoria}
                    </p>
                  </div>

                  <div className="j-peso-box">
                    <span>Peso</span>
                    <strong>{actual.peso} kg</strong>
                  </div>
                </div>

                <div className="j-atleta-meta">
                  <div className="j-meta-pill">
                    <span>Levantamiento</span>
                    <strong>{actual.levantamiento}</strong>
                  </div>

                  <div className="j-meta-pill">
                    <span>Intento</span>
                    <strong>{actual.intento}</strong>
                  </div>

                  <div className="j-meta-pill">
                    <span>Estado</span>
                    <strong>{resultado}</strong>
                  </div>
                </div>

                <div className="j-judges-row">
                  <div className="judge-card">
                    <span>Juez 1</span>
                    <div className="judge-actions">
                      <button
                        className={`judge-btn white ${judge1 === "white" ? "active" : ""}`}
                        onClick={() => setJudge1("white")}
                      >
                        Blanco
                      </button>
                      <button
                        className={`judge-btn red ${judge1 === "red" ? "active" : ""}`}
                        onClick={() => setJudge1("red")}
                      >
                        Rojo
                      </button>
                    </div>
                  </div>

                  <div className="judge-card">
                    <span>Juez 2</span>
                    <div className="judge-actions">
                      <button
                        className={`judge-btn white ${judge2 === "white" ? "active" : ""}`}
                        onClick={() => setJudge2("white")}
                      >
                        Blanco
                      </button>
                      <button
                        className={`judge-btn red ${judge2 === "red" ? "active" : ""}`}
                        onClick={() => setJudge2("red")}
                      >
                        Rojo
                      </button>
                    </div>
                  </div>

                  <div className="judge-card">
                    <span>Juez 3</span>
                    <div className="judge-actions">
                      <button
                        className={`judge-btn white ${judge3 === "white" ? "active" : ""}`}
                        onClick={() => setJudge3("white")}
                      >
                        Blanco
                      </button>
                      <button
                        className={`judge-btn red ${judge3 === "red" ? "active" : ""}`}
                        onClick={() => setJudge3("red")}
                      >
                        Rojo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lights-panel">
                  <div className={`light ${judge1 === "white" ? "light-white on" : ""}`} />
                  <div className={`light ${judge2 === "white" ? "light-white on" : ""}`} />
                  <div className={`light ${judge3 === "white" ? "light-white on" : ""}`} />
                  <div className={`light ${judge1 === "red" ? "light-red on" : ""}`} />
                  <div className={`light ${judge2 === "red" ? "light-red on" : ""}`} />
                  <div className={`light ${judge3 === "red" ? "light-red on" : ""}`} />
                </div>

                <div className="j-main-actions">
                  <button className="j-action primary" onClick={registrarResultado}>
                    Confirmar resultado
                  </button>
                  <button className="j-action secondary" onClick={reiniciarVotacion}>
                    Reiniciar
                  </button>
                  <button className="j-action secondary" onClick={saltarTurno}>
                    Siguiente turno
                  </button>
                </div>
              </>
            ) : (
              <div className="j-empty">
                <h2>No hay atletas en cola</h2>
                <p>Agrega más competidores o carga el siguiente intento.</p>
              </div>
            )}
          </article>

          <aside className="j-side-stack">
            <article className="j-card">
              <div className="j-tag">COLA DE SALIDA</div>
              <h3 className="side-title">Siguientes atletas</h3>

              <div className="queue-list">
                {cola.length > 1 ? (
                  cola.slice(1).map((item) => (
                    <div key={item.id} className="queue-item">
                      <div>
                        <strong>{item.atleta}</strong>
                        <p>
                          {item.levantamiento} · intento {item.intento}
                        </p>
                      </div>
                      <span>{item.peso} kg</span>
                    </div>
                  ))
                ) : (
                  <p className="muted-text">No hay más atletas en espera.</p>
                )}
              </div>
            </article>

            <article className="j-card">
              <div className="j-tag">ÚLTIMOS RESULTADOS</div>
              <h3 className="side-title">Historial</h3>

              <div className="history-list">
                {historial.length > 0 ? (
                  historial.map((item) => (
                    <div key={`${item.id}-${item.intento}-${item.levantamiento}`} className="history-item">
                      <div>
                        <strong>{item.atleta}</strong>
                        <p>
                          {item.levantamiento} · {item.peso} kg
                        </p>
                      </div>
                      <span className={item.resultado === "Válido" ? "ok" : "bad"}>
                        {item.resultado}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="muted-text">Todavía no hay decisiones registradas.</p>
                )}
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}