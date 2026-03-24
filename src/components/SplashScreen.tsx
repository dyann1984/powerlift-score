"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SplashScreen() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (pathname === "/inicio" || pathname === "/") {
      setVisible(true);
      setHide(false);

      const fade = setTimeout(() => setHide(true), 1800);
      const end = setTimeout(() => setVisible(false), 2300);

      return () => {
        clearTimeout(fade);
        clearTimeout(end);
      };
    }
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className={`splash-overlay ${hide ? "splash-hide" : ""}`}>
      <div className="splash-content">
        <img src="/logo.png" className="splash-logo" />

        <div className="splash-title">Powerlifting Score</div>
        <div className="splash-subtitle">Sistema profesional</div>

        <div className="splash-loader">
          <div className="splash-loader-bar" />
        </div>
      </div>
    </div>
  );
}