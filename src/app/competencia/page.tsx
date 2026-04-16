"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Sexo = "Masculino" | "Femenino";

type Athlete = {
  id: string;
  nombre: string;
  sexo: Sexo;
  peso: number;
  categoria: string;
  club: string;
  foto_url?: string | null;
};

type IntentoGuardado = {
  id: string;
  atletaId: string;
  atleta: string;
  sexo: Sexo;
  categoria: string;
  pesoCorporal: number;
  club: string;
  movimiento: string;
  intento: string;
  pesoIntento: number;
  resultado: "valido" | "nulo";
  marcaValida: number;
  fecha: string;
};

const RESULTS_STORAGE_KEY = "resultados_powerlift";

const movimientos = ["Sentadilla", "Press de banca", "Peso muerto"];
const intentos = ["Intento 1", "Intento 2", "Intento 3"];

function getCategoria(peso: number) {
  if (!peso || peso <= 0) return "—";
  if (peso >= 50 && peso <= 70) return "50-70 kg";
  if (peso > 70 && peso <= 90) return "70-90 kg";
  return "Libre";
}

export default function CompetenciaPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [atletaId, setAtletaId] = useState("");
  const [movimiento, setMovimiento] = useState("Sentadilla");
  const [intento, setIntento] = useState("Intento 1");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<"" | "valido" | "nulo">("");

  useEffect(() => {
    const cargarAthletes = async () => {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargar athletes:", error);
        alert(error.message || "Error al cargar atletas");
        setAthletes([]);
        return;
      }

      const lista = (data as Athlete[]) || [];
      setAthletes(lista);

      if (lista.length > 0) {
        setAtletaId((prev) => prev || lista[0].id);
      }
    };

    cargarAthletes();
  }, []);

  const atletaActual = athletes.find((a) => a.id === atletaId) || null;

  const categoriaActual = useMemo(() => {
    return atletaActual ? getCategoria(Number(atletaActual.peso)) : "—";
  }, [atletaActual]);

  const siguienteMovimiento = useMemo(() => {
    const index = movimientos.indexOf(movimiento);
    if (index === -1 || index === movimientos.length - 1) {
      return "Finaliza competencia";
    }
    return movimientos[index + 1];
  }, [movimiento]);

  const guardarIntento = (tipo: "valido" | "nulo") => {
    if (!atletaActual) return;

    const pesoNumero = Number(peso || 0);

    const nuevoRegistro: IntentoGuardado = {
      id: `${atletaActual.id}-${movimiento}-${intento}`,
      atletaId: atletaActual.id,
      atleta: atletaActual.nombre,
      sexo: atletaActual.sexo,
      categoria: getCategoria(Number(atletaActual.peso)),
      pesoCorporal: Number(atletaActual.peso),
      club: atletaActual.club || "",
      movimiento,
      intento,
      pesoIntento: pesoNumero,
      resultado: tipo,
      marcaValida: tipo === "valido" ? pesoNumero : 0,
      fecha: new Date().toISOString(),
    };

    const guardados: IntentoGuardado[] = JSON.parse(
      localStorage.getItem(RESULTS_STORAGE_KEY) || "[]"
    );

    const sinDuplicado = guardados.filter(
      (item) =>
        !(
          item.atletaId === nuevoRegistro.atletaId &&
          item.movimiento === nuevoRegistro.movimiento &&
          item.intento === nuevoRegistro.intento
        )
    );

    sinDuplicado.push(nuevoRegistro);
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(sinDuplicado));
  };

  const marcarValido = () => {
    if (!atletaActual) {
      alert("Primero registra al menos un atleta");
      return;
    }

    if (!peso) {
      alert("Ingresa el peso");
      return;
    }

    setResultado("valido");
    guardarIntento("valido");
    alert("Intento válido guardado");
  };

  const marcarNulo = () => {
    if (!atletaActual) {
      alert("Primero registra al menos un atleta");
      return;
    }

    if (!peso) {
      alert("Ingresa el peso");
      return;
    }

    setResultado("nulo");
    guardarIntento("nulo");
    alert("Intento nulo guardado");
  };

  const guardarDesdeBotonPrincipal = () => {
    if (resultado === "nulo") {
      marcarNulo();
      return;
    }
    marcarValido();
  };

  const limpiarResultados = () => {
    const ok = confirm("¿Seguro que quieres borrar todos los resultados?");
    if (!ok) return;
    localStorage.removeItem(RESULTS_STORAGE_KEY);
    setResultado("");
    setPeso("");
    alert("Resultados borrados");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "url('/fondo.png') center/cover no-repeat",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "rgba(0, 0, 0, 0.78)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,180,0,0.2)",
          borderRadius: "28px",
          padding: "28px",
          color: "white",
          boxShadow: "0 0 30px rgba(255,180,0,0.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            marginBottom: "18px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            ← Volver al inicio
          </Link>

          <h1
            style={{
              margin: 0,
              fontSize: "2.8rem",
              fontWeight: 900,
            }}
          >
            Competencia
          </h1>

          <button
            type="button"
            onClick={limpiarResultados}
            style={{
              background: "transparent",
              color: "#ffb3b3",
              border: "1px solid rgba(255,0,0,0.25)",
              borderRadius: "10px",
              padding: "8px 12px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Borrar
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            marginBottom: "18px",
          }}
        >
          <div style={infoCard}>
            <div style={infoLabel}>Ejercicio actual</div>
            <div style={infoValue}>{movimiento}</div>
          </div>

          <div style={infoCard}>
            <div style={infoLabel}>Siguiente</div>
            <div style={infoValue}>{siguienteMovimiento}</div>
          </div>
        </div>

        <div
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(255,180,0,0.14)",
            background: "rgba(255,255,255,0.04)",
            padding: "16px",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "#f6cf69",
              marginBottom: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Ejercicios oficiales
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {movimientos.map((item) => {
              const activo = item === movimiento;

              return (
                <button
                  key={item}
                  onClick={() => setMovimiento(item)}
                  type="button"
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: activo
                      ? "1px solid rgba(255,190,60,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                    background: activo
                      ? "linear-gradient(135deg, #ffb300, #ff7b00)"
                      : "rgba(255,255,255,0.05)",
                    color: activo ? "#000" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <label style={label}>Atleta</label>
        <select
          value={atletaId}
          onChange={(e) => {
            setAtletaId(e.target.value);
            setResultado("");
          }}
          style={input}
          disabled={athletes.length === 0}
        >
          {athletes.length === 0 ? (
            <option value="" style={{ backgroundColor: "#161616", color: "#ffffff" }}>
              Sin atletas registrados
            </option>
          ) : (
            athletes.map((item) => (
              <option
                key={item.id}
                value={item.id}
                style={{ backgroundColor: "#161616", color: "#ffffff" }}
              >
                {item.nombre} — {getCategoria(Number(item.peso))} — {item.club || "—"}
              </option>
            ))
          )}
        </select>

        <label style={label}>Movimiento</label>
        <select
          value={movimiento}
          onChange={(e) => setMovimiento(e.target.value)}
          style={input}
        >
          {movimientos.map((item) => (
            <option
              key={item}
              value={item}
              style={{ backgroundColor: "#161616", color: "#ffffff" }}
            >
              {item}
            </option>
          ))}
        </select>

        <label style={label}>Intento</label>
        <select
          value={intento}
          onChange={(e) => setIntento(e.target.value)}
          style={input}
        >
          {intentos.map((item) => (
            <option
              key={item}
              value={item}
              style={{ backgroundColor: "#161616", color: "#ffffff" }}
            >
              {item}
            </option>
          ))}
        </select>

        <label style={label}>Peso (kg)</label>
        <input
          type="number"
          placeholder="Ej. 200"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          style={input}
        />

        {atletaActual && (
          <div
            style={{
              marginTop: "10px",
              marginBottom: "18px",
              borderRadius: "18px",
              border: "1px solid rgba(255,180,0,0.14)",
              background: "rgba(255,255,255,0.04)",
              padding: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "14px",
            }}
          >
            <div>
              <div style={miniLabel}>Atleta</div>
              <div style={miniValue}>{atletaActual.nombre}</div>
            </div>
            <div>
              <div style={miniLabel}>Categoría</div>
              <div style={miniValue}>{categoriaActual}</div>
            </div>
            <div>
              <div style={miniLabel}>Club</div>
              <div style={miniValue}>{atletaActual.club || "—"}</div>
            </div>
          </div>
        )}

        <button
          onClick={guardarDesdeBotonPrincipal}
          type="button"
          style={{
            width: "100%",
            background: "linear-gradient(180deg, #f7d979 0%, #dfa826 100%)",
            color: "#111",
            border: "none",
            borderRadius: "16px",
            padding: "16px",
            fontWeight: 900,
            fontSize: "1.15rem",
            cursor: "pointer",
            marginBottom: "16px",
          }}
        >
          Guardar intento
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={marcarValido} style={btnValido} type="button">
            VÁLIDO
          </button>

          <button onClick={marcarNulo} style={btnNulo} type="button">
            NULO
          </button>
        </div>

        <div style={resultadoBox}>
          {athletes.length === 0 && (
            <span style={{ color: "#ffcf7a" }}>Registra atletas primero</span>
          )}

          {athletes.length > 0 && resultado === "" && (
            <span style={{ color: "#aaa" }}>Pendiente</span>
          )}

          {athletes.length > 0 && resultado === "valido" && (
            <span style={{ color: "#00ff88" }}>✅ VÁLIDO {peso} kg</span>
          )}

          {athletes.length > 0 && resultado === "nulo" && (
            <span style={{ color: "#ff2d2d" }}>❌ NULO</span>
          )}
        </div>
      </div>
    </main>
  );
}

const label: React.CSSProperties = {
  display: "block",
  marginTop: "12px",
  marginBottom: "6px",
  fontWeight: 800,
  fontSize: "1rem",
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.16)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  marginBottom: "8px",
  fontSize: "1rem",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const btnValido: React.CSSProperties = {
  flex: 1,
  background: "#0aa000",
  padding: "16px",
  borderRadius: "14px",
  fontWeight: 900,
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
};

const btnNulo: React.CSSProperties = {
  flex: 1,
  background: "#ff1a0a",
  padding: "16px",
  borderRadius: "14px",
  fontWeight: 900,
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
};

const resultadoBox: React.CSSProperties = {
  marginTop: "26px",
  textAlign: "center",
  fontSize: "2rem",
  fontWeight: 900,
};

const infoCard: React.CSSProperties = {
  borderRadius: "18px",
  padding: "16px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,180,0,0.14)",
};

const infoLabel: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 800,
  color: "#f6cf69",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const infoValue: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 800,
  color: "#fff",
};

const miniLabel: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 800,
  color: "#f6cf69",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const miniValue: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 800,
  color: "#fff",
};