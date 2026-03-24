"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div className="splash">
      <div className="overlay" />

      {/* HALO AZTECA */}
      <div className="halo" />

      {/* LOGO JAGUAR */}
      <img src="/jaguar.png" alt="Jaguar" className="logo" />

      <h1 className="title">POWERLIFT</h1>
      <p className="subtitle">TLALMANALCO</p>
    </div>
  );
}