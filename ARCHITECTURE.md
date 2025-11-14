# Architecture Documentation

## System Architecture

### Overview

Runtime Report 2.0 follows a modern, component-based architecture built on React with TypeScript. The application is structured to promote code reusability, maintainability, and scalability.

## Architecture Patterns

### 1. Component-Based Architecture

The application uses a hierarchical component structure:

```
App
└── Router
    └── Home
        └── Heatmap
            ├── DateRangePicker
            ├── DownloadButton
            │   └── Dropdown
            └── ReactECharts (ECharts)
```

### 2. Separation of Concerns

The codebase is organized into distinct layers:

- **Presentation Layer**: React components (`src/component/`, `src/page/`)
- **Business Logic Layer**: Custom hooks (`src/hooks/`)
- **Data Layer**: API services (`src/api/`)
- **Utility Layer**: Helper functions (`src/utils/`)

### 3. Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
Custom Hook (useRuntimeData)
    ↓
API Service (fetchRuntimeData)
    ↓
External API / JSON File
    ↓
Data Transformation (utils)
    ↓
Component State Update
    ↓
UI Re-render
```

## Key Design Decisions

### 1. Custom Hooks for State Management

Instead of using a global state management library (Redux, Zustand), the application uses:
- **Custom hooks** (`useRuntimeData`) for data fetching and polling
- **Local component state** for UI-specific state
- **React Context** (if needed in future) for shared state

**Rationale**: 
- Simpler for small to medium applications
- Reduces bundle size
- Easier to understand and maintain
- Sufficient for current requirements

### 2. Utility Functions for Data Transformation

Data transformation logic is separated into utility functions:
- `heatmap.utils.ts` - Data extraction and filtering
- `chart.utils.ts` - ECharts configuration

**Rationale**:
- Reusable across components
- Easier to test
- Clear separation of concerns
- Better code organization

### 3. TypeScript for Type Safety

All code is written in TypeScript with strict type checking.

**Benefits**:
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Easier refactoring

### 4. ECharts for Visualization

ECharts is used instead of D3.js or other libraries.

**Rationale**:
- Rich feature set out of the box
- Good performance for large datasets
- Built-in zoom/pan capabilities
- Active community and documentation
- React wrapper available

## Component Architecture

### Heatmap Component

**Responsibilities**:
- Orchestrate data fetching
- Manage date range state
- Coordinate child components
- Handle export functionality
- Render the chart

**State Management**:
- Uses `useRuntimeData` hook for data
- Local state for date range
- Memoized computations for performance

### DateRangePicker Component

**Responsibilities**:
- Display date selection UI
- Validate date ranges
- Initialize default range
- Handle user interactions

**Features**:
- Click-outside detection
- Date validation
- Reset functionality

### DownloadButton Component

**Responsibilities**:
- Provide download options
- Trigger download handlers
- Manage dropdown state

**Design Pattern**: Compound component with Dropdown

## Data Management

### Data Fetching Strategy

1. **Initial Load**: Fetch data on component mount
2. **Polling**: Automatic refresh at configured intervals
3. **Manual Refresh**: User-triggered refetch
4. **Change Detection**: Only update UI if data actually changed

### Caching Strategy

- No client-side caching (always fetch fresh data)
- Cache-busting query parameters
- HTTP cache headers disabled

### Error Handling

- Try-catch blocks in async functions
- Error state in hooks
- User-friendly error messages
- Silent error handling during polling

## Performance Optimizations

### 1. Memoization

- `useMemo` for expensive computations
- `useCallback` for event handlers
- Prevents unnecessary re-renders

### 2. Conditional Rendering

- Lazy loading of routes
- Conditional animation (disabled for large datasets)
- Early returns for loading/error states

### 3. Efficient Data Structures

- Indexed data access (O(1) lookups)
- Sorted arrays for date filtering
- Minimal data transformations

### 4. Chart Optimization

- Canvas rendering (better performance than SVG)
- Device pixel ratio optimization
- Conditional animations

## Security Considerations

### 1. Input Validation

- Date range validation
- Type checking with TypeScript
- Safe data access patterns

### 2. XSS Prevention

- React's built-in XSS protection
- No `dangerouslySetInnerHTML` usage
- Sanitized tooltip content

### 3. API Security

- Environment variables for endpoints
- No sensitive data in client code
- CORS considerations for production

## Scalability Considerations

### Current Limitations

- All data loaded into memory
- No pagination for large datasets
- Single API endpoint

### Future Improvements

1. **Data Pagination**
   - Load data in chunks
   - Virtual scrolling for dates
   - Progressive data loading

2. **State Management**
   - Consider Redux/Zustand for complex state
   - Context API for theme/settings

3. **Caching**
   - Service Worker for offline support
   - IndexedDB for large datasets
   - Smart cache invalidation

4. **Code Splitting**
   - Route-based code splitting (already implemented)
   - Component-level code splitting
   - Dynamic imports for heavy libraries

## Testing Strategy

### Unit Testing (Recommended)

- Test utility functions
- Test custom hooks
- Test component logic

### Integration Testing (Recommended)

- Test component interactions
- Test data flow
- Test API integration

### E2E Testing (Recommended)

- Test user workflows
- Test date filtering
- Test export functionality

## Deployment Architecture

### Build Process

1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. Static file generation

### Production Build

- Minified JavaScript
- Optimized CSS
- Tree-shaken dependencies
- Source maps (optional)

### Hosting

- Static file hosting
- CDN distribution
- Environment-specific configurations

## Future Enhancements

### Planned Features

1. **Advanced Filtering**
   - Filter by runtime source
   - Filter by voltage/current ranges
   - Multiple date range selection

2. **Visualization Enhancements**
   - Multiple chart types
   - Comparison views
   - Statistical overlays

3. **User Preferences**
   - Saved date ranges
   - Custom color schemes
   - Export preferences

4. **Performance**
   - Web Workers for data processing
   - WebGL rendering for very large datasets
   - Progressive loading

## Dependencies Overview

### Core Dependencies

- **React**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server

### UI Dependencies

- **ECharts**: Charting library
- **Tailwind CSS**: Styling framework
- **React Router**: Client-side routing

### Development Dependencies

- **ESLint**: Code quality
- **TypeScript ESLint**: TypeScript linting
- **Vite React Plugin**: React support

## Code Organization Principles

1. **Feature-based organization** (where applicable)
2. **Separation of concerns** (components, hooks, utils, API)
3. **Single Responsibility Principle**
4. **DRY (Don't Repeat Yourself)**
5. **Clear naming conventions**
6. **Comprehensive type definitions**

## Conclusion

The architecture is designed to be:
- **Maintainable**: Clear structure and separation of concerns
- **Scalable**: Can grow with additional features
- **Performant**: Optimized for current use case
- **Type-safe**: Full TypeScript coverage
- **Modern**: Uses latest React patterns and best practices

