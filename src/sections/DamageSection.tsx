import { Card } from '../components';
import { conditionLabels } from "../data/stats";

type DamageSectionProps = {
    finalStats: Record<string, number>;
    heroLevel: number;
    damageCalculators: Array<{ baseMin: number; baseMax: number; attackSpeed: number; keywords?: string[] }>;
    setDamageCalculators: (calculators: Array<{ baseMin: number; baseMax: number; attackSpeed: number; keywords?: string[] }>) => void;
    globalCheckedConditions: boolean[];
    setGlobalCheckedConditions: (conditions: boolean[]) => void;
    vuln: number;
    setVuln: (v: number) => void;
}

type DamageCalculatorState = {
    baseMin: number;
    baseMax: number;
    attackSpeed: number;
    keywords?: string[];
}

function formatNumberSmallDecimal(n: number) {
    if (isNaN(n)) return n;
    const rounded = Math.round(n * 100) / 100;
    const [intPart, decPart] = rounded.toString().split(".");
    const intWithCommas = Number(intPart).toLocaleString();

    if (decPart && decPart !== "00") {
        // Pad decimals to 2 digits if needed
        const decStr = "." + (decPart.length === 1 ? decPart + "0" : decPart);
        return (
            <>
                {intWithCommas}
                <span className="ml-0.5 text-xs align-end" style={{ fontSize: '0.70em' }}>{decStr}</span>
            </>
        );
    }
    return intWithCommas;
}

function formatIntegerWithCommas(num: number | undefined) {
    if (num === undefined || isNaN(num)) return num;
    return Math.round(num).toLocaleString();
}

const typeCritKeys = [
    { tag: "Physical", key: "Physical Crit Hit Rating" },
    { tag: "Energy", key: "Energy Crit Hit Rating" },
    { tag: "Mental", key: "Mental Crit Hit Rating" },
    { tag: "Melee", key: "Melee Crit Hit Rating" },
    { tag: "Ranged", key: "Ranged Crit Hit Rating" },
    { tag: "Area", key: "Area Crit Hit Rating" },
    { tag: "Movement", key: "Movement Crit Hit Rating" },
] as const;

const typeDmgKeys = [
    { tag: "Physical", key: "Total Physical DMG%" },
    { tag: "Energy", key: "Total Energy DMG%" },
    { tag: "Mental", key: "Total Mental DMG%" },
    { tag: "Melee", key: "Total Melee DMG%" },
    { tag: "Ranged", key: "Total Ranged DMG%" },
    { tag: "Area", key: "Total Area DMG%" },
    { tag: "Summon", key: "Total Summon DMG%" },
    { tag: "Movement", key: "Total Movement DMG%" },
] as const;

