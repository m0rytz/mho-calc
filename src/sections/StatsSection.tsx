import React from "react";
import { useState, useEffect } from "react";
import {
    Card,
    ToggleButton,
    StatCategory,
    StatsManager,
    StatDisplay,
} from "../components";
import { heroes } from "../data/heroes";
import { DEFAULT_STATS_CONFIG, STAT_ID_TO_NAME_MAP, resolveStatReference } from "../types/statsConfig";
import type { StatsConfiguration } from "../types/statsConfig";

type StatsSectionProps = {
    selectedHero: string;
    finalStats: Record<string, number>;
    onSave: () => void;
    onLoad: () => void;
    onExportFile?: () => void;
    onImportFile?: (file: File) => void;
};

export default function StatsSection({ selectedHero, finalStats, onSave, onLoad, onExportFile, onImportFile }: StatsSectionProps) {
    const hero = heroes.find((h) => h.name === selectedHero);
    const [expandState, setExpandState] = useState(false);
    const [foldVersion, setFoldVersion] = useState(0);
    const [foldState, setFoldState] = useState<boolean | null>(null);
    const [statsConfig, setStatsConfig] = useState<StatsConfiguration>(DEFAULT_STATS_CONFIG);
    const [showStatsManager, setShowStatsManager] = useState(false);

    // Load saved configuration from localStorage
    useEffect(() => {
        const savedConfig = localStorage.getItem('mho-stats-config');
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                setStatsConfig(parsed);
            } catch (error) {
                console.error('Failed to parse saved stats config:', error);
            }
        }
    }, []);

    // Save configuration to localStorage
    const handleConfigChange = (newConfig: StatsConfiguration) => {
        setStatsConfig(newConfig);
        localStorage.setItem('mho-stats-config', JSON.stringify(newConfig));
    };

    const expandStats = (state: boolean) => {
        setExpandState(state);
    };

    const expandAllCategories = () => {
        setFoldState(true);
        setFoldVersion((v) => v + 1);
    };

    const collapseAllCategories = () => {
        setFoldState(false);
        setFoldVersion((v) => v + 1);
    };

    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (file && onImportFile) {
            onImportFile(file);
            e.currentTarget.value = "";
        }
    };

    return (
        <>
            <div className="xl:fixed xl:right-10 xl:w-[350px] xl:top-12 w-full">
                <div className="flex flex-col xl:place-self-end p-2 gap-2">
                    <div className="flex items-center gap-2 xl:ml-auto justify-center xl:justify-end">
                        <button
                            onClick={onSave}
                            className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors duration-200 shadow"
                        >
                            Save
                        </button>
                        <button
                            onClick={onLoad}
                            className="cursor-pointer px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded transition-colors duration-200 shadow"
                        >
                            Load
                        </button>
                        <button
                            onClick={onExportFile}
                            className="cursor-pointer px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded transition-colors duration-200 shadow"
                        >
                            Export
                        </button>
                        <button
                            onClick={handleImportClick}
                            className="cursor-pointer px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded transition-colors duration-200 shadow"
                        >
                            Import
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/json,.json"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                    <div className="flex items-center gap-2 xl:ml-auto xl:mt-1 justify-center xl:justify-end flex-wrap">
                        <h1 className="text-xs font-medium text-white flex items-center px-2">
                            Expand Stats
                        </h1>
                        <ToggleButton onToggle={expandStats} />
                        <button
                            onClick={expandAllCategories}
                            className="cursor-pointer px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs font-semibold rounded transition-colors duration-200 shadow"
                        >
                            ▼
                        </button>
                        <button
                            onClick={collapseAllCategories}
                            className="cursor-pointer px-3 py-1 bg-gray-400 hover:bg-gray-500 text-white text-xs font-semibold rounded transition-colors duration-200 shadow"
                        >
                            ▲
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowStatsManager(true)}
                            className="cursor-pointer p-1 group"
                            aria-label="Open Stats Manager"
                            style={{
                                background: 'transparent',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg
                                style={{ width: '18px', height: '18px' }}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className="transition-transform duration-150"
                            >
                                <path
                                    d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"
                                    className="transition-colors duration-150 group-hover:fill-gray-400"
                                    fill="white"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <Card className="flex flex-col xl:max-h-[calc(95vh-6rem)] max-h-[400px] gap-2 overflow-y-scroll">
                    {statsConfig.categories.map((category) => (
                        <StatCategory key={category.id} title={category.name} foldVersion={foldVersion} foldState={foldState}>
                            {category.stats.map((statRef) => {
                                const statConfig = resolveStatReference(statRef);
                                if (!statConfig) return null;
                                
                                const statName = STAT_ID_TO_NAME_MAP[statConfig.id];
                                const value = statName ? finalStats[statName] : 0;

                                return (
                                    <React.Fragment key={statConfig.id}>
                                        <StatDisplay
                                            statConfig={statConfig}
                                            value={value}
                                            hero={hero}
                                            isExpanded={expandState}
                                        />
                                    </React.Fragment>
                                );
                            })}
                        </StatCategory>
                    ))}
                </Card>
            </div>

            {showStatsManager && (
                <StatsManager
                    config={statsConfig}
                    onConfigChange={handleConfigChange}
                    onClose={() => setShowStatsManager(false)}
                />
            )}
        </>
    );
}

