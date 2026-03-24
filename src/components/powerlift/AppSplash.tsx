"use client";

import Image from "next/image";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  children: ReactNode;
};

export default function AppSplash({ children }: Props) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const splashAlreadySeen = sessionStorage.getItem("powerlift_splash_seen");

    if (splashAlreadySeen === "true") {
      setVisible(false);
      return;
    }

    const startFade = setTimeout(() => {
      setFadeOut(true);
    }, 2200);

    const removeSplash = setTimeout(() => {
      sessionStorage.setItem("powerlift_splash_seen", "true");
      setVisible(false);
    }, 3000);

    return () => {
      clearTimeout(startFade);
      clearTimeout(removeSplash);
    };
  }, []);

  return (
    <>
      {visible && (
        <div className={`pl-splash ${fadeOut ? "pl-splash--hide" : ""}`}>
          <div className="pl-splash__bg" />
          <div className="pl-splash__particles" />
          <div className="pl-splash__center">
            <div className="pl-splash__logoWrap">
              <div className="pl-splash__ring pl-splash__ring--one" />
              <div className="pl-splash__ring pl-splash__ring--two" />
              <div className="pl-splash__logoBox">
                <Image
                  src="/jaguar-logo.png"
                  alt="Powerlift Tlalmanalco"
                  width={170}
                  height={170}
                  priority
                  className="pl-splash__logo"
                />
              </div>
            </div>

            <div className="pl-splash__text">
              <p className="pl-splash__kicker">SISTEMA OFICIAL</p>
              <h1 className="pl-splash__title">POWERLIFT TLALMANALCO</h1>
              <p className="pl-splash__subtitle">Cargando plataforma profesional...</p>
            </div>

            <div className="pl-splash__loader">
              <span className="pl-splash__bar" />
            </div>
          </div>
        </div>
      )}

      <div className={visible ? "pl-app pl-app--locked" : "pl-app"}>{children}</div>
    </>
  );
}