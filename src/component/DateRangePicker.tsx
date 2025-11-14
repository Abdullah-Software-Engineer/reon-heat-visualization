import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useClickOutside } from '../hooks';

export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangePickerProps {
  /** Available dates to select from */
  availableDates: string[];
  /** Current date range value */
  value: DateRange;
  /** Callback when date range changes */
  onChange: (range: DateRange) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  availableDates,
  value,
  onChange,
  placeholder = 'Select date range',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(pickerRef, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  // Initialize date range when available dates change
  useEffect(() => {
    if (availableDates.length > 0 && !value.start && !value.end) {
      onChange({
        start: availableDates[0],
        end: availableDates[availableDates.length - 1],
      });
    }
  }, [availableDates, value.start, value.end, onChange]);

  const handleDateChange = useCallback(
    (type: 'start' | 'end') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      if (type === 'start' && newDate <= value.end) {
        onChange({ ...value, start: newDate });
      } else if (type === 'end' && newDate >= value.start) {
        onChange({ ...value, end: newDate });
      }
    },
    [value, onChange]
  );

  const formatDateRange = useCallback(() => {
    if (!value.start || !value.end) return '';
    return `${value.start} ~ ${value.end}`;
  }, [value]);

  const handleReset = useCallback(() => {
    if (availableDates.length > 0) {
      onChange({
        start: availableDates[0],
        end: availableDates[availableDates.length - 1],
      });
    }
  }, [availableDates, onChange]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  if (availableDates.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded border border-gray-300 text-sm bg-white text-gray-800 cursor-pointer min-w-[200px] text-left"
      >
        {formatDateRange() || placeholder}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-4 z-50 flex flex-col gap-3 min-w-[300px]">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-800 whitespace-nowrap">From:</label>
            <input
              type="date"
              value={value.start}
              min={availableDates[0]}
              max={availableDates[availableDates.length - 1]}
              onChange={handleDateChange('start')}
              className="px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-800 flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-800 whitespace-nowrap">To:</label>
            <input
              type="date"
              value={value.end}
              min={availableDates[0]}
              max={availableDates[availableDates.length - 1]}
              onChange={handleDateChange('end')}
              className="px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-800 flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors flex-1"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded border border-gray-300 text-sm bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors flex-1"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

