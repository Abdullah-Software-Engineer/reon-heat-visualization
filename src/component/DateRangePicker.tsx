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
  const [dropdownPosition, setDropdownPosition] = useState<{ horizontal: string; vertical: string }>({
    horizontal: 'left-0',
    vertical: 'top-full',
  });
  const pickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Calculate dropdown position to stay within viewport
  useEffect(() => {
    if (isOpen && pickerRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      const calculatePosition = () => {
        if (!pickerRef.current || !dropdownRef.current) return;
        
        const pickerRect = pickerRef.current.getBoundingClientRect();
        const dropdownRect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate horizontal position
        let horizontal = 'left-0';
        const spaceOnRight = viewportWidth - pickerRect.right;
        const spaceOnLeft = pickerRect.left;
        const dropdownWidth = dropdownRect.width || 300; // fallback to min-width
        
        if (spaceOnRight < dropdownWidth && spaceOnLeft > spaceOnRight) {
          // Not enough space on right, align to right edge
          horizontal = 'right-0';
        } else if (pickerRect.left + dropdownWidth > viewportWidth) {
          // Would overflow, align to right edge
          horizontal = 'right-0';
        }
        
        // Calculate vertical position
        let vertical = 'top-full';
        const spaceBelow = viewportHeight - pickerRect.bottom;
        const spaceAbove = pickerRect.top;
        const dropdownHeight = dropdownRect.height || 200; // estimated height
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          // Not enough space below, position above
          vertical = 'bottom-full';
        }
        
        setDropdownPosition({ horizontal, vertical });
      };
      
      // Calculate after a small delay to ensure dropdown is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(calculatePosition);
      });
      
      // Recalculate on window resize
      const handleResize = () => {
        calculatePosition();
      };
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize, true);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
      };
    }
  }, [isOpen]);

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
        className="px-2 sm:px-3 py-2 rounded border border-gray-300 text-xs sm:text-sm bg-white text-gray-800 cursor-pointer min-w-0 sm:min-w-[200px] text-left truncate"
      >
        {formatDateRange() || placeholder}
      </button>
      {isOpen && (
        <div 
          ref={dropdownRef}
          className={`absolute ${dropdownPosition.vertical} ${dropdownPosition.horizontal} ${
            dropdownPosition.vertical === 'top-full' ? 'mt-1' : 'mb-1'
          } bg-white border border-gray-300 rounded shadow-lg p-3 sm:p-4 z-50 flex flex-col gap-2 sm:gap-3 min-w-0 sm:min-w-[300px] max-w-[calc(100vw-24px)]`}
        >
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
              onClick={(e) => e.stopPropagation()}
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

