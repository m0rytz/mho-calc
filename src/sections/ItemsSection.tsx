import { Card, Dropdown } from "../components";
import { useRef, useState, useEffect, useCallback } from "react";
import { itemStats } from "../data/stats";
import type { Item, StatType } from "../data/stats";

type ItemsSectionProps = {
    items: Item[];
    setItems: React.Dispatch<React.SetStateAction<Item[]>>;
};

export default function ItemsSection({ items, setItems }: ItemsSectionProps) {
    const draggingCardIndex = useRef<number | null>(null);
    const draggingStatRef = useRef<{ cardId: number; index: number } | null>(null);
    const [focusedInput, setFocusedInput] = useState<{ cardId: number; statIndex?: number } | null>(null);
    const scrollIntervalRef = useRef<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragOverPosition, setDragOverPosition] = useState<'left' | 'right' | null>(null);

    const reorderArray = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
        const next = [...array];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        return next;
    };

    const addCard = () => {
        setItems((prev) => [
            ...prev,
            { id: prev.length + 1, name: "", selectedStats: [], enabled: true },
        ]);
    };

    const deleteCard = (id: number) => {
        setItems((prev) => prev.filter((card) => card.id !== id));
    };

    const updateCardName = (cardId: number, name: string) => {
        setItems((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId ? { ...card, name } : card
            )
        );
    };

    const addStatToCard = (cardId: number, statName: string, statType: StatType, fixedValue?: number) => {
        if (!statName) return;

        setItems((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId
                    ? {
                        ...card,
                        selectedStats: [
                            ...card.selectedStats,
                            {
                                stat: statName,
                                value: statType === "fixed" ? (fixedValue ?? 0) : 0,
                                type: statType,
                                fixedValue: fixedValue,
                            },
                        ],
                    }
                    : card
            )
        );
    };

    const updateStatValue = (
        cardId: number,
        statIndex: number,
        value: number
    ) => {
        setItems((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId
                    ? {
                        ...card,
                        selectedStats: card.selectedStats.map((s, i) =>
                            i === statIndex ? { ...s, value } : s
                        ),
                    }
                    : card
            )
        );
    };

    const removeStatFromCard = (cardId: number, statIndex: number) => {
        setItems((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId
                    ? {
                        ...card,
                        selectedStats: card.selectedStats.filter(
                            (_, i) => i !== statIndex
                        ),
                    }
                    : card
            )
        );
    };

    const toggleItemEnabled = (cardId: number) => {
        setItems((prevCards) =>
            prevCards.map((card) =>
                card.id === cardId
                    ? { ...card, enabled: !card.enabled }
                    : card
            )
        );
    };

    const startAutoScroll = useCallback((direction: 'up' | 'down') => {
        if (scrollIntervalRef.current) return;

        const scrollSpeed = 10;
        const scrollAmount = direction === 'up' ? -scrollSpeed : scrollSpeed;

        scrollIntervalRef.current = setInterval(() => {
            window.scrollBy(0, scrollAmount);
        }, 16); // ~60fps
    }, []);

    const stopAutoScroll = useCallback(() => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (!isDragging) return;

        const scrollThreshold = 100; // Distance from edge to trigger scroll
        const mouseY = e.clientY;
        const viewportHeight = window.innerHeight;

        if (mouseY < scrollThreshold) {
            startAutoScroll('up');
        } else if (mouseY > viewportHeight - scrollThreshold) {
            startAutoScroll('down');
        } else {
            stopAutoScroll();
        }
    }, [isDragging, startAutoScroll, stopAutoScroll]);

    useEffect(() => {
        return () => {
            stopAutoScroll();
        };
    }, [stopAutoScroll]);

    return (
        <div className="p-2 sm:p-2">
            <p className="text-gray-400 pb-2 text-xs">* For better accuracy,
                calculate the exact stat percentages from the detailed item view (Alt view),
                then enter those values here. Example: <span className="text-green-700">+6.5% Attack Speed </span> 
                [<span className="text-yellow-300">62</span>% of 4% - 8%] = <span className="text-green-700">+6.48 Attack Speed</span>
            </p>

            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-2 sm:px-4"
                onDragOver={handleDragOver}
            >
                {items.map((card, cardIndex) => (
                    <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => {
                            if (focusedInput) {
                                e.preventDefault();
                                return;
                            }
                            draggingCardIndex.current = cardIndex;
                            setIsDragging(true);
                            e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            handleDragOver(e);

                            // Determine if we're dropping to the left or right of this card
                            const rect = e.currentTarget.getBoundingClientRect();
                            const mouseX = e.clientX;
                            const cardCenterX = rect.left + rect.width / 2;

                            if (mouseX < cardCenterX) {
                                setDragOverIndex(cardIndex);
                                setDragOverPosition('left');
                            } else {
                                setDragOverIndex(cardIndex);
                                setDragOverPosition('right');
                            }
                        }}
                        onDragLeave={() => {
                            setDragOverIndex(null);
                            setDragOverPosition(null);
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            const from = draggingCardIndex.current;
                            if (from === null) return;

                            let targetIndex = cardIndex;
                            if (dragOverPosition === 'right') {
                                targetIndex = cardIndex + 1;
                            }

                            // Adjust for the case where we're moving from before the target
                            if (from < targetIndex) {
                                targetIndex -= 1;
                            }

                            if (from !== targetIndex) {
                                setItems((prev) => reorderArray(prev, from, targetIndex));
                            }

                            draggingCardIndex.current = null;
                            setDragOverIndex(null);
                            setDragOverPosition(null);
                        }}
                        onDragEnd={() => {
                            draggingCardIndex.current = null;
                            setIsDragging(false);
                            setDragOverIndex(null);
                            setDragOverPosition(null);
                            stopAutoScroll();
                        }}
                        className="h-[400px] max-h-[400px] relative min-h-[300px] sm:min-h-[400px]"
                    >
                        {/* Vertical Gutter Drop Indicator - Left */}
                        {dragOverIndex === cardIndex && dragOverPosition === 'left' && isDragging && draggingCardIndex.current !== cardIndex && (
                            <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400 rounded-full z-20 shadow-lg">
                                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rotate-45"></div>
                            </div>
                        )}

                        {/* Vertical Gutter Drop Indicator - Right */}
                        {dragOverIndex === cardIndex && dragOverPosition === 'right' && isDragging && draggingCardIndex.current !== cardIndex && (
                            <div className="absolute -right-2 top-0 bottom-0 w-1 bg-blue-400 rounded-full z-20 shadow-lg">
                                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rotate-45"></div>
                            </div>
                        )}

                        <Card
                            className="h-full p-2 sm:p-3 flex flex-col border-gray-500"
                        >
                            {/* Top Row */}
                            <div className="flex items-center">
                                <button
                                    onClick={() => toggleItemEnabled(card.id)}
                                    className={`mr-2 px-2 py-1 text-[0.6rem] font-bold rounded transition-colors duration-200 cursor-pointer ${card.enabled
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {card.enabled ? 'ON' : 'OFF'}
                                </button>
                                <input
                                    type="text"
                                    placeholder="Item/Buff Name"
                                    value={card.name}
                                    onChange={(e) => updateCardName(card.id, e.target.value)}
                                    onFocus={() => setFocusedInput({ cardId: card.id })}
                                    onBlur={() => setFocusedInput(null)}
                                    title={card.name}
                                    className={`text-sm text-white border border-gray-500 rounded-xs p-1 px-3 flex-grow min-w-0 truncate focus:outline-none focus:ring-1 focus:ring-blue-400 ${!card.enabled ? 'opacity-50' : ''
                                        }`}
                                />
                                <button
                                    onClick={() => deleteCard(card.id)}
                                    className="ml-2 text-red-400 hover:text-red-600 font-bold cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Scrollable area */}
                            <div className={`flex-1 overflow-y-auto mt-2 ${!card.enabled ? 'opacity-50' : ''}`}>
                                {/* List of Selected Stats */}
                                <ul className="mt-2 list-disc list-inside text-sm pb-1">
                                    {card.selectedStats.map((statObj, index) => (
                                        <li
                                            key={index}
                                            draggable
                                            onDragStart={(e) => {
                                                if (focusedInput) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                draggingStatRef.current = { cardId: card.id, index };
                                                e.dataTransfer.effectAllowed = "move";
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = "move";
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const dragInfo = draggingStatRef.current;
                                                if (!dragInfo || dragInfo.cardId !== card.id) return;
                                                const from = dragInfo.index;
                                                const to = index;
                                                if (from === to) return;
                                                setItems((prevCards) =>
                                                    prevCards.map((c) =>
                                                        c.id === card.id
                                                            ? {
                                                                ...c,
                                                                selectedStats: reorderArray(c.selectedStats, from, to),
                                                            }
                                                            : c
                                                    )
                                                );
                                                draggingStatRef.current = null;
                                            }}
                                            onDragEnd={() => {
                                                draggingStatRef.current = null;
                                            }}
                                            className="grid grid-cols-[1fr_2fr_auto] sm:grid-cols-[80px_155px_15px] items-center gap-2 sm:gap-6 py-1"
                                        >
                                            <div className="flex-shrink-0 w-21">
                                                <div className="flex items-center rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600 dark:outline-gray-600 dark:has-[input:focus-within]:outline-indigo-500">
                                                    <input
                                                        type="number"
                                                        value={statObj.value}
                                                        onChange={(e) =>
                                                            updateStatValue(
                                                                card.id,
                                                                index,
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        onFocus={(e) => {
                                                            setFocusedInput({ cardId: card.id, statIndex: index });
                                                            e.target.select();
                                                        }}
                                                        onBlur={() => setFocusedInput(null)}
                                                        className={`block min-w-0 grow pr-2 text-base text-white placeholder:text-gray-400 focus:outline-none sm:text-sm/6 ${statObj.type === "fixed" ? "hidden" : ""}`}
                                                    />
                                                    {statObj.type === "percent" && (
                                                        <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6 dark:text-gray-400 pr-3">
                                                            %
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <span className="text-white text-xs sm:text-xs truncate">{statObj.stat}</span>

                                            <button
                                                className="text-red-400 hover:text-red-600 text-[0.75rem] sm:text-base flex-shrink-0 cursor-pointer"
                                                onClick={() => removeStatFromCard(card.id, index)}
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                {/* Dropdown */}
                                <Dropdown
                                    stats={itemStats}
                                    addStatToCard={addStatToCard}
                                    cardId={card.id}
                                />
                            </div>
                        </Card>
                    </div>
                ))}

                {/* Add New Card Button */}
                <div
                    className="h-[400px] max-h-[400px] min-h-[300px] sm:min-h-[400px] flex justify-center items-center relative"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        handleDragOver(e);
                        setDragOverIndex(items.length);
                        setDragOverPosition('left');
                    }}
                    onDragLeave={() => {
                        setDragOverIndex(null);
                        setDragOverPosition(null);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        const from = draggingCardIndex.current;
                        if (from === null) return;
                        setItems((prev) => reorderArray(prev, from, items.length));
                        draggingCardIndex.current = null;
                        setDragOverIndex(null);
                        setDragOverPosition(null);
                    }}
                >
                    {/* Vertical Gutter Drop Indicator for Add Button */}
                    {dragOverIndex === items.length && isDragging && (
                        <div className="absolute -left-2 top-0 bottom-0 w-1 bg-blue-400 rounded-full z-20 shadow-lg">
                            <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-400 rotate-45"></div>
                        </div>
                    )}

                    <button
                        onClick={addCard}
                        className="cursor-pointer flex justify-center items-center text-sm sm:text-md font-bold text-white border border-white rounded p-3 sm:p-2 hover:bg-white hover:text-black transition w-full sm:w-auto"
                    >
                        + Add Item/Buff
                    </button>
                </div>
            </div>
        </div>
    );
}
