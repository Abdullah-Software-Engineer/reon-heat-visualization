import React from 'react';
import type { RuntimeDataResponse, RuntimeSource } from '../api/types/runtime-data.types';

const ALLOWED_SOURCES = [
  'Battery',
  'Battery Solar',
  'Genset Battery',
  'Genset Solar Battery',
] as const;

interface LegendProps {
  data: RuntimeDataResponse;
}

const Legend: React.FC<LegendProps> = ({ data }) => {
  const sources = data.meta.sources.filter(
    (source): source is RuntimeSource =>
      ALLOWED_SOURCES.includes(source.display as (typeof ALLOWED_SOURCES)[number])
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-1 py-0.5">
      {sources.map((source) => (
        <div
          key={source.value}
          className="flex items-center gap-1 flex-shrink-0"
        >
          <div
            className="w-2 h-2 flex-shrink-0 rounded-sm"
            style={{ backgroundColor: source.color }}
          />
          <span className="text-xs text-gray-700 whitespace-nowrap">
            {source.display}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
