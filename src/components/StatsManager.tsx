import React, { useState } from 'react';
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
}

interface CategoryItemProps {
  category: StatCategoryConfig;
  onEdit: (category: StatCategoryConfig) => void;
  onDelete: (categoryId: string) => void;
  onAddStat: (categoryId: string) => void;
  onStatDelete: (statId: string) => void;
  onStatEdit: (statId: string, updatedStatRef: StatReference) => void;
  onStatReorder: (categoryId: string, statId: string, newIndex: number) => void;
}

const StatItem: React.FC<StatItemProps> = ({ statRef, stat, onDelete, onEdit }) => {
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
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`flex items-center justify-between p-2 border border-gray-600 rounded bg-[#081f39] cursor-move ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const statId = e.dataTransfer.getData('text/plain');
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const itemHeight = 60; // Approximate height of each stat item
    const newIndex = Math.floor(y / itemHeight);
    
    onStatReorder(category.id, statId, newIndex);
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
              className="w-full px-2 py-1 border border-gray-500 rounded text-sm bg-gray-800 text-white placeholder-gray-400"
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
              className="flex items-center space-x-2 text-left flex-1"
            >
              <span className="font-medium text-white">{category.name}</span>
              <span className="text-gray-300">({category.stats.length} stats)</span>
              <span className="text-white">{isExpanded ? '▲' : '▼'}</span>
            </button>
            <div className="flex space-x-1">
              <button
                onClick={() => onAddStat(category.id)}
                className="p-1 text-gray-400 hover:text-green-400 rounded transition-colors duration-200"
                title="Add Stat"
              >
                +
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-400 rounded transition-colors duration-200"
                title="Edit"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </button>
              <button
                onClick={() => onDelete(category.id)}
                className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors duration-200"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <div 
          className="p-3 space-y-2 bg-gray-800"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {category.stats.map((statRef) => {
            const stat = resolveStatReference(statRef);
            if (!stat) return null;
            
            return (
              <StatItem
                key={stat.id}
                statRef={statRef}
                stat={stat}
                onDelete={onStatDelete}
                onEdit={onStatEdit}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const StatsManager: React.FC<StatsManagerProps> = ({ config, onConfigChange, onClose }) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showStatSelector, setShowStatSelector] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [statSearchQuery, setStatSearchQuery] = useState('');

  const generateId = () => Math.random().toString(36).substr(2, 9);

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

  const handleAddStat = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
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
      categories: config.categories.map(cat =>
        cat.id === selectedCategoryId
          ? { ...cat, stats: [...cat.stats, newStatRef] }
          : cat
      ),
      version: config.version + 1,
    };
    onConfigChange(updatedConfig);
    setShowStatSelector(false);
    setSelectedCategoryId(null);
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
    if (window.confirm('Are you sure you want to reset to default configuration? This will lose all your customizations.')) {
      onConfigChange(DEFAULT_STATS_CONFIG);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#081f39] rounded-lg p-6 max-w-4xl w-full h-[90vh] max-h-[90vh] overflow-y-auto border border-gray-600">
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
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200"
              >
                Reset to Default
              </button>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="px-3 py-1 bg-green-700 text-white text-sm rounded hover:bg-green-800 transition-colors duration-200"
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
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-[#081f39] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Select Stat to Add</h3>
              <button
                onClick={() => {
                  setShowStatSelector(false);
                  setSelectedCategoryId(null);
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
