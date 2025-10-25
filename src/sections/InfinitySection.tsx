import { useState, useEffect } from "react";
import { type StatConfig, gemStats, gemBonuses } from "../data/infinity";

type InfinitySectionProps = {
    infinity: Record<string, number>;
    setInfinity: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    infinityAttributes: Record<string, number>;
    setInfinityAttributes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    pointsRemaining: number;
    setPointsRemaining: React.Dispatch<React.SetStateAction<number>>;
    ranks: Record<string, number>;
    setRanks: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    usedPerGem: Record<string, number>;
    setUsedPerGem: React.Dispatch<React.SetStateAction<Record<string, number>>>;
};

const gemColors: Record<string, { color: string, text: string; bg: string; border: string; hoverBg: string }> = {
    Overview: { color: "gray", text: "text-gray-200", bg: "bg-gray-500", border: "border-gray-500", hoverBg: "hover:bg-gray-400" },
    Mind: { color: "blue", text: "text-blue-500", bg: "bg-blue-800", border: "border-blue-800", hoverBg: "hover:bg-blue-900" },
    Power: { color: "red", text: "text-red-400", bg: "bg-red-800", border: "border-red-800", hoverBg: "hover:bg-red-900" },
    Soul: { color: "green", text: "text-green-600", bg: "bg-green-800", border: "border-green-800", hoverBg: "hover:bg-green-900" },
    Time: { color: "orange", text: "text-orange-400", bg: "bg-orange-700", border: "border-orange-700", hoverBg: "hover:bg-orange-800" },
    Space: { color: "purple", text: "text-purple-400", bg: "bg-purple-800", border: "border-purple-800", hoverBg: "hover:bg-purple-900" },
    Reality: { color: "yellow", text: "text-yellow-500", bg: "bg-yellow-700", border: "border-yellow-700", hoverBg: "hover:bg-yellow-800" },
};

