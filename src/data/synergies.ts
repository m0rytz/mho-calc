export type SynergyStat = {
  key: string;
  value: number;
  type: "percent" | "flat";
};

export type HeroSynergy = {
  name: string;
  stats: SynergyStat[];
};

export const synergies: HeroSynergy[] = [
  {
    name: "Angela",
    stats: [
      { key: "Area Base DMG%", value: 2.5, type: "percent" },
      { key: "Speed", value: 1, type: "flat" },
    ],
  },
  {
    name: "Ant-Man",
    stats: [
      { key: "Bonus Credits Per Drop", value: 5, type: "flat" },
      { key: "Strength", value: 1, type: "flat" },
    ],
  },
  {
    name: "Beast",
    stats: [
      { key: "Melee Base DMG%", value: 2, type: "percent" },
      { key: "Intelligence", value: 1, type: "flat" },
    ],
  },
  {
    name: "Black Bolt",
    stats: [
      { key: "Move Speed", value: 3, type: "percent" },
      { key: "Crit Hit Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Black Cat",
    stats: [
      { key: "DMG vs Bleeding", value: 2, type: "percent" },
      { key: "Bonus Credits Per Drop", value: 5, type: "flat" },
    ],
  },
  {
    name: "Black Panther",
    stats: [
      { key: "Move Speed", value: 3, type: "percent" },
      { key: "Melee Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Black Widow",
    stats: [
      { key: "DMG vs Enemies Not Targeting You", value: 2, type: "percent" },
      { key: "DMG vs Enemies Not Targeting You", value: 2, type: "percent" },
    ],
  },
  {
    name: "Blade",
    stats: [
      { key: "Health On Hit", value: 49 / 60, type: "percent" },
      { key: "Attack Speed", value: 3, type: "percent" },
    ],
  },
  {
    name: "Cable",
    stats: [
      { key: "Crit Hit Multi.", value: 2, type: "percent" },
      { key: "Crit Hit Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Captain America",
    stats: [
      { key: "Deflect Multi.", value: 2, type: "percent" },
      { key: "Deflect Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Captain Marvel",
    stats: [
      { key: "Energy Base DMG%", value: 2, type: "percent" },
      { key: "Energy Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Colossus",
    stats: [
      { key: "Health Multi.", value: 3, type: "percent" },
      { key: "Physical Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Carnage",
    stats: [
      { key: "Health On Hit", value: 49 / 60, type: "flat" },
      { key: "Health On Hit", value: 49 / 60, type: "flat" },
    ],
  },
  {
    name: "Cyclops",
    stats: [
      { key: "Energy Base DMG%", value: 2, type: "percent" },
      { key: "XP Boost", value: 10, type: "percent" },
    ],
  },
  {
    name: "Daredevil",
    stats: [
      { key: "DMG vs Normals/Elites", value: 3, type: "percent" },
      { key: "Melee Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Deadpool",
    stats: [
      { key: "DMG vs Enemies Targeting You", value: 2, type: "percent" },
      { key: "Health Regen.", value: 25, type: "percent" },
    ],
  },
  {
    name: "Doctor Doom",
    stats: [
      { key: "Signature Base DMG%", value: 5, type: "percent" },
      { key: "Signature Base DMG%", value: 5, type: "percent" },
    ],
  },
  {
    name: "Doctor Strange",
    stats: [
      { key: "Mental Base DMG%", value: 2, type: "percent" },
      { key: "Mental Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Elektra",
    stats: [
      { key: "Physical Base DMG%", value: 2, type: "percent" },
      { key: "DMG vs Bosses", value: 3, type: "percent" },
    ],
  },
  {
    name: "Emma Frost",
    stats: [
      { key: "DMG Over Time%", value: 3, type: "percent" },
      { key: "Durability", value: 1, type: "flat" },
    ],
  },
  {
    name: "Gambit",
    stats: [
      { key: "Bonus Credits Per Drop", value: 5, type: "percent" },
      { key: "Energy", value: 1, type: "flat" },
    ],
  },
  {
    name: "Ghost Rider",
    stats: [
      { key: "Mental Crit Hit Multi.", value: 3, type: "percent" },
      { key: "Mental Crit Hit Multi.", value: 3, type: "percent" },
    ],
  },
  {
    name: "Green Goblin",
    stats: [
      { key: "Area Base DMG%", value: 2.5, type: "percent" },
      { key: "While Moving DMG%", value: 5, type: "percent" },
    ],
  },
  {
    name: "Hawkeye",
    stats: [
      { key: "Move Speed", value: 2, type: "percent" },
      { key: "Crit DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Hulk",
    stats: [
      { key: "Health Multi.", value: 3, type: "percent" },
      { key: "Health Multi.", value: 3, type: "percent" },
    ],
  },
  {
    name: "Human Torch",
    stats: [
      { key: "Area Base DMG%", value: 2.5, type: "percent" },
      { key: "Area Base DMG%", value: 2.5, type: "percent" },
    ],
  },
  {
    name: "Iceman",
    stats: [
      { key: "Spirit", value: 15, type: "flat" },
      { key: "DMG vs Slowed Targets", value: 5, type: "percent" },
    ],
  },
  {
    name: "Invisible Woman",
    stats: [
      { key: "Energy Base DMG%", value: 2, type: "percent" },
      { key: "Deflect Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Iron Fist",
    stats: [
      { key: "Mental Base DMG%", value: 3, type: "percent" },
      { key: "Health Regen.", value: 25, type: "percent" },
    ],
  },
  {
    name: "Iron Man",
    stats: [
      { key: "Ranged Base DMG%", value: 2, type: "percent" },
      { key: "Energy Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Jean Grey",
    stats: [
      { key: "Mental Base DMG%", value: 3, type: "percent" },
      { key: "Energy Base DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Juggernaut",
    stats: [
      { key: "Movement Base DMG%", value: 3, type: "percent" },
      { key: "Movement Base DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Kitty Pryde",
    stats: [
      { key: "Dodge Multi.", value: 2, type: "percent" },
      { key: "Deflect Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Loki",
    stats: [
      { key: "DMG vs Slowed Targets", value: 5, type: "percent" },
      { key: "Spirit Cost", value: 5, type: "percent" },
    ],
  },
  {
    name: "Luke Cage",
    stats: [
      { key: "Defense Multi.", value: 2, type: "percent" },
      { key: "Physical Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Magik",
    stats: [
      { key: "Health On Hit", value: 49 / 60, type: "percent" },
      { key: "Summoned Ally DMG%", value: 5, type: "percent" },
    ],
  },
  {
    name: "Magneto",
    stats: [
      { key: "Area Base DMG%", value: 4, type: "percent" },
      { key: "Orb Pickup Radius", value: 10, type: "percent" },
    ],
  },
  {
    name: "Mister Fantastic",
    stats: [
      { key: "Crafting discount", value: 5, type: "percent" },
      { key: "Crit DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Moon Knight",
    stats: [
      { key: "Physical Crit Hit Multi.", value: 3, type: "percent" },
      { key: "Physical Crit Hit Multi.", value: 3, type: "percent" },
    ],
  },
  {
    name: "Nick Fury",
    stats: [
      { key: "Defense Multi.", value: 2, type: "percent" },
      { key: "DMG vs Enemies Not Targeting You", value: 3, type: "percent" },
    ],
  },
  {
    name: "Nightcrawler",
    stats: [
      { key: "Melee Base DMG%", value: 2, type: "percent" },
      { key: "Melee Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Nova",
    stats: [
      { key: "Move Speed", value: 3, type: "percent" },
      { key: "Dodge Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Psylocke",
    stats: [
      { key: "Mental Base DMG%", value: 3, type: "percent" },
      { key: "Physical Base DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Punisher",
    stats: [
      { key: "Health On Kill", value: 35 / 12, type: "flat" },
      { key: "Spirit On Kill", value: 0.05, type: "flat" },
    ],
  },
  {
    name: "Rocket Raccoon",
    stats: [
      { key: "Summoned Ally DMG%", value: 5, type: "percent" },
      { key: "Summoned Ally Health", value: 5, type: "percent" },
    ],
  },
  {
    name: "Rogue",
    stats: [
      { key: "Health On Hit", value: 49 / 60, type: "flat" },
      { key: "Spirit On Hit", value: 1, type: "flat" },
    ],
  },
  {
    name: "Scarlet Witch",
    stats: [
      { key: "DMG Over Time%", value: 2, type: "percent" },
      { key: "DMG Over Time%", value: 2, type: "percent" },
    ],
  },
  {
    name: "She-Hulk",
    stats: [
      { key: "Physical Base DMG%", value: 3, type: "percent" },
      { key: "Health Regen.", value: 25, type: "percent" },
    ],
  },
  {
    name: "Silver Surfer",
    stats: [
      { key: "Move Speed", value: 3, type: "percent" },
      { key: "Energy Base DMG%", value: 2, type: "percent" },
    ],
  },
  {
    name: "Spider-Man",
    stats: [
      { key: "Dodge Multi.", value: 2, type: "percent" },
      { key: "Dodge Multi.", value: 2, type: "percent" },
    ],
  },
  {
    name: "Squirrel Girl",
    stats: [
      { key: "DMG vs Bosses", value: 2, type: "percent" },
      { key: "DMG vs Bosses", value: 2, type: "percent" },
    ],
  },
  {
    name: "Star-Lord",
    stats: [
      { key: "Energy Crit Hit Multi.", value: 3, type: "percent" },
      { key: "Energy Crit Hit Multi.", value: 3, type: "percent" },
    ],
  },
  {
    name: "Storm",
    stats: [
      { key: "Spirit", value: 20, type: "flat" },
      { key: "Spirit", value: 20, type: "flat" },
    ],
  },
  {
    name: "Taskmaster",
    stats: [
      { key: "Deflect Multi.", value: 1, type: "percent" },
      { key: "Crit DMG%", value: 1, type: "percent" },
      { key: "Dodge Multi.", value: 1, type: "percent" },
      { key: "Melee Base DMG%", value: 1, type: "percent" },
    ],
  },
  {
    name: "Thing",
    stats: [
      { key: "DMG vs Enemies Targeting You", value: 2, type: "percent" },
      { key: "DMG vs Enemies Targeting You", value: 2, type: "percent" },
    ],
  },
  {
    name: "Thor",
    stats: [
      { key: "Physical Base DMG%", value: 3, type: "percent" },
      { key: "Energy Base DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Ultron",
    stats: [
      { key: "Summoned Ally DMG%", value: 3, type: "percent" },
      { key: "Intelligence", value: 1, type: "flat" },
    ],
  },
  {
    name: "Venom",
    stats: [
      { key: "Health Multi.", value: 3, type: "percent" },
      { key: "Below 50% HP DMG%", value: 5, type: "percent" },
    ],
  },
  {
    name: "Vision",
    stats: [
      { key: "Ranged Base DMG%", value: 3, type: "percent" },
      { key: "DMG vs Machines", value: 10, type: "percent" },
    ],
  },
  {
    name: "War Machine",
    stats: [
      { key: "Spirit", value: 10, type: "flat" },
      { key: "Fighting", value: 1, type: "flat" },
    ],
  },
  {
    name: "Winter Soldier",
    stats: [
      { key: "Ranged Base DMG%", value: 3, type: "percent" },
      { key: "Melee Base DMG%", value: 3, type: "percent" },
    ],
  },
  {
    name: "Wolverine",
    stats: [
      { key: "Brutal Strike Multi.", value: 5, type: "percent" },
      { key: "Brutal DMG%", value: 5, type: "percent" },
    ],
  },
  {
    name: "X-23",
    stats: [
      { key: "DMG vs Bleeding", value: 2, type: "percent" },
      { key: "DMG vs Bleeding", value: 2, type: "percent" },
    ],
  },
];
