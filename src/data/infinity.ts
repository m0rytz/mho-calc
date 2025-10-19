export type StatConfig = {
  key: string;
  label: string;
  cost: number;
  increment: number;
  max: number;
  category: "attribute" | "infinity" | "local";
  format?: "max" | "percent";
};

export const gemStats: Record<string, StatConfig[]> = {
  Mind: [
    {
      key: "Intelligence",
      label: "Intelligence (+1/25pts)",
      cost: 25,
      increment: 1,
      max: 500,
      category: "attribute",
    },
    {
      key: "Spirit",
      label: "Spirit (+5/2pts)",
      cost: 2,
      increment: 5,
      max: 100,
      category: "infinity",
    },
    {
      key: "Crit Hit%",
      label: "Crit Hit% (+0.1%/4pts)",
      cost: 4,
      increment: 0.1,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Crit DMG%",
      label: "Crit DMG% (+0.2%/1pt)",
      cost: 1,
      increment: 0.2,
      max: 150,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Mental DMG",
      label:
        "5% chance to deal Mental DMG (170 per point of Intelligence, 3 Max) (+1 Max/4pts)",
      cost: 4,
      increment: 1,
      max: 50,
      category: "local",
      format: "max",
    },
  ],
  Power: [
    {
      key: "Strength",
      label: "Strength (+1/25pts)",
      cost: 25,
      increment: 1,
      max: 500,
      category: "attribute",
    },
    {
      key: "DMG vs Weakened",
      label: "DMG vs Weakened (+0.5%/3pts)",
      cost: 3,
      increment: 0.5,
      max: 50,
      category: "infinity",
    },
    {
      key: "Brutal DMG%",
      label: "Brutal DMG% (+1%/2pts)",
      cost: 2,
      increment: 0.1,
      max: 75,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Brutal Strike%",
      label: "Brutal Strike% (+0.1%/3pts)",
      cost: 3,
      increment: 0.1,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Physical DMG",
      label:
        "5% chance to deal Physical DMG (170 per point of Strength, 3 Max) (+1 Max/4pts)",
      cost: 4,
      increment: 1,
      max: 50,
      category: "local",
      format: "max",
    },
  ],
  Reality: [
    {
      key: "Energy",
      label: "Energy (+1/25pts)",
      cost: 25,
      increment: 1,
      max: 500,
      category: "attribute",
    },
    {
      key: "Base Buff",
      label: "Base Damage and Health for 20s on Ult (+3%/3pts)",
      cost: 3,
      increment: 3,
      max: 50,
      category: "local",
      format: "percent",
    },
    {
      key: "Signature DMG%",
      label: "Base Damage to Signature Powers (+0.5%/1pt)",
      cost: 1,
      increment: 0.5,
      max: 200,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Ult CD",
      label: "Ultimate Power Cooldown (-0.1%/4pts)",
      cost: 4,
      increment: 0.1,
      max: 100,
      category: "local",
      format: "percent",
    },
    {
      key: "Energy DMG",
      label:
        "5% chance to deal Energy DMG (170 per point of Energy, 3 Max) (+1 Max/4pts)",
      cost: 4,
      increment: 1,
      max: 50,
      category: "local",
      format: "max",
    },
  ],
  Soul: [
    {
      key: "Fighting",
      label: "Fighting (+1/25pts)",
      cost: 25,
      increment: 1,
      max: 500,
      category: "attribute",
    },
    {
      key: "Healing Received",
      label: "Healing Received (+0.5%/5pts)",
      cost: 5,
      increment: 0.5,
      max: 50,
      category: "local",
      format: "percent",
    },
    {
      key: "Health On Hit",
      label: "Health On Hit (0.2% of Base Health per rank) (+0.2%/6pts)",
      cost: 6,
      increment: 0.2,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Health Regen.",
      label: "Health Regen (0.2% of Base Health per rank) (+0.2%/7pts)",
      cost: 7,
      increment: 0.2,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Mental DMG (Soul)",
      label:
        "5% chance to deal Mental DMG (170 per point of Fighting, 3 Max) (+1 Max/4pts)",
      cost: 4,
      increment: 1,
      max: 50,
      category: "local",
      format: "max",
    },
  ],
  Space: [
    {
      key: "Durability",
      label: "Durability (+1/25pts)",
      cost: 25,
      increment: 1,
      max: 500,
      category: "attribute",
    },
    {
      key: "Defense Multi.",
      label: "Defense Multi. (+0.5%/1pt)",
      cost: 1,
      increment: 0.5,
      max: 150,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Deflect% +",
      label: "Deflect% (+0.1%/4pts)",
      cost: 4,
      increment: 0.1,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Health Multi.",
      label: "Base Health Multi. (+1%/2pts)",
      cost: 2,
      increment: 1,
      max: 250,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Physical DMG (Space)",
      label:
        "5% chance to deal Physical DMG (170 per point of Durability, 3 Max) (+1 Max/4pts)",
      cost: 4,
      increment: 1,
      max: 50,
      category: "local",
      format: "max",
    },
  ],
  Time: [
    {
      key: "Speed",
      label: "Speed (+1/25pts)",
      cost: 25,
      increment: 1,
      max: 500,
      category: "attribute",
    },
    {
      key: "Dodge% +",
      label: "Dodge% (+0.1%/4pts)",
      cost: 4,
      increment: 0.1,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Attack & Move Speed",
      label: "Attack & Move Speed (+0.5%/4pts)",
      cost: 4,
      increment: 0.5,
      max: 50,
      category: "infinity",
      format: "percent",
    },
    {
      key: "Dash CD",
      label: "Dash/Teleport Cooldown (-0.5%/5pts)",
      cost: 5,
      increment: 0.5,
      max: 60,
      category: "local",
      format: "percent",
    },
    {
      key: "Physical DMG (Time)",
      label:
        "5% chance to deal Physical DMG (170 per point of Speed, 3 Max) (+1 Max/4pts)",
      cost: 4,
      increment: 1,
      max: 50,
      category: "local",
      format: "max",
    },
  ],
};

