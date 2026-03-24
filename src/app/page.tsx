"use client";

import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

function SplashScreen() {
  return (
    <div className="powerlift-splash">
      <div className="powerlift-splash-overlay" />
      <div className="powerlift-splash-content">
        <Image
          src="/jaguar-logo.png"
          alt="Powerlift"
          width={240}
          height={240}
          className="powerlift-splash-logo"
          priority
        />
        <p className="powerlift-splash-kicker">COMPETENCIA</p>
        <h1 className="powerlift-splash-title">POWERLIFT TLALMANALCO</h1>
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

function HomeContent() {
  return (
    <main className="powerlift-home">
      <div className="powerlift-shell">
        <div className="powerlift-container">
          <section className="powerlift-hero">
            <div className="powerlift-brand">
              <div className="powerlift-logo-wrap">
                <Image
                  src="/jaguar-logo.png"
                  alt="Powerlift"
                  width={150}
                  height={150}
                  className="powerlift-logo"
                  priority
                />
              </div>

              <div>
                <p className="powerlift-kicker">COMPETENCIA</p>
                <h1 className="powerlift-title">POWERLIFT TLALMANALCO</h1>
                <p className="powerlift-subtitle">
                  Sistema profesional de competencia
                </p>
              </div>
            </div>

            <div className="powerlift-grid">
              <article className="powerlift-card">
                <span className="powerlift-label">Registro</span>
                <h3>Atletas</h3>
                <p>Alta de competidores</p>
                <Link href="/registro" className="powerlift-button">
                  Entrar
                </Link>
              </article>

              <article className="powerlift-card">
                <span className="powerlift-label">Competencia</span>
                <h3>Jueces</h3>
                <p>Panel de calificación</p>
                <Link href="/jueces" className="powerlift-button">
                  Entrar
                </Link>
              </article>

              <article className="powerlift-card">
                <span className="powerlift-label">Resultados</span>
                <h3>Ranking</h3>
                <p>Tabla general</p>
                <Link href="/resultados" className="powerlift-button">
                  Entrar
                </Link>
              </article>

              <article className="powerlift-card">
                <span className="powerlift-label">Control</span>
                <h3>Admin</h3>
                <p>Gestión del evento</p>
                <Link href="/admin" className="powerlift-button">
                  Entrar
                </Link>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [hideSplash, setHideSplash] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setHideSplash(true);
    }, 2600);

    const timer2 = setTimeout(() => {
      setShowSplash(false);
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      <div className={`powerlift-page ${showSplash ? "is-loading" : "is-ready"}`}>
        <HomeContent />
      </div>

      {showSplash && (
        <div className={hideSplash ? "powerlift-splash-out" : ""}>
          <SplashScreen />
        </div>
      )}
    </>
  );
}