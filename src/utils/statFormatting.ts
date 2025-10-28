import type { StatConfig } from "../types/statsConfig";

// function customRound(value: number, decimals: number = 0): number {
//   // ≥ 7 round up, ≤ 6 round down
//   const absValue = Math.abs(value);
//   const isNegative = value < 0;
//   const scaledValue = absValue * Math.pow(10, decimals);

//   // Check the furthest decimal place for rounding
//   const decimal = scaledValue - Math.floor(scaledValue);
//   if (decimal >= 0.7) {
//     const rounded = Math.ceil(scaledValue);
//     return isNegative
//       ? -(rounded / Math.pow(10, decimals))
//       : rounded / Math.pow(10, decimals);
//   } else {
//     const rounded = Math.floor(scaledValue);
//     return isNegative
//       ? -(rounded / Math.pow(10, decimals))
//       : rounded / Math.pow(10, decimals);
//   }
// }

export function formatStatValue(value: number, statConfig: StatConfig): string {
  // Use format string if specified
  if (statConfig.format) {
    // Replace placeholders in format string
    let formatted = statConfig.format
      .replace(/\{value\}/g, value.toString())
      .replace(/\{value\.0d\}/g, Math.round(value).toString())
      .replace(/\{value\.1d\}/g, (Math.round(value * 10) / 10).toString())
      .replace(/\{value\.2d\}/g, (Math.round(value * 100) / 100).toString());

    return formatted;
  }

  // Fallback for stats without format
  return value.toString();
}

export function getStatDisplayName(statConfig: StatConfig, hero?: any): string {
  let name = statConfig.name;

  // Handle dynamic names based on hero properties
  if (statConfig.id === "spirit1" && hero?.spirit1?.name) {
    name = hero.spirit1.name;
  } else if (statConfig.id === "spirit2" && hero?.spirit2?.name) {
    name = hero.spirit2.name || "Secondary Resource";
  } else if (statConfig.id === "spirit-on-hit" && hero?.spirit1?.name) {
    name = `${hero.spirit1.name} On Hit`;
  } else if (statConfig.id === "spirit-on-kill" && hero?.spirit1?.name) {
    name = `${hero.spirit1.name} On Kill`;
  }

  return name;
}

export function getStatTooltip(statConfig: StatConfig, hero?: any): string {
  let tooltip = statConfig.tooltip || "";

  // Handle dynamic tooltips based on hero properties
  if (statConfig.id === "spirit1") {
    const sources = hero?.spirit1?.type === "scale" ? "Level Scaling, " : "";
    tooltip = `Sources: ${sources}Items`;
  } else if (statConfig.id === "spirit2") {
    const sources = hero?.spirit2?.type === "scale" ? "Level Scaling, " : "";
    tooltip = `Sources: ${sources}Items`;
  } else if (statConfig.id === "health") {
    const trait3Health = hero?.trait3 === "Health" ? ", Trait 3" : "";
    tooltip = `Sources: Items, Durability${trait3Health}`;
  }

  return tooltip;
}

export function getRawValue(value: number, statConfig: StatConfig): string {
  // Truncate to 2 decimals without rounding
  const truncated = Math.trunc(value * 100) / 100;

  // Check if the stat should have a minus sign
  const minusStats = [
    "medkit-cooldown",
    "resource-cost",
    "reduced-dmg-from-area",
    "reduced-dmg-from-deflected",
    "reduced-dmg-from-melee",
    "reduced-dmg-from-ranged",
  ];

  const shouldShowMinus = minusStats.includes(statConfig.id);
  const prefix = shouldShowMinus ? "-" : "";

  const hasPercent = statConfig.format && statConfig.format.includes("%");
  const suffix = hasPercent ? "%" : "";

  return `${prefix}${truncated.toFixed(2)}${suffix}`;
}
