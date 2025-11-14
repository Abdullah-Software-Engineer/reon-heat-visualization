# Quick Start Guide

## Getting Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Open Browser

Navigate to `http://localhost:5173`

That's it! The application should now be running.

## What You'll See

1. **Loading State**: Brief loading message while data is fetched
2. **Heatmap**: Interactive chart showing runtime data
3. **Date Range Picker**: Top-right corner for filtering dates
4. **Download Button**: Export options for image and data

## Common Tasks

### Filter Data by Date Range

1. Click the date range picker (shows "YYYY-MM-DD ~ YYYY-MM-DD")
2. Select a start date
3. Select an end date
4. Click "Done"

### Export Heatmap as Image

1. Click the download button (top-right)
2. Select "Download Image"
3. PNG file will be downloaded

### Export Data as CSV

1. Click the download button
2. Select "Download Data"
3. CSV file will be downloaded with filtered data

### Interact with Chart

- **Hover**: See detailed tooltip
- **Scroll**: Zoom in/out
- **Click & Drag**: Pan across chart

## Troubleshooting

### Port Already in Use

If port 5173 is busy, Vite will automatically use the next available port. Check the terminal for the actual URL.

### Data Not Loading

1. Ensure `public/runtime-data.json` exists
2. Check browser console for errors
3. Verify file format matches expected structure

### Build Errors

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Explore the codebase in `src/` directory

## Development Commands

```bash
# Development
npm run dev          # Start dev server

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check code quality
```

## Project Structure Overview

```
src/
├── component/       # Reusable UI components
├── page/           # Page components
├── hooks/          # Custom React hooks
├── api/            # API services
├── utils/          # Utility functions
└── route/          # Route configuration
```

## Need Help?

- Check the main [README.md](README.md)
- Review component documentation
- Check browser console for errors
- Verify all dependencies are installed

