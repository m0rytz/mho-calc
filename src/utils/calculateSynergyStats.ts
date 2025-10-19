import { synergies } from "../data/synergies";

export function calculateSynergyStats(
  activeSynergies: string[],
  heroLevel: number
): Record<string, number> {
  const totals: Record<string, number> = {};

  activeSynergies.forEach((s) => {
    const synergy = synergies.find((h) => h.name === s);
    if (!synergy) return;

    synergy.stats.forEach(({ key, value }) => {
      let val = value;

      // Apply heroLevel scaling
      if (key === "Health On Hit" || key === "Spirit On Kill") {
        val = Math.trunc(val * heroLevel + 1);
      } else if (key === "Health On Kill") {
        val = val * heroLevel;
      }

      totals[key] = (totals[key] || 0) + val;
    });
  });

  return totals;
}
