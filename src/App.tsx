import "./App.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { type Item, conditionLabels } from "./data/stats";
import { type Hero, heroes } from "./data/heroes";
import { calculateItemTotals, calculateFinalStats } from "./utils/statCalculate";
import HeroSection from "./sections/HeroSection.tsx";
import StatsSection from "./sections/StatsSection.tsx";
import ItemsSection from "./sections/ItemsSection.tsx";
import InfinitySection from "./sections/InfinitySection.tsx";
import DamageSection from "./sections/DamageSection.tsx";
import SynergySection from "./sections/SynergySection.tsx";

export default function App() {
    const [activeTab, setActiveTab] = useState<"items" | "infinity" | "synergy" | "damage">("items");
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    // Hero Section
    const [selectedHero, setSelectedHero] = useState<string>("Angela");
    const hero = heroes.find((h) => h.name === selectedHero);
    const [heroLevel, setHeroLevel] = useState<number>(60);
    const [combatState, setCombatState] = useState(false);
    const [heroAttributes, setHeroAttributes] = useState<Record<string, number>>({});

    // Items Section
    const [items, setItems] = useState<Item[]>([
        { id: 1, name: "", selectedStats: [], enabled: true },
    ]);

    // Infinity Section
    const [infinity, setInfinity] = useState<Record<string, number>>({});
    const [infinityAttributes, setInfinityAttributes] = useState<Record<string, number>>({});
    const [pointsRemaining, setPointsRemaining] = useState(80400);
    const [ranks, setRanks] = useState<Record<string, number>>({});
    const [usedPerGem, setUsedPerGem] = useState<Record<string, number>>({});

    // Synergy Section
    const [synergy, setSynergy] = useState<Record<string, number>>({});
    const [activatedHeroes, setActivatedHeroes] = useState<string[]>([]);

    // Damage Section
    const [damageCalculators, setDamageCalculators] = useState<Array<{ baseMin: number; baseMax: number; keywords?: string[] }>>(() =>
        Array(8).fill(null).map(() => ({
            baseMin: 0,
            baseMax: 0,
            attackSpeed: 1,
            keywords: []
        }))
    );
    const [globalCheckedConditions, setGlobalCheckedConditions] = useState<boolean[]>(
        Array(conditionLabels.length).fill(false)
    );
    const [vuln, setVuln] = useState<number>(0);

    // Toast notification
    const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
    const showToast = (message: string) => {
        setToast({ message, visible: true });
        window.clearTimeout((showToast as any)._tId);
        (showToast as any)._tId = window.setTimeout(() => setToast({ message: "", visible: false }), 1500);
    };

    // Ref for info modal
    const infoModalRef = useRef<HTMLDivElement>(null);

    const itemTotals = useMemo(() => calculateItemTotals(items), [items]);
    const finalStats = useMemo(
        () => calculateFinalStats(hero as Hero, heroLevel, combatState, heroAttributes, infinityAttributes, itemTotals, infinity, synergy),
        [hero, heroLevel, combatState, heroAttributes, infinityAttributes, itemTotals, infinity, synergy]
    );

    useEffect(() => {
        loadState();
    }, []);

    

    // Handle click outside to close info modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (infoModalOpen && infoModalRef.current && !infoModalRef.current.contains(event.target as Node)) {
                setInfoModalOpen(false);
            }
        };

        if (infoModalOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [infoModalOpen]);

    const saveState = () => {
        const stateToSave = {
            selectedHero,
            heroLevel,
            combatState,
            heroAttributes,
            infinityAttributes,
            items,
            infinity,
            pointsRemaining,
            ranks,
            usedPerGem,
            synergy,
            activatedHeroes,
            damageCalculators,
            globalCheckedConditions,
            vuln,
        };

        try {
            localStorage.setItem("appState", JSON.stringify(stateToSave));
            console.log("State saved successfully.");
            showToast("Saved");
        } catch (error) {
            console.error("Failed to save state:", error);
            showToast("Save Failed");
        }
    };

    const loadState = () => {
        try {
            const savedState = localStorage.getItem("appState");
            if (!savedState) return;

            const parsedState = JSON.parse(savedState);

            if (parsedState.selectedHero) setSelectedHero(parsedState.selectedHero);
            if (parsedState.heroLevel) setHeroLevel(parsedState.heroLevel);
            if (parsedState.combatState !== undefined) setCombatState(parsedState.combatState);
            if (parsedState.heroAttributes) setHeroAttributes(parsedState.heroAttributes);
            if (parsedState.infinityAttributes) setInfinityAttributes(parsedState.infinityAttributes);
            if (parsedState.items) {
                // Handle backward compatibility for items without enabled field
                const itemsWithEnabled = parsedState.items.map((item: any) => ({
                    ...item,
                    enabled: item.enabled !== undefined ? item.enabled : true
                }));
                setItems(itemsWithEnabled);
            }
            if (parsedState.infinity) setInfinity(parsedState.infinity);
            if (parsedState.pointsRemaining !== undefined) setPointsRemaining(parsedState.pointsRemaining);
            if (parsedState.ranks) setRanks(parsedState.ranks);
            if (parsedState.usedPerGem) setUsedPerGem(parsedState.usedPerGem);
            if (parsedState.synergy) setSynergy(parsedState.synergy);
            if (parsedState.activatedHeroes) setActivatedHeroes(parsedState.activatedHeroes);
            if (parsedState.damageCalculators && parsedState.damageCalculators.length) {
                // Normalize to new shape with baseMin and baseMax
                const converted = parsedState.damageCalculators.map((c: any) => {
                    // New shape already present
                    if (c.baseMin !== undefined && c.baseMax !== undefined) {
                        return { baseMin: c.baseMin, baseMax: c.baseMax, attackSpeed: c.attackSpeed ?? 1, keywords: c.keywords ?? c.tags ?? [] };
                    }
                    // Previous step: only baseMax existed
                    if (c.baseMax !== undefined && c.baseMin === undefined) {
                        return { baseMin: Number(c.baseMax) / 1.5, baseMax: c.baseMax, attackSpeed: c.attackSpeed ?? 1, keywords: c.keywords ?? c.tags ?? [] };
                    }
                    // Oldest: only baseMin existed
                    if (c.baseMin !== undefined && c.baseMax === undefined) {
                        return { baseMin: c.baseMin, baseMax: Number(c.baseMin) * 1.5, attackSpeed: c.attackSpeed ?? 1, keywords: c.keywords ?? c.tags ?? [] };
                    }
                    return { baseMin: 0, baseMax: 0, attackSpeed: c.attackSpeed ?? 1, keywords: [] };
                });
                setDamageCalculators(converted);
            }
            if (parsedState.globalCheckedConditions) setGlobalCheckedConditions(parsedState.globalCheckedConditions);
            if (parsedState.vuln !== undefined) setVuln(parsedState.vuln);

            console.log("State loaded successfully.");
            showToast("Loaded");
        } catch (error) {
            console.error("Failed to load state:", error);
            showToast("Load Failed");
        }
    };

    const getCurrentState = () => ({
        selectedHero,
        heroLevel,
        combatState,
        heroAttributes,
        infinityAttributes,
        items,
        infinity,
        pointsRemaining,
        ranks,
        usedPerGem,
        synergy,
        activatedHeroes,
        damageCalculators,
        globalCheckedConditions,
        vuln,
    });

    const applyLoadedState = (parsedState: any) => {
        if (parsedState.selectedHero) setSelectedHero(parsedState.selectedHero);
        if (parsedState.heroLevel) setHeroLevel(parsedState.heroLevel);
        if (parsedState.combatState !== undefined) setCombatState(parsedState.combatState);
        if (parsedState.heroAttributes) setHeroAttributes(parsedState.heroAttributes);
        if (parsedState.infinityAttributes) setInfinityAttributes(parsedState.infinityAttributes);
        if (parsedState.items) {
            const itemsWithEnabled = parsedState.items.map((item: any) => ({
                ...item,
                enabled: item.enabled !== undefined ? item.enabled : true
            }));
            setItems(itemsWithEnabled);
        }
        if (parsedState.infinity) setInfinity(parsedState.infinity);
        if (parsedState.pointsRemaining !== undefined) setPointsRemaining(parsedState.pointsRemaining);
        if (parsedState.ranks) setRanks(parsedState.ranks);
        if (parsedState.usedPerGem) setUsedPerGem(parsedState.usedPerGem);
        if (parsedState.synergy) setSynergy(parsedState.synergy);
        if (parsedState.activatedHeroes) setActivatedHeroes(parsedState.activatedHeroes);
        if (parsedState.damageCalculators && parsedState.damageCalculators.length) {
            const converted = parsedState.damageCalculators.map((c: any) => {
                if (c.baseMin !== undefined && c.baseMax !== undefined) {
                    return { baseMin: c.baseMin, baseMax: c.baseMax, attackSpeed: c.attackSpeed ?? 1, keywords: c.keywords ?? c.tags ?? [] };
                }
                if (c.baseMax !== undefined && c.baseMin === undefined) {
                    return { baseMin: Number(c.baseMax) / 1.5, baseMax: c.baseMax, attackSpeed: c.attackSpeed ?? 1, keywords: c.keywords ?? c.tags ?? [] };
                }
                if (c.baseMin !== undefined && c.baseMax === undefined) {
                    return { baseMin: c.baseMin, baseMax: Number(c.baseMin) * 1.5, attackSpeed: c.attackSpeed ?? 1, keywords: c.keywords ?? c.tags ?? [] };
                }
                return { baseMin: 0, baseMax: 0, attackSpeed: c.attackSpeed ?? 1, keywords: [] };
            });
            setDamageCalculators(converted);
        }
        if (parsedState.globalCheckedConditions) setGlobalCheckedConditions(parsedState.globalCheckedConditions);
        if (parsedState.vuln !== undefined) setVuln(parsedState.vuln);
    };

    const exportStateToFile = () => {
        try {
            const data = JSON.stringify(getCurrentState(), null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `mho-calc-save-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Downloaded");
        } catch (error) {
            console.error("Failed to export state:", error);
            showToast("Export Failed");
        }
    };

    const importStateFromFile = async (file: File) => {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
            applyLoadedState(parsed);
            localStorage.setItem("appState", JSON.stringify(parsed));
            showToast("Imported");
        } catch (error) {
            console.error("Failed to import state:", error);
            showToast("Import Failed");
        }
    };


    return (
        <div className="relative min-h-screen py-4 px-2 sm:py-8 sm:px-4 lg:py-12 lg:px-10">
            {/* Main Content */}
            <main>
                {/* Toast */}
                {toast.visible && (
                    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-800 text-white text-sm px-3 py-2 rounded shadow">
                        {toast.message}
                    </div>
                )}
                
                {/* Desktop Layout */}
                <div className="hidden xl:block">
                    {/* Hero */}
                    <HeroSection
                        selectedHero={selectedHero} setSelectedHero={setSelectedHero}
                        heroLevel={heroLevel} setHeroLevel={setHeroLevel}
                        setCombatState={setCombatState}
                        setHeroAttributes={setHeroAttributes}
                        finalStats={finalStats}
                        setInfoModalOpen={setInfoModalOpen}
                    />

                    {/* Stats */}
                    <StatsSection selectedHero={selectedHero} 
                    finalStats={finalStats} onSave={saveState} onLoad={loadState} onExportFile={exportStateToFile} onImportFile={importStateFromFile} />

                    {/* Tabs */}
                    <div className="grid grid-cols-[290px_minmax(500px,_1fr)_345px] justify-center gap-4 p-4">
                        <section className="flex-1 col-start-2 row-start-1">
                            {/* Tab Headers */}
                            <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur flex gap-4 border-b border-gray-700 mb-4 py-2">
                                <button
                                    onClick={() => setActiveTab("items")}
                                    className={`pb-2 px-4 cursor-pointer ${activeTab === "items" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                        }`}
                                >
                                    Items
                                </button>
                                <button
                                    onClick={() => setActiveTab("infinity")}
                                    className={`pb-2 px-4 cursor-pointer ${activeTab === "infinity" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                        }`}
                                >
                                    Infinity
                                </button>
                                <button
                                    onClick={() => setActiveTab("synergy")}
                                    className={`pb-2 px-4 cursor-pointer ${activeTab === "synergy" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                        }`}
                                >
                                    Synergy
                                </button>
                                <button
                                    onClick={() => setActiveTab("damage")}
                                    className={`pb-2 px-4 cursor-pointer ${activeTab === "damage" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                        }`}
                                >
                                    Damage
                                </button>
                                <div className="ml-auto" />
                            </div>

                            {/* Tab Content */}
                            <div>
                                {activeTab === "items" && (
                                    <ItemsSection items={items} setItems={setItems} />
                                )}
                                {activeTab === "infinity" && (
                                    <InfinitySection
                                        infinity={infinity}
                                        setInfinity={setInfinity}
                                        infinityAttributes={infinityAttributes}
                                        setInfinityAttributes={setInfinityAttributes}
                                        pointsRemaining={pointsRemaining}
                                        setPointsRemaining={setPointsRemaining}
                                        ranks={ranks}
                                        setRanks={setRanks}
                                        usedPerGem={usedPerGem}
                                        setUsedPerGem={setUsedPerGem}
                                    />
                                )}
                                {activeTab === "synergy" && (
                                    <SynergySection
                                        heroLevel={heroLevel}
                                        synergy={synergy} setSynergy={setSynergy}
                                        activatedHeroes={activatedHeroes} setActivatedHeroes={setActivatedHeroes} />
                                )}
                                {activeTab === "damage" && (
                                    <DamageSection
                                        finalStats={finalStats}
                                        heroLevel={heroLevel}
                                        damageCalculators={damageCalculators}
                                        setDamageCalculators={setDamageCalculators}
                                        globalCheckedConditions={globalCheckedConditions}
                                        setGlobalCheckedConditions={setGlobalCheckedConditions}
                                        vuln={vuln}
                                        setVuln={setVuln}
                                    />
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Mobile/Tablet Layout */}
                <div className="xl:hidden">
                    {/* Hero Section - Mobile */}
                    <div className="mb-6">
                        <HeroSection
                            selectedHero={selectedHero} setSelectedHero={setSelectedHero}
                            heroLevel={heroLevel} setHeroLevel={setHeroLevel}
                            setCombatState={setCombatState}
                            setHeroAttributes={setHeroAttributes}
                            finalStats={finalStats}
                            setInfoModalOpen={setInfoModalOpen}
                        />
                    </div>

                    {/* Tab Headers - Mobile */}
                    <div className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur flex gap-2 border-b border-gray-700 mb-4 overflow-x-auto py-2">
                        <button
                            onClick={() => setActiveTab("items")}
                            className={`pb-2 px-3 cursor-pointer whitespace-nowrap text-sm ${activeTab === "items" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                }`}
                        >
                            Items
                        </button>
                        <button
                            onClick={() => setActiveTab("infinity")}
                            className={`pb-2 px-3 cursor-pointer whitespace-nowrap text-sm ${activeTab === "infinity" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                }`}
                        >
                            Infinity
                        </button>
                        <button
                            onClick={() => setActiveTab("synergy")}
                            className={`pb-2 px-3 cursor-pointer whitespace-nowrap text-sm ${activeTab === "synergy" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                }`}
                        >
                            Synergy
                        </button>
                        <button
                            onClick={() => setActiveTab("damage")}
                            className={`pb-2 px-3 cursor-pointer whitespace-nowrap text-sm ${activeTab === "damage" ? "text-blue-500 border-b-2 border-blue-500 font-semibold" : "text-gray-400"
                                }`}
                        >
                            Damage
                        </button>
                    </div>

                    {/* Tab Content - Mobile */}
                    <div className="mb-6">
                        {activeTab === "items" && (
                            <ItemsSection items={items} setItems={setItems} />
                        )}
                        {activeTab === "infinity" && (
                            <InfinitySection
                                infinity={infinity}
                                setInfinity={setInfinity}
                                infinityAttributes={infinityAttributes}
                                setInfinityAttributes={setInfinityAttributes}
                                pointsRemaining={pointsRemaining}
                                setPointsRemaining={setPointsRemaining}
                                ranks={ranks}
                                setRanks={setRanks}
                                usedPerGem={usedPerGem}
                                setUsedPerGem={setUsedPerGem}
                            />
                        )}
                        {activeTab === "synergy" && (
                            <SynergySection
                                heroLevel={heroLevel}
                                synergy={synergy} setSynergy={setSynergy}
                                activatedHeroes={activatedHeroes} setActivatedHeroes={setActivatedHeroes} />
                        )}
                        {activeTab === "damage" && (
                            <DamageSection
                                finalStats={finalStats}
                                heroLevel={heroLevel}
                                damageCalculators={damageCalculators}
                                setDamageCalculators={setDamageCalculators}
                                globalCheckedConditions={globalCheckedConditions}
                                setGlobalCheckedConditions={setGlobalCheckedConditions}
                                vuln={vuln}
                                setVuln={setVuln}
                            />
                        )}
                    </div>

                    {/* Stats Section - Mobile */}
                    <StatsSection selectedHero={selectedHero} 
                    finalStats={finalStats} onSave={saveState} onLoad={loadState} onExportFile={exportStateToFile} onImportFile={importStateFromFile} />
                </div>
                {/* Modal Overlay */}
                {infoModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div ref={infoModalRef} className="bg-gray-800 text-white rounded-lg shadow-2xl w-full max-w-2xl p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                className="absolute top-2 right-4 text-gray-400 hover:text-white text-lg font-bold"
                                onClick={() => setInfoModalOpen(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                            {/* MHO Calc Info */}
                            <div className="mb-4 text-xs text-center">
                                <p className="font-bold">MHO Calculator</p>
                                <p>by ken</p>
                                <br />
                                <p>MHServerEmu</p>
                                <p>Game Version: 1.52.0.1700 (2.16a)</p>
                            </div>
                            {/* Sources/Tools */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-center">
                                {/* Lace/Prinn */}
                                <div className="flex flex-col items-center">
                                    <a className="underline" href="https://www.youtube.com/@WilfridWong" target="_blank" rel="noopener noreferrer">
                                        Lace / Wilfrid Wong
                                    </a>
                                    <span>Prinn's Spreadsheet</span>
                                </div>
                                {/* Alex Bond */}
                                <div className="flex flex-col items-center">
                                    <a className="underline" href="https://github.com/AlexBond2/MHServerEmu/tree/v1.0" target="_blank" rel="noopener noreferrer">
                                        Database Browser - Alex Bond
                                    </a>
                                    <a className="underline" href="https://itembase.mhbugle.com/" target="_blank" rel="noopener noreferrer">
                                        Item Base - Alex Bond
                                    </a>
                                </div>
                                {/* Crypto137 */}
                                <div className="flex flex-col items-center">
                                    <a className="underline" href="https://github.com/Crypto137/MHDataParser" target="_blank" rel="noopener noreferrer">
                                        Data Parser - Crypto137
                                    </a>
                                </div>
                            </div>
                            {/* Disclaimer */}
                            <div className="mt-4 text-xs text-center">
                                <span>
                                    All Marvel-related visuals and characters shown here belong to Marvel Entertainment, LLC and Gazillion.
                                    <br />
                                    This website is fan-made, not an official Marvel or Gazillion project.
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </main >
        </div >
    );
}
