import React, { useRef, type ReactNode } from 'react';
import { useClickOutside } from '../hooks';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  /** Trigger element or button content */
  trigger: ReactNode;
  /** Array of dropdown options */
  options: DropdownOption[];
  /** Whether the dropdown is open */
  isOpen: boolean;
  /** Callback when dropdown should open/close */
  onToggle: (isOpen: boolean) => void;
  /** Optional callback when an option is clicked (if not provided in option) */
  onSelect?: (option: DropdownOption) => void;
  /** Placement of dropdown relative to trigger */
  placement?: 'left' | 'right' | 'center';
  /** Additional CSS classes for the dropdown container */
  className?: string;
  /** Additional CSS classes for the dropdown menu */
  menuClassName?: string;
  /** Additional CSS classes for dropdown options */
  optionClassName?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  options,
  isOpen,
  onToggle,
  onSelect,
  placement = 'left',
  className = '',
  menuClassName = '',
  optionClassName = '',
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      onToggle(false);
    }
  });

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;

    if (option.onClick) {
      option.onClick();
    } else if (onSelect) {
      onSelect(option);
    }

    onToggle(false);
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'right':
        return 'right-0';
      case 'center':
        return 'left-1/2 -translate-x-1/2';
      case 'left':
      default:
        return 'left-0';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => onToggle(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute top-full mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[160px] ${getPlacementClasses()} ${menuClassName}`}
        >
          {options.map((option, index) => {
            if (option.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="h-px bg-gray-200 my-1"
                />
              );
            }

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className={`w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                  option.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                } ${optionClassName}`}
              >
                {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

