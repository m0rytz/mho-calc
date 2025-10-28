import type { Item } from "../data/stats";
import { archetype1list, archetype2list, type Hero } from "../data/heroes";

export function calculateItemTotals(items: Item[]): Record<string, number> {
  const itemTotals: Record<string, number> = {};

  items.forEach((item) => {
    if (item.enabled) {
      item.selectedStats.forEach((s) => {
        if (!itemTotals[s.stat]) itemTotals[s.stat] = 0;
        itemTotals[s.stat] += s.value;
      });
    }
  });

  return itemTotals;
}

export function calculateFinalStats(
  hero: Hero,
  heroLevel: number,
  combatState: boolean,
  heroAttributes: Record<string, number>,
  infinityAttributes: Record<string, number>,
  itemTotals: Record<string, number>,
  infinity: Record<string, number>,
  synergy: Record<string, number>
): Record<string, number> {
  const finalStats: Record<string, number> = {};
  const attributes = {
    Durability:
      (heroAttributes["Durability"] || 0) +
      (infinityAttributes["Durability"] || 0) +
      (synergy["Durability"] || 0) +
      (itemTotals["Durability"] || 0) +
      (itemTotals["To All Attributes"] || 0),
    Fighting:
      (heroAttributes["Fighting"] || 0) +
      (infinityAttributes["Fighting"] || 0) +
      (synergy["Fighting"] || 0) +
      (itemTotals["Fighting"] || 0) +
      (itemTotals["To All Attributes"] || 0),
    Strength:
      (heroAttributes["Strength"] || 0) +
      (infinityAttributes["Strength"] || 0) +
      (synergy["Strength"] || 0) +
      (itemTotals["Strength"] || 0) +
      (itemTotals["To All Attributes"] || 0),
    Speed:
      (heroAttributes["Speed"] || 0) +
      (infinityAttributes["Speed"] || 0) +
      (synergy["Speed"] || 0) +
      (itemTotals["Speed"] || 0) +
      (itemTotals["To All Attributes"] || 0),
    Energy:
      (heroAttributes["Energy"] || 0) +
      (infinityAttributes["Energy"] || 0) +
      (synergy["Energy"] || 0) +
      (itemTotals["Energy"] || 0) +
      (itemTotals["To All Attributes"] || 0),
    Intelligence:
      (heroAttributes["Intelligence"] || 0) +
      (infinityAttributes["Intelligence"] || 0) +
      (synergy["Intelligence"] || 0) +
      (itemTotals["Intelligence"] || 0) +
      (itemTotals["To All Attributes"] || 0),
  };

  // const enemyLevel = 60;
  const archetype1 = hero?.archetype1;
  const archetype2 = hero?.archetype2;
  const trait1 = hero?.trait1;
  const trait3 = hero?.trait3;
  const combatType = hero?.combatType;
  // Attribute values
  const dur = attributes["Durability"] ?? 0;
  finalStats["Durability"] = dur;
  const str = attributes["Strength"] ?? 0;
  finalStats["Strength"] = str;
  const fgt = attributes["Fighting"] ?? 0;
  finalStats["Fighting"] = fgt;
  const spd = attributes["Speed"] ?? 0;
  finalStats["Speed"] = spd;
  const enr = attributes["Energy"] ?? 0;
  finalStats["Energy"] = enr;
  const int = attributes["Intelligence"] ?? 0;
  finalStats["Intelligence"] = int;

  // ===== General =====
  const baseHealth = 115 * heroLevel + 400;
  const infinityHealthBuff = (infinity["Health Multi."] ?? 0) / 100;
  const synergyHealthBuff = (synergy["Health Multi."] ?? 0) / 100;
  const totalBaseHealth =
    baseHealth * (1 + (infinityHealthBuff + synergyHealthBuff));
  finalStats["Base Health"] = totalBaseHealth;
  const trait3health = trait3 === "Health" ? 0.25 * ((350 / 3) * heroLevel) : 0;
  const plusHealth =
    (itemTotals["Health"] ?? 0) + trait3health + heroLevel * dur;
  finalStats["Health"] = plusHealth;
  const maxHealth = totalBaseHealth + plusHealth;
  finalStats["Max Health"] = maxHealth;

  // Spirit/Resource
  const baseSpirit =
    hero.spirit1.type == "scale"
      ? 2.576 * heroLevel + 100.242
      : hero.spirit1.type == "colossus"
      ? 11.5 * heroLevel + 40
      : hero.spirit1.value;
  const synergySpirit = synergy["Spirit"] ?? 0;
  const infinitySpirit = infinity["Spirit"] ?? 0;
  finalStats["Spirit1"] =
    (itemTotals["Spirit"] ?? 0) + synergySpirit + infinitySpirit + baseSpirit;

  const baseSpirit2 =
    hero.spirit2.name == "Diamond Armor"
      ? diamondArmor(heroLevel)
      : hero.spirit2.name == "Combat Shield"
      ? 1 + heroLevel * 35
      : hero.spirit2.value;
  finalStats["Spirit2"] = baseSpirit2;

  const infinityBonusResourceCost = infinity["Resource Cost"] ?? 0;
  const attributeResourceCost = enr * 25;
  const synergySpiritCost = synergy["Spirit Cost"] ?? 0;
  finalStats["Resource Cost"] =
    (itemTotals["Resource Cost"] ?? 0) +
    infinityBonusResourceCost +
    synergySpiritCost +
    (attributeResourceCost / 100 > 25 ? 25 : attributeResourceCost / 100);

  finalStats["Spirit On Hit"] =
    (itemTotals["Spirit On Hit"] ?? 0) + (synergy["Spirit On Hit"] ?? 0);

  finalStats["Spirit On Kill"] =
    (itemTotals["Spirit On Kill"] ?? 0) + (synergy["Spirit On Kill"] ?? 0);

  // Attack Speed
  const infinityAttackSpeed = infinity["Attack & Move Speed"] ?? 0;
  const synergyAttackSpeed = synergy["Attack Speed"] ?? 0;
  const rawAttackSpeed =
    (itemTotals["Attack Speed"] ?? 0) +
    infinityAttackSpeed +
    synergyAttackSpeed;
  finalStats["Raw Attack Speed"] = rawAttackSpeed;
  const effectiveAttackSpeed =
    rawAttackSpeed < 12.5
      ? rawAttackSpeed
      : 0.4 * (1 - Math.exp((-3 * rawAttackSpeed) / 100)) * 100;
  finalStats["Attack Speed"] = effectiveAttackSpeed;

  // Move Speed
  const infinityMoveSpeed = infinity["Attack & Move Speed"] ?? 0;
  const synergyMoveSpeed = synergy["Move Speed"] ?? 0;
  const baseMoveSpeed = hero?.moveSpeed ?? 0;
  const totalMoveSpeed =
    baseMoveSpeed *
    (1 +
      (infinityMoveSpeed + synergyMoveSpeed + (itemTotals["Move Speed"] ?? 0)) /
        100);
  finalStats["Move Speed"] = totalMoveSpeed;

  // Medkit Cooldown
  const attributeMedkitCooldown = int * 25;
  finalStats["Medkit Cooldown"] =
    (itemTotals["Medkit Cooldown"] ?? 0) +
    (attributeMedkitCooldown / 100 > 25 ? 25 : attributeMedkitCooldown / 100);

  // ===== Offensive =====
  const dmgRating = itemTotals["DMG Rating"] ?? 0;
  finalStats["DMG Rating"] = dmgRating;

  let baseDmg = 0;
  if (hero?.archetype1 === "Jack of All Trades") {
    baseDmg = (dur + str + fgt + spd + enr + int) * 1.5;
  } else {
    baseDmg =
      archetype1 && archetype1list[archetype1]
        ? ((attributes[archetype1list[archetype1][0]] ??
            hero?.attributes[archetype1list[archetype1][0]] ??
            0) +
            (attributes[archetype1list[archetype1][1]] ??
              hero?.attributes[archetype1list[archetype1][1]] ??
              0)) *
          4
        : 0;
  }

  let startingBaseDmg = 0;
  if (hero?.archetype1 === "Jack of All Trades") {
    startingBaseDmg =
      ((heroAttributes["Durability"] || 0) +
        (heroAttributes["Strength"] || 0) +
        (heroAttributes["Fighting"] || 0) +
        (heroAttributes["Speed"] || 0) +
        (heroAttributes["Energy"] || 0) +
        (heroAttributes["Intelligence"] || 0)) *
      1.5;
  } else {
    startingBaseDmg =
      archetype1 && archetype1list[archetype1]
        ? ((heroAttributes[archetype1list[archetype1][0]] ?? 0) +
            (heroAttributes[archetype1list[archetype1][1]] ?? 0)) *
          4
        : 0;
  }

  const trait1BaseDmgOfBnsHp =
    hero.trait1 === "Base DMG of Bonus Health"
      ? (maxHealth - baseHealth) * 0.005
      : 0;
  finalStats["Starting Base DMG"] = startingBaseDmg + trait1BaseDmgOfBnsHp;
  finalStats["Base DMG"] = baseDmg + trait1BaseDmgOfBnsHp;

  const dmgRatingConverted = dmgRating / 40;
  finalStats["Normal DMG%"] = dmgRatingConverted;

  // ===== X DMG% =====
  const dmgTypes1 = ["Physical", "Energy", "Mental"];

  for (const type1 of dmgTypes1) {
    const ratingKey = `${type1} DMG Rating`;
    const addKey = `${type1} Base DMG%`;
    const totalKey = `Total ${type1} DMG%`;

    const dmgRatingVal = (itemTotals[ratingKey] ?? 0) + dmgRating;
    finalStats[ratingKey] = dmgRatingVal;

    const addVal = (itemTotals[addKey] ?? 0) + (synergy[addKey] ?? 0);
    finalStats[addKey] = addVal;

    const finalVal = dmgRatingVal / 40 + addVal;
    finalStats[totalKey] = finalVal;
  }

  const dmgTypes2 = [
    "Melee",
    "Ranged",
    "Summon",
    "Area",
    "Movement",
    "Signature",
  ];

  for (const type2 of dmgTypes2) {
    const ratingKey = `${type2} DMG Rating`;
    const addKey = `${type2} Base DMG%`;
    const totalKey = `Total ${type2} DMG%`;

    const dmgRatingVal = itemTotals[ratingKey] ?? 0;
    finalStats[ratingKey] = dmgRatingVal;

    const addVal = (itemTotals[addKey] ?? 0) + (synergy[addKey] ?? 0);
    finalStats[addKey] = addVal;

    const finalVal = dmgRatingVal / 40 + addVal;
    finalStats[totalKey] = finalVal;
  }

  finalStats["Power Duration"] = itemTotals["Power Duration"] ?? 0;
  finalStats["Power Radius"] = itemTotals["Power Radius"] ?? 0;

  // DoT
  finalStats["DoT"] = synergy["DMG Over Time%"] ?? 0;

  // Summoned Ally Stats
  finalStats["Summoned Ally Health"] =
    (synergy["Summoned Ally Health"] ?? 0) +
    (itemTotals["Summoned Ally Health"] ?? 0);
  finalStats["Summoned Ally DMG%"] =
    (synergy["Summoned Ally DMG%"] ?? 0) +
    (itemTotals["Summoned Ally DMG Rating"] ?? 0) / 40;
  finalStats["Summoned Ally Crit Hit Rating"] =
    itemTotals["Summoned Ally Crit Hit Rating"] ?? 0;
  finalStats["Summoned Ally Duration"] =
    itemTotals["Summoned Ally Duration"] ?? 0;

  // ===== DMG vs =====
  finalStats["DMG vs Normals/Elites"] =
    (itemTotals["Normals/Elites (Rating)"] ?? 0) / 40 +
    (itemTotals["Normals/Elites (%)"] ?? 0) +
    (synergy["DMG vs Normals/Elites"] ?? 0);
  finalStats["DMG vs Champions"] = (itemTotals["Champions"] ?? 0) / 40;
  finalStats["DMG vs Bosses"] =
    (synergy["DMG vs Bosses"] ?? 0) + (itemTotals["Bosses"] ?? 0) / 40;
  finalStats["DMG vs Targeting You"] =
    (synergy["DMG vs Enemies Targeting You"] ?? 0) +
    (itemTotals["Targeting You"] ?? 0) / 40;
  finalStats["DMG vs Not Targeting You"] =
    (hero.trait1 === "DMG vs Not Targeting You" ? 20 : 0) +
    (synergy["DMG vs Enemies Not Targeting You"] ?? 0) +
    (itemTotals["Not Targeting You"] ?? 0 / 40);
  finalStats["DMG vs Unaware Targets"] =
    (itemTotals["Unaware Targets"] ?? 0) / 40;
  finalStats["DMG vs Weakened"] =
    (infinity["DMG vs Weakened"] ?? 0) + (itemTotals["Weakened"] ?? 0) / 40;
  finalStats["DMG vs Stunned"] = (itemTotals["Stunned"] ?? 0) / 40;
  finalStats["DMG vs Slowed"] =
    (synergy["DMG vs Slowed Targets"] ?? 0) + (itemTotals["Slowed"] ?? 0) / 40;
  finalStats["DMG vs Knockdown"] = (itemTotals["Knockdown"] ?? 0) / 40;
  finalStats["DMG vs Chilled"] = (itemTotals["Chilled"] ?? 0) / 40;
  finalStats["DMG vs Frozen"] = (itemTotals["Frozen"] ?? 0) / 40;
  finalStats["DMG vs Vulnerable"] = (itemTotals["Vulnerable"] ?? 0) / 40;
  finalStats["DMG vs Taunted"] = (itemTotals["Taunted"] ?? 0) / 40;
  finalStats["DMG vs Petrified"] = (itemTotals["Petrified"] ?? 0) / 40;
  finalStats["DMG vs Constricted Webbing"] =
    (itemTotals["Constricted Webbing"] ?? 0) / 40;
  finalStats["DMG vs DoT Affected"] = (itemTotals["DoT Affected"] ?? 0) / 40;
  finalStats["DMG vs Feared"] = (itemTotals["Feared"] ?? 0) / 40;
  finalStats["DMG vs Bleeding"] =
    (synergy["DMG vs Bleeding"] ?? 0) + (itemTotals["Bleeding"] ?? 0) / 40;
  finalStats["DMG vs Burning"] = (itemTotals["Burning"] ?? 0) / 40;
  finalStats["DMG vs Hellfire"] = (itemTotals["Hellfire"] ?? 0) / 40;
  finalStats["DMG vs Machines"] = synergy["DMG vs Machines"] ?? 0;
  finalStats["DMG vs Demon Status"] = (itemTotals["Demon Status"] ?? 0) / 40;
  finalStats["DMG vs Danger Room Status"] =
    (itemTotals["Danger Room Status"] ?? 0) / 40;

  // ===== Crit =====
  // Crit Hit
  const critHitRating = itemTotals["Crit Hit Rating"] ?? 0;
  const attributeCritHitMulti = fgt * 0.005 * 100;
  const synergyCritHitMulti = synergy["Crit Hit Multi."] ?? 0;
  const critHitMulti = attributeCritHitMulti + synergyCritHitMulti;
  finalStats["Crit Hit Multi."] = critHitMulti;
  const critHitMultiplied = critHitRating * (1 + critHitMulti / 100);
  finalStats["Crit Hit Rating"] = critHitMultiplied;
  const trait1CritHit = trait1 === "Crit Hit%" ? 3 : 0;
  const infinityCritHit = infinity["Crit Hit%"] ?? 0;
  const plusCritHit = trait1CritHit + infinityCritHit;
  finalStats["Crit Hit% (+)"] = plusCritHit;
  const totalCritHit =
    10 +
    (89 * critHitMultiplied) / (critHitMultiplied + 80 * heroLevel) +
    plusCritHit;
  finalStats["Total Crit Hit%"] = totalCritHit;

  // X Crit Hit%
  for (const type of dmgTypes1) {
    calculateTypeCritHit(
      type,
      itemTotals,
      synergy,
      finalStats,
      heroLevel,
      critHitMulti,
      critHitRating,
      plusCritHit
    );
  }

  for (const type of dmgTypes2) {
    calculateTypeCritHit(
      type,
      itemTotals,
      synergy,
      finalStats,
      heroLevel,
      critHitMulti,
      critHitRating,
      plusCritHit
    );
  }

  // Crit DMG
  const critDmgRating1 = itemTotals["Crit DMG Rating"] ?? 0;
  const critDmgRating2 = int * heroLevel;
  const critDmgRating = critDmgRating1 + critDmgRating2;
  finalStats["Crit DMG Rating"] = critDmgRating;
  const trait1CritDmg = trait1 === "Crit DMG%" ? 15 : 0;
  const synergyCritDmg = synergy["Crit DMG%"] ?? 0;
  const infinityCritDmg = infinity["Crit DMG%"] ?? 0;
  const plusCritDmg =
    (itemTotals["Crit DMG%"] ?? 0) +
    trait1CritDmg +
    synergyCritDmg +
    infinityCritDmg;
  finalStats["Crit DMG% (+)"] = plusCritDmg;
  const totalCritDmg = 150 + (critDmgRating / heroLevel) * 0.75 + plusCritDmg;
  finalStats["Total Crit DMG%"] = totalCritDmg;

  // =====Brutal=====
  // Brutal Strike
  const brutalStrikeRating = itemTotals["Brutal Strike Rating"] ?? 0;
  finalStats["Brutal Strike Rating"] = brutalStrikeRating;
  const synergyBrutalStrikeMulti = synergy["Brutal Strike Multi."] ?? 0;
  finalStats["Brutal Strike Multi."] = synergyBrutalStrikeMulti;
  const brutalStrikeMultiplied =
    brutalStrikeRating * (1 + synergyBrutalStrikeMulti);
  const trait1BrutalStrike = trait1 === "Brutal Strike %" ? 5 : 0;
  const infinityBrutalStrike = infinity["Brutal Strike%"] ?? 0;
  const plusBrutalStrike = trait1BrutalStrike + infinityBrutalStrike;
  finalStats["Brutal Strike% (+)"] = plusBrutalStrike;
  const brutalStrike =
    ((0.89 * brutalStrikeMultiplied) /
      (brutalStrikeMultiplied + 80 * heroLevel) +
      plusBrutalStrike) *
    100;
  finalStats["Total Brutal Strike%"] = brutalStrike;

  // Brutal DMG
  const brutalDmgRating = itemTotals["Brutal DMG Rating"] ?? 0;
  finalStats["Brutal DMG Rating"] = brutalDmgRating;
  const brutalDmg = 150 + brutalDmgRating / 80;
  const synergyBrutalDmg = synergy["Brutal DMG%"] ?? 0;
  const infinityBrutalDmg = infinity["Brutal DMG%"] ?? 0;
  const plusBrutalDmg = synergyBrutalDmg + infinityBrutalDmg * 10;
  finalStats["Brutal DMG% (+)"] = plusBrutalDmg;
  const totalBrutalDmg = totalCritDmg + brutalDmg + plusBrutalDmg;
  finalStats["Total Brutal DMG%"] = totalBrutalDmg;

  // ===== Defensive =====
  // Health Regen.
  const synergyHealthRegen = synergy["Health Regen."] ?? 0;
  const infinityHealthRegen =
    0.23333 * heroLevel * ((infinity["Health Regen."] ?? 0) / 0.2);
  const trait3HealthRegen =
    trait3 === "Health Regen." ? (7 * heroLevel - (heroLevel % 2)) / 2 : 0;
  const trait3HealthRegenMedkit =
    trait3 === "Health Regen. On Medkit"
      ? 12 +
        35 * Math.floor((heroLevel - 1) / 3) +
        [0, 11, 23][(heroLevel - 1) % 3]
      : 0;
  finalStats["Health Regen."] =
    (itemTotals["Health Regen."] ?? 0) +
    synergyHealthRegen +
    parseInt(infinityHealthRegen.toFixed(1)) +
    trait3HealthRegen;
  finalStats["Health Regen. On Medkit"] = trait3HealthRegenMedkit;

  // Health On Hit
  const itemsHealthOnHit = itemTotals["Health On Hit"] ?? 0;
  const synergyHealthOnHit = synergy["Health On Hit"] ?? 0;
  const infinityHealthOnHit =
    0.23333 * heroLevel * ((infinity["Health On Hit"] ?? 0) / 0.2);
  const trait3HealthOnHit =
    hero.trait3 === "Health On Hit" ? 0.04 * (350 / 3) * heroLevel : 0;
  finalStats["Health On Hit"] = parseInt(
    (
      itemsHealthOnHit +
      synergyHealthOnHit +
      infinityHealthOnHit +
      trait3HealthOnHit
    ).toFixed(2)
  );

  // Health On Kill
  finalStats["Health On Kill"] = synergy["Health On Kill"] ?? 0;

  // Tenacity
  finalStats["Tenacity"] = itemTotals["Tenacity"] ?? 0;

  // Defense, Deflect, Dodge
  let defenseRating = 0;
  let deflectRating = 0;
  let dodgeRating = 0;
  let defenseMulti = 0;
  let deflectMulti = 0;
  let dodgeMulti = 0;

  if (archetype2 && archetype2 in archetype2list) {
    switch (archetype2list[archetype2][0]) {
      case "defense":
        defenseRating = heroLevel * 10;
        defenseMulti = 0.2;
        break;
      case "deflect":
        deflectRating = heroLevel * 10;
        deflectMulti = 0.2;
        break;
      case "dodge":
        dodgeRating = heroLevel * 10;
        dodgeMulti = 0.2;
        break;
      default:
    }
    switch (archetype2list[archetype2][1]) {
      case "defense":
        defenseRating = heroLevel * 10;
        defenseMulti = 0.2;
        break;
      case "deflect":
        deflectRating = heroLevel * 10;
        deflectMulti = 0.2;
        break;
      case "dodge":
        dodgeRating = heroLevel * 10;
        dodgeMulti = 0.2;
        break;
      default:
    }
  }

  defenseRating += itemTotals["Defense Rating"] ?? 0;
  const synergyDefenseMulti = synergy["Defense Multi."] ?? 0;
  defenseMulti =
    defenseMulti +
    dur * 0.01 +
    synergyDefenseMulti / 10 +
    (infinity["Defense Multi."] ?? 0) / 100 +
    (itemTotals["Defense Multi."] ?? 0) / 100;
  finalStats["Defense Multi."] = defenseMulti * 100;
  const defenseMultiplied = defenseRating * (1 + defenseMulti);
  finalStats["Defense Rating"] = defenseMultiplied;
  const totalDefense =
    ((0.4 * defenseMultiplied) / (defenseMultiplied + 200 * heroLevel)) * 100;
  finalStats["Total Defense%"] = totalDefense;

  deflectRating += itemTotals["Deflect Rating"] ?? 0;
  const synergyDeflectMulti = synergy["Deflect Multi."] ?? 0;
  deflectMulti =
    deflectMulti +
    str * 0.01 +
    synergyDeflectMulti / 10 +
    (itemTotals["Deflect Multi."] ?? 0) / 100;
  finalStats["Deflect Multi."] = deflectMulti * 100;
  const deflectMultiplied = deflectRating * (1 + deflectMulti);
  finalStats["Deflect Rating"] = deflectMultiplied;
  const trait3DeflectPct = trait3 === "Deflect%" ? 3 : 0;
  const infinityDeflectPct = infinity["Deflect% +"] ?? 0;
  const plusDeflectPct = trait3DeflectPct + infinityDeflectPct;
  finalStats["Deflect% (+)"] = plusDeflectPct;
  const totalDeflect =
    ((0.9 * deflectMultiplied) / (deflectMultiplied + 250 * heroLevel)) * 100 +
    plusDeflectPct;
  finalStats["Total Deflect%"] = totalDeflect;

  dodgeRating += itemTotals["Dodge Rating"] ?? 0;
  const synergyDodgeMulti = synergy["Dodge Multi."] ?? 0;
  dodgeMulti =
    dodgeMulti +
    spd * 0.01 +
    synergyDodgeMulti / 10 +
    (itemTotals["Dodge Multi."] ?? 0) / 100;
  finalStats["Dodge Multi."] = dodgeMulti * 100;
  const dodgeMultiplied = dodgeRating * (1 + dodgeMulti);
  finalStats["Dodge Rating"] = dodgeMultiplied;
  const trait3DodgePct = trait3 === "Dodge%" ? 3 : 0;
  const infinityDodgePct = infinity["Dodge% +"] ?? 0;
  const plusDodgetPct = trait3DodgePct + infinityDodgePct;
  finalStats["Dodge% (+)"] = plusDodgetPct;
  const totalDodge =
    ((0.45 * dodgeMultiplied) / (dodgeMultiplied + 250 * heroLevel)) * 100 +
    plusDodgetPct;
  finalStats["Total Dodge%"] = totalDodge;

  const itemsDmgReduction = itemTotals["DMG Reduction% (+)"] ?? 0;
  const infinityDmgReduction = infinity["DMG Reduction% (+)"] ?? 0;
  const combatTypeDmgReduction =
    combatType === "Melee Combatant" ? 8 : combatState === true ? 8 : 0;
  const plusDmgReduction =
    itemsDmgReduction + infinityDmgReduction + combatTypeDmgReduction;
  finalStats["DMG Reduction% (+)"] = plusDmgReduction;
  const deflectToDmgReduction = Math.round(totalDeflect * 0.2 * 10) / 10;
  const dodgeToDmgReduction = Math.round(totalDodge * 0.4 * 10) / 10;
  const totalDmgReduction =
    totalDefense +
    deflectToDmgReduction +
    dodgeToDmgReduction +
    plusDmgReduction;
  finalStats["Total DMG Reduction %"] = totalDmgReduction;

  // Avg. Effective Health
  // finalStats["Avg. Effective Health"] = Math.round(maxHealth / (1 - totalDmgReduction)); // TODO
  finalStats["Avg. Effective Health"] =
    maxHealth /
    (1 -
      ((itemTotals["DMG Reduction% (+)"] ?? 0) +
        (0.4 * defenseMultiplied) / (defenseMultiplied + 200 * heroLevel)) +
      ((((0.2 * totalDeflect) / 100 / +0.4) * totalDodge) / 100) *
        (1 - (0.5 * totalDeflect) / 100) *
        (1 - totalDodge / 100));

  // ===== -DMG from =====
  // Deflected
  const reduceDeflected = str * 0.1 > 10 ? 10 : str * 0.1;
  const totalReduceDeflected =
    (itemTotals["Reduced DMG from Deflected"] ?? 0) + reduceDeflected;
  finalStats["Reduced DMG from Deflected"] = totalReduceDeflected;
  // Melee
  const reduceMelee = fgt * 0.25 > 25 ? 25 : fgt * 0.25;
  const totalReduceMelee =
    (itemTotals["Reduced DMG from Melee"] ?? 0) + reduceMelee;
  finalStats["Reduced DMG from Melee"] = totalReduceMelee;
  // Area
  const reduceArea = spd * 0.25 > 25 ? 25 : spd * 0.25;
  const totalReduceArea =
    (itemTotals["Reduced DMG from Area"] ?? 0) + reduceArea;
  finalStats["Reduced DMG from Area"] = totalReduceArea;
  // Ranged
  const reduceRanged = enr * 0.25 > 25 ? 25 : enr * 0.25;
  const totalRanged =
    (itemTotals["Reduced DMG from Ranged"] ?? 0) + reduceRanged;
  finalStats["Reduced DMG from Ranged"] = totalRanged;

  return finalStats;
}

