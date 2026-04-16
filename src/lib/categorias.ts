export function getCategoria(peso: number): string {
  if (peso >= 50 && peso <= 70) return "50-70 kg";
  if (peso > 70 && peso <= 90) return "70-90 kg";
  return "Libre";
}