export default function InfinitySection({
    infinity,
    setInfinity,
    infinityAttributes,
    setInfinityAttributes,
    pointsRemaining,
    setPointsRemaining,
    ranks,
    setRanks,
    usedPerGem,
    setUsedPerGem
}: InfinitySectionProps) {
    const [activeTab, setActiveTab] = useState(0);
    const precise = (num: number) => parseFloat(num.toFixed(4));
    const gemKeys = ["Overview", "Mind", "Power", "Reality", "Soul", "Space", "Time"];
    const totalUsed = Object.values(usedPerGem).reduce((a, b) => a + b, 0);

    useEffect(() => {
        const newInfinity = { ...infinity };
        const newAttributes = { ...infinityAttributes };

        newInfinity["Resource Cost"] = 0;
        newInfinity["DMG Reduction% +"] = 0;

        const gems = ["Mind", "Power", "Reality", "Soul", "Space", "Time"];
        if ((usedPerGem["Mind"] || 0) >= 100) newInfinity["Resource Cost"] = 10;
        if ((usedPerGem["Space"] || 0) >= 100) newInfinity["DMG Reduction% +"] = 1;
        const allAttrBonus = gems.reduce((sum, gem) => sum + ((usedPerGem[gem] || 0) >= 150 ? 1 : 0), 0);

        const attrKeys = ["Durability", "Strength", "Fighting", "Speed", "Energy", "Intelligence"];
        attrKeys.forEach((key) => {
            const currentValue = infinityAttributes[key] || 0;
            const previousBonus = infinityAttributes["_bonus"] || 0;

            const base = Math.max(0, currentValue - previousBonus);

            newAttributes[`_base_${key}`] = base;

            newAttributes[key] = base + allAttrBonus;
        });
        newAttributes["_bonus"] = allAttrBonus;

        setInfinity(newInfinity);
        setInfinityAttributes(newAttributes);
    }, [usedPerGem]);

    const getActiveBonuses = (gem: string) => {
        const used = usedPerGem[gem] || 0;
        return gemBonuses[gem]
            .filter((b) => used >= b.threshold)
            .map((b) => b.effect);
    };

    const handleRankChange = (gem: string, stat: StatConfig, newRank: number) => {
        const currentRank = ranks[stat.key] || 0;
        newRank = Math.max(0, Math.min(stat.max, newRank));
        const rankDiff = newRank - currentRank;
        const costDiff = rankDiff * stat.cost;

        if (rankDiff > 0 && pointsRemaining < costDiff) return;

        setRanks((prev) => ({ ...prev, [stat.key]: newRank }));
        setPointsRemaining((prev) => prev - costDiff);
        setUsedPerGem((prev) => ({
            ...prev,
            [gem]: (prev[gem] || 0) + costDiff,
        }));

        const newValue = precise(newRank * stat.increment);
        if (stat.category === "infinity") {
            setInfinity((prev) => ({ ...prev, [stat.key]: newValue }));
        } else if (stat.category === "attribute") {
            setInfinityAttributes((prev) => {
                const updated = { ...prev };
                const currentBonus = prev["_bonus"] || 0;

                const currentBase = Math.max(0, (prev[stat.key] || 0) - currentBonus);

                updated[`_base_${stat.key}`] = currentBase + (newValue - (currentRank * stat.increment));

                updated[stat.key] = updated[`_base_${stat.key}`] + currentBonus;

                return updated;
            });
        }
    };

    const resetAllPoints = () => {
        setRanks({});
        setPointsRemaining(80400);
        setUsedPerGem({});
        setInfinity({});
        setInfinityAttributes({});
    };

    const resetGemPoints = (gem: string) => {
        const gemStatsToReset = gemStats[gem];
        const totalCostToRefund = gemStatsToReset.reduce((total, stat) => {
            const currentRank = ranks[stat.key] || 0;
            return total + (currentRank * stat.cost);
        }, 0);

        // Reset ranks for this gem
        const newRanks = { ...ranks };
        gemStatsToReset.forEach(stat => {
            delete newRanks[stat.key];
        });

        // Reset infinity stats for this gem
        const newInfinity = { ...infinity };
        gemStatsToReset.forEach(stat => {
            if (stat.category === "infinity") {
                delete newInfinity[stat.key];
            }
        });

        // Reset attribute stats for this gem
        const newInfinityAttributes = { ...infinityAttributes };
        gemStatsToReset.forEach(stat => {
            if (stat.category === "attribute") {
                delete newInfinityAttributes[stat.key];
                delete newInfinityAttributes[`_base_${stat.key}`];
            }
        });

        setRanks(newRanks);
        setPointsRemaining(prev => prev + totalCostToRefund);
        setUsedPerGem(prev => ({ ...prev, [gem]: 0 }));
        setInfinity(newInfinity);
        setInfinityAttributes(newInfinityAttributes);
    };

    return (
        <div className="p-4 min-h-[700px] relative">
            {/* Tabs Header */}
            <div className={`w-full max-w-6xl mx-auto mt-4 border text-white ${gemColors[gemKeys[activeTab]].border} rounded-lg shadow-lg overflow-hidden`}>
                <ul className="flex flex-wrap">
                    {gemKeys.map((gem, idx) => (
                        <li
                            key={gem}
                            onClick={() => setActiveTab(idx)}
                            className={`cursor-pointer flex-1 text-center py-3 text-sm sm:text-base ${gemColors[gem].hoverBg} font-semibold transition-all 
                            ${activeTab === idx
                                    ? `${gemColors[gem].bg} shadow-inner`
                                    : `${gemColors[gem].text} hover:text-white hover:brightness-110`
                                }`}
                        >
                            {gem} {" "}
                            <span className={`${idx == 0 ? "hidden" : ""} text-xs text-white bg-gray-700 px-1 rounded-2xl`}>{usedPerGem[gemKeys[idx]] || 0}</span>
                        </li>
                    ))}
                </ul>

                {/* Main Content */}
                <div className="p-6 bg-[#0e2445] min-h-[520px]">
                    {/* Overview Tab */}
                    {activeTab === 0 ? (
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 text-sm">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-lg font-semibold">
                                        <span className="text-white">Points Available:{" "}</span>
                                        <span className="font-bold">{pointsRemaining.toLocaleString()}</span>
                                    </div>
                                    <span className="bg-[#0b1d38] px-3 py-1 rounded-lg shadow">
                                        <span className="font-semibold text-white">Total Used:</span>{" "}
                                        {totalUsed.toLocaleString()}
                                    </span>
                                </div>
                                <button
                                    onClick={resetAllPoints}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer"
                                >
                                    Reset All Points
                                </button>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Object.keys(gemBonuses).map((gem) => {
                                    const active = getActiveBonuses(gem);
                                    return (
                                        <div
                                            key={gem}
                                            className="bg-[#132a4d] border border-gray-700 rounded-lg p-4 shadow-md"
                                        >
                                            <h4 className={`text-lg font-bold mb-2 ${gemColors[gem].text}`}>{gem} Gem</h4>
                                            {active.length > 0 ? (
                                                <ul className="list-disc ml-5 text-sm space-y-1">
                                                    {active.map((bonus, idx) => (
                                                        <li key={idx} className="text-green-400">
                                                            {bonus}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">No active bonuses</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Individual Gem View */
                        <div>
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-5 text-sm">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-lg font-semibold">
                                        <span className="text-white">Points Available:{" "}</span>
                                        <span className="font-bold">{pointsRemaining.toLocaleString()}</span>
                                    </div>
                                    <span className="bg-[#0b1d38] px-3 py-1 rounded-lg shadow">
                                        <span className="font-semibold text-white">Points Used:</span>{" "}
                                        <span className="text-white">
                                            {usedPerGem[gemKeys[activeTab]] || 0}
                                        </span>
                                    </span>
                                </div>
                                <button
                                    onClick={() => resetGemPoints(gemKeys[activeTab])}
                                    className={`${gemColors[gemKeys[activeTab]].bg} ${gemColors[gemKeys[activeTab]].hoverBg} text-white px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer`}
                                >
                                    Reset Points
                                </button>
                            </div>

                            <h3 className={`text-xl font-bold text-center ${gemColors[gemKeys[activeTab]].text} mb-3`}>
                                The {gemKeys[activeTab]} Gem
                            </h3>

                            <div className="flex flex-col sm:flex-row gap-8">
                                {/* Left: Active Bonuses */}
                                <div className="sm:w-1/3">
                                    <h4 className={`font-semibold text-lg text-center ${gemColors[gemKeys[activeTab]].text} mb-2`}>
                                        {gemKeys[activeTab]} Mastery
                                    </h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {gemBonuses[gemKeys[activeTab]].map((bonus, idx) => {
                                            const used = usedPerGem[gemKeys[activeTab]] || 0;
                                            const isActive = used >= bonus.threshold;
                                            return (
                                                <li
                                                    key={idx}
                                                    className={`transition ${isActive ? "text-green-400" : "text-gray-500"}`}
                                                >
                                                    {bonus.effect}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                {/* Right: Stat List */}
                                <div className="sm:w-2/3 space-y-3">
                                    {gemStats[gemKeys[activeTab]].map((stat) => {
                                        const currentRank = ranks[stat.key] || 0;
                                        const currentValue = precise(currentRank * stat.increment);

                                        return (
                                            <div
                                                key={stat.key}
                                                className="bg-[#142b52] border border-gray-700 rounded-md p-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                                            >
                                                <div className="flex-1">
                                                    {stat.label.includes("(") ? (
                                                        <p className="font-medium text-gray-200">
                                                            {stat.label.split("(")[0].trim()}
                                                            <br />
                                                            {"(" + stat.label.split("(").slice(1).join("(")}
                                                        </p>
                                                    ) : (
                                                        <p className="font-medium text-gray-200">{stat.label}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={stat.max}
                                                        value={currentRank}
                                                        onChange={(e) =>
                                                            handleRankChange(gemKeys[activeTab], stat, Number(e.target.value))
                                                        }
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-15 text-center border border-gray-600 bg-[#081a36] text-white rounded px-2 py-1"
                                                    />
                                                    <span className="text-gray-400 text-sm tabular-nums inline-block w-8 text-right">/ {stat.max}</span>
                                                    <span className="text-blue-400 font-semibold text-sm tabular-nums w-15 text-left inline-block">
                                                        +{currentValue}
                                                        {stat.format === "percent"
                                                            ? "%"
                                                            : stat.format === "max"
                                                                ? " Max"
                                                                : ""
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
