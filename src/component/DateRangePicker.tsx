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

const APPLY_INSTANTLY_KEY = 'dateRangePicker_applyInstantly';

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  availableDates,
  value,
  onChange,
  placeholder = 'Select date range',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [applyInstantly, setApplyInstantly] = useState<boolean>(() => {
    // Load preference from localStorage, default to true (instant mode)
    const saved = localStorage.getItem(APPLY_INSTANTLY_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange>(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(pickerRef, () => {
    if (isOpen) {
      setIsOpen(false);
      // Reset temp range if closed without applying
      if (!applyInstantly) {
        setTempDateRange(value);
      }
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

  // Sync tempDateRange with value when picker opens or value changes externally
  useEffect(() => {
    if (isOpen) {
      setTempDateRange(value);
    }
  }, [isOpen, value]);

  // Save preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(APPLY_INSTANTLY_KEY, String(applyInstantly));
  }, [applyInstantly]);

  const handleDateChange = useCallback(
    (type: 'start' | 'end') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value;
      const currentRange = applyInstantly ? value : tempDateRange;
      
      if (type === 'start' && newDate <= currentRange.end) {
        const newRange = { ...currentRange, start: newDate };
        if (applyInstantly) {
          onChange(newRange);
        } else {
          setTempDateRange(newRange);
        }
      } else if (type === 'end' && newDate >= currentRange.start) {
        const newRange = { ...currentRange, end: newDate };
        if (applyInstantly) {
          onChange(newRange);
        } else {
          setTempDateRange(newRange);
        }
      }
    },
    [value, tempDateRange, applyInstantly, onChange]
  );

  const formatDateRange = useCallback(() => {
    if (!value.start || !value.end) return '';
    return `${value.start} ~ ${value.end}`;
  }, [value]);

  const handleReset = useCallback(() => {
    if (availableDates.length > 0) {
      const resetRange = {
        start: availableDates[0],
        end: availableDates[availableDates.length - 1],
      };
      if (applyInstantly) {
        onChange(resetRange);
      } else {
        setTempDateRange(resetRange);
      }
    }
  }, [availableDates, applyInstantly, onChange]);

  const handleDone = useCallback(() => {
    if (!applyInstantly) {
      // Apply the temporary date range
      onChange(tempDateRange);
    }
    setIsOpen(false);
  }, [applyInstantly, tempDateRange, onChange]);

  const handleToggleApplyInstantly = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setApplyInstantly(newValue);
    
    // If switching to instant mode, apply current temp range immediately
    if (newValue && !applyInstantly) {
      onChange(tempDateRange);
    }
  }, [applyInstantly, tempDateRange, onChange]);

  // Get the current date range to display in inputs
  const currentRange = applyInstantly ? value : tempDateRange;

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
              value={currentRange.start}
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
              value={currentRange.end}
              min={availableDates[0]}
              max={availableDates[availableDates.length - 1]}
              onChange={handleDateChange('end')}
              className="px-2 py-1.5 rounded border border-gray-300 text-sm bg-white text-gray-800 flex-1"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
            <input
              type="checkbox"
              id="apply-instantly"
              checked={applyInstantly}
              onChange={handleToggleApplyInstantly}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <label
              htmlFor="apply-instantly"
              className="text-sm text-gray-800 cursor-pointer select-none"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleApplyInstantly({ target: { checked: !applyInstantly } } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              Apply changes instantly
            </label>
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
              onClick={handleDone}
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