export const gemBonuses: Record<string, { threshold: number; effect: string }[]> = {
  Mind: [
    {
      threshold: 50,
      effect:
        "50+ Points: When you Critically Hit, regenerate 0.5% of your Maximum Health",
    },
    {
      threshold: 100,
      effect: "100+ Points: Increase your Cost Reduction by 10%",
    },
    { threshold: 150, effect: "150+ Points: +1 to All Attributes" },
  ],
  Power: [
    {
      threshold: 50,
      effect: "50+ Points: Your Ultimate Power has +20% Critical Hit Chance",
    },
    {
      threshold: 100,
      effect:
        "100+ Points: Your Signature Power has +10% Brutal Strike Chance and causes all enemies to become Weakened for 10 seconds",
    },
    { threshold: 150, effect: "150+ Points: +1 to All Attributes" },
  ],
  Reality: [
    {
      threshold: 50,
      effect:
        "50+ Points: When you use a Medkit, reduce the cooldown of your Ultimate by 3 seconds (30s Cooldown)",
    },
    {
      threshold: 100,
      effect:
        "100+ Points: When you use your Signature, reduce the cooldown of your Ultimate by 6 seconds (60s Cooldown)",
    },
    { threshold: 150, effect: "150+ Points: +1 to All Attributes" },
  ],
  Soul: [
    {
      threshold: 50,
      effect:
        "50+ Points: When you fall below 30% Maximum Health, trigger your Medkit without activating its cooldown (60s Cooldown)",
    },
    {
      threshold: 100,
      effect: "100+ Points: Increases healing from your Medkit by 10%",
    },
    { threshold: 150, effect: "150+ Points: +1 to All Attributes" },
  ],
  Space: [
    {
      threshold: 50,
      effect:
        "50+ Points: Your Medkit causes you to take 10% less damage for 5 seconds",
    },
    { threshold: 100, effect: "100+ Points: Increase Damage Reduction by 1%" },
    { threshold: 150, effect: "150+ Points: +1 to All Attributes" },
  ],
  Time: [
    {
      threshold: 50,
      effect:
        "50+ Points: When you use a Medkit, your Dash Powers gain a charge",
    },
    {
      threshold: 100,
      effect: "100+ Points: Your Dash Powers have 1 additional charge",
    },
    { threshold: 150, effect: "150+ Points: +1 to All Attributes" },
  ],
};
