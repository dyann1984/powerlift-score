export type Athlete = {
  id: string;
  nombre: string;
  peso: number;
  sexo: "M" | "F";
  categoria: string;
};

const KEY = "powerlift_data";

export function getAthletes(): Athlete[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAthletes(athletes: Athlete[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(athletes));
}

export function addAthlete(athlete: Athlete) {
  const athletes = getAthletes();
  athletes.push(athlete);
  saveAthletes(athletes);
}

export function deleteAthlete(id: string) {
  const athletes = getAthletes().filter(a => a.id !== id);
  saveAthletes(athletes);
}