import { useEffect } from "react";
import { Card, Tooltip, ImageTooltip } from "../components";
import { heroes, archetype1list, archetype2list, combatType } from "../data/heroes";

type HeroSectionProps = {
    selectedHero: string;
    setSelectedHero: React.Dispatch<React.SetStateAction<string>>;
    heroLevel: number;
    setHeroLevel: React.Dispatch<React.SetStateAction<number>>;
    setHeroAttributes: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    setCombatState: React.Dispatch<React.SetStateAction<boolean>>;
    finalStats: Record<string, number>;
    setInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function HeroSection({ selectedHero, setSelectedHero, heroLevel, setHeroLevel, setHeroAttributes, setCombatState, finalStats, setInfoModalOpen }: HeroSectionProps) {
    const hero = heroes.find((h) => h.name === selectedHero);
    const procCombat = (state: boolean) => {
        setCombatState(state);
    };

    useEffect(() => {
        setHeroAttributes({
            Durability: hero?.attributes["Durability"] ?? 0,
            Strength: hero?.attributes["Strength"] ?? 0,
            Fighting: hero?.attributes["Fighting"] ?? 0,
            Speed: hero?.attributes["Speed"] ?? 0,
            Energy: hero?.attributes["Energy"] ?? 0,
            Intelligence: hero?.attributes["Intelligence"] ?? 0,
        });
    }, [selectedHero]);

    return (
        <div className="xl:fixed xl:left-10 xl:top-12 xl:w-[290px]">
            {/* Hero and Attributes Container */}
            <div className="flex flex-row xl:flex-col gap-4">
                {/* Hero */}
                <Card className="text-center flex-1">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <ImageTooltip
                            content={
                                <img
                                    src={`./heroes_png/${selectedHero
                                        .toLocaleLowerCase()
                                        .replace(/[-\s]/g, "")}.png`}
                                    alt="Oh No! Missing Image"
                                    width="300"
                                />
                            }
                        >
                            <img
                                className="rounded mx-auto"
                                src={`./heroes_portrait/${selectedHero
                                    .toLocaleLowerCase()
                                    .replace(/[-\s]/g, "")}.png`}
                                alt="Oh No! Missing Image"
                                width="100"
                            />
                        </ImageTooltip>
                        <div className="flex flex-col items-center sm:items-start">
                            <select
                                value={selectedHero}
                                onChange={(e) => setSelectedHero(e.target.value)}
                                className="bg-gray-800 p-1 px-2 mb-4 rounded text-white text-sm font-medium"
                            >
                                {heroes.map((hero) => (
                                    <option
                                        className="text-sm"
                                        key={hero.name}
                                        value={hero.name}
                                    >
                                        {hero.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {hero && (
                        <div className="grid grid-cols-1 gap-4 mt-6">
                            <div className="rounded-lg bg-gray-800 p-1 px-2 flex justify-between items-center">
                                <h1 className="text-sm font-medium text-white flex items-center gap-1">
                                    Level
                                </h1>
                                <input
                                    type="number"
                                    value={heroLevel}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "") {
                                            setHeroLevel(1);
                                            return;
                                        }
                                        const num = parseInt(val, 10);
                                        setHeroLevel(Math.min(Math.max(num, 1), 60));
                                    }}
                                    className="text-md w-16 border border-white rounded-sm text-white text-center"
                                />

                            </div>
                            <div className="rounded-lg bg-gray-800 p-1 px-2 flex justify-between items-center">
                                <Tooltip
                                    content={
                                        archetype1list[hero.archetype1]
                                            ?.map(
                                                (attr) => attr.charAt(0).toUpperCase() + attr.slice(1)
                                            )
                                            .join(", ") || "No attributes"
                                    }
                                >
                                    <h1 className="text-sm font-medium text-white flex items-center gap-1">
                                        Archetype 1: {hero.archetype1}
                                    </h1>
                                </Tooltip>
                            </div>
                            <div className="rounded-lg bg-gray-800 p-1 px-2 flex justify-between items-center">
                                <Tooltip
                                    content={
                                        archetype2list[hero.archetype2]
                                            ?.map(
                                                (attr) => attr.charAt(0).toUpperCase() + attr.slice(1)
                                            )
                                            .join(", ") || "No attributes"
                                    }
                                >
                                    <h1 className="text-sm font-medium text-white flex items-center gap-1">
                                        Archetype 2: {hero.archetype2}
                                    </h1>
                                </Tooltip>
                            </div>
                            <div className="rounded-lg bg-gray-800 p-1 px-2 flex justify-between items-center">
                                <Tooltip content={combatType[hero.combatType || "None"]}>
                                    <h1 className="text-sm font-medium text-white flex items-center gap-1">
                                        Combat Type: {hero.combatType || "None"}
                                    </h1>
                                </Tooltip>
                                <Tooltip content="Proc?">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => procCombat(e.target.checked)}
                                        className={`${hero?.combatType === "Melee Combatant" || hero?.combatType === "N/A" ? "hidden" : ""} mx-2`}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Attributes */}
                <Card className="flex-1 xl:mt-4">
                <div className="space-y-2">
                    {/* Durability */}
                    <div className="flex items-center rounded-lg border border-red-800 p-2 gap-4">
                        <Tooltip content={`+${finalStats["Durability"]}% Defense Rating Multiplier (1% per rank)
                        +${(finalStats["Durability"]) * heroLevel} Health (Level x 1 per rank)`}>
                            <h1 className="play-bold text-md font-medium text-white w-32">DURABILITY</h1>
                        </Tooltip>
                        <div className="play-bold text-xl w-10 text-white text-center">
                            {finalStats["Durability"] ?? 0}
                        </div>
                    </div>

                    {/* Strength */}
                    <div className="flex items-center rounded-lg border border-orange-800 p-2 gap-4">
                        <Tooltip content={`+${finalStats["Strength"]}% Deflect Rating Multiplier (1% per rank)
                        -${(finalStats["Strength"]) * 0.1 > 10 ? 10 : (finalStats["Strength"]) * 0.01}% reduced damage from Deflected attacks (-0.1% per rank, -10% maximum)`}>
                            <h1 className="play-bold text-md font-medium text-white w-32">STRENGTH</h1>
                        </Tooltip>
                        <div className="play-bold text-xl w-10 text-white text-center">
                            {finalStats["Strength"] ?? 0}
                        </div>
                    </div>

                    {/* Fighting */}
                    <div className="flex items-center rounded-lg border border-yellow-800 p-2 gap-4">
                        <Tooltip content={`+${(finalStats["Fighting"]) * 0.5}% Critical Rating Multiplier (0.5% per rank)
                        -${(finalStats["Fighting"]) * 0.25 > 25 ? 25 : (finalStats["Fighting"]) * 0.25}% damage taken from Melee attacks (-0.25% per rank, -25% maximum)`}>
                            <h1 className="play-bold text-md font-medium text-white w-32">FIGHTING</h1>
                        </Tooltip>
                        <div className="play-bold text-xl w-10 text-white text-center">
                            {finalStats["Fighting"] ?? 0}
                        </div>
                    </div>

                    {/* Speed */}
                    <div className="flex items-center rounded-lg border border-green-800 p-2 gap-4">
                        <Tooltip content={`+${(finalStats["Speed"])}% Dodge Rating Multiplier (1% per rank)
                        -${(finalStats["Speed"]) * 0.25 > 25 ? 25 : (finalStats["Speed"]) * 0.25}% damage taken from Area attacks (-0.25% per rank, -25% maximum)`}>
                            <h1 className="play-bold text-md font-medium text-white w-32">SPEED</h1>
                        </Tooltip>
                        <div className="play-bold text-xl w-10 text-white text-center">
                            {finalStats["Speed"] ?? 0}
                        </div>
                    </div>

                    {/* Energy */}
                    <div className="flex items-center rounded-lg border border-blue-800 p-2 gap-4">
                        <Tooltip content={`-${(finalStats["Energy"]) * 0.25 > 25 ? 25 : (finalStats["Energy"]) * 0.25}% damage taken from Ranged attacks (-0.25% per rank)
                        -${(finalStats["Energy"]) * 0.25 > 25 ? 25 : (finalStats["Energy"]) * 0.25}% Spirit  Cost (-0.25% per rank, -25% maximum)`}>
                            <h1 className="play-bold text-md font-medium text-white w-32">ENERGY</h1>
                        </Tooltip>
                        <div className="play-bold text-xl w-10 text-white text-center">
                            {finalStats["Energy"] ?? 0}
                        </div>
                    </div>

                    {/* Intelligence */}
                    <div className="flex items-center rounded-lg border border-violet-800 p-2 gap-4">
                        <Tooltip content={`+${(finalStats["Intelligence"]) * heroLevel} Critical Damage Rating (Level x 1 per rank)
                        -${(finalStats["Intelligence"]) * 0.25 > 25 ? 25 : (finalStats["Intelligence"]) * 0.25}% Med Kit Cooldown (-0.25% per rank, -25% maximum)`}>
                            <h1 className="play-bold text-md font-medium text-white w-32">INTELLIGENCE</h1>
                        </Tooltip>
                        <div className="play-bold text-xl w-10 text-white text-center">
                            {finalStats["Intelligence"] ?? 0}
                        </div>
                    </div>
                </div>
                </Card>
            </div>
            
            {/* Info Button */}
            <div className="w-full px-4 flex justify-start mb-4">
                <button
                    onClick={() => setInfoModalOpen(true)}
                    className="px-3 py-1 mt-4 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded shadow-lg focus:outline-none"
                >
                    Info
                </button>
            </div>
        </div>
    );
}