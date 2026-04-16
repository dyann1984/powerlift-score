"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Sexo = "Masculino" | "Femenino";

type IntentoGuardado = {
  id: string;
  atletaId: string;
  atleta: string;
  sexo: Sexo;
  categoria?: string;
  pesoCorporal: number;
  club: string;
  movimiento: string;
  intento: string;
  pesoIntento: number;
  resultado: "valido" | "nulo";
  marcaValida: number;
  fecha: string;
};

type AtletaRegistrado = {
  id: string;
  nombre: string;
  sexo: Sexo;
  peso: number;
  categoria?: string;
  club?: string;
};

type ResumenAtleta = {
  atletaId: string;
  atleta: string;
  sexo: Sexo;
  categoria: string;
  pesoCorporal: number;
  club: string;
  sentadilla1: string | number;
  sentadilla2: string | number;
  sentadilla3: string | number;
  banca1: string | number;
  banca2: string | number;
  banca3: string | number;
  muerto1: string | number;
  muerto2: string | number;
  muerto3: string | number;
  mejorSentadilla: number;
  mejorBanca: number;
  mejorMuerto: number;
  total: number;
};

const RESULTS_STORAGE_KEY = "resultados_powerlift";

/**
 * OJO:
 * Aquí debes poner EXACTAMENTE la misma key que usas en /registro
 * Ejemplo: "atletas_powerlift" o la que tengas realmente.
 */
const REGISTRO_STORAGE_KEY = "atletas_powerlift";

function getCategoriaPorPeso(peso: number) {
  if (!peso || peso <= 0) return "Sin categoría";
  if (peso >= 50 && peso <= 70) return "50-70 kg";
  if (peso > 70 && peso <= 90) return "70-90 kg";
  return "Libre";
}

function categoriaFinal(categoria?: string, peso?: number) {
  const limpia = String(categoria || "").trim();
  if (limpia && limpia !== "-" && limpia !== "—") return limpia;
  return getCategoriaPorPeso(Number(peso) || 0);
}

