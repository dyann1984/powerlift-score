"use client";

import "./resultados.css";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type ResultadoAtleta = {
  id: number;
  nombre: string;
  club: string;
  categoria: string;
  sentadilla: number;
  banca: number;
  muerto: number;
};

const datosIniciales: ResultadoAtleta[] = [
  {
    id: 1,
    nombre: "Juan García",
    club: "Atlas Gym",
    categoria: "83 kg",
    sentadilla: 185,
    banca: 125,
    muerto: 240,
  },
  {
    id: 2,
    nombre: "Luis Martínez",
    club: "Power House",
    categoria: "93 kg",
    sentadilla: 210,
    banca: 145,
    muerto: 255,
  },
  {
    id: 3,
    nombre: "Ana Gómez",
    club: "Titan Club",
    categoria: "57 kg",
    sentadilla: 110,
    banca: 72,
    muerto: 145,
  },
  {
    id: 4,
    nombre: "María Torres",
    club: "Legends Team",
    categoria: "63 kg",
    sentadilla: 125,
    banca: 78,
    muerto: 155,
  },
];

type CategoriaFiltro = "Todas" | string;

export default function ResultadosPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<CategoriaFiltro>("Todas");
  const [orden, setOrden] = useState<"total" | "sentadilla" | "banca" | "muerto">("total");

  const categorias = useMemo(() => {
    const únicas = Array.from(new Set(datosIniciales.map((a) => a.categoria)));
    return ["Todas", ...únicas];
  }, []);

  const atletasProcesados = useMemo(() => {
    const conTotales = datosIniciales.map((a) => ({
      ...a,
      total: a.sentadilla + a.banca + a.muerto,
    }));

    const filtrados = conTotales.filter((a) => {
      const coincideBusqueda =
        a.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        a.club.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCategoria = categoria === "Todas" || a.categoria === categoria;

      return coincideBusqueda && coincideCategoria;
    });

    const ordenados = [...filtrados].sort((a, b) => {
      if (orden === "sentadilla") return b.sentadilla - a.sentadilla;
      if (orden === "banca") return b.banca - a.banca;
      if (orden === "muerto") return b.muerto - a.muerto;
      return b.total - a.total;
    });

    return ordenados.map((a, index) => ({
      ...a,
      posicion: index + 1,
    }));
  }, [busqueda, categoria, orden]);

  const topTotal = atletasProcesados[0];
  const mejoresStats = useMemo(() => {
    if (atletasProcesados.length === 0) return null;

    const mejorSentadilla = [...atletasProcesados].sort((a, b) => b.sentadilla - a.sentadilla)[0];
    const mejorBanca = [...atletasProcesados].sort((a, b) => b.banca - a.banca)[0];
    const mejorMuerto = [...atletasProcesados].sort((a, b) => b.muerto - a.muerto)[0];

    return {
      mejorSentadilla,
      mejorBanca,
      mejorMuerto,
    };
  }, [atletasProcesados]);

  return (
    <main className="resultados-page">
      <div className="resultados-shell">
        <header className="resultados-header">
          <div className="resultados-brand">
            <div className="resultados-logo-box">
              <Image
                src="/jaguar-logo.png"
                alt="Powerlift Tlalmanalco"
                width={82}
                height={82}
                className="resultados-logo"
                priority
              />
            </div>

            <div className="resultados-title-wrap">
              <p className="resultados-kicker">RESULTADOS OFICIALES</p>
              <h1 className="resultados-title">Ranking general</h1>
              <p className="resultados-subtitle">
                Tabla de posiciones, mejores levantamientos y control por categoría
              </p>
            </div>
          </div>

          <Link href="/" className="resultados-back-btn">
            ← Volver
          </Link>
        </header>

        <section className="resultados-top-grid">
          <article className="r-card champion-card">
            <div className="r-tag">LÍDER ACTUAL</div>
            {topTotal ? (
              <>
                <h2>{topTotal.nombre}</h2>
                <p>
                  {topTotal.club} · {topTotal.categoria}
                </p>
                <div className="champion-total">
                  <span>Total oficial</span>
                  <strong>{topTotal.total} kg</strong>
                </div>
              </>
            ) : (
              <div className="empty-state-mini">Sin resultados disponibles</div>
            )}
          </article>

          <article className="r-card stat-card">
            <div className="r-tag">MEJOR SENTADILLA</div>
            {mejoresStats ? (
              <>
                <h3>{mejoresStats.mejorSentadilla.nombre}</h3>
                <p>{mejoresStats.mejorSentadilla.categoria}</p>
                <strong>{mejoresStats.mejorSentadilla.sentadilla} kg</strong>
              </>
            ) : (
              <div className="empty-state-mini">Sin datos</div>
            )}
          </article>

          <article className="r-card stat-card">
            <div className="r-tag">MEJOR BANCA</div>
            {mejoresStats ? (
              <>
                <h3>{mejoresStats.mejorBanca.nombre}</h3>
                <p>{mejoresStats.mejorBanca.categoria}</p>
                <strong>{mejoresStats.mejorBanca.banca} kg</strong>
              </>
            ) : (
              <div className="empty-state-mini">Sin datos</div>
            )}
          </article>

          <article className="r-card stat-card">
            <div className="r-tag">MEJOR PESO MUERTO</div>
            {mejoresStats ? (
              <>
                <h3>{mejoresStats.mejorMuerto.nombre}</h3>
                <p>{mejoresStats.mejorMuerto.categoria}</p>
                <strong>{mejoresStats.mejorMuerto.muerto} kg</strong>
              </>
            ) : (
              <div className="empty-state-mini">Sin datos</div>
            )}
          </article>
        </section>

        <section className="resultados-main-grid">
          <article className="r-card filters-card">
            <div className="r-tag">FILTROS</div>
            <h3 className="section-title">Buscar y ordenar</h3>

            <div className="filter-grid">
              <div className="field">
                <label>Buscar atleta / club</label>
                <input
                  className="field-input"
                  placeholder="Ej. Juan / Atlas Gym"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Categoría</label>
                <select
                  className="field-input"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                >
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Ordenar por</label>
                <select
                  className="field-input"
                  value={orden}
                  onChange={(e) =>
                    setOrden(e.target.value as "total" | "sentadilla" | "banca" | "muerto")
                  }
                >
                  <option value="total">Total</option>
                  <option value="sentadilla">Sentadilla</option>
                  <option value="banca">Banca</option>
                  <option value="muerto">Peso muerto</option>
                </select>
              </div>
            </div>
          </article>

          <article className="r-card ranking-card">
            <div className="r-tag">TABLA GENERAL</div>
            <h3 className="section-title">Clasificación</h3>

            <div className="ranking-scroll">
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Atleta</th>
                    <th>Club</th>
                    <th>Categoría</th>
                    <th>Sentadilla</th>
                    <th>Banca</th>
                    <th>Peso muerto</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {atletasProcesados.length > 0 ? (
                    atletasProcesados.map((atleta) => (
                      <tr key={atleta.id}>
                        <td>
                          <span
                            className={`pos-badge ${
                              atleta.posicion === 1
                                ? "gold"
                                : atleta.posicion === 2
                                ? "silver"
                                : atleta.posicion === 3
                                ? "bronze"
                                : ""
                            }`}
                          >
                            {atleta.posicion}
                          </span>
                        </td>
                        <td>{atleta.nombre}</td>
                        <td>{atleta.club}</td>
                        <td>{atleta.categoria}</td>
                        <td>{atleta.sentadilla} kg</td>
                        <td>{atleta.banca} kg</td>
                        <td>{atleta.muerto} kg</td>
                        <td className="total-cell">{atleta.total} kg</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="empty-row">
                        No hay resultados para ese filtro.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}