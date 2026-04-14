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

function getCategoria(peso: number, sexo: Sexo) {
  if (!peso || peso <= 0) return "—";

  if (sexo === "Masculino") {
    if (peso <= 59) return "59 kg";
    if (peso <= 66) return "66 kg";
    if (peso <= 74) return "74 kg";
    if (peso <= 83) return "83 kg";
    if (peso <= 93) return "93 kg";
    if (peso <= 105) return "105 kg";
    if (peso <= 120) return "120 kg";
    return "+120 kg";
  }

  if (peso <= 47) return "47 kg";
  if (peso <= 52) return "52 kg";
  if (peso <= 57) return "57 kg";
  if (peso <= 63) return "63 kg";
  if (peso <= 69) return "69 kg";
  if (peso <= 76) return "76 kg";
  if (peso <= 84) return "84 kg";
  return "+84 kg";
}

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
      status?: number;
      statusText?: string;
    };

    return [
      maybe.message,
      maybe.details,
      maybe.hint,
      maybe.status ? `status: ${maybe.status}` : "",
      maybe.statusText ?? "",
      maybe.code ? `(code: ${maybe.code})` : "",
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return "Error desconocido";
}

export default function RegistroPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState<Sexo>("Masculino");
  const [peso, setPeso] = useState("");
  const [club, setClub] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const categoriaActual = useMemo(() => {
    return getCategoria(Number(peso), sexo);
  }, [peso, sexo]);

  const cargarAthletes = async () => {
    setLoadingAthletes(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase select athletes:", error);
        setErrorMsg(`Error al cargar atletas: ${formatError(error)}`);
        setAthletes([]);
        return;
      }

      setAthletes((data as Athlete[]) || []);
    } catch (error) {
      console.warn("Catch cargarAthletes:", error);
      setErrorMsg(`Error al cargar atletas: ${formatError(error)}`);
      setAthletes([]);
    } finally {
      setLoadingAthletes(false);
    }
  };

  useEffect(() => {
    void cargarAthletes();
  }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setSexo("Masculino");
    setPeso("");
    setClub("");
    setEditingId(null);
  };

  const handleGuardar = async () => {
    const pesoNumero = Number(peso);

    if (!nombre.trim()) {
      alert("Captura el nombre del atleta");
      return;
    }

    if (!peso || Number.isNaN(pesoNumero) || pesoNumero <= 0) {
      alert("Captura un peso válido");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload = {
      nombre: nombre.trim(),
      sexo,
      peso: pesoNumero,
      categoria: getCategoria(pesoNumero, sexo),
      club: club.trim(),
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("athletes")
          .update(payload)
          .eq("id", editingId);

        if (error) {
          console.warn("Supabase update athlete:", error);
          const msg = `Error al actualizar atleta: ${formatError(error)}`;
          setErrorMsg(msg);
          alert(msg);
          return;
        }
      } else {
        const { error } = await supabase.from("athletes").insert([payload]);

        if (error) {
          console.warn("Supabase insert athlete:", error);
          const msg = `Error al guardar atleta: ${formatError(error)}`;
          setErrorMsg(msg);
          alert(msg);
          return;
        }
      }

      await cargarAthletes();
      limpiarFormulario();
    } catch (error) {
      console.warn("General guardar athlete:", error);
      const msg = `Ocurrió un error inesperado: ${formatError(error)}`;
      setErrorMsg(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (athlete: Athlete) => {
    setEditingId(athlete.id);
    setNombre(athlete.nombre);
    setSexo(athlete.sexo);
    setPeso(String(athlete.peso));
    setClub(athlete.club || "");
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEliminar = async (id: string) => {
    const ok = window.confirm("¿Eliminar atleta?");
    if (!ok) return;

    setErrorMsg("");

    try {
      const { error } = await supabase.from("athletes").delete().eq("id", id);

      if (error) {
        console.warn("Supabase delete athlete:", error);
        const msg = `Error al eliminar atleta: ${formatError(error)}`;
        setErrorMsg(msg);
        alert(msg);
        return;
      }

      await cargarAthletes();

      if (editingId === id) {
        limpiarFormulario();
      }
    } catch (error) {
      console.warn("General delete athlete:", error);
      const msg = `Ocurrió un error inesperado al eliminar: ${formatError(error)}`;
      setErrorMsg(msg);
      alert(msg);
    }
  };

  return (
    <main className="registro-page">
      <div className="bg-image" />
      <div className="registro-overlay" />
      <div className="registro-noise" />

      <section className="registro-wrap">
        <header className="hero">
          <div className="heroBrand">
            <div className="logoBox">
              <img
                src="/jaguar-logo.png"
                alt="Logo Powerlifting"
                className="logoImg"
              />
            </div>

            <div className="heroText">
              <p className="eyebrow">REGISTRO</p>
              <h1>Atletas del campeonato</h1>
              <p>
                Alta de competidores con categoría automática y control visual
                profesional
              </p>
            </div>
          </div>

          <Link href="/" className="volverBtn">
            ← Volver
          </Link>
        </header>

        {errorMsg && <div className="errorBox">{errorMsg}</div>}

        <section className="mainGrid">
          <article className="panel formPanel">
            <div className="panelGlow" />
            <div className="pill">NUEVO ATLETA</div>
            <h2>{editingId ? "Editar atleta" : "Registro"}</h2>

            <div className="field">
              <label>Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan García"
              />
            </div>

            <div className="field">
              <label>Sexo</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value as Sexo)}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div className="field">
              <label>Peso corporal</label>
              <input
                type="number"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ej. 83"
              />
            </div>

            <div className="field">
              <label>Categoría automática</label>
              <div className="readonlyBox">{categoriaActual}</div>
            </div>

            <div className="field">
              <label>Club / equipo</label>
              <input
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Ej. Atlas Gym"
              />
            </div>

            <div className="actions">
              <button
                className="primaryBtn"
                onClick={handleGuardar}
                disabled={loading}
                type="button"
              >
                {loading
                  ? "Guardando..."
                  : editingId
                    ? "Actualizar atleta"
                    : "Guardar atleta"}
              </button>

              {editingId && (
                <button
                  className="ghostBtn"
                  onClick={limpiarFormulario}
                  type="button"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </article>

          <article className="panel tablePanel">
            <div className="panelGlow" />
            <div className="pill">ATLETAS REGISTRADOS</div>
            <h2>Listado</h2>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Categoría</th>
                    <th>Club</th>
                    <th className="colAcciones">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingAthletes ? (
                    <tr>
                      <td colSpan={6} className="emptyCell">
                        Cargando atletas...
                      </td>
                    </tr>
                  ) : athletes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="emptyCell">
                        ⚠️ Sin atletas registrados
                      </td>
                    </tr>
                  ) : (
                    athletes.map((a) => (
                      <tr key={a.id}>
                        <td className="nombreCell">{a.nombre}</td>
                        <td>{a.sexo}</td>
                        <td>{a.peso} kg</td>
                        <td>{a.categoria}</td>
                        <td>{a.club || "—"}</td>
                        <td className="colAcciones">
                          <div className="rowActions">
                            <button
                              className="editBtn"
                              onClick={() => handleEditar(a)}
                              type="button"
                            >
                              Editar
                            </button>
                            <button
                              className="deleteBtn"
                              onClick={() => handleEliminar(a.id)}
                              type="button"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
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
        .registro-page {
          position: relative;
          min-height: 100vh;
          padding: 14px;
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
          filter: brightness(0.78) saturate(0.95);
        }

        .registro-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(rgba(0, 0, 0, 0.36), rgba(0, 0, 0, 0.68)),
            radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.08), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(0, 120, 255, 0.06), transparent 30%);
        }

        .registro-noise {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          opacity: 0.035;
          background-image:
            radial-gradient(circle, rgba(255, 220, 140, 0.95) 1px, transparent 1.7px),
            radial-gradient(circle, rgba(255, 160, 0, 0.2) 1px, transparent 2px);
          background-size: 180px 180px, 260px 260px;
          background-position: 0 0, 60px 90px;
        }

        .registro-wrap {
          position: relative;
          z-index: 1;
          width: min(100%, 1600px);
          margin: 0 auto;
          min-height: calc(100vh - 28px);
          display: flex;
          flex-direction: column;
        }

        .errorBox {
          margin: 0 4px 14px;
          padding: 14px 16px;
          border-radius: 16px;
          background: rgba(140, 20, 20, 0.5);
          border: 1px solid rgba(255, 110, 110, 0.35);
          color: #fff;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }

        .hero {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 14px;
          padding: 6px 4px 0;
        }

        .heroBrand {
          display: flex;
          align-items: center;
          gap: 16px;
          min-width: 0;
        }

        .logoBox {
          width: 86px;
          height: 86px;
          border-radius: 22px;
          background: rgba(10, 10, 10, 0.34);
          backdrop-filter: blur(10px) saturate(135%);
          border: 1px solid rgba(255, 196, 60, 0.16);
          display: grid;
          place-items: center;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow:
            0 12px 30px rgba(0, 0, 0, 0.26),
            inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .logoImg {
          width: 64px;
          height: 64px;
          object-fit: contain;
          filter: drop-shadow(0 0 10px rgba(255, 196, 60, 0.15));
        }

        .heroText {
          min-width: 0;
        }

        .eyebrow {
          margin: 0 0 6px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.34em;
          color: #f5cf72;
        }

        .heroText h1 {
          margin: 0;
          font-size: clamp(38px, 4.1vw, 74px);
          line-height: 0.95;
          font-weight: 1000;
          color: #fff7df;
        }

        .heroText p {
          margin: 8px 0 0;
          font-size: clamp(15px, 1.2vw, 19px);
          color: rgba(255, 255, 255, 0.9);
        }

        .volverBtn {
          min-height: 46px;
          padding: 0 18px;
          border-radius: 16px;
          background: rgba(10, 10, 10, 0.34);
          backdrop-filter: blur(10px) saturate(140%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          text-decoration: none;
        }

        .mainGrid {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(360px, 430px) minmax(0, 1fr);
          gap: 16px;
          align-items: stretch;
          min-height: 0;
        }

        .panel {
          position: relative;
          background: linear-gradient(
            135deg,
            rgba(18, 10, 4, 0.42),
            rgba(0, 0, 0, 0.34)
          );
          backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(255, 190, 60, 0.16);
          border-radius: 28px;
          padding: 18px;
          overflow: hidden;
          box-shadow:
            0 18px 40px rgba(0, 0, 0, 0.34),
            inset 0 0 18px rgba(255, 166, 0, 0.035);
        }

        .panelGlow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at top left, rgba(255, 196, 60, 0.035), transparent 20%),
            radial-gradient(circle at bottom right, rgba(0, 136, 255, 0.03), transparent 24%);
          z-index: 0;
        }

        .formPanel,
        .tablePanel {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .pill,
        h2,
        .field,
        .actions,
        .tableWrap {
          position: relative;
          z-index: 1;
        }

        .pill {
          display: inline-flex;
          width: fit-content;
          padding: 7px 14px;
          border-radius: 999px;
          background: rgba(70, 46, 10, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.18);
          color: #f5d27c;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.22em;
        }

        .panel h2 {
          margin: 12px 0 16px;
          font-size: clamp(30px, 2.6vw, 56px);
          line-height: 1;
          color: #ffffff;
          font-weight: 1000;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 12px;
        }

        .field label {
          font-weight: 900;
          font-size: 15px;
          color: #fff;
        }

        .field input,
        .field select,
        .readonlyBox {
          width: 100%;
          min-height: 54px;
          border-radius: 18px;
          border: 1px solid rgba(255, 190, 60, 0.14);
          background: rgba(0, 0, 0, 0.42);
          color: #fff;
          padding: 0 16px;
          outline: none;
        }

        .readonlyBox {
          display: flex;
          align-items: center;
          color: #f6d878;
          font-weight: 1000;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: auto;
          padding-top: 8px;
        }

        .primaryBtn,
        .ghostBtn {
          min-height: 54px;
          border-radius: 18px;
          padding: 0 20px;
          font-weight: 1000;
          border: none;
          cursor: pointer;
        }

        .primaryBtn {
          flex: 1;
          background: linear-gradient(180deg, #f7d979 0%, #dfa826 100%);
          color: #111;
        }

        .primaryBtn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ghostBtn {
          background: rgba(10, 10, 10, 0.38);
          color: #f6d878;
          border: 1px solid rgba(255, 196, 60, 0.14);
        }

        .tableWrap {
          flex: 1;
          min-height: 0;
          overflow: auto;
          border-radius: 18px;
        }

        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          table-layout: fixed;
        }

        thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          text-align: left;
          padding: 18px 14px;
          color: #f7d77a;
          font-size: 16px;
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

        .colAcciones {
          width: 170px;
        }

        .nombreCell {
          font-weight: 900;
        }

        .rowActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .editBtn,
        .deleteBtn {
          min-height: 36px;
          padding: 0 12px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 900;
          font-size: 12px;
        }

        .editBtn {
          background: linear-gradient(180deg, #f2d170 0%, #ddaa2e 100%);
          color: #161616;
        }

        .deleteBtn {
          background: linear-gradient(180deg, #ff6f61 0%, #db433b 100%);
          color: white;
        }

        .emptyCell {
          text-align: center;
          padding: 56px 20px !important;
          font-size: 18px;
          color: rgba(255, 220, 150, 0.96);
          font-weight: 1000;
          background: rgba(0, 0, 0, 0.16);
        }

        @media (max-width: 1100px) {
          .mainGrid {
            grid-template-columns: 1fr;
          }

          table {
            min-width: 900px;
            table-layout: auto;
          }
        }

        @media (max-width: 760px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .panel {
            padding: 16px;
          }

          .actions {
            flex-direction: column;
          }

          .primaryBtn,
          .ghostBtn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}