function calculateTypeCritHit(
  statType: string,
  itemTotals: Record<string, number>,
  synergy: Record<string, number>,
  finalStats: Record<string, number>,
  heroLevel: number,
  baseCritHitMulti: number,
  baseCritHitRating: number,
  plusCritHit: number
) {
  const ratingKey = `${statType} Crit Hit Rating`;
  const multiKey = `${statType} Crit Hit Multi.`;
  const percentKey = `${statType} Crit Hit%`;

  const critHitRating = itemTotals[ratingKey] ?? 0;
  const synergyMulti = synergy[multiKey] ?? 0;
  finalStats[multiKey] = synergyMulti;

  const typeCritHitMultiplied =
    (critHitRating + baseCritHitRating) *
    (1 + (synergyMulti + baseCritHitMulti) / 100);
  finalStats[ratingKey] = typeCritHitMultiplied;

  const critHit =
    10 +
    (89 * typeCritHitMultiplied) / (typeCritHitMultiplied + 80 * heroLevel) +
    plusCritHit;

  finalStats[percentKey] = critHit;
}

function diamondArmor(level: number) {
  return (
    (((((((-6.246827502200548e-11 * level + 1.303963887789363e-8) * level -
      1.039046292148242e-6) *
      level +
      3.859726053709363e-5) *
      level -
      6.28034025449365e-4) *
      level +
      2.271095117691089e-3) *
      level +
      3.578387347844458e-2) *
      level +
      23.56164734519495) *
      level +
    79.73714428573214
  );
}
