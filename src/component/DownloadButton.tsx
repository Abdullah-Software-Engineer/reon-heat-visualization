import React, { useMemo } from 'react';
import Dropdown, { type DropdownOption } from './Dropdown';
import { DownloadIcon, ImageIcon } from './Icons';

export interface DownloadOption {
  label: string;
  onDownload: () => void;
}

export interface DownloadButtonProps {
  /** Download options */
  options: DownloadOption[];
  /** Additional CSS classes */
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({
  options,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const dropdownOptions = useMemo<DropdownOption[]>(
    () =>
      options.map((option, index) => ({
        label: option.label,
        value: `download-${index}`,
        icon: option.label.toLowerCase().includes('image') ? (
          <ImageIcon />
        ) : (
          <DownloadIcon size={14} />
        ),
        onClick: () => {
          option.onDownload();
          setIsOpen(false);
        },
      })),
    [options]
  );

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className={`w-10 h-10 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer transition-colors duration-250 hover:bg-gray-50 ${className}`}
          aria-label="Download options"
          title="Download"
        >
          <DownloadIcon />
        </button>
      }
      options={dropdownOptions}
      isOpen={isOpen}
      onToggle={setIsOpen}
      placement="right"
    />
  );
};

export default DownloadButton;

