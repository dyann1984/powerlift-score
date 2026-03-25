"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Sexo = "Masculino" | "Femenino";

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

export default function AdminPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ATHLETES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Athlete[];
        if (Array.isArray(parsed)) {
          setAthletes(parsed);
        }
      }
    } catch {
      setAthletes([]);
    }
  }, []);

  const filteredAthletes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return athletes;

    return athletes.filter((a) => {
      return (
        a.nombre.toLowerCase().includes(q) ||
        a.club.toLowerCase().includes(q) ||
        a.categoria.toLowerCase().includes(q)
      );
    });
  }, [athletes, search]);

  const stats = useMemo(() => {
    const masculinos = athletes.filter((a) => a.sexo === "Masculino").length;
    const femeninos = athletes.filter((a) => a.sexo === "Femenino").length;
    const categorias = new Set(athletes.map((a) => a.categoria).filter(Boolean)).size;
    const clubes = new Set(athletes.map((a) => a.club).filter(Boolean)).size;

    return {
      total: athletes.length,
      masculinos,
      femeninos,
      categorias,
      clubes,
    };
  }, [athletes]);

  const recentAthletes = useMemo(() => {
    return [...athletes].slice(-5).reverse();
  }, [athletes]);

  const handleResetAthletes = () => {
    const ok = window.confirm(
      "¿Seguro que deseas eliminar todos los atletas registrados localmente?"
    );
    if (!ok) return;

    localStorage.removeItem(ATHLETES_STORAGE_KEY);
    setAthletes([]);
  };

  const handleDeleteOne = (id: string) => {
    const ok = window.confirm("¿Eliminar este atleta?");
    if (!ok) return;

    const updated = athletes.filter((a) => a.id !== id);
    setAthletes(updated);
    localStorage.setItem(ATHLETES_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <main className="admin-page">
      <div className="bg-image" />
      <div className="admin-overlay" />
      <div className="admin-noise" />

      <section className="admin-wrap">
        <header className="hero">
          <div className="heroBrand">
            <div className="logoBox">
              <img src="/jaguar-logo.png" alt="Logo Powerlifting" className="logoImg" />
            </div>

            <div className="heroText">
              <p className="eyebrow">ADMIN</p>
              <h1>Centro de control</h1>
              <p>Gestión general del evento, atletas, módulos y control rápido del sistema</p>
            </div>
          </div>

          <Link href="/" className="volverBtn">
            ← Volver
          </Link>
        </header>

        <section className="topGrid">
          <article className="panel metricsPanel">
            <div className="panelGlow" />
            <div className="pill">RESUMEN GENERAL</div>
            <h2>Indicadores</h2>

            <div className="metricsGrid">
              <div className="metricCard">
                <span>Total atletas</span>
                <strong>{stats.total}</strong>
              </div>
              <div className="metricCard">
                <span>Masculino</span>
                <strong>{stats.masculinos}</strong>
              </div>
              <div className="metricCard">
                <span>Femenino</span>
                <strong>{stats.femeninos}</strong>
              </div>
              <div className="metricCard">
                <span>Categorías</span>
                <strong>{stats.categorias}</strong>
              </div>
              <div className="metricCard">
                <span>Clubes</span>
                <strong>{stats.clubes}</strong>
              </div>
              <div className="metricCard">
                <span>Estado</span>
                <strong>Activo</strong>
              </div>
            </div>
          </article>

          <article className="panel quickPanel">
            <div className="panelGlow" />
            <div className="pill">ACCESO RÁPIDO</div>
            <h2>Módulos</h2>

            <div className="quickLinks">
              <Link href="/registro" className="quickLink">
                Registro
              </Link>
              <Link href="/jueces" className="quickLink">
                Jueces
              </Link>
              <Link href="/resultados" className="quickLink">
                Resultados
              </Link>
              <Link href="/" className="quickLink">
                Inicio
              </Link>
            </div>

            <div className="dangerZone">
              <div className="dangerTitle">Control local</div>
              <button className="dangerBtn" onClick={handleResetAthletes}>
                Borrar todos los atletas
              </button>
            </div>
          </article>

          <article className="panel recentPanel">
            <div className="panelGlow" />
            <div className="pill">ACTIVIDAD</div>
            <h2>Recientes</h2>

            <div className="recentList">
              {recentAthletes.length === 0 ? (
                <div className="emptyRecent">Sin atletas registrados</div>
              ) : (
                recentAthletes.map((a) => (
                  <div className="recentItem" key={a.id}>
                    <div className="recentPhoto">
                      {a.foto ? <img src={a.foto} alt={a.nombre} /> : <span>F</span>}
                    </div>
                    <div className="recentInfo">
                      <strong>{a.nombre}</strong>
                      <span>
                        {a.categoria} · {a.club || "Sin club"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="bottomGrid">
          <article className="panel tablePanel">
            <div className="panelGlow" />
            <div className="tableHeader">
              <div>
                <div className="pill">GESTIÓN DE ATLETAS</div>
                <h2>Listado general</h2>
              </div>

              <div className="searchBox">
                <input
                  type="text"
                  placeholder="Buscar por nombre, club o categoría"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th className="colFoto">Foto</th>
                    <th>Nombre</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Categoría</th>
                    <th>Club</th>
                    <th className="colActions">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAthletes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="emptyCell">
                        ⚠️ Sin atletas para mostrar
                      </td>
                    </tr>
                  ) : (
                    filteredAthletes.map((a) => (
                      <tr key={a.id}>
                        <td className="colFoto">
                          {a.foto ? (
                            <img src={a.foto} alt={a.nombre} className="miniFoto" />
                          ) : (
                            <div className="miniFoto miniFotoEmpty">FOTO</div>
                          )}
                        </td>
                        <td className="nameCell">{a.nombre}</td>
                        <td>{a.sexo}</td>
                        <td>{a.peso} kg</td>
                        <td>{a.categoria}</td>
                        <td>{a.club || "—"}</td>
                        <td className="colActions">
                          <button className="deleteBtn" onClick={() => handleDeleteOne(a.id)}>
                            Eliminar
                          </button>
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
        .admin-page {
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

        .admin-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(rgba(0, 0, 0, 0.38), rgba(0, 0, 0, 0.72)),
            radial-gradient(circle at 20% 80%, rgba(255, 140, 0, 0.08), transparent 35%),
            radial-gradient(circle at 80% 20%, rgba(0, 120, 255, 0.06), transparent 30%);
        }

        .admin-noise {
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

        .admin-wrap {
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
          grid-template-columns: 1.15fr 0.75fr 0.8fr;
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
        .metricsGrid,
        .quickLinks,
        .dangerZone,
        .recentList,
        .tableHeader,
        .tableWrap {
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

        .metricsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
        }

        .metricCard,
        .recentItem,
        .dangerZone {
          background: rgba(0, 0, 0, 0.34);
          border: 1px solid rgba(255, 196, 60, 0.08);
          border-radius: 14px;
          padding: 10px;
          backdrop-filter: blur(6px);
        }

        .metricCard span {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.64);
          margin-bottom: 4px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 800;
        }

        .metricCard strong {
          color: #fff;
          font-size: 18px;
        }

        .quickLinks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }

        .quickLink {
          min-height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.36);
          border: 1px solid rgba(255, 190, 60, 0.1);
          color: #fff;
          font-weight: 900;
          text-decoration: none;
        }

        .dangerZone {
          display: grid;
          gap: 10px;
        }

        .dangerTitle {
          color: #fff;
          font-weight: 900;
          font-size: 14px;
        }

        .dangerBtn,
        .deleteBtn {
          min-height: 40px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 900;
        }

        .dangerBtn,
        .deleteBtn {
          background: linear-gradient(180deg, #ff6f61 0%, #db433b 100%);
          color: #fff;
          box-shadow: 0 8px 14px rgba(0, 0, 0, 0.22);
        }

        .recentList {
          display: grid;
          gap: 8px;
        }

        .recentItem {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 10px;
          align-items: center;
        }

        .recentPhoto {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.46);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 12px;
        }

        .recentPhoto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recentInfo {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .recentInfo strong {
          color: #fff;
          font-size: 13px;
        }

        .recentInfo span {
          color: rgba(255, 255, 255, 0.72);
          font-size: 12px;
        }

        .emptyRecent {
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.3);
          color: rgba(255, 255, 255, 0.86);
          font-weight: 900;
        }

        .tableHeader {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: end;
          margin-bottom: 8px;
        }

        .searchBox {
          width: min(380px, 100%);
        }

        .searchBox input {
          width: 100%;
          min-height: 42px;
          border-radius: 14px;
          border: 1px solid rgba(255, 190, 60, 0.12);
          background: rgba(0, 0, 0, 0.42);
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
          min-width: 980px;
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

        .colFoto {
          width: 84px;
        }

        .colActions {
          width: 120px;
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

        .nameCell {
          font-weight: 900;
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

          .metricsGrid {
            grid-template-columns: 1fr 1fr;
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

          .metricsGrid,
          .quickLinks {
            grid-template-columns: 1fr;
          }

          .tableHeader {
            flex-direction: column;
            align-items: stretch;
          }

          .searchBox {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}