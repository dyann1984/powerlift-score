import Link from "next/link";

export default function CompetenciaPage() {
  return (
    <main className="site-wrap">
      <section className="hero">
        <div className="hero-left">
          <div className="logo-box">
            <img src="/logo.png" alt="Powerlifting Score" />
          </div>

          <div>
            <div className="kicker">Competencia</div>
            <h1 className="hero-title">Mesa de control oficial</h1>
            <div className="hero-subtitle">
              Panel técnico premium con estética de campeonato
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <Link href="/registro">
            <button className="btn-dark">Registro</button>
          </Link>
          <Link href="/inicio">
            <button className="btn-gold">Inicio</button>
          </Link>
        </div>
      </section>

      <section className="panel-split">
        <div className="card section">
          <h2 className="section-title">Panel técnico</h2>

          <div className="field" style={{ marginBottom: 16 }}>
            <label>Seleccionar atleta</label>
            <select defaultValue="Juan García">
              <option>Juan García</option>
              <option>Ana Gómez</option>
              <option>Pablo Martínez</option>
            </select>
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="field">
              <label>Movimiento</label>
              <select defaultValue="Sentadilla">
                <option>Sentadilla</option>
                <option>Bench Press</option>
                <option>Peso muerto</option>
              </select>
            </div>

            <div className="field">
              <label>Intento</label>
              <select defaultValue="Intento 1">
                <option>Intento 1</option>
                <option>Intento 2</option>
                <option>Intento 3</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Peso solicitado</label>
            <input type="number" placeholder="Ej. 200" />
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <div className="mini-label">Movimiento</div>
              <div className="mini-value">Sentadilla</div>
            </div>

            <div className="mini-card">
              <div className="mini-label">Intento</div>
              <div className="mini-value">Intento 1</div>
            </div>

            <div className="mini-card">
              <div className="mini-label">Resultado</div>
              <div className="mini-value">Pendiente</div>
            </div>
          </div>

          <div className="action-grid">
            <button className="action-btn valid">VÁLIDO</button>
            <button className="action-btn fail">NULO</button>
            <button className="action-btn pending">PENDIENTE</button>
          </div>
        </div>

        <div className="card section">
          <h2 className="section-title">Intento actual</h2>

          <div className="big-screen">
            <div>
              <h3>Juan García</h3>
              <p>83 kg · Atlas Gym</p>
              <div className="big-number">80 kg</div>
              <p>Sentadilla · Intento 1</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}