import React from 'react';
import { Tooltip } from '../components';
import { formatStatValue, getStatDisplayName, getStatTooltip, getRawValue } from '../utils/statFormatting';
import type { StatConfig } from '../types/statsConfig';


interface StatDisplayProps {
  statConfig: StatConfig;
  value: number;
  hero?: any;
  isExpanded?: boolean;
}

const StatDisplay: React.FC<StatDisplayProps> = ({
  statConfig,
  value,
  hero,
  isExpanded = false
}) => {
  // Don't show stats that are only visible when expanded if not expanded
  if (statConfig.showWhenExpanded && !isExpanded) {
    return null;
  }

  const displayName = getStatDisplayName(statConfig, hero);
  const tooltip = getStatTooltip(statConfig, hero);
  const formattedValue = formatStatValue(value, statConfig);
  const rawValue = getRawValue(value, statConfig);

  return (
    <div className="flex justify-between items-center p-1 px-2">
      {tooltip ? (
        <Tooltip content={tooltip}>
          <h1 className="text-xs font-medium text-white flex items-center gap-1">
            {displayName}
          </h1>
        </Tooltip>
      ) : (
        <h1 className="text-xs font-medium text-white flex items-center gap-1">
          {displayName}
        </h1>
      )}
      {rawValue && Number(rawValue) % 1 !== 0 && Number(rawValue) !== 0 ? (
        <Tooltip content={rawValue == "null" ? "hidden" : rawValue}>
          <p className="text-xs font-medium text-white">{formattedValue}</p>
        </Tooltip>
      ) : (<p className="text-xs font-medium text-white">{formattedValue}</p>)
      }
    </div>
  );
};

export default StatDisplay;
