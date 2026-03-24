export default function MarcadorPage() {
  return (
    <main className="site-wrap">
      <section className="broadcast-wrap">
        <div className="broadcast-top">
          <div className="kicker">Live Broadcast</div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 36, fontWeight: 900 }}>
                Powerlifting Championship 2026
              </div>
              <div
                style={{
                  color: "#b8bec8",
                  fontSize: 18,
                  marginTop: 6,
                }}
              >
                Pantalla oficial de competencia
              </div>
            </div>

            <div
              className="badge"
              style={{
                fontSize: 18,
                minHeight: 48,
                padding: "0 22px",
                background: "rgba(201,162,39,0.12)",
                border: "1px solid rgba(231,198,90,0.35)",
              }}
            >
              EN VIVO
            </div>
          </div>
        </div>

        <div className="broadcast-main">
          <div className="broadcast-big">
            <div className="broadcast-label">Atleta actual</div>

            <div
              className="badge"
              style={{
                width: "fit-content",
                marginBottom: 16,
              }}
            >
              PLATAFORMA A · OFICIAL
            </div>

            <div className="broadcast-name">Juan García</div>

            <div
              style={{
                fontSize: 26,
                color: "#b8bec8",
                marginTop: 14,
              }}
            >
              Atlas Gym · Categoría 83 kg
            </div>

            <div className="broadcast-weight">80 kg</div>
          </div>

          <div className="broadcast-side">
            <div className="broadcast-mini">
              <div className="broadcast-label">Movimiento</div>
              <div className="broadcast-value">Sentadilla</div>
            </div>

            <div className="broadcast-mini">
              <div className="broadcast-label">Intento</div>
              <div className="broadcast-value">Intento 1</div>
            </div>

            <div className="broadcast-mini">
              <div className="broadcast-label">Estado</div>
              <div
                className="broadcast-value"
                style={{ color: "#facc15" }}
              >
                Pendiente
              </div>
            </div>
          </div>
        </div>

        <div className="broadcast-bottom">
          <div className="broadcast-label">Siguientes atletas</div>

          <div className="broadcast-next-grid">
            <div className="broadcast-mini next-primary">
              <div className="broadcast-value">Pablo Martínez</div>
              <div style={{ color: "#cbd5e1", marginTop: 10 }}>
                90 kg · Bench Press · 85 kg
              </div>
            </div>

            <div className="broadcast-mini">
              <div className="broadcast-value">Ana Gómez</div>
              <div style={{ color: "#cbd5e1", marginTop: 10 }}>
                63 kg · Peso muerto · 110 kg
              </div>
            </div>

            <div className="broadcast-mini">
              <div className="broadcast-value">Carlos Herrera</div>
              <div style={{ color: "#cbd5e1", marginTop: 10 }}>
                90 kg · Sentadilla · 100 kg
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}