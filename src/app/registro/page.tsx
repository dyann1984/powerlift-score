"use client";

import "./registro.css";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

type Atleta = {
  id: number;
  nombre: string;
  sexo: string;
  peso: string;
  categoria: string;
  club: string;
  foto?: string;
};

const atletasIniciales: Atleta[] = [
  {
    id: 1,
    nombre: "Juan García",
    sexo: "Masculino",
    peso: "83",
    categoria: "83 kg",
    club: "Atlas Gym",
  },
  {
    id: 2,
    nombre: "Ana Gómez",
    sexo: "Femenino",
    peso: "57",
    categoria: "57 kg",
    club: "Titan Club",
  },
];

function obtenerCategoria(sexo: string, peso: string) {
  const valor = Number(peso);

  if (!valor) return "—";

  if (sexo === "Femenino") {
    if (valor <= 47) return "47 kg";
    if (valor <= 52) return "52 kg";
    if (valor <= 57) return "57 kg";
    if (valor <= 63) return "63 kg";
    if (valor <= 69) return "69 kg";
    if (valor <= 76) return "76 kg";
    if (valor <= 84) return "84 kg";
    return "+84 kg";
  }

  if (valor <= 59) return "59 kg";
  if (valor <= 66) return "66 kg";
  if (valor <= 74) return "74 kg";
  if (valor <= 83) return "83 kg";
  if (valor <= 93) return "93 kg";
  if (valor <= 105) return "105 kg";
  if (valor <= 120) return "120 kg";
  return "+120 kg";
}

export default function RegistroPage() {
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [nombre, setNombre] = useState("");
  const [sexo, setSexo] = useState("Masculino");
  const [peso, setPeso] = useState("");
  const [club, setClub] = useState("");
  const [fotoPreview, setFotoPreview] = useState("");
  const [fotoNombre, setFotoNombre] = useState("No se ha seleccionado archivo");
  const [atletas, setAtletas] = useState<Atleta[]>(atletasIniciales);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const categoria = useMemo(() => obtenerCategoria(sexo, peso), [sexo, peso]);

  const limpiarFormulario = () => {
    setEditandoId(null);
    setNombre("");
    setSexo("Masculino");
    setPeso("");
    setClub("");
    setFotoPreview("");
    setFotoNombre("No se ha seleccionado archivo");

    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const abrirSelectorArchivo = () => {
    inputFileRef.current?.click();
  };

  const onCambiarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setFotoNombre(archivo.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreview(String(reader.result || ""));
    };
    reader.readAsDataURL(archivo);
  };

  const guardarOActualizarAtleta = () => {
    if (!nombre.trim() || !peso.trim() || !club.trim()) {
      alert("Completa nombre, peso y club.");
      return;
    }

    const atletaData: Atleta = {
      id: editandoId ?? Date.now(),
      nombre: nombre.trim(),
      sexo,
      peso: peso.trim(),
      categoria,
      club: club.trim(),
      foto: fotoPreview || "",
    };

    if (editandoId !== null) {
      setAtletas((prev) =>
        prev.map((atleta) => (atleta.id === editandoId ? atletaData : atleta))
      );
    } else {
      setAtletas((prev) => [atletaData, ...prev]);
    }

    limpiarFormulario();
  };

  const editarAtleta = (atleta: Atleta) => {
    setEditandoId(atleta.id);
    setNombre(atleta.nombre ?? "");
    setSexo(atleta.sexo ?? "Masculino");
    setPeso(atleta.peso ?? "");
    setClub(atleta.club ?? "");
    setFotoPreview(atleta.foto ?? "");
    setFotoNombre(atleta.foto ? "foto-cargada.jpg" : "No se ha seleccionado archivo");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  const eliminarAtleta = (id: number) => {
    setAtletas((prev) => prev.filter((atleta) => atleta.id !== id));

    if (editandoId === id) {
      limpiarFormulario();
    }
  };

  return (
    <main className="registro-page">
      <div className="registro-shell">
        <header className="registro-header">
          <div className="registro-brand">
            <div className="registro-logo-box">
              <Image
                src="/jaguar-logo.png"
                alt="Powerlift Tlalmanalco"
                width={84}
                height={84}
                className="registro-logo"
                priority
              />
            </div>

            <div className="registro-title-wrap">
              <p className="registro-kicker">REGISTRO</p>
              <h1 className="registro-title">Atletas del campeonato</h1>
              <p className="registro-subtitle">
                Alta de competidores con foto, categoría automática y control visual profesional
              </p>
            </div>
          </div>

          <Link href="/" className="registro-back-btn">
            ← Volver
          </Link>
        </header>

        <section className="registro-content">
          <article className="registro-form-card">
            <div className="section-tag">
              {editandoId !== null ? "EDITANDO ATLETA" : "NUEVO ATLETA"}
            </div>

            <h2>{editandoId !== null ? "Editar atleta" : "Registro"}</h2>

            <div className="photo-area">
              <div className="photo-preview">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" />
                ) : (
                  <span className="photo-placeholder">Sin foto</span>
                )}
              </div>

              <div className="photo-actions">
                <input
                  ref={inputFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={onCambiarFoto}
                />

                <button type="button" className="upload-btn" onClick={abrirSelectorArchivo}>
                  Subir foto
                </button>

                <span className="upload-name">{fotoNombre}</span>
              </div>
            </div>

            <div className="registro-form-grid">
              <div className="field">
                <label>Nombre</label>
                <input
                  className="field-input"
                  placeholder="Ej. Juan García"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Sexo</label>
                <select
                  className="field-input"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                </select>
              </div>

              <div className="field">
                <label>Peso corporal</label>
                <input
                  className="field-input"
                  placeholder="Ej. 83"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Categoría automática</label>
                <div className="field-readonly">{categoria}</div>
              </div>

              <div className="field field-full">
                <label>Club / equipo</label>
                <input
                  className="field-input"
                  placeholder="Ej. Atlas Gym"
                  value={club}
                  onChange={(e) => setClub(e.target.value)}
                />
              </div>
            </div>

            <div className="form-footer">
              <button type="button" className="save-btn" onClick={guardarOActualizarAtleta}>
                {editandoId !== null ? "Actualizar atleta →" : "Guardar atleta →"}
              </button>

              {editandoId !== null && (
                <button type="button" className="cancel-btn" onClick={limpiarFormulario}>
                  Cancelar
                </button>
              )}
            </div>
          </article>

          <article className="registro-table-card">
            <div className="section-tag">ATLETAS REGISTRADOS</div>
            <h2>Listado</h2>

            <div className="table-scroll">
              <table className="registro-table">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nombre</th>
                    <th>Sexo</th>
                    <th>Peso</th>
                    <th>Categoría</th>
                    <th>Club</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {atletas.map((atleta) => (
                    <tr key={atleta.id}>
                      <td>
                        <div className="mini-photo">
                          {atleta.foto ? (
                            <img src={atleta.foto} alt={atleta.nombre} />
                          ) : (
                            <span>FOTO</span>
                          )}
                        </div>
                      </td>
                      <td>{atleta.nombre}</td>
                      <td>{atleta.sexo}</td>
                      <td>{atleta.peso} kg</td>
                      <td>{atleta.categoria}</td>
                      <td>{atleta.club}</td>
                      <td>
                        <div className="acciones-wrap">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => editarAtleta(atleta)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn"
                            onClick={() => eliminarAtleta(atleta.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {atletas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="empty-row">
                        No hay atletas registrados.
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