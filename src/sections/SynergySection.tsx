import { useEffect, useState } from "react";
import { Card } from "../components";
import { synergies } from "../data/synergies";
import { calculateSynergyStats } from "../utils/calculateSynergyStats";
import { type HeroSynergy } from "../data/synergies";

function SynergyStatsPanel({ tempSynergy }: { tempSynergy: Record<string, number> }) {
    return (
        <Card className="rounded-lg shadow border border-gray-700 p-4 h-fit sticky top-4">
            <h3 className="font-bold text-lg mb-2 text-white">Synergy Stats</h3>
            {Object.keys(tempSynergy).length === 0 ? (
                <p className="text-gray-300 text-sm italic">No synergies active</p>
            ) : (
                <table className="w-full text-sm">
                    <tbody>
                        {Object.entries(tempSynergy).map(([stat, value]) => (
                            <tr key={stat} className="border-b last:border-none">
                                <td className="py-1 text-left font-medium text-white">{stat}</td>
                                <td className="py-1 text-right font-semibold text-blue-300">{value}
                                    <span>{stat === "Durability" ||
                                        stat === "Strength" ||
                                        stat === "Fighting" ||
                                        stat === "Energy" ||
                                        stat === "Speed" ||
                                        stat === "Intelligence" ||
                                        stat === "Health On Hit" ||
                                        stat === "Spirit On Hit" ||
                                        stat === "Health On Kill" ||
                                        stat === "Spirit On Kill" ||
                                        stat === "Spirit" ||
                                        stat === "Bonus Credits Per Drop"
                                        ? "" : "%"}</span>
                                    {/* TODO */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Card>
    );
}

function HeroSynergyCard({
    hero,
    heroLevel,
    isActive,
    isPermanent,
    onToggle,
    searchTerm,
}: {
    hero: HeroSynergy;
    heroLevel: number;
    isActive: boolean;
    isPermanent: boolean;
    onToggle: () => void;
    searchTerm: string;
}) {
    const heroImage = `./heroes_portrait/${hero.name.toLowerCase().replace(/[-\s]/g, "")}.png`;

    // Helper function to expand abbreviations in search terms
    const expandSearchTerm = (term: string): string => {
        return term
            .toLowerCase()
            .replace(/\bcrit\b/g, 'critical')
            .replace(/\bdmg\b/g, 'damage');
    };

    const expandedSearchTerm = expandSearchTerm(searchTerm);
    const matchesSearch =
        searchTerm &&
        (expandSearchTerm(hero.name).includes(expandedSearchTerm) ||
            hero.stats.some((s) => expandSearchTerm(s.key).includes(expandedSearchTerm)));

    return (
        <div
            className={`flex items-center bg-gray-800 justify-between rounded-md border p-1 px-4 transition-all duration-200 
        ${isActive ? "border-green-400 shadow-md" : "border-gray-700 hover:shadow-sm"}
        ${matchesSearch ? "ring-2 ring-blue-400" : ""}
        ${isPermanent ? "opacity-70" : ""}`}
        >
            <div className="flex flex-col items-center py-2">
                <img
                    src={heroImage}
                    alt={hero.name}
                    className="w-10 h-10 rounded-md object-cover border border-gray-700"
                />
            </div>
            <div className="flex-1 flex flex-col pl-4 text-xs text-gray-300 ">
                <span
                    className={`font-semibold text-sm text-center mb-1 text-white ${matchesSearch ? "text-blue-500" : "text-gray-800"}`}>
                    {hero.name}
                </span>
                {hero.stats.map((s, i) => {
                    let displayValue =
                        s.key === "Health On Hit" || s.key === "Spirit On Kill"
                            ? Math.trunc(s.value * heroLevel + 1)
                            : s.key === "Health On Kill"
                                ? s.value * heroLevel
                                : s.value;

                    const highlight = searchTerm && expandSearchTerm(s.key).includes(expandedSearchTerm);

                    return (
                        <div key={i} className={`flex gap-1 items-center ${highlight ? "text-blue-500" : ""}`}>
                            <span className="font-medium">{s.key}</span>
                            <span>
                                {s.key === "Spirit Cost" ? "-" : "+"}
                                {displayValue}
                                {s.type === "percent" ? "%" : ""}
                            </span>
                        </div>
                    );
                })}
            </div>

            <button
                disabled={isPermanent}
                onClick={onToggle}
                className={`w-9 h-9 flex items-center justify-center rounded-full font-bold text-white cursor-pointer transition 
                    ${isActive || isPermanent ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"} 
                    ${isPermanent ? "cursor-not-allowed" : ""}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" role="img">
                    <path
                        d="M12 2v8.5M4.93 7.76a8 8 0 1 0 14.14 0"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>
            </button>
        </div>
    );
}

export default function SynergySection({
    heroLevel,
    synergy,
    setSynergy,
    activatedHeroes,
    setActivatedHeroes,
}: {
    heroLevel: number;
    synergy: Record<string, number>;
    setSynergy: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    activatedHeroes: string[];
    setActivatedHeroes: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    const [tempActivatedSynergies, setTempActivatedSynergies] = useState<string[]>(activatedHeroes);
    const [tempSynergy, setTempSynergy] = useState({ ...synergy });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const recalculated = calculateSynergyStats(tempActivatedSynergies, heroLevel);
        setTempSynergy(recalculated);
    }, [heroLevel, tempActivatedSynergies]);

    const toggleActivate = (heroName: string) => {
        const hero = synergies.find((h) => h.name === heroName);
        if (!hero) return;

        const isPermanent = activatedHeroes.includes(heroName);
        const isActive = tempActivatedSynergies.includes(heroName);

        if (isPermanent) return;
        if (!isActive && tempActivatedSynergies.length >= 10) return;

        const newActivated = isActive
            ? tempActivatedSynergies.filter((name) => name !== heroName)
            : [...tempActivatedSynergies, heroName];

        setTempActivatedSynergies(newActivated);
    };

    const handleApply = () => {
        setActivatedHeroes(tempActivatedSynergies);
        setSynergy(tempSynergy);
    };

    const handleCancel = () => {
        setTempActivatedSynergies(activatedHeroes);
        setTempSynergy({ ...synergy });
    };

    const handleReset = () => {
        setActivatedHeroes([]);
        setTempActivatedSynergies([]);
        setSynergy({});
        setTempSynergy({});
    };

    const unchanged = JSON.stringify(tempActivatedSynergies) === JSON.stringify(activatedHeroes);

    // Helper function to expand abbreviations in search terms
    const expandSearchTerm = (term: string): string => {
        return term
            .toLowerCase()
            .replace(/\bcrit\b/g, 'critical')
            .replace(/\bdmg\b/g, 'damage');
    };

    const filteredSynergies = synergies.filter((hero) => {
        if (!searchTerm.trim()) return true;
        const expandedTerm = expandSearchTerm(searchTerm);
        return (
            expandSearchTerm(hero.name).includes(expandedTerm) ||
            hero.stats.some((s) => expandSearchTerm(s.key).includes(expandedTerm))
        );
    });

    return (
        <div className="p-6 min-h-screen relative">
            <div className="flex justify-end items-center mb-4 sticky top-4">
                <div className="bg-[#081f39] border border-gray-700 shadow-xl rounded-lg px-4 py-2 flex items-center gap-3 w-full max-w-2xl">
                    <span className="font-bold text-gray-700 mr-3 flex-shrink-0">
                        <span className="text-white">Synergies Active: </span>
                        <span className="text-blue-500">{tempActivatedSynergies.length}/10</span>
                    </span>
                    <button
                        onClick={handleApply}
                        disabled={unchanged}
                        className={`px-3 py-1.5 rounded font-semibold text-white transition
                            ${unchanged ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:bg-green-800"}`}
                    >
                        Apply
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={unchanged}
                        className={`px-3 py-1.5 rounded font-semibold text-white transition
                            ${unchanged ? "bg-gray-400 cursor-not-allowed" : "bg-sky-700 hover:bg-sky-800"}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-gray-300 hover:bg-gray-400 rounded font-semibold text-gray-800"
                    >
                        Reset
                    </button>
                    <div className="relative w-64 ml-auto">
                        <input
                            type="text"
                            placeholder="Search hero or stat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-700 bg-white rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => setSearchTerm("")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Stats */}
                <div className="lg:w-1/4 w-full">
                    <SynergyStatsPanel tempSynergy={tempSynergy} />
                </div>

                {/* Synergy list */}
                <div className="lg:w-3/4 w-full grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredSynergies.map((hero) => (
                        <HeroSynergyCard
                            key={hero.name}
                            hero={hero}
                            heroLevel={heroLevel}
                            isActive={tempActivatedSynergies.includes(hero.name)}
                            isPermanent={activatedHeroes.includes(hero.name)}
                            onToggle={() => toggleActivate(hero.name)}
                            searchTerm={searchTerm.toLowerCase()}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}