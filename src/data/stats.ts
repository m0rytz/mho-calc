export type StatType = "percent" | "flat" | "attribute" | "fixed";

export type SelectedStat = {
  stat: string;
  value: number;
  type: StatType;
};

export type AvailableStat = {
  name: string;
  type: StatType;
};

export type Item = {
  id: number;
  name: string;
  selectedStats: SelectedStat[];
  enabled: boolean;
};

export interface DropdownCategory {
  category: string;
  stats: AvailableStat[];
}

export const itemStats = [
  {
    category: "Offensive",
    stats: [
      { name: "Attack Speed", type: "percent" },
      { name: "DMG Rating", type: "flat" },
      { name: "Physical DMG Rating", type: "flat" },
      { name: "Physical Base DMG%", type: "percent" },
      { name: "Energy DMG Rating", type: "flat" },
      { name: "Energy Base DMG%", type: "percent" },
      { name: "Mental DMG Rating", type: "flat" },
      { name: "Mental Base DMG%", type: "percent" },
      { name: "Melee DMG Rating", type: "flat" },
      { name: "Melee Base DMG%", type: "percent" },
      { name: "Ranged DMG Rating", type: "flat" },
      { name: "Ranged Base DMG%", type: "percent" },
      { name: "Summon DMG Rating", type: "flat" },
      { name: "Summon Base DMG%", type: "percent" },
      { name: "Area DMG Rating", type: "flat" },
      { name: "Area Base DMG%", type: "percent" },
      { name: "Movement DMG Rating", type: "flat" },
      { name: "Movement Base DMG%", type: "percent" },
    ],
  },
  {
    category: "Critical",
    stats: [
      { name: "Crit Hit Rating", type: "flat" },
      { name: "Crit DMG Rating", type: "flat" },
      { name: "+Crit DMG%", type: "percent" },
      { name: "Physical Crit Hit Rating", type: "flat" },
      { name: "Energy Crit Hit Rating", type: "flat" },
      { name: "Mental Crit Hit Rating", type: "flat" },
      { name: "Melee Crit Hit Rating", type: "flat" },
      { name: "Ranged Crit Hit Rating", type: "flat" },
      { name: "Summon Crit Hit Rating", type: "flat" },
      { name: "Area Crit Hit Rating", type: "flat" },
      { name: "Movement Crit Hit Rating", type: "flat" },
    ],
  },
  {
    category: "Brutal",
    stats: [
      { name: "Brutal Strike Rating", type: "flat" },
      { name: "Brutal DMG Rating", type: "flat" },
    ],
  },
  {
    category: "Defensive",
    stats: [
      { name: "Defense Rating", type: "flat" },
      { name: "Defense Multi.", type: "percent" },
      { name: "Deflect Rating", type: "flat" },
      { name: "Deflect Multi.", type: "percent" },
      { name: "Dodge Rating", type: "flat" },
      { name: "Dodge Multi.", type: "percent" },
      { name: "+DMG Reduction%", type: "percent" },
      { name: "Tenacity", type: "flat" },
      { name: "Reduced DMG from Deflected", type: "percent" },
      { name: "Reduced DMG from Melee", type: "percent" },
      { name: "Reduced DMG from Area", type: "percent" },
      { name: "Reduced DMG from Ranged", type: "percent" },
    ],
  },
  {
    category: "Attributes",
    stats: [
      { name: "Durability", type: "attribute" },
      { name: "Strength", type: "attribute" },
      { name: "Fighting", type: "attribute" },
      { name: "Speed", type: "attribute" },
      { name: "Energy", type: "attribute" },
      { name: "Intelligence", type: "attribute" },
      { name: "To All Attributes", type: "flat" },
    ],
  },
  {
    category: "General",
    stats: [
      { name: "Health", type: "flat" },
      { name: "Spirit", type: "flat" },
      { name: "Resource Cost", type: "percent" },
      { name: "Power Duration", type: "percent" },
      { name: "Power Range", type: "percent" },
      { name: "Move Speed", type: "percent" },
      { name: "Health Regen.", type: "flat" },
      { name: "Medkit Cooldown", type: "flat" },
      { name: "Health On Hit", type: "flat" },
      { name: "Spirit On Hit", type: "flat" },
      { name: "Summoned Ally Health", type: "flat" },
    ],
  },
  {
    category: "DMG vs",
    stats: [
      { name: "Normals/Elites (Rating)", type: "flat" },
      { name: "Normals/Elites (DMG %)", type: "percent" },
      { name: "Champions", type: "percent" },
      { name: "Bosses", type: "percent" },
      { name: "Targeting You", type: "flat" },
      { name: "Not Targeting You", type: "flat" },
      { name: "Unaware Targets", type: "flat" },
      { name: "Weakened", type: "flat" },
      { name: "Stunned", type: "flat" },
      { name: "Slowed", type: "flat" },
      { name: "Knockdown", type: "flat" },
      { name: "Chilled", type: "flat" },
      { name: "Frozen", type: "flat" },
      { name: "Vulnerable", type: "flat" },
      { name: "Taunted", type: "flat" },
      { name: "Petrified", type: "flat" },
      { name: "Constricted Webbing", type: "flat" },
      { name: "DoT Affected", type: "flat" },
      { name: "Feared", type: "flat" },
      { name: "Bleeding", type: "flat" },
      { name: "Burning", type: "flat" },
      { name: "Hellfire", type: "flat" },
      { name: "Demon Status", type: "percent" },
      { name: "Danger Room Status", type: "percent" },
    ],
  },
] as const satisfies DropdownCategory[];

export const conditionLabels = [
  "Normals/Elites",
  "Champions",
  "Bosses",
  "Targeting You",
  "Not Targeting You",
  "Unaware Targets",
  "Weakened",
  "Stunned",
  "Slowed",
  "Knockdown",
  "Chilled",
  "Frozen",
  "Vulnerable",
  "Taunted",
  "Petrified",
  "Constricted Webbing",
  "DoT Affected",
  "Feared",
  "Bleeding",
  "Burning",
  "Hellfire",
  "Machines",
  "Demon Status",
  "Danger Room Status",
];
