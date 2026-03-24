"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function SplashScreen() {
  return (
    <div className="powerlift-splash">
      <div className="powerlift-splash-noise" />
      <div className="powerlift-splash-rays" />
      <div className="powerlift-splash-content">
        <div className="powerlift-splash-logo-wrap">
          <div className="powerlift-splash-ring powerlift-splash-ring-1" />
          <div className="powerlift-splash-ring powerlift-splash-ring-2" />
          <Image
            src="/jaguar-logo.png"
            alt="Powerlift"
            width={240}
            height={240}
            className="powerlift-splash-logo"
            priority
          />
        </div>

        <p className="powerlift-splash-kicker">COMPETENCIA OFICIAL</p>

        <h1 className="powerlift-splash-title">
          POWERLIFT
          <span>TLALMANALCO</span>
        </h1>

        <p className="powerlift-splash-subtitle">
          Sistema profesional de competencia
        </p>

        <div className="powerlift-splash-loader">
          <span />
        </div>
      </div>
    </div>
  );
}

export default function InicioPage() {
  const [showSplash, setShowSplash] = useState(true);
  const [hideSplash, setHideSplash] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const triggerSplash = () => {
    clearAllTimers();
    setShowSplash(true);
    setHideSplash(false);

    timersRef.current.push(
      window.setTimeout(() => {
        setHideSplash(true);
      }, 2600)
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setShowSplash(false);
      }, 3400)
    );
  };

  useEffect(() => {
    triggerSplash();

    return () => {
      clearAllTimers();
    };
  }, []);

  const stats = {
    atletas: 12,
    masculino: 9,
    femenino: 3,
    categorias: 8,
  };

  const modules = [
    {
      label: "ATLETAS",
      title: "Registro",
      desc: "Alta de atletas y categoría automática",
      href: "/registro",
    },
    {
      label: "CONTROL",
      title: "Competencia",
      desc: "Mesa oficial para gestionar intentos",
      href: "/competencia",
    },
    {
      label: "BROADCAST",
      title: "Marcador",
      desc: "Pantalla en vivo para TV o proyección",
      href: "/marcador",
    },
    {
      label: "RANKING",
      title: "Resultados",
      desc: "Clasificación general del campeonato",
      href: "/resultados",
    },
  ];

  return (
    <>
      <button className="powerlift-home-btn" onClick={triggerSplash}>
        INICIO
      </button>

      <div
        className={`powerlift-home-stage ${
          showSplash ? "powerlift-home-stage--loading" : "powerlift-home-stage--ready"
        }`}
      >
        <main className="powerlift-shell">
          <div className="powerlift-bg-orb orb-1" />
          <div className="powerlift-bg-orb orb-2" />
          <div className="powerlift-grid-lines" />

          <div className="powerlift-container">
            <section className="powerlift-hero">
              <div className="powerlift-hero-glow" />

              <div className="powerlift-brand">
                <div className="powerlift-logo-wrap">
                  <div className="powerlift-logo-ring" />
                  <Image
                    src="/jaguar-logo.png"
                    alt="Powerlift Tlalmanalco"
                    width={180}
                    height={180}
                    className="powerlift-logo"
                    priority
                  />
                </div>

                <div className="powerlift-copy">
                  <p className="powerlift-kicker">POWERLIFTING</p>
                  <h1 className="powerlift-title">Powerlifting Score</h1>
                  <p className="powerlift-subtitle">
                    TLALMANALCO · Championship Control Interface
                  </p>
                </div>
              </div>

              <div className="powerlift-grid">
                {modules.map((item) => (
                  <article key={item.href} className="powerlift-card">
                    <div className="powerlift-card-glow" />
                    <div className="powerlift-label">{item.label}</div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>

                    <Link href={item.href} className="powerlift-button">
                      Abrir módulo <span>→</span>
                    </Link>
                  </article>
                ))}
              </div>

              <div className="powerlift-stats">
                <div className="powerlift-stat">
                  <span>Atletas registrados</span>
                  <strong>{stats.atletas}</strong>
                </div>

                <div className="powerlift-stat">
                  <span>Masculino</span>
                  <strong>{stats.masculino}</strong>
                </div>

                <div className="powerlift-stat">
                  <span>Femenino</span>
                  <strong>{stats.femenino}</strong>
                </div>

                <div className="powerlift-stat">
                  <span>Categorías</span>
                  <strong>{stats.categorias}</strong>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {showSplash && (
        <div className={hideSplash ? "powerlift-splash-out" : ""}>
          <SplashScreen />
        </div>
      )}
    </>
  );
}