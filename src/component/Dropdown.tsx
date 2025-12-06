import React, { useRef, useState, useEffect, type ReactNode } from 'react';
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
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useClickOutside(dropdownRef, () => {
    if (isOpen) {
      onToggle(false);
    }
  });

  // Calculate position when dropdown opens
  useEffect(() => {
    if (isOpen && triggerRef.current && menuRef.current) {
      const calculatePosition = () => {
        if (!triggerRef.current || !menuRef.current) return;
        
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = triggerRect.left;
        let top = triggerRect.bottom + 4; // mt-1 equivalent (4px)
        
        // Adjust horizontal position based on placement
        if (placement === 'right') {
          left = triggerRect.right - (menuRect.width || 160);
        } else if (placement === 'center') {
          left = triggerRect.left + (triggerRect.width / 2) - ((menuRect.width || 160) / 2);
        }
        
        // Ensure dropdown stays within viewport
        if (left + (menuRect.width || 160) > viewportWidth) {
          left = viewportWidth - (menuRect.width || 160) - 8;
        }
        if (left < 8) {
          left = 8;
        }
        
        // Check if there's enough space below, otherwise position above
        if (top + (menuRect.height || 200) > viewportHeight && triggerRect.top > (menuRect.height || 200)) {
          top = triggerRect.top - (menuRect.height || 200) - 4;
        }
        
        setPosition({ top, left });
        // Small delay to ensure position is set before showing
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      };
      
      // Calculate position after a frame to ensure menu is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(calculatePosition);
      });
    } else {
      setIsVisible(false);
    }
  }, [isOpen, placement]);

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;

    if (option.onClick) {
      option.onClick();
    } else if (onSelect) {
      onSelect(option);
    }

    onToggle(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div ref={triggerRef} onClick={() => onToggle(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.95)',
            transition: 'opacity 150ms ease-out, transform 150ms ease-out',
            pointerEvents: isVisible ? 'auto' : 'none',
          }}
          className={`bg-white border border-gray-300 rounded shadow-lg z-50 min-w-[160px] ${menuClassName}`}
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

