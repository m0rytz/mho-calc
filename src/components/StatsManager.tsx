import React, { useState, useEffect, useRef } from 'react';
import type { StatsConfiguration, StatCategoryConfig, StatConfig, StatReference } from '../types/statsConfig';
import { DEFAULT_STATS_CONFIG, ALL_AVAILABLE_STATS, resolveStatReference } from '../types/statsConfig';

interface StatsManagerProps {
  config: StatsConfiguration;
  onConfigChange: (config: StatsConfiguration) => void;
  onClose: () => void;
}

// Helper function to get all available stats from the consolidated list
const getAllAvailableStats = (): StatConfig[] => {
  return ALL_AVAILABLE_STATS;
};

interface StatItemProps {
  statRef: StatReference;
  stat: StatConfig;
  onDelete: (statId: string) => void;
  onEdit: (statId: string, updatedStatRef: StatReference) => void;
  highlightPosition?: 'top' | 'bottom' | null;
}

interface CategoryItemProps {
  category: StatCategoryConfig;
  onEdit: (category: StatCategoryConfig) => void;
  onDelete: (categoryId: string) => void;
  onAddStat: (categoryId: string, insertIndex: number) => void;
  onStatDelete: (statId: string) => void;
  onStatEdit: (statId: string, updatedStatRef: StatReference) => void;
  onStatReorder: (categoryId: string, statId: string, newIndex: number) => void;
}