export default function ResultadosPage() {
  const [registros, setRegistros] = useState<IntentoGuardado[]>([]);
  const [atletasRegistrados, setAtletasRegistrados] = useState<AtletaRegistrado[]>([]);
  const [sexo, setSexo] = useState<Sexo>("Masculino");
  const [categoria, setCategoria] = useState("Todas");
  const [competidorId, setCompetidorId] = useState("");

  useEffect(() => {
    try {
      const guardadosResultados = JSON.parse(
        localStorage.getItem(RESULTS_STORAGE_KEY) || "[]"
      );
      setRegistros(Array.isArray(guardadosResultados) ? guardadosResultados : []);
    } catch {
      setRegistros([]);
    }

    try {
      const guardadosAtletas = JSON.parse(
        localStorage.getItem(REGISTRO_STORAGE_KEY) || "[]"
      );
      setAtletasRegistrados(Array.isArray(guardadosAtletas) ? guardadosAtletas : []);
    } catch {
      setAtletasRegistrados([]);
    }
  }, []);

  const atletasResumen = useMemo(() => {
    const mapa = new Map<string, ResumenAtleta>();

    // 1) Primero cargamos TODOS los atletas registrados
    for (const atleta of atletasRegistrados) {
      const atletaId = atleta.id;
      const atletaNombre = atleta.nombre;
      const pesoCorporal = Number(atleta.peso) || 0;
      const categoria = categoriaFinal(atleta.categoria, pesoCorporal);

      if (!atletaId || !atletaNombre) continue;

      mapa.set(atletaId, {
        atletaId,
        atleta: atletaNombre,
        sexo: atleta.sexo,
        categoria,
        pesoCorporal,
        club: atleta.club || "",
        sentadilla1: "-",
        sentadilla2: "-",
        sentadilla3: "-",
        banca1: "-",
        banca2: "-",
        banca3: "-",
        muerto1: "-",
        muerto2: "-",
        muerto3: "-",
        mejorSentadilla: 0,
        mejorBanca: 0,
        mejorMuerto: 0,
        total: 0,
      });
    }

    // 2) Luego metemos/actualizamos resultados si existen
    for (const item of registros) {
      const pesoCorporal = Number(item.pesoCorporal) || 0;
      const categoria = categoriaFinal(item.categoria, pesoCorporal);

      if (!mapa.has(item.atletaId)) {
        mapa.set(item.atletaId, {
          atletaId: item.atletaId,
          atleta: item.atleta,
          sexo: item.sexo,
          categoria,
          pesoCorporal,
          club: item.club || "",
          sentadilla1: "-",
          sentadilla2: "-",
          sentadilla3: "-",
          banca1: "-",
          banca2: "-",
          banca3: "-",
          muerto1: "-",
          muerto2: "-",
          muerto3: "-",
          mejorSentadilla: 0,
          mejorBanca: 0,
          mejorMuerto: 0,
          total: 0,
        });
      }

      const actual = mapa.get(item.atletaId)!;
      const valor = item.resultado === "valido" ? item.pesoIntento : "Nulo";

      actual.atleta = item.atleta || actual.atleta;
      actual.sexo = item.sexo || actual.sexo;
      actual.club = item.club || actual.club;
      actual.pesoCorporal = pesoCorporal || actual.pesoCorporal;
      actual.categoria = categoriaFinal(item.categoria || actual.categoria, actual.pesoCorporal);

      if (item.movimiento === "Sentadilla") {
        if (item.intento === "Intento 1") actual.sentadilla1 = valor;
        if (item.intento === "Intento 2") actual.sentadilla2 = valor;
        if (item.intento === "Intento 3") actual.sentadilla3 = valor;
        actual.mejorSentadilla = Math.max(actual.mejorSentadilla, item.marcaValida || 0);
      }

      if (item.movimiento === "Press de banca") {
        if (item.intento === "Intento 1") actual.banca1 = valor;
        if (item.intento === "Intento 2") actual.banca2 = valor;
        if (item.intento === "Intento 3") actual.banca3 = valor;
        actual.mejorBanca = Math.max(actual.mejorBanca, item.marcaValida || 0);
      }

      if (item.movimiento === "Peso muerto") {
        if (item.intento === "Intento 1") actual.muerto1 = valor;
        if (item.intento === "Intento 2") actual.muerto2 = valor;
        if (item.intento === "Intento 3") actual.muerto3 = valor;
        actual.mejorMuerto = Math.max(actual.mejorMuerto, item.marcaValida || 0);
      }

      actual.total =
        actual.mejorSentadilla + actual.mejorBanca + actual.mejorMuerto;
    }

    return Array.from(mapa.values());
  }, [registros, atletasRegistrados]);

  const categoriasDisponibles = useMemo(() => {
    const filtrados = atletasResumen.filter((a) => a.sexo === sexo);

    const unicas = Array.from(
      new Set(
        filtrados
          .map((a) => String(a.categoria || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));

    return ["Todas", ...unicas];
  }, [atletasResumen, sexo]);

  const atletasFiltrados = useMemo(() => {
    return atletasResumen
      .filter((a) => a.sexo === sexo)
      .filter((a) => (categoria === "Todas" ? true : a.categoria === categoria))
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.pesoCorporal - b.pesoCorporal;
      });
  }, [atletasResumen, sexo, categoria]);

  useEffect(() => {
    if (!categoriasDisponibles.includes(categoria)) {
      setCategoria("Todas");
    }
  }, [categoriasDisponibles, categoria]);

  useEffect(() => {
    if (atletasFiltrados.length === 0) {
      setCompetidorId("");
      return;
    }

    const existe = atletasFiltrados.some((a) => a.atletaId === competidorId);
    if (!existe) {
      setCompetidorId(atletasFiltrados[0].atletaId);
    }
  }, [atletasFiltrados, competidorId]);

  const competidorSeleccionado =
    atletasFiltrados.find((a) => a.atletaId === competidorId) || null;

  const lugar =
    competidorSeleccionado != null
      ? atletasFiltrados.findIndex(
          (a) => a.atletaId === competidorSeleccionado.atletaId
        ) + 1
      : 0;

  const limpiarResultados = () => {
    const ok = confirm("¿Seguro que quieres borrar todos los resultados?");
    if (!ok) return;
    localStorage.removeItem(RESULTS_STORAGE_KEY);
    setRegistros([]);
    setCompetidorId("");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "url('/fondo.png') center/cover no-repeat",
        padding: "28px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 180, 0, 0.20)",
          borderRadius: "28px",
          padding: "28px",
          color: "#fff",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "3rem", fontWeight: 900, lineHeight: 1 }}>
            Resultados
          </h1>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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
              Borrar resultados
            </button>

            <Link
              href="/"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "1rem",
              }}
            >
              ← Volver
            </Link>
          </div>
        </div>

        <p
          style={{
            marginTop: 0,
            marginBottom: "24px",
            color: "rgba(255,255,255,0.78)",
            fontSize: "1.05rem",
          }}
        >
          Selecciona sexo, categoría y competidor para ver sus resultados.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
            marginBottom: "26px",
          }}
        >
          <div>
            <label style={labelStyle}>Sexo</label>
            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value as Sexo)}
              style={selectStyle}
            >
              <option value="Masculino" style={{ color: "#000" }}>Masculino</option>
              <option value="Femenino" style={{ color: "#000" }}>Femenino</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={selectStyle}
            >
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat} style={{ color: "#000" }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Competidor</label>
            <select
              value={competidorId}
              onChange={(e) => setCompetidorId(e.target.value)}
              style={selectStyle}
              disabled={atletasFiltrados.length === 0}
            >
              {atletasFiltrados.length === 0 ? (
                <option value="" style={{ color: "#000" }}>Sin competidores</option>
              ) : (
                atletasFiltrados.map((a) => (
                  <option key={a.atletaId} value={a.atletaId} style={{ color: "#000" }}>
                    {a.atleta}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {!competidorSeleccionado ? (
          <div
            style={{
              padding: "26px",
              borderRadius: "22px",
              background: "rgba(0,0,0,0.36)",
              border: "1px solid rgba(255,180,0,0.14)",
              color: "rgba(255,255,255,0.78)",
              textAlign: "center",
              fontSize: "1.05rem",
            }}
          >
            No hay resultados para mostrar.
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <InfoCard title="Competidor" value={competidorSeleccionado.atleta} />
              <InfoCard title="Club" value={competidorSeleccionado.club || "—"} />
              <InfoCard title="Categoría" value={competidorSeleccionado.categoria} />
              <InfoCard title="Peso corporal" value={`${competidorSeleccionado.pesoCorporal} kg`} />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(180px, 1fr))",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <InfoCard title="Sentadilla" value={`${competidorSeleccionado.mejorSentadilla} kg`} />
              <InfoCard title="Press de banca" value={`${competidorSeleccionado.mejorBanca} kg`} />
              <InfoCard title="Peso muerto" value={`${competidorSeleccionado.mejorMuerto} kg`} />
              <InfoCard title="Total" value={`${competidorSeleccionado.total} kg`} />
            </div>

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                borderRadius: "20px",
                border: "1px solid rgba(255,180,0,0.14)",
                background: "rgba(0,0,0,0.35)",
                padding: "16px",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "1.7rem" }}>
                Ranking de la categoría
              </h2>

              <table
                style={{
                  width: "100%",
                  minWidth: "900px",
                  borderCollapse: "collapse",
                  color: "#fff",
                }}
              >
                <thead>
                  <tr style={{ background: "rgba(255,180,0,0.14)" }}>
                    <th style={thStyle}>Lugar</th>
                    <th style={thStyle}>Competidor</th>
                    <th style={thStyle}>Club</th>
                    <th style={thStyle}>Sentadilla</th>
                    <th style={thStyle}>Press</th>
                    <th style={thStyle}>Peso muerto</th>
                    <th style={thStyle}>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {atletasFiltrados.map((item, index) => (
                    <tr
                      key={item.atletaId}
                      style={index === lugar - 1 ? rowStyleHighlight : rowStyle}
                    >
                      <td style={tdStyle}>#{index + 1}</td>
                      <td style={tdStyle}>{item.atleta}</td>
                      <td style={tdStyle}>{item.club || "—"}</td>
                      <td style={tdStyle}>{item.mejorSentadilla} kg</td>
                      <td style={tdStyle}>{item.mejorBanca} kg</td>
                      <td style={tdStyle}>{item.mejorMuerto} kg</td>
                      <td style={tdStyle}>{item.total} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        borderRadius: "22px",
        padding: "22px",
        background: "rgba(0,0,0,0.36)",
        border: "1px solid rgba(255,180,0,0.14)",
      }}
    >
      <div
        style={{
          fontSize: "0.92rem",
          fontWeight: 800,
          color: "rgba(255,220,140,0.92)",
          marginBottom: "10px",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "1.45rem",
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 800,
  fontSize: "1rem",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  fontSize: "1rem",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px 14px",
  fontSize: "1rem",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "16px 14px",
  fontSize: "0.98rem",
  whiteSpace: "nowrap",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const rowStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.01)",
};

const rowStyleHighlight: React.CSSProperties = {
  background: "rgba(255,180,0,0.18)",
};