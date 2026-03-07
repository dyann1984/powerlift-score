"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/inicio");
    }, 2600);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,170,255,0.16),transparent_45%)]" />
      <div className="absolute h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

      <section className="relative z-10 flex flex-col items-center px-6 text-center">
        <img
          src="/logo.png"
          alt="PowerLift Tlalmanalco"
          className="w-[180px] md:w-[240px] animate-[pulse_2s_ease-in-out_infinite]"
        />

        <p className="mt-6 text-sm tracking-[0.35em] text-cyan-400">
          POWERLIFTING CLÁSICO
        </p>

        <h1
          className="mt-5 text-4xl font-black leading-none md:text-6xl"
          style={{
            color: "#7fd3ff",
            textShadow:
              "0 1px 0 rgba(255,255,255,0.2), 0 0 12px rgba(0,140,255,0.18), 0 3px 12px rgba(0,0,0,0.7)",
          }}
        >
          PowerLift Tlalmanalco Score
        </h1>

        <p className="mt-4 text-base text-white/70 md:text-lg">
          Cargando sistema...
        </p>

        <div className="mt-7 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-3 w-3 rounded-full bg-cyan-400 animate-bounce" />
        </div>

        <div className="mt-8 h-2 w-64 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 animate-[growBar_2.3s_ease-out_forwards]" />
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes growBar {
              from { transform: scaleX(0); }
              to { transform: scaleX(1); }
            }
          `,
        }}
      />
    </main>
  );
}