function DamageCalculator({
    index,
    state,
    setState,
    finalStats,
    heroLevel,
    globalConditionBonusDmg,
    vuln
}: {
    index: number;
    state: DamageCalculatorState;
    setState: (state: DamageCalculatorState) => void;
    finalStats: Record<string, number>;
    heroLevel: number;
    globalConditionBonusDmg: number;
    vuln: number;
}) {
    const { baseMin, baseMax, attackSpeed } = state;
    const selectedKeywords = state.keywords ?? [];

    // Crit Hit
    const summedKeywordCritDelta = selectedKeywords
        .map(t => typeCritKeys.find(k => k.tag.toLowerCase() === t.toLowerCase()))
        .filter((x): x is typeof typeCritKeys[number] => !!x)
        .map(k => ((finalStats["Crit Hit Rating"] ?? 0) - (finalStats[k.key] ?? 0)))
        .reduce((a, b) => a + b, 0);
    const keywordCritHit = 10 +
        (89 * summedKeywordCritDelta) / (summedKeywordCritDelta + 80 * heroLevel)
    const applicableCritHitPct = keywordCritHit ?? 0;

    // Brutal
    const applicableBrutalStrikePct = finalStats["Total Brutal Strike%"] ?? 0;

    // Dmg%
    const summedKeywordDmgDelta = selectedKeywords
        .map(t => typeDmgKeys.find(k => k.tag.toLowerCase() === t.toLowerCase()))
        .filter((x): x is typeof typeDmgKeys[number] => !!x)
        .map(k => (finalStats[k.key] ?? 0))
        .reduce((a, b) => a + b, 0);
    const totalDmgBonus = finalStats["Base DMG"] + globalConditionBonusDmg + summedKeywordDmgDelta;

    // Base
    const startingMin = baseMin / (1 + finalStats["Base DMG"] / 100);
    const startingMax = baseMax / (1 + finalStats["Base DMG"] / 100);

    // Final
    const finalMin = startingMin * (1 + totalDmgBonus / 100) * (1 + (vuln / 100));
    const finalMax = startingMax * (1 + totalDmgBonus / 100) * (1 + (vuln / 100));
    const finalAvg = (finalMin + finalMax) / 2;

    const finalCritMin = finalMin * (finalStats["Total Crit DMG%"] / 100);
    const finalCritMax = finalMax * (finalStats["Total Crit DMG%"] / 100);
    const finalCritAvg = finalAvg * (finalStats["Total Crit DMG%"] / 100);

    const finalBrutalMin = finalMin * (finalStats["Total Brutal DMG%"] / 100);
    const finalBrutalMax = finalMax * (finalStats["Total Brutal DMG%"] / 100);
    const finalBrutalAvg = finalAvg * (finalStats["Total Brutal DMG%"] / 100);

    const finalDps = attackSpeed * ((finalMin + finalMax) / 2);
    const finalCritDps = attackSpeed * ((finalCritMin + finalCritMax) / 2) * ((1 - (applicableCritHitPct / 100)) + (applicableCritHitPct / 100) * (finalStats["Total Crit DMG%"] / 100));
    const finalBrutalDps = attackSpeed * ((finalBrutalMin + finalBrutalMax) / 2) * ((1 - (applicableBrutalStrikePct / 100)) + (applicableBrutalStrikePct / 100) * (finalStats["Total Brutal DMG%"] / 100));

    // Total DPS
    const totalDps =
        attackSpeed * ((finalMin + finalMax) / 2) *
        ((1 - (finalStats["Total Crit Hit%"] / 100))) +
        ((finalStats["Total Crit Hit%"] / 100)) * (1 - (finalStats["Total Brutal Strike%"] / 100)) * (finalStats["Total Crit DMG%"] / 100) +
        ((finalStats["Total Crit Hit%"] / 100)) * (finalStats["Total Brutal Strike%"] / 100) * (finalStats["Total Brutal DMG%"] / 100);

    return (
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="text-xs font-semibold text-blue-200 mb-2">Skill #{index + 1}</div>

            {/* Row 1: Inputs + Keywords */}
            <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Input Card */}
                <div className="col-span-1 flex flex-col bg-gray-700 rounded p-2 border border-blue-600">
                    <label className="text-xs font-semibold text-blue-200 mb-1">Base Min DMG</label>
                    <input
                        type="number"
                        className="bg-gray-600 border border-blue-500 rounded px-2 py-1 text-white text-xs w-full focus:ring-blue-400 focus:outline-none"
                        value={baseMin}
                        min={0}
                        onChange={e => setState({ ...state, baseMin: Number(e.target.value) })}
                        placeholder="Min"
                    />
                    <label className="text-xs font-semibold text-blue-200 mt-2 mb-1">Base Max DMG</label>
                    <input
                        type="number"
                        className="bg-gray-600 border border-blue-500 rounded px-2 py-1 text-white text-xs w-full focus:ring-blue-400 focus:outline-none"
                        value={baseMax}
                        min={0}
                        onChange={e => setState({ ...state, baseMax: Number(e.target.value) })}
                        placeholder="Max"
                    />
                    <label className="text-xs font-semibold text-blue-200 mt-1 mb-1"> Attack Speed /s</label>
                    <input
                        type="number"
                        step="0.01"
                        min={0}
                        className="bg-gray-600 border border-blue-500 rounded px-2 py-1 text-white text-xs w-full focus:ring-blue-400 focus:outline-none"
                        value={attackSpeed}
                        onChange={e => setState({ ...state, attackSpeed: Number(e.target.value) })}
                        placeholder="APS"
                    />
                </div>
                {/* Keywords Card */}
                <div className="col-span-1 flex flex-col bg-gray-700 rounded p-2 border border-indigo-600">
                    <span className="text-xs text-indigo-300 font-semibold mb-1">Keywords</span>
                    <div className="grid grid-cols-2 gap-1 text-[10px] text-white">
                        {["Physical", "Melee", "Energy", "Ranged", "Mental", "Area", "Summon", "Movement", "Signature"].map(tag => (
                            <label key={tag} className="flex items-center space-x-1">
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-3 w-3 text-indigo-500 border-gray-600 bg-gray-800 rounded"
                                    checked={!!selectedKeywords.find(t => t.toLowerCase() === tag.toLowerCase())}
                                    onChange={() => {
                                        const current = selectedKeywords;
                                        const exists = current.find(t => t.toLowerCase() === tag.toLowerCase());
                                        const next = exists ? current.filter(t => t.toLowerCase() !== tag.toLowerCase()) : [...current, tag];
                                        setState({ ...state, keywords: next });
                                    }}
                                />
                                <span>{tag}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final */}
            <div className="grid grid-cols-3 gap-2 mb-2">
                {/* Input Card */}
                <div className="col-span-1 flex flex-col gap-2 bg-gray-700 rounded p-2 border border-blue-600">
                    <div className="text-xs text-gray-400 mt-1">
                        <div className="text-xs font-semibold text-blue-200">Final Min DMG <span className="font-bold text-white ml-2">{formatNumberSmallDecimal(finalMin)}</span></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        <div className="text-xs font-semibold text-blue-200">Final Max DMG <span className="font-bold text-white ml-2">{formatNumberSmallDecimal(finalMax)}</span></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        <div className="text-blue-300 font-extrabold">DPS: <span className="font-extrabold">{formatNumberSmallDecimal(finalDps)}</span></div>
                    </div>
                </div>

                {/* Critical Damage Card */}
                <div className="col-span-1 flex flex-col bg-gray-700 rounded p-2 border border-yellow-600">
                    <span className="text-xs text-yellow-300 font-semibold mb-1">Final Critical</span>
                    <div className="text-xs text-gray-400 flex flex-col gap-2">
                        <div>Min: <span className="font-bold text-yellow-200">{formatNumberSmallDecimal(finalCritMin)}</span></div>
                        <div>Max: <span className="font-bold text-yellow-200">{formatNumberSmallDecimal(finalCritMax)}</span></div>
                        <div>Avg: <span className="font-bold text-yellow-200">{formatNumberSmallDecimal(finalCritAvg)}</span></div>
                        <div className="text-yellow-200 font-extrabold">DPS: <span className="font-extrabold">{formatNumberSmallDecimal(finalCritDps)}</span></div>
                    </div>
                </div>

                {/* Brutal Damage Card */}
                <div className="col-span-1 flex flex-col bg-gray-700 rounded p-2 border border-red-600">
                    <span className="text-xs text-red-300 font-semibold mb-1">Final Brutal</span>
                    <div className="text-xs text-gray-400 flex flex-col gap-2">
                        <div>Min: <span className="font-bold text-red-200">{formatNumberSmallDecimal(finalBrutalMin)}</span></div>
                        <div>Max: <span className="font-bold text-red-200">{formatNumberSmallDecimal(finalBrutalMax)}</span></div>
                        <div>Avg: <span className="font-bold text-red-200">{formatNumberSmallDecimal(finalBrutalAvg)}</span></div>
                        <div className="text-red-200 font-extrabold">DPS: <span className="font-extrabold">{formatNumberSmallDecimal(finalBrutalDps)}</span></div>
                    </div>
                </div>
            </div>

            <div className="border border-amber-500 rounded-lg text-center text-amber-500 text-sm">
                <span className="font-semibold">Total DPS: {" "}
                    <span className="font-bold">{(totalDps).toFixed(0)}</span>
                </span>
            </div>
        </div>
    );
}

export default function DamageSection({
    finalStats,
    heroLevel,
    damageCalculators,
    setDamageCalculators,
    globalCheckedConditions,
    setGlobalCheckedConditions,
    vuln,
    setVuln
}: DamageSectionProps) {
    function handleGlobalCheckboxToggle(idx: number) {
        const copy = [...globalCheckedConditions];
        copy[idx] = !copy[idx];
        setGlobalCheckedConditions(copy);
    }

    const globalConditionBonusDmg = globalCheckedConditions.reduce((sum, checked, idx) => {
        if (checked) {
            const label = conditionLabels[idx];
            const val = finalStats[`DMG vs ${label}`] ?? 0;
            return sum + val;
        }
        return sum;
    }, 0);

    // Calculate Grand Total DPS by summing all individual calculator DPS
    const grandTotalDps = damageCalculators.reduce((total, calc) => {
        const { baseMin, baseMax, attackSpeed } = calc;
        const selectedKeywords = calc.keywords ?? [];

        // Calculate the same way as individual calculators
        const summedKeywordDmgDelta = selectedKeywords
            .map(t => typeDmgKeys.find(k => k.tag.toLowerCase() === t.toLowerCase()))
            .filter((x): x is typeof typeDmgKeys[number] => !!x)
            .map(k => (finalStats[k.key] ?? 0))
            .reduce((a, b) => a + b, 0);
        const totalDmgBonus = finalStats["Base DMG"] + globalConditionBonusDmg + summedKeywordDmgDelta;

        const startingMin = baseMin / (1 + finalStats["Base DMG"] / 100);
        const startingMax = baseMax / (1 + finalStats["Base DMG"] / 100);
        const finalMin = startingMin * (1 + totalDmgBonus / 100);
        const finalMax = startingMax * (1 + totalDmgBonus / 100);

        // Calculate total DPS for this calculator (same formula as in individual calculator)
        const calculatorTotalDps =
            attackSpeed * ((finalMin + finalMax) / 2) *
            ((1 - (finalStats["Total Crit Hit%"] / 100))) +
            ((finalStats["Total Crit Hit%"] / 100)) * (1 - (finalStats["Total Brutal Strike%"] / 100)) * (finalStats["Total Crit DMG%"] / 100) +
            ((finalStats["Total Crit Hit%"] / 100)) * (finalStats["Total Brutal Strike%"] / 100) * (finalStats["Total Brutal DMG%"] / 100);

        return total + calculatorTotalDps;
    }, 0);

    return (
        <div>
            <div className="flex justify-center text-sm mb-4 px-4 py-2 bg-gray-700 rounded border border-amber-500">
                <span className="text-amber-500 mr-8">
                    <span className="font-bold">Grand Total DPS: {formatIntegerWithCommas(grandTotalDps)}</span>
                </span>
            </div>

            <div className="flex gap-4 h-full">
                {/* Main Content Area with 8 calculators */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-3">
                        {damageCalculators.map((state, index) => (
                            <DamageCalculator
                                key={index}
                                index={index}
                                state={state}
                                setState={(newState) => {
                                    const copy = [...damageCalculators];
                                    copy[index] = newState;
                                    setDamageCalculators(copy);
                                }}
                                finalStats={finalStats}
                                heroLevel={heroLevel}
                                globalConditionBonusDmg={globalConditionBonusDmg}
                                vuln={vuln}
                            />
                        ))}
                    </div>
                </div>

                {/* Sticky Column */}
                <div className="w-50 bg-gray-800 rounded-lg p-3 border border-indigo-700 sticky top-0 overflow-y-auto">
                    <div className="flex justify-center items-center bg-gray-800 rounded-lg p-1 border border-indigo-700 mb-4">
                        <span className="mr-2 text-xs text-white">Vulnerability</span>
                        <span className="mr-1 text-white">-</span>
                        <input
                            type="number"
                            className="bg-gray-600 border border-blue-500 rounded px-2 py-0.5 text-white text-xs w-12 focus:ring-blue-400 focus:outline-none"
                            value={vuln}
                            min={0}
                            onChange={e => setVuln(Number(e.target.value))}
                            placeholder="%"
                        />
                        <span className="ml-1 text-xs text-white">%</span>
                    </div>
                    <div className="space-y-2 text-xs text-white mb-4">
                        <div className="text-center space-y-2 text-xs font-semibold text-white">
                            DMG vs ...
                        </div>
                        {conditionLabels.map((label, idx) => (
                            <label className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-700 p-0.5 rounded" key={label}>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-3 w-3 text-indigo-500 border-gray-600 bg-gray-800 rounded"
                                    checked={globalCheckedConditions[idx]}
                                    onChange={() => handleGlobalCheckboxToggle(idx)}
                                />
                                <span className="flex-1">
                                    {label} <span className="text-blue-300">{formatIntegerWithCommas(finalStats[`DMG vs ${label}`])}%</span>
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="text-indigo-200 text-xs mt-4 p-2 bg-gray-700 rounded">
                        <span className="mb-1">Bonus DMG: </span><span className="font-semibold">{formatIntegerWithCommas(globalConditionBonusDmg)}%</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4">
                        <button
                            onClick={() => setGlobalCheckedConditions(Array(conditionLabels.length).fill(false))}
                            className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded transition-colors"
                        >
                            Uncheck All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