const StatItem: React.FC<StatItemProps> = ({ statRef, stat, onDelete, onEdit, highlightPosition = null }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleShowWhenExpandedChange = (checked: boolean) => {
    const updatedStatRef: StatReference = {
      ...statRef,
      showWhenExpanded: checked,
    };
    onEdit(stat.id, updatedStatRef);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', stat.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const highlightClass = highlightPosition === 'top'
    ? 'shadow-[inset_0_2px_0_0_rgba(59,130,246,1)]'
    : highlightPosition === 'bottom'
      ? 'shadow-[inset_0_-2px_0_0_rgba(59,130,246,1)]'
      : '';

  return (
    <div
      className={`flex items-center justify-between p-2 border border-gray-600 rounded bg-[#081f39] cursor-move ${isDragging ? 'opacity-50' : ''} ${highlightClass}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-stat-item
    >
      <div className="flex-1">
        <div className="font-medium text-sm text-white">{stat.name + " "}
          <span className="text-xs text-gray-400">
            {stat.showWhenExpanded && 'Expanded Only'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <input
            type="checkbox"
            id={`expanded-${stat.id}`}
            checked={stat.showWhenExpanded}
            onChange={(e) => handleShowWhenExpandedChange(e.target.checked)}
            className="rounded"
          />
          <label htmlFor={`expanded-${stat.id}`} className="text-xs text-gray-300">
            Expanded only
          </label>
        </div>
        <button
          onClick={() => onDelete(stat.id)}
          className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors duration-200"
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  onEdit,
  onDelete,
  onAddStat,
  onStatDelete,
  onStatEdit,
  onStatReorder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoverInsertIndex, setHoverInsertIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragCalcRaf = useRef<number | null>(null);

  // Initialize transition container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.overflow = 'hidden';
    el.style.transition = 'height 200ms ease';
    el.style.height = '0px';
  }, []);

  // Animate expand/collapse
  useEffect(() => {
    const el = containerRef.current;
    const inner = contentRef.current;
    if (!el || !inner) return;

    if (isExpanded) {
      // Expand: set to target height then to auto after transition
      const target = inner.scrollHeight;
      el.style.height = target + 'px';
      setIsAnimating(true);
      const onEnd = () => {
        el.style.height = 'auto';
        setIsAnimating(false);
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    } else {
      // Collapse: from current height to 0
      const current = el.getBoundingClientRect().height;
      el.style.height = current + 'px';
      // force reflow
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight;
      el.style.height = '0px';
      setIsAnimating(true);
      const onEnd = () => {
        setIsAnimating(false);
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    }
  }, [isExpanded]);

  const handleSave = () => {
    const updatedCategory: StatCategoryConfig = {
      ...category,
      name: editName,
    };
    onEdit(updatedCategory);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(category.name);
    setIsEditing(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLElement;
    const performCalc = () => {
      const children = Array.from(currentTarget.querySelectorAll('[data-stat-item]')) as HTMLElement[];
      if (children.length === 0) {
        if (dragOverIndex !== 0) setDragOverIndex(0);
        return;
      }

      const mouseY = e.clientY;
      // Find the child under the cursor to use thirds-based decision
      let computedIndex: number | null = null;
      for (let i = 0; i < children.length; i++) {
        const r = children[i].getBoundingClientRect();
        if (mouseY >= r.top && mouseY <= r.bottom) {
          const relative = (mouseY - r.top) / r.height; // 0..1
          if (relative < 0.33) {
            computedIndex = i; // insert above this item
          } else if (relative > 0.67) {
            computedIndex = i + 1; // insert below this item
          } else {
            computedIndex = dragOverIndex; // middle third: keep current index
          }
          break;
        }
      }

      if (computedIndex == null) {
        // If not inside any item vertically, fallback to edge decision
        let index = children.findIndex((child) => {
          const r = child.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          return mouseY < mid;
        });
        if (index === -1) index = children.length;
        computedIndex = index;
      }

      computedIndex = Math.max(0, Math.min(category.stats.length, computedIndex ?? 0));
      if (computedIndex !== dragOverIndex) setDragOverIndex(computedIndex);
      dragCalcRaf.current = null;
    };

    if (dragCalcRaf.current == null) {
      dragCalcRaf.current = requestAnimationFrame(performCalc);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const statId = e.dataTransfer.getData('text/plain');
    let targetIndex = dragOverIndex ?? 0;
    targetIndex = Math.max(0, Math.min(category.stats.length, targetIndex));
    onStatReorder(category.id, statId, targetIndex);
    setDragOverIndex(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Do not show hover insert while dragging
    if (dragOverIndex !== null) return;
    const container = e.currentTarget as HTMLElement;
    const children = Array.from(container.querySelectorAll('[data-stat-item]')) as HTMLElement[];
    if (children.length === 0) {
      setHoverInsertIndex(0);
      return;
    }
    const mouseY = e.clientY;
    let index = children.findIndex((child) => {
      const r = child.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      return mouseY < mid;
    });
    if (index === -1) index = children.length;
    index = Math.max(0, Math.min(category.stats.length, index));
    setHoverInsertIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverInsertIndex(null);
  };

  return (
    <div className="border border-gray-600 rounded mb-2 bg-[#081f39]">
      <div className="bg-gray-700 p-3">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Category Name"
              className="w-full px-2 py-1 border border-gray-500 rounded text-md bg-gray-800 text-white placeholder-gray-400"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2 text-left flex-1 cursor-pointer"
            >
              <span className="font-medium text-white">{category.name}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-lg text-gray-400 hover:text-blue-400 rounded transition-colors duration-200 cursor-pointer"
                title="Edit"
                style={{ minWidth: '2.25rem', minHeight: '2.25rem' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
              <span className={`text-white transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>
            <div className="flex space-x-1">
              <button
                onClick={() => onDelete(category.id)}
                className="p-1 text-lg text-gray-400 hover:text-red-400 rounded transition-colors duration-200 cursor-pointer"
                title="Delete"
                style={{ minWidth: '2.25rem', minHeight: '2.25rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div ref={containerRef}>
        <div
          ref={contentRef}
          className="p-3 space-y-2 bg-gray-800"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={() => { setHoverInsertIndex(null); }}
          onMouseMove={(e) => { if (isExpanded && !isAnimating) handleMouseMove(e); }}
          onMouseLeave={handleMouseLeave}
        >
          {isExpanded && dragOverIndex === null && hoverInsertIndex === 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => onAddStat(category.id, 0)}
                className="px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors duration-200 cursor-pointer"
                title="Add Stat"
              >
                + Add Stat Here
              </button>
            </div>
          )}
          {category.stats.map((statRef, idx) => {
            const stat = resolveStatReference(statRef);
            if (!stat) return null;

            // Determine drag highlight position without shifting layout
            let highlightPosition: 'top' | 'bottom' | null = null;
            if (dragOverIndex !== null) {
              if (dragOverIndex === 0 && idx === 0) {
                highlightPosition = 'top';
              } else if (dragOverIndex === idx) {
                highlightPosition = 'top';
              } else if (dragOverIndex === category.stats.length && idx === category.stats.length - 1) {
                highlightPosition = 'bottom';
              }
            }

            return (
              <React.Fragment key={stat.id}>
                <StatItem
                  statRef={statRef}
                  stat={stat}
                  onDelete={onStatDelete}
                  onEdit={onStatEdit}
                  highlightPosition={highlightPosition}
                />
                {isExpanded && dragOverIndex === null && hoverInsertIndex === idx + 1 && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => onAddStat(category.id, idx + 1)}
                      className="px-2 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-800 transition-colors duration-200 cursor-pointer"
                      title="Add Stat"
                    >
                      + Add Stat Here
                    </button>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatsManager: React.FC<StatsManagerProps> = ({ config, onConfigChange, onClose }) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showStatSelector, setShowStatSelector] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [statSearchQuery, setStatSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const statSelectorRef = useRef<HTMLDivElement>(null);
  const [selectedInsertIndex, setSelectedInsertIndex] = useState<number | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Handle click outside to close modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStatSelector && statSelectorRef.current && !statSelectorRef.current.contains(event.target as Node)) {
        setShowStatSelector(false);
        setSelectedCategoryId(null);
        setStatSearchQuery('');
      } else if (!showStatSelector && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatSelector, onClose]);

  // Common abbreviations and synonyms for stat searching
  const statAbbreviations: Record<string, string[]> = {
    'dmg': ['damage'],
    'crit': ['critical'],
    'def': ['defense', 'defence'],
    'hp': ['health'],
    'spirit': ['resource', 'endurance'],
    'spd': ['speed'],
    'dodge': ['evasion', 'evade'],
    'regen': ['regeneration'],
    'cdr': ['cooldown reduction'],
    'cd': ['cooldown'],
    'dot': ['damage over time'],
    'aoe': ['area'],
    'phys': ['physical'],
    'mental': ['psychic'],
    'summon': ['pet', 'minion'],
    'duration': ['time'],
    'chance': ['probability', 'rate'],
    'increase': ['boost', 'more'],
    'total': ['sum', 'combined'],
    'pct': ['percent', 'percentage'],
    '%': ['percent', 'percentage']
  };

  // Helper function to expand search terms with abbreviations and synonyms
  const expandSearchTerms = (query: string): string[] => {
    const terms = query.toLowerCase().split(/\s+/);
    const expandedTerms = new Set<string>();

    terms.forEach(term => {
      expandedTerms.add(term);

      // Add abbreviations/synonyms for this term
      if (statAbbreviations[term]) {
        statAbbreviations[term].forEach(synonym => {
          expandedTerms.add(synonym);
        });
      }

      // Also check if any abbreviation maps to this term
      Object.entries(statAbbreviations).forEach(([abbrev, synonyms]) => {
        if (synonyms.includes(term)) {
          expandedTerms.add(abbrev);
        }
      });
    });

    return Array.from(expandedTerms);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: StatCategoryConfig = {
        id: generateId(),
        name: newCategoryName.trim(),
        stats: [],
      };
      const updatedConfig = {
        ...config,
        categories: [...config.categories, newCategory],
        version: config.version + 1,
      };
      onConfigChange(updatedConfig);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = (updatedCategory: StatCategoryConfig) => {
    const updatedConfig = {
      ...config,
      categories: config.categories.map(cat =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      ),
      version: config.version + 1,
    };
    onConfigChange(updatedConfig);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all stats in it.')) {
      const updatedConfig = {
        ...config,
        categories: config.categories.filter(cat => cat.id !== categoryId),
        version: config.version + 1,
      };
      onConfigChange(updatedConfig);
    }
  };

  const handleAddStat = (categoryId: string, insertIndex: number) => {
    setSelectedCategoryId(categoryId);
    setSelectedInsertIndex(insertIndex);
    setStatSearchQuery('');
    setShowStatSelector(true);
  };

  const handleSelectStat = (statId: string) => {
    if (!selectedCategoryId) return;

    const selectedStat = getAllAvailableStats().find(stat => stat.id === statId);
    if (!selectedStat) return;

    const newStatRef: StatReference = {
      id: selectedStat.id,
      showWhenExpanded: selectedStat.showWhenExpanded || false,
    };

    const updatedConfig = {
      ...config,
      categories: config.categories.map(cat => {
        if (cat.id !== selectedCategoryId) return cat;
        const insertAt = Math.max(0, Math.min(cat.stats.length, selectedInsertIndex ?? cat.stats.length));
        const newStats = [...cat.stats];
        newStats.splice(insertAt, 0, newStatRef);
        return { ...cat, stats: newStats };
      }),
      version: config.version + 1,
    };
    onConfigChange(updatedConfig);
    setShowStatSelector(false);
    setSelectedCategoryId(null);
    setSelectedInsertIndex(null);
    setStatSearchQuery('');
  };

  const handleDeleteStat = (statId: string) => {
    if (window.confirm('Are you sure you want to delete this stat?')) {
      const updatedConfig = {
        ...config,
        categories: config.categories.map(cat => ({
          ...cat,
          stats: cat.stats.filter(stat => stat.id !== statId)
        })),
        version: config.version + 1,
      };
      onConfigChange(updatedConfig);
    }
  };

  const handleEditStat = (statId: string, updatedStatRef: StatReference) => {
    const updatedConfig = {
      ...config,
      categories: config.categories.map(cat => ({
        ...cat,
        stats: cat.stats.map(stat =>
          stat.id === statId ? updatedStatRef : stat
        )
      })),
      version: config.version + 1,
    };
    onConfigChange(updatedConfig);
  };

  const handleStatReorder = (categoryId: string, statId: string, newIndex: number) => {
    const category = config.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const currentIndex = category.stats.findIndex(stat => stat.id === statId);
    if (currentIndex === -1) return;

    const newStats = [...category.stats];
    const [movedStat] = newStats.splice(currentIndex, 1);
    newStats.splice(newIndex, 0, movedStat);

    const updatedConfig = {
      ...config,
      categories: config.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, stats: newStats }
          : cat
      ),
      version: config.version + 1,
    };
    onConfigChange(updatedConfig);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default configuration?')) {
      onConfigChange(DEFAULT_STATS_CONFIG);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-[#081f39] rounded-lg p-6 max-w-4xl w-full h-[90vh] max-h-[90vh] overflow-y-auto border border-gray-600">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={onClose}
            className="text-red-400 hover:text-white text-2xl transition-colors duration-200"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-end items-center">
            <div className="flex space-x-2">
              <button
                onClick={handleResetToDefault}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200 cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="px-3 py-1 bg-blue-700 text-white text-sm rounded hover:bg-blue-800 transition-colors duration-200 cursor-pointer"
              >
                + Category
              </button>
            </div>
          </div>

          {isAddingCategory && (
            <div className="p-3 border border-gray-600 rounded bg-gray-800">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name"
                  className="w-full px-2 py-1 border border-gray-500 rounded text-sm bg-gray-700 text-white placeholder-gray-400"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddCategory}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {config.categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
                onAddStat={handleAddStat}
                onStatDelete={handleDeleteStat}
                onStatEdit={handleEditStat}
                onStatReorder={handleStatReorder}
              />
            ))}
          </div>
        </div>
      </div>

      {showStatSelector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60">
          <div ref={statSelectorRef} className="bg-[#081f39] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Select Stat to Add</h3>
              <button
                onClick={() => {
                  setShowStatSelector(false);
                  setSelectedCategoryId(null);
                  setSelectedInsertIndex(null);
                  setStatSearchQuery('');
                }}
                className="text-gray-400 hover:text-white text-xl transition-colors duration-200"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={statSearchQuery}
                onChange={(e) => setStatSearchQuery(e.target.value)}
                placeholder="Search stats..."
                className="w-full px-3 py-2 border border-gray-500 rounded text-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              {(() => {
                const category = config.categories.find(cat => cat.id === selectedCategoryId);
                const usedStatIds = category?.stats.map(stat => stat.id) || [];
                const allStatsForCategory = getAllAvailableStats().filter(stat => !usedStatIds.includes(stat.id));

                // Filter stats based on search query
                const filteredStats = allStatsForCategory.filter(stat => {
                  if (!statSearchQuery.trim()) return true;

                  const expandedTerms = expandSearchTerms(statSearchQuery);
                  const searchText = `${stat.name}`.toLowerCase();

                  // Check if any expanded term matches the stat name
                  return expandedTerms.some(term => searchText.includes(term));
                });

                if (allStatsForCategory.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-300">
                      No more stats available to add to this category.
                    </div>
                  );
                }

                if (filteredStats.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-300">
                      No stats found matching "{statSearchQuery}".
                    </div>
                  );
                }

                return filteredStats.map((stat) => (
                  <button
                    key={stat.id}
                    onClick={() => handleSelectStat(stat.id)}
                    className="w-full text-left p-3 border border-gray-600 rounded hover:bg-gray-700 bg-[#081f39] transition-colors duration-200"
                  >
                    <div className="font-medium text-white">{stat.name}</div>
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsManager;
