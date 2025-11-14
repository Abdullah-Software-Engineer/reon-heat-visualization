# Component API Reference

Complete API documentation for all React components in the application.

## Table of Contents

- [Heatmap](#heatmap)
- [DateRangePicker](#daterangepicker)
- [DownloadButton](#downloadbutton)
- [Dropdown](#dropdown)

---

## Heatmap

Main component for rendering the interactive heatmap visualization.

### Import

```typescript
import Heatmap from './component/Heatmap';
```

### Props

```typescript
interface HeatmapProps {
  enableAnimation?: boolean; // Default: true
}
```

### Usage

```typescript
// Basic usage
<Heatmap />

// Disable animations
<Heatmap enableAnimation={false} />
```

### Features

- Automatically fetches runtime data on mount
- Displays interactive ECharts heatmap
- Supports date range filtering
- Provides export functionality (image and CSV)
- Handles loading and error states
- Real-time data updates via polling

### Internal State

- `dateRange`: Current date range filter
- `data`: Runtime data from API
- `loading`: Loading state
- `error`: Error state

### Dependencies

- `useRuntimeData` hook for data fetching
- `DateRangePicker` for date filtering
- `DownloadButton` for exports
- ECharts for visualization

---

## DateRangePicker

Component for selecting and filtering date ranges.

### Import

```typescript
import DateRangePicker, { type DateRange } from './component/DateRangePicker';
```

### Props

```typescript
interface DateRangePickerProps {
  availableDates: string[];           // Required: Array of available dates (YYYY-MM-DD format)
  value: DateRange;                   // Required: Current date range
  onChange: (range: DateRange) => void; // Required: Change handler
  placeholder?: string;                // Optional: Placeholder text (default: "Select date range")
  className?: string;                  // Optional: Additional CSS classes
}

interface DateRange {
  start: string;  // Start date in YYYY-MM-DD format
  end: string;    // End date in YYYY-MM-DD format
}
```

### Usage

```typescript
const [dateRange, setDateRange] = useState<DateRange>({ start: '', end: '' });
const availableDates = ['2024-01-01', '2024-01-02', '2024-01-03'];

<DateRangePicker
  availableDates={availableDates}
  value={dateRange}
  onChange={setDateRange}
  placeholder="Select date range"
/>
```

### Behavior

- Automatically initializes with first and last available dates
- Validates that start date ≤ end date
- Closes on outside click
- Provides "Reset" button to restore full range
- "Done" button to close picker

### Validation

- Start date cannot be after end date
- End date cannot be before start date
- Dates must be within available dates range

---

## DownloadButton

Button component with dropdown menu for download options.

### Import

```typescript
import DownloadButton, { type DownloadOption } from './component/DownloadButton';
```

### Props

```typescript
interface DownloadButtonProps {
  options: DownloadOption[];  // Required: Array of download options
  className?: string;         // Optional: Additional CSS classes
}

interface DownloadOption {
  label: string;              // Display label for the option
  onDownload: () => void;     // Function to execute on selection
}
```

### Usage

```typescript
const handleImageDownload = () => {
  // Download image logic
};

const handleDataDownload = () => {
  // Download data logic
};

<DownloadButton
  options={[
    {
      label: 'Download Image',
      onDownload: handleImageDownload,
    },
    {
      label: 'Download Data',
      onDownload: handleDataDownload,
    },
  ]}
/>
```

### Features

- Dropdown menu with custom options
- Icons for different download types
- Closes automatically after selection
- Click-outside detection

### Icons

- "Download Image" → Image icon
- Other options → Download icon

---

## Dropdown

Reusable dropdown menu component.

### Import

```typescript
import Dropdown, { type DropdownOption } from './component/Dropdown';
```

### Props

```typescript
interface DropdownProps {
  trigger: ReactNode;                              // Required: Element that triggers dropdown
  options: DropdownOption[];                       // Required: Array of dropdown options
  isOpen: boolean;                                 // Required: Whether dropdown is open
  onToggle: (isOpen: boolean) => void;            // Required: Toggle handler
  onSelect?: (option: DropdownOption) => void;     // Optional: Selection handler (if not in option)
  placement?: 'left' | 'right' | 'center';       // Optional: Dropdown placement (default: 'left')
  className?: string;                              // Optional: Container CSS classes
  menuClassName?: string;                          // Optional: Menu CSS classes
  optionClassName?: string;                        // Optional: Option CSS classes
}

interface DropdownOption {
  label: string;        // Display label
  value: string;        // Unique identifier
  icon?: ReactNode;     // Optional icon element
  onClick?: () => void; // Optional click handler
  disabled?: boolean;   // Optional disabled state
  divider?: boolean;    // Optional divider line
}
```

### Usage

```typescript
const [isOpen, setIsOpen] = useState(false);

const options: DropdownOption[] = [
  {
    label: 'Option 1',
    value: 'opt1',
    icon: <SomeIcon />,
    onClick: () => console.log('Option 1 clicked'),
  },
  {
    label: 'Divider',
    value: 'divider',
    divider: true,
  },
  {
    label: 'Option 2',
    value: 'opt2',
    disabled: true,
  },
];

<Dropdown
  trigger={<button>Open Menu</button>}
  options={options}
  isOpen={isOpen}
  onToggle={setIsOpen}
  placement="right"
/>
```

### Features

- Flexible trigger element
- Customizable options with icons
- Disabled state support
- Divider support
- Click-outside detection
- Multiple placement options

### Placement Options

- `'left'`: Aligns to left of trigger (default)
- `'right'`: Aligns to right of trigger
- `'center'`: Centers relative to trigger

---

## Custom Hooks

### useRuntimeData

Hook for fetching and managing runtime data with polling.

#### Import

```typescript
import { useRuntimeData } from './hooks';
```

#### Usage

```typescript
const {
  data,        // RuntimeDataResponse | null
  loading,      // boolean
  error,        // ApiError | null
  refetch,      // () => Promise<void>
  isPolling,    // boolean
} = useRuntimeData({
  enablePolling: true,      // Default: true
  pollingInterval: 30000,   // Default: 30000ms (30 seconds)
});
```

#### Options

```typescript
interface UseRuntimeDataOptions {
  enablePolling?: boolean;    // Enable automatic polling
  pollingInterval?: number;   // Polling interval in milliseconds
}
```

#### Return Value

```typescript
interface UseRuntimeDataReturn {
  data: RuntimeDataResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  isPolling: boolean;
}
```

### useClickOutside

Hook to detect clicks outside a referenced element.

#### Import

```typescript
import { useClickOutside } from './hooks';
```

#### Usage

```typescript
const ref = useRef<HTMLDivElement>(null);

useClickOutside(ref, (event) => {
  console.log('Clicked outside!', event);
  // Handle outside click
});
```

#### Parameters

- `ref`: React ref object pointing to the element
- `handler`: Callback function executed on outside click

---

## Utility Functions

### Heatmap Utilities

#### extractDates

Extracts all unique dates from runtime data.

```typescript
import { extractDates } from './utils';

const dates = extractDates(data);
// Returns: string[] (sorted dates)
```

#### filterDatesByRange

Filters dates based on start and end date range.

```typescript
import { filterDatesByRange } from './utils';

const filtered = filterDatesByRange(
  allDates,
  '2024-01-01',
  '2024-01-31'
);
// Returns: string[] (filtered dates)
```

#### extractTimeSlots

Extracts time slots from the first available date.

```typescript
import { extractTimeSlots } from './utils';

const timeSlots = extractTimeSlots(data, dates);
// Returns: string[] (time values)
```

#### transformToHeatmapData

Transforms runtime data into heatmap data points.

```typescript
import { transformToHeatmapData } from './utils';

const heatmapData = transformToHeatmapData(data, filteredDates);
// Returns: HeatmapDataPoint[]
```

### Chart Utilities

#### createChartOptions

Creates ECharts configuration for the heatmap.

```typescript
import { createChartOptions } from './utils';

const options = createChartOptions(
  data,
  timeSlots,
  filteredDates,
  heatmapData,
  enableAnimation
);
// Returns: EChartsOption
```

#### createVisualMap

Creates visual map configuration for the heatmap.

```typescript
import { createVisualMap } from './utils';

const visualMap = createVisualMap(data);
// Returns: VisualMap configuration object
```

---

## Type Definitions

### Runtime Data Types

```typescript
interface RuntimeDataResponse {
  meta: RuntimeDataMeta;
  data: Record<string, RuntimeDataPoint[]>;
}

interface RuntimeDataPoint {
  time: string;
  rtsources: number;
  sys_volt: number;
  batt_curr: number;
  batt_volt: number;
  rect_curr: number;
  load_curr: number;
}

interface RuntimeSource {
  color: string;
  display: string;
  name: string;
  value: number;
  desc: string;
}
```

### Heatmap Data Types

```typescript
interface HeatmapDataPoint {
  timeIndex: number;
  dateIndex: number;
  value: number;
}
```

---

## Examples

### Complete Heatmap Implementation

```typescript
import Heatmap from './component/Heatmap';

function App() {
  return (
    <div>
      <Heatmap enableAnimation={true} />
    </div>
  );
}
```

### Custom Date Range Picker Usage

```typescript
import { useState } from 'react';
import DateRangePicker, { type DateRange } from './component/DateRangePicker';

function MyComponent() {
  const [range, setRange] = useState<DateRange>({ start: '', end: '' });
  const dates = ['2024-01-01', '2024-01-02', '2024-01-03'];

  return (
    <DateRangePicker
      availableDates={dates}
      value={range}
      onChange={setRange}
    />
  );
}
```

### Custom Download Button

```typescript
import DownloadButton from './component/DownloadButton';

function MyComponent() {
  const handleExport = () => {
    // Export logic
  };

  return (
    <DownloadButton
      options={[
        { label: 'Export PDF', onDownload: handleExport },
        { label: 'Export Excel', onDownload: handleExport },
      ]}
    />
  );
}
```

---

## Best Practices

1. **Always provide required props** - TypeScript will enforce this
2. **Use TypeScript types** - Import and use provided type definitions
3. **Handle loading/error states** - Components provide these states
4. **Memoize callbacks** - Use `useCallback` for event handlers
5. **Validate date ranges** - Ensure start ≤ end
6. **Clean up subscriptions** - Hooks handle cleanup automatically

---

For more information, see:
- [README.md](README.md) - Main documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [QUICK_START.md](QUICK_START.md) - Quick start guide

