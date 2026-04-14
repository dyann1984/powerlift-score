"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Athlete = {
  id: string;
  nombre: string;
  sexo: "Masculino" | "Femenino";
  peso: number;
  categoria: string;
  club: string;
  created_at?: string;
};

type Movimiento = "Sentadilla" | "Press de banca" | "Peso muerto";
type Intento = "Intento 1" | "Intento 2" | "Intento 3";

const ejercicios: Movimiento[] = [
  "Sentadilla",
  "Press de banca",
  "Peso muerto",
];

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

export default function CompetenciaPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [movimiento, setMovimiento] = useState<Movimiento>("Sentadilla");
  const [selectedAthleteId, setSelectedAthleteId] = useState("");
  const [intento, setIntento] = useState<Intento>("Intento 1");
  const [peso, setPeso] = useState("");

  const siguienteEjercicio = useMemo(() => {
    if (movimiento === "Sentadilla") return "Press de banca";
    if (movimiento === "Press de banca") return "Peso muerto";
    return "Finalizado";
  }, [movimiento]);

  const atletaSeleccionado = useMemo(() => {
    return athletes.find((a) => a.id === selectedAthleteId) || null;
  }, [athletes, selectedAthleteId]);

  const cargarAthletes = async () => {
    setLoadingAthletes(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(`Error al cargar atletas: ${formatError(error)}`);
        setAthletes([]);
        setSelectedAthleteId("");
        return;
      }

      const rows = (data as Athlete[]) || [];
      setAthletes(rows);

      if (rows.length > 0) {
        setSelectedAthleteId((prev) => prev || rows[0].id);
      } else {
        setSelectedAthleteId("");
      }
    } catch (error) {
      setErrorMsg(`Error al cargar atletas: ${formatError(error)}`);
      setAthletes([]);
      setSelectedAthleteId("");
    } finally {
      setLoadingAthletes(false);
    }
  };

  useEffect(() => {
    void cargarAthletes();
  }, []);

  const handleGuardarIntento = async () => {
    setOkMsg("");
    setErrorMsg("");

    if (!selectedAthleteId) {
      alert("Primero selecciona un atleta");
      return;
    }

    const pesoNumero = Number(peso);

    if (!peso || Number.isNaN(pesoNumero) || pesoNumero <= 0) {
      alert("Captura un peso válido");
      return;
    }

    setLoadingSave(true);

    try {
      const payload = {
        athlete_id: selectedAthleteId,
        athlete_name: atletaSeleccionado?.nombre || "",
        movimiento,
        intento,
        peso: pesoNumero,
        valido: null,
      };

      const { error } = await supabase.from("attempts").insert([payload]);

      if (error) {
        setErrorMsg(`Error al guardar intento: ${formatError(error)}`);
        return;
      }

      setOkMsg("Intento guardado correctamente");
      setPeso("");
    } catch (error) {
      setErrorMsg(`Error al guardar intento: ${formatError(error)}`);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleBorrarFormulario = () => {
    setMovimiento("Sentadilla");
    setIntento("Intento 1");
    setPeso("");
    setOkMsg("");
    setErrorMsg("");
    setSelectedAthleteId(athletes[0]?.id || "");
  };

  return (
    <main className="comp-page">
      <div className="bg-image" />
      <div className="comp-overlay" />
      <div className="comp-noise" />

      <section className="comp-wrap">
        <header className="hero">
          <Link href="/" className="volverBtn">
            ← Volver al inicio
          </Link>

          <h1>Competencia</h1>

          <button className="borrarBtn" type="button" onClick={handleBorrarFormulario}>
            Borrar
          </button>
        </header>

        {errorMsg && <div className="errorBox">{errorMsg}</div>}
        {okMsg && <div className="okBox">{okMsg}</div>}

        <section className="topGrid">
          <article className="miniCard">
            <span className="miniLabel">Ejercicio actual</span>
            <strong>{movimiento}</strong>
          </article>

          <article className="miniCard">
            <span className="miniLabel">Siguiente</span>
            <strong>{siguienteEjercicio}</strong>
          </article>
        </section>

        <section className="mainCard">
          <div className="panelGlow" />

          <div className="pill">EJERCICIOS OFICIALES</div>

          <div className="ejerciciosRow">
            {ejercicios.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${movimiento === item ? "chipActive" : ""}`}
                onClick={() => setMovimiento(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="formGrid">
            <div className="field full">
              <label>Atleta</label>
              <select
                value={selectedAthleteId}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                disabled={loadingAthletes || athletes.length === 0}
              >
                {loadingAthletes ? (
                  <option value="">Cargando atletas...</option>
                ) : athletes.length === 0 ? (
                  <option value="">Sin atletas registrados</option>
                ) : (
                  athletes.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.nombre} — {athlete.categoria} — {athlete.club || "Sin club"}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="field">
              <label>Movimiento</label>
              <select
                value={movimiento}
                onChange={(e) => setMovimiento(e.target.value as Movimiento)}
              >
                <option value="Sentadilla">Sentadilla</option>
                <option value="Press de banca">Press de banca</option>
                <option value="Peso muerto">Peso muerto</option>
              </select>
            </div>

            <div className="field">
              <label>Intento</label>
              <select
                value={intento}
                onChange={(e) => setIntento(e.target.value as Intento)}
              >
                <option value="Intento 1">Intento 1</option>
                <option value="Intento 2">Intento 2</option>
                <option value="Intento 3">Intento 3</option>
              </select>
            </div>

            <div className="field full">
              <label>Peso (kg)</label>
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ej. 200"
              />
            </div>
          </div>

          {atletaSeleccionado && (
            <div className="resumeBox">
              <div>
                <span>Atleta</span>
                <strong>{atletaSeleccionado.nombre}</strong>
              </div>
              <div>
                <span>Categoría</span>
                <strong>{atletaSeleccionado.categoria}</strong>
              </div>
              <div>
                <span>Club</span>
                <strong>{atletaSeleccionado.club || "—"}</strong>
              </div>
            </div>
          )}

          <div className="actions">
            <button
              type="button"
              className="primaryBtn"
              onClick={handleGuardarIntento}
              disabled={loadingSave || athletes.length === 0}
            >
              {loadingSave ? "Guardando..." : "Guardar intento"}
            </button>
          </div>
        </section>
      </section>

      <style jsx>{`
        .comp-page {
          position: relative;
          min-height: 100vh;
          padding: 24px 16px;
          overflow: hidden;
        }

        .bg-image {
          position: fixed;
          inset: 0;
          background-image: url("/fondo.png");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: brightness(0.75) saturate(1);
          transform: scale(1.02);
        }

        .comp-overlay {
          position: fixed;
          inset: 0;
          background:
            linear-gradient(rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.72)),
            radial-gradient(circle at 20% 20%, rgba(255, 170, 0, 0.08), transparent 30%),
            radial-gradient(circle at 80% 30%, rgba(0, 120, 255, 0.08), transparent 28%);
        }

        .comp-noise {
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

        .comp-wrap {
          position: relative;
          z-index: 1;
          width: min(100%, 760px);
          margin: 0 auto;
        }

        .hero {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
          padding: 24px 28px;
          border-radius: 32px;
          background: linear-gradient(135deg, rgba(18, 10, 4, 0.78), rgba(0, 0, 0, 0.62));
          backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(255, 190, 60, 0.16);
        }

        .hero h1 {
          margin: 0;
          text-align: center;
          font-size: clamp(42px, 5vw, 72px);
          color: #fff7df;
          font-weight: 1000;
        }

        .volverBtn,
        .borrarBtn {
          min-height: 52px;
          padding: 0 18px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 10, 10, 0.28);
          color: #fff;
          font-weight: 900;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .borrarBtn {
          cursor: pointer;
          color: #ffb0b0;
        }

        .errorBox,
        .okBox {
          margin-bottom: 14px;
          padding: 14px 16px;
          border-radius: 16px;
          font-weight: 800;
          backdrop-filter: blur(8px);
        }

        .errorBox {
          background: rgba(140, 20, 20, 0.5);
          border: 1px solid rgba(255, 110, 110, 0.35);
          color: #fff;
        }

        .okBox {
          background: rgba(20, 120, 40, 0.38);
          border: 1px solid rgba(90, 255, 120, 0.35);
          color: #fff;
        }

        .topGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }

        .miniCard,
        .mainCard {
          position: relative;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(18, 10, 4, 0.72), rgba(0, 0, 0, 0.52));
          backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(255, 190, 60, 0.16);
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.34),
            inset 0 0 18px rgba(255, 166, 0, 0.035);
        }

        .miniCard {
          padding: 22px;
        }

        .miniLabel {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 1000;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #f5cf72;
        }

        .miniCard strong {
          display: block;
          color: #fff;
          font-size: 24px;
          line-height: 1.1;
        }

        .mainCard {
          padding: 28px;
          overflow: hidden;
        }

        .panelGlow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at top left, rgba(255, 196, 60, 0.035), transparent 20%),
            radial-gradient(circle at bottom right, rgba(0, 136, 255, 0.03), transparent 24%);
        }

        .pill,
        .ejerciciosRow,
        .formGrid,
        .resumeBox,
        .actions {
          position: relative;
          z-index: 1;
        }

        .pill {
          display: inline-flex;
          width: fit-content;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(70, 46, 10, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.18);
          color: #f5d27c;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
          margin-bottom: 16px;
        }

        .ejerciciosRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .chip {
          min-height: 48px;
          padding: 0 18px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          font-weight: 900;
          cursor: pointer;
        }

        .chipActive {
          background: linear-gradient(180deg, #ffb800 0%, #e39b00 100%);
          color: #111;
          border-color: transparent;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          font-size: 16px;
          font-weight: 900;
          color: #fff;
        }

        .field input,
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

        .resumeBox {
          margin-top: 18px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 190, 60, 0.1);
        }

        .resumeBox span {
          display: block;
          font-size: 12px;
          color: #f5cf72;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 900;
        }

        .resumeBox strong {
          color: #fff;
          font-size: 18px;
        }

        .actions {
          margin-top: 18px;
        }

        .primaryBtn {
          width: 100%;
          min-height: 58px;
          border-radius: 18px;
          border: none;
          background: linear-gradient(180deg, #f7d979 0%, #dfa826 100%);
          color: #111;
          font-size: 18px;
          font-weight: 1000;
          cursor: pointer;
        }

        .primaryBtn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 760px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            text-align: left;
          }

          .topGrid,
          .formGrid,
          .resumeBox {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}