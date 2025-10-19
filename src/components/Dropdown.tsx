import type { StatType, DropdownCategory } from "../data/stats";
import { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

export default function Dropdown({
  stats,
  addStatToCard,
  cardId,
}: {
  stats: DropdownCategory[];
  addStatToCard: (cardId: number, name: string, type: StatType) => void;
  cardId: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const expandSearchTerm = (term: string): string => {
    return term
      .toLowerCase()
      .replace(/\bcrit\b/g, 'critical')
      .replace(/\bdmg\b/g, 'damage');
  };

  const filteredStats = stats
    .map((category) => ({
      ...category,
      stats: category.stats.filter((s) => {
        const expandedSearch = expandSearchTerm(search);
        const expandedStatName = expandSearchTerm(s.name);
        return expandedStatName.includes(expandedSearch);
      }),
    }))
    .filter((category) => category.stats.length > 0);

  const flatStats = useMemo(() => {
    const list: Array<{ name: string; type: StatType }> = [];
    for (const category of filteredStats) {
      for (const s of category.stats) {
        list.push({ name: s.name, type: s.type });
      }
    }
    return list;
  }, [filteredStats]);

  useEffect(() => {
    if (open) {
      // Focus the search input when opening
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    // Reset or clamp highlighted index when results change
    if (flatStats.length === 0) {
      setHighlightedIndex(0);
      return;
    }
    setHighlightedIndex((idx) => {
      if (idx < 0) return 0;
      if (idx >= flatStats.length) return flatStats.length - 1;
      return idx;
    });
  }, [flatStats]);

  useEffect(() => {
    // Keep highlighted item visible
    const el = itemRefs.current[highlightedIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, flatStats]);

  return (
    <div className="relative w-full">
      <button
        ref={buttonRef}
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm text-center text-white border border-gray-500 rounded p-1 w-full bg-gray-800 hover:bg-gray-700 cursor-pointer"
      >
        Add Stat
      </button>

      {open && buttonRef.current &&
        createPortal(
          <div
            ref={dropdownRef}
            className="absolute bg-gray-800 border border-gray-600 rounded shadow-lg z-50 max-h-100 overflow-y-auto"
            style={{
              top:
                buttonRef.current.getBoundingClientRect().bottom +
                window.scrollY,
              left: buttonRef.current.getBoundingClientRect().left,
              width: buttonRef.current.getBoundingClientRect().width,
            }}
          >
            <div className="sticky top-0 bg-gray-800 z-10 border-b border-gray-600">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search stat..."
                className="w-full p-2 text-sm bg-gray-700 text-white border-b border-gray-600 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (flatStats.length > 0) {
                      setHighlightedIndex((i) => Math.min(i + 1, flatStats.length - 1));
                    }
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (flatStats.length > 0) {
                      setHighlightedIndex((i) => Math.max(i - 1, 0));
                    }
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const selected = flatStats[highlightedIndex];
                    if (selected) {
                      addStatToCard(cardId, selected.name, selected.type);
                      setOpen(false);
                      setSearch("");
                    }
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setOpen(false);
                  } else if (e.key === "Home") {
                    e.preventDefault();
                    if (flatStats.length > 0) setHighlightedIndex(0);
                  } else if (e.key === "End") {
                    e.preventDefault();
                    if (flatStats.length > 0) setHighlightedIndex(flatStats.length - 1);
                  }
                }}
              />
            </div>

            {filteredStats.length > 0 ? (
              filteredStats.map((category) => (
                <div key={category.category}>
                  <div className="px-2 py-1 text-gray-400 text-xs uppercase font-bold">
                    {category.category}
                  </div>
                  {category.stats.map((s) => {
                    const globalIndex = flatStats.findIndex((f) => f.name === s.name && f.type === s.type);
                    const isActive = globalIndex === highlightedIndex;
                    return (
                      <div
                        key={s.name}
                        ref={(el) => {
                          if (globalIndex >= 0) itemRefs.current[globalIndex] = el;
                        }}
                        onMouseEnter={() => {
                          if (globalIndex >= 0) setHighlightedIndex(globalIndex);
                        }}
                        onClick={() => {
                          addStatToCard(cardId, s.name, s.type);
                          setOpen(false);
                          setSearch("");
                        }}
                        className={
                          "px-3 py-1 cursor-pointer text-sm text-white " +
                          (isActive ? "bg-gray-700" : "hover:bg-gray-700")
                        }
                        role="option"
                        aria-selected={isActive}
                      >
                        {s.name}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No results found
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}