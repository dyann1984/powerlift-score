import Link from "next/link";

const cards = [
  {
    href: "/registro",
    icon: "📝",
    title: "Registro de atletas",
    desc: "Alta de competidores, peso corporal, club y categoría automática.",
  },
  {
    href: "/competencia",
    icon: "🏋️",
    title: "Competencia",
    desc: "Control de intentos, luces de jueces y temporizador de 60 segundos.",
  },
  {
    href: "/marcador",
    icon: "📺",
    title: "Marcador en vivo",
    desc: "Vista pública para pantalla, TV o transmisión.",
  },
  {
    href: "/resultados",
    icon: "🏆",
    title: "Resultados",
    desc: "Ranking por categoría con total de sentadilla, banca y peso muerto.",
  },
];

export default function InicioPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center">
        <img
          src="/logo.png"
          alt="PowerLift Tlalmanalco"
          className="mb-8 w-[170px] md:w-[220px]"
        />

        <p className="mb-6 text-center text-sm tracking-[0.35em] text-cyan-400">
          POWERLIFTING CLÁSICO
        </p>

        <h1 className="mb-8 text-center text-4xl font-black leading-none tracking-tight md:text-7xl">
          <span
            style={{
              color: "#7fd3ff",
              textShadow:
                "0 1px 0 rgba(255,255,255,0.25), 0 0 12px rgba(0,140,255,0.18), 0 3px 12px rgba(0,0,0,0.7)",
            }}
          >
            PowerLift Tlalmanalco Score
          </span>
        </h1>

        <p className="max-w-3xl text-center text-white/70 md:text-xl">
          Sistema de registro, control de intentos, luces de jueces,
          marcador en vivo y resultados para competencias de powerlifting.
        </p>

        <div className="mt-14 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          {cards.map((card) => (
            <Link key={card.href} href={card.href} className="relative group">
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-cyan-500/40 to-blue-700/40 blur-lg opacity-50 transition duration-300 group-hover:opacity-80" />

              <div className="relative rounded-3xl border border-cyan-400/20 bg-zinc-950 p-8 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/50">
                <div className="mb-4 text-3xl">{card.icon}</div>

                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  {card.title}
                </h2>

                <p className="mt-3 text-base text-white/70 md:text-lg">
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}