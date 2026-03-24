"use client";

import "./admin.css";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Competidor = {
  id: number;
  nombre: string;
  sexo: "Masculino" | "Femenino";
  categoria: string;
  club: string;
  estado: "Activo" | "En espera" | "Finalizado";
};

type EventoStats = {
  atletas: number;
  jueces: number;
  intentos: number;
  categorias: number;
};

const competidoresIniciales: Competidor[] = [
  {
    id: 1,
    nombre: "Juan García",
    sexo: "Masculino",
    categoria: "83 kg",
    club: "Atlas Gym",
    estado: "Activo",
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    sexo: "Femenino",
    categoria: "57 kg",
    club: "Titan Club",
    estado: "En espera",
  },
  {
    id: 3,
    nombre: "Luis Martínez",
    sexo: "Masculino",
    categoria: "93 kg",
    club: "Power House",
    estado: "Finalizado",
  },
  {
    id: 4,
    nombre: "María Torres",
    sexo: "Femenino",
    categoria: "63 kg",
    club: "Legends Team",
    estado: "Activo",
  },
];

const statsIniciales: EventoStats = {
  atletas: 24,
  jueces: 3,
  intentos: 58,
  categorias: 8,
};

export default function AdminPage() {
  const [competidores, setCompetidores] = useState<Competidor[]>(competidoresIniciales);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<"Todos" | Competidor["estado"]>("Todos");

  const filtrados = useMemo(() => {
    return competidores.filter((c) => {
      const matchBusqueda =
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.club.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.categoria.toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado = estadoFiltro === "Todos" || c.estado === estadoFiltro;

      return matchBusqueda && matchEstado;
    });
  }, [competidores, busqueda, estadoFiltro]);

  const activos = useMemo(
    () => competidores.filter((c) => c.estado === "Activo").length,
    [competidores]
  );

  const finalizarEvento = () => {
    setCompetidores((prev) =>
      prev.map((c) => ({
        ...c,
        estado: "Finalizado",
      }))
    );
  };

  const reiniciarEstados = () => {
    setCompetidores((prev) =>
      prev.map((c, index) => ({
        ...c,
        estado: index % 2 === 0 ? "Activo" : "En espera",
      }))
    );
  };

  const marcarFinalizado = (id: number) => {
    setCompetidores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: "Finalizado" } : c))
    );
  };

  const ponerActivo = (id: number) => {
    setCompetidores((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: "Activo" } : c))
    );
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div className="admin-brand">
            <div className="admin-logo-box">
              <Image
                src="/jaguar-logo.png"
                alt="Powerlift Tlalmanalco"
                width={82}
                height={82}
                className="admin-logo"
                priority
              />
            </div>

            <div className="admin-title-wrap">
              <p className="admin-kicker">CONTROL GENERAL</p>
              <h1 className="admin-title">Panel administrativo</h1>
              <p className="admin-subtitle">
                Gestión del evento, control de atletas, estado del campeonato y monitoreo rápido
              </p>
            </div>
          </div>

          <Link href="/" className="admin-back-btn">
            ← Volver
          </Link>
        </header>

        <section className="admin-stats-grid">
          <article className="a-card stat-card">
            <div className="a-tag">ATLETAS</div>
            <strong>{statsIniciales.atletas}</strong>
            <p>Registrados en el evento</p>
          </article>

          <article className="a-card stat-card">
            <div className="a-tag">JUECES</div>
            <strong>{statsIniciales.jueces}</strong>
            <p>Activos en la plataforma</p>
          </article>

          <article className="a-card stat-card">
            <div className="a-tag">INTENTOS</div>
            <strong>{statsIniciales.intentos}</strong>
            <p>Procesados en jornada</p>
          </article>

          <article className="a-card stat-card">
            <div className="a-tag">CATEGORÍAS</div>
            <strong>{statsIniciales.categorias}</strong>
            <p>Abiertas en competencia</p>
          </article>
        </section>

        <section className="admin-main-grid">
          <aside className="admin-side">
            <article className="a-card">
              <div className="a-tag">CONTROL RÁPIDO</div>
              <h3 className="section-title">Acciones del evento</h3>

              <div className="admin-actions">
                <button className="admin-btn primary" onClick={finalizarEvento}>
                  Finalizar evento
                </button>
                <button className="admin-btn secondary" onClick={reiniciarEstados}>
                  Reiniciar estados
                </button>
              </div>

              <div className="admin-status-box">
                <span>Atletas activos</span>
                <strong>{activos}</strong>
              </div>
            </article>

            <article className="a-card">
              <div className="a-tag">FILTROS</div>
              <h3 className="section-title">Buscar competidores</h3>

              <div className="field">
                <label>Buscar</label>
                <input
                  className="field-input"
                  placeholder="Nombre, club o categoría"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Estado</label>
                <select
                  className="field-input"
                  value={estadoFiltro}
                  onChange={(e) =>
                    setEstadoFiltro(e.target.value as "Todos" | Competidor["estado"])
                  }
                >
                  <option value="Todos">Todos</option>
                  <option value="Activo">Activo</option>
                  <option value="En espera">En espera</option>
                  <option value="Finalizado">Finalizado</option>
                </select>
              </div>
            </article>
          </aside>

          <article className="a-card admin-table-card">
            <div className="a-tag">MONITOREO GENERAL</div>
            <h3 className="section-title">Competidores</h3>

            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Sexo</th>
                    <th>Categoría</th>
                    <th>Club</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length > 0 ? (
                    filtrados.map((c) => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td>{c.nombre}</td>
                        <td>{c.sexo}</td>
                        <td>{c.categoria}</td>
                        <td>{c.club}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              c.estado === "Activo"
                                ? "status-ok"
                                : c.estado === "En espera"
                                ? "status-wait"
                                : "status-end"
                            }`}
                          >
                            {c.estado}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="mini-btn ok"
                              onClick={() => ponerActivo(c.id)}
                            >
                              Activar
                            </button>
                            <button
                              className="mini-btn end"
                              onClick={() => marcarFinalizado(c.id)}
                            >
                              Finalizar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="empty-row">
                        No se encontraron competidores con ese filtro.
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