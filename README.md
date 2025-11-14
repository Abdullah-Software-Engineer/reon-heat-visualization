# Runtime Report 2.0 - Heat Visualization Application

A modern, interactive web application for visualizing runtime data in an intuitive heatmap format. This application provides real-time monitoring, date range filtering, and data export capabilities for runtime source analysis.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Component Documentation](#component-documentation)
- [Development Guide](#development-guide)
- [Build & Deployment](#build--deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Runtime Report 2.0 is a React-based single-page application designed to visualize runtime source data through an interactive heatmap. The application displays time-series data across multiple dates, allowing users to:

- View runtime source patterns over time
- Filter data by date ranges
- Export visualizations as images
- Download raw data as CSV files
- Monitor real-time updates with automatic polling

The heatmap uses color-coded cells to represent different runtime sources (Battery, Solar, Genset, and their combinations), making it easy to identify patterns and anomalies in power system operations.

## ✨ Features

### Core Functionality

- **Interactive Heatmap Visualization**
  - Color-coded cells representing different runtime sources
  - Interactive tooltips with detailed information
  - Zoom and pan capabilities for large datasets
  - Smooth animations for data updates

- **Date Range Filtering**
  - Intuitive date range picker
  - Filter data by custom date ranges
  - Automatic initialization with available date range
  - Reset functionality

- **Data Export**
  - Download heatmap as high-resolution PNG image
  - Export filtered data as CSV file
  - Customizable filenames with date range

- **Real-time Updates**
  - Automatic data polling (configurable interval)
  - Silent background updates
  - Smart change detection to prevent unnecessary re-renders
  - Manual refresh capability

- **User Experience**
  - Responsive design with Tailwind CSS
  - Loading states and error handling
  - 404 page for invalid routes
  - Smooth transitions and animations

## 🛠 Technology Stack

### Core Technologies

- **React 19.2.0** - Modern UI library with hooks
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.2.2** - Fast build tool and dev server

### UI & Visualization

- **ECharts 5.4.3** - Powerful charting library
- **echarts-for-react 3.0.5** - React wrapper for ECharts
- **Tailwind CSS 4.1.17** - Utility-first CSS framework

### Routing

- **React Router DOM 6.30.2** - Client-side routing

### Development Tools

- **ESLint 9.39.1** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite React Plugin** - React Fast Refresh support

## 📁 Project Structure

```
reon-heat-visualization/
├── public/                 # Static assets
│   ├── runtime-data.json   # Runtime data file
│   └── vite.svg           # Vite logo
├── src/
│   ├── _api/              # API mock data
│   │   └── runtime-data.json
│   ├── api/               # API layer
│   │   ├── index.ts       # API exports
│   │   ├── services/      # API services
│   │   │   └── runtime-data.service.ts
│   │   └── types/         # API type definitions
│   │       └── runtime-data.types.ts
│   ├── component/         # React components
│   │   ├── DateRangePicker.tsx
│   │   ├── DownloadButton.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Heatmap.tsx
│   │   └── Icons.tsx
│   ├── hooks/             # Custom React hooks
│   │   ├── index.ts
│   │   ├── useClickOutside.ts
│   │   └── useRuntimeData.ts
│   ├── page/              # Page components
│   │   ├── Home.tsx
│   │   └── NotFound.tsx
│   ├── route/             # Route configuration
│   │   └── index.tsx
│   ├── types/             # TypeScript type definitions
│   │   └── echarts-for-react.d.ts
│   ├── utils/             # Utility functions
│   │   ├── chart.utils.ts
│   │   ├── heatmap.utils.ts
│   │   └── index.ts
│   ├── App.tsx            # Root component
│   ├── App.css            # App styles
│   ├── index.css          # Global styles
│   └── main.tsx           # Application entry point
├── dist/                  # Build output directory
├── node_modules/          # Dependencies
├── .gitignore
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML template
├── package.json           # Project dependencies
├── package-lock.json      # Dependency lock file
├── tsconfig.json          # TypeScript configuration
├── tsconfig.app.json      # App-specific TS config
├── tsconfig.node.json     # Node-specific TS config
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher) or **yarn**

### Installation Steps

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd reon-heat-visualization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   Create a `.env` file in the root directory:
   ```env
   VITE_API_ENDPOINT=/runtime-data.json
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check code quality

## 📖 Usage

### Basic Usage

1. **View the Heatmap**
   - The application automatically loads runtime data on startup
   - The heatmap displays all available dates by default
   - Each cell represents a runtime source at a specific time and date

2. **Filter by Date Range**
   - Click on the date range picker in the top-right corner
   - Select a start date and end date
   - Click "Done" to apply the filter
   - Click "Reset" to restore the full date range

3. **Interact with the Chart**
   - **Hover** over cells to see detailed tooltips
   - **Scroll** to zoom in/out on the chart
   - **Click and drag** to pan across the chart
   - Use mouse wheel for vertical/horizontal scrolling

4. **Export Data**
   - Click the download button (top-right)
   - Select "Download Image" to save the heatmap as PNG
   - Select "Download Data" to export filtered data as CSV

### Understanding the Heatmap

- **X-Axis**: Time slots (typically hourly intervals)
- **Y-Axis**: Dates (sorted chronologically)
- **Colors**: Represent different runtime sources:
  - Gray (#808080) - Unknown
  - Cyan (#23CFE5) - Battery
  - Yellow (#FFED00) - Solar
  - Green (#809A56) - Battery Solar
  - Red (#FF0000) - Genset
  - Purple (#802456) - Genset Battery
  - Orange (#FF7700) - Genset Solar
  - Pink (#FF00FF) - Genset Solar Battery

## 📚 API Documentation

### Data Structure

The application expects runtime data in the following JSON format:

```typescript
interface RuntimeDataResponse {
  meta: {
    sources: RuntimeSource[];
  };
  data: Record<string, RuntimeDataPoint[]>;
}

interface RuntimeSource {
  color: string;      // Hex color code
  display: string;    // Display name
  name: string;       // Internal name
  value: number;      // Numeric identifier
  desc: string;       // Description
}

interface RuntimeDataPoint {
  time: string;       // Time in HH:MM format
  rtsources: number; // Runtime source value
  sys_volt: number;  // System voltage
  batt_curr: number;  // Battery current
  batt_volt: number;  // Battery voltage
  rect_curr: number;  // Rectifier current
  load_curr: number;  // Load current
}
```

### API Service

#### `fetchRuntimeData(skipCache?: boolean): Promise<RuntimeDataResponse>`

Fetches runtime data from the configured endpoint.

**Parameters:**
- `skipCache` (optional): If `true`, adds cache-busting parameters. Default: `true`

**Returns:** Promise resolving to `RuntimeDataResponse`

**Example:**
```typescript
import { fetchRuntimeData } from './api';

const data = await fetchRuntimeData();
console.log(data.meta.sources);
```

### Custom Hooks

#### `useRuntimeData(options?: UseRuntimeDataOptions)`

Custom hook for fetching and managing runtime data with polling support.

**Parameters:**
```typescript
interface UseRuntimeDataOptions {
  enablePolling?: boolean;    // Enable automatic polling (default: true)
  pollingInterval?: number;   // Polling interval in ms (default: 30000)
}
```

**Returns:**
```typescript
interface UseRuntimeDataReturn {
  data: RuntimeDataResponse | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  isPolling: boolean;
}
```

**Example:**
```typescript
import { useRuntimeData } from './hooks';

function MyComponent() {
  const { data, loading, error, refetch } = useRuntimeData({
    enablePolling: true,
    pollingInterval: 60000, // 1 minute
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Use data */}</div>;
}
```

#### `useClickOutside(ref, handler)`

Custom hook to detect clicks outside a referenced element.

**Parameters:**
- `ref`: React ref object
- `handler`: Callback function executed on outside click

**Example:**
```typescript
import { useRef } from 'react';
import { useClickOutside } from './hooks';

function Dropdown() {
  const ref = useRef<HTMLDivElement>(null);
  
  useClickOutside(ref, () => {
    console.log('Clicked outside!');
  });
  
  return <div ref={ref}>Content</div>;
}
```

## 🧩 Component Documentation

### Heatmap Component

Main component for rendering the interactive heatmap visualization.

**Props:**
```typescript
interface HeatmapProps {
  enableAnimation?: boolean; // Enable chart animations (default: true)
}
```

**Features:**
- Automatic data fetching and updates
- Date range filtering
- Export functionality
- Loading and error states

### DateRangePicker Component

Component for selecting date ranges.

**Props:**
```typescript
interface DateRangePickerProps {
  availableDates: string[];    // Array of available dates
  value: DateRange;             // Current date range
  onChange: (range: DateRange) => void; // Change handler
  placeholder?: string;          // Placeholder text
  className?: string;            // Additional CSS classes
}
```

**Usage:**
```typescript
<DateRangePicker
  availableDates={dates}
  value={dateRange}
  onChange={setDateRange}
  placeholder="Select date range"
/>
```

### DownloadButton Component

Button component with dropdown menu for download options.

**Props:**
```typescript
interface DownloadButtonProps {
  options: DownloadOption[];    // Array of download options
  className?: string;            // Additional CSS classes
}

interface DownloadOption {
  label: string;                 // Option label
  onDownload: () => void;        // Download handler
}
```

**Usage:**
```typescript
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

### Dropdown Component

Reusable dropdown menu component.

**Props:**
```typescript
interface DropdownProps {
  trigger: ReactNode;            // Trigger element
  options: DropdownOption[];     // Dropdown options
  isOpen: boolean;               // Open state
  onToggle: (isOpen: boolean) => void; // Toggle handler
  onSelect?: (option: DropdownOption) => void; // Selection handler
  placement?: 'left' | 'right' | 'center'; // Placement
  className?: string;            // Additional CSS classes
}
```

## 🔧 Development Guide

### Code Style

- Use TypeScript for all new files
- Follow React hooks best practices
- Use functional components
- Prefer named exports over default exports
- Use meaningful variable and function names

### Adding New Features

1. **Create new components** in `src/component/`
2. **Add utility functions** in `src/utils/`
3. **Create custom hooks** in `src/hooks/`
4. **Add new routes** in `src/route/index.tsx`
5. **Update types** in respective `types/` directories

### Testing

While no test framework is currently configured, consider adding:
- **Vitest** for unit testing
- **React Testing Library** for component testing
- **Playwright** or **Cypress** for E2E testing

### Performance Optimization

- The application uses `useMemo` and `useCallback` to prevent unnecessary re-renders
- Large datasets (>10,000 points) disable animations automatically
- Data polling uses silent mode to avoid UI disruption
- Chart rendering uses canvas for better performance

## 🏗 Build & Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. **Deploy the `dist/` directory** to your hosting service

### Deployment Options

- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: Cloudflare, AWS CloudFront
- **Server**: Nginx, Apache (serve static files)

### Environment Variables

Set the following environment variables for production:

```env
VITE_API_ENDPOINT=https://api.example.com/runtime-data.json
```

## ⚙️ Configuration

### Vite Configuration

The `vite.config.ts` file configures:
- React plugin for Fast Refresh
- Tailwind CSS plugin
- Build optimizations

### TypeScript Configuration

- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - Application-specific settings
- `tsconfig.node.json` - Node.js-specific settings

### ESLint Configuration

ESLint is configured with:
- React hooks rules
- React refresh rules
- TypeScript support

## 🐛 Troubleshooting

### Common Issues

1. **Data not loading**
   - Check that `runtime-data.json` exists in `public/` directory
   - Verify the API endpoint in environment variables
   - Check browser console for errors

2. **Chart not rendering**
   - Ensure ECharts is properly installed
   - Check that data format matches expected structure
   - Verify date range is valid

3. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run build`
   - Verify all dependencies are installed

4. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check that CSS files are imported
   - Verify Tailwind classes are not purged in production

### Performance Issues

- For large datasets, consider:
  - Reducing the date range
  - Disabling animations
  - Increasing polling interval
  - Implementing data pagination

## 📝 License

This project is private and proprietary.

## 👥 Authors

Developed as part of a frontend assessment project.

## 🔄 Version History

- **v0.0.0** - Initial release
  - Basic heatmap visualization
  - Date range filtering
  - Data export functionality
  - Real-time polling

---

**Note**: This documentation is maintained as part of the project. For questions or issues, please refer to the development team.
