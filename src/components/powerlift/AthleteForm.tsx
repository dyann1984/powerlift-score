"use client";

import React, { useMemo, useState } from "react";
import { useMeetStore } from "../../store/useMeetStore";

function calcCategory(gender: "M" | "F", bw: number) {
  if (gender === "M") {
    if (bw <= 59) return "59 kg";
    if (bw <= 66) return "66 kg";
    if (bw <= 74) return "74 kg";
    if (bw <= 83) return "83 kg";
    if (bw <= 93) return "93 kg";
    if (bw <= 105) return "105 kg";
    if (bw <= 120) return "120 kg";
    return "+120 kg";
  }

  if (bw <= 47) return "47 kg";
  if (bw <= 52) return "52 kg";
  if (bw <= 57) return "57 kg";
  if (bw <= 63) return "63 kg";
  if (bw <= 69) return "69 kg";
  if (bw <= 76) return "76 kg";
  if (bw <= 84) return "84 kg";
  return "+84 kg";
}

export default function AthleteForm() {
  const addAthlete = useMeetStore((s) => s.addAthlete);

  const [name, setName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [bodyweight, setBodyweight] = useState("");
  const [club, setClub] = useState("");
  const [photo, setPhoto] = useState("");

  // CALCULA LA CATEGORIA AUTOMATICAMENTE
  const categoria = useMemo(() => {
    const peso = Number(bodyweight);
    if (!peso) return "—";
    return calcCategory(gender, peso);
  }, [gender, bodyweight]);

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    addAthlete({
      name: name.trim(),
      gender,
      bodyweight: Number(bodyweight),
      category: categoria,
      club,
      photo,
    });

    setName("");
    setBodyweight("");
    setClub("");
    setPhoto("");
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 md:grid-cols-6"
    >
      <input
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
        placeholder="Nombre del atleta"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
        value={gender}
        onChange={(e) => setGender(e.target.value as "M" | "F")}
      >
        <option value="M">Masculino</option>
        <option value="F">Femenino</option>
      </select>

      <input
        type="number"
        step="0.1"
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
        placeholder="Peso corporal"
        value={bodyweight}
        onChange={(e) => setBodyweight(e.target.value)}
      />

      {/* CATEGORIA AUTOMATICA */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3">
        <div className="text-xs text-cyan-300">Categoría automática</div>
        <div className="text-lg font-bold text-white">{categoria}</div>
      </div>

      <input
        className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
        placeholder="Club / equipo"
        value={club}
        onChange={(e) => setClub(e.target.value)}
      />

      <div className="flex flex-col gap-2">
        <input
          type="file"
          accept="image/*"
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white"
          onChange={onPhotoChange}
        />

        <button
          type="submit"
          className="rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black"
        >
          Guardar atleta
        </button>
      </div>
    </form>
  );
}