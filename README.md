# Smart Energy Dashboard

A modern smart energy management frontend application built with React, Vite, and Tailwind CSS v4.  
It provides electricity price forecasting, trading center, and visualization analytics, designed for households or small energy users with solar or energy storage systems.

## Features
- **Electricity Price Forecasting**: Supports multi-range prediction and real vs. actual comparison charts.  
- **Energy Trading**: Includes trading panel, price refresh, profit estimation, and history tracking.  
- **Status & Statistics**: Displays current price, average, peak, and off-peak information cards.  
- **Data Visualization**: Responsive line and bar charts with interactive tooltips.  
- **Responsive Layout**: Optimized for both desktop and mobile devices.

## Tech Stack
- React 19 + React Router  
- Vite 7 (Development & Build Tool)  
- Tailwind CSS 4 (Based on PostCSS)  
- Recharts (Charts and Data Visualization)

## Project Structure
```
smart-energy-dashboard/
  smart-energy-dashboard/
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js
    public/
      vite.svg
    src/
      App.jsx
      main.jsx
      index.css
      components/
        Navbar.jsx
        Footer.jsx
        Hero.jsx
        Features.jsx
        About.jsx
      pages/
        Landing.jsx
        Dashboard.jsx
        Trading.jsx
```

## Installation & Setup
**Requirements:** Node.js >= 18 (LTS recommended)

1. Install dependencies  
```
npm install
```

2. Start the development server (default port: 5173)  
```
npm run dev
```

3. Build for production  
```
npm run build
```

4. Preview production build  
```
npm run preview
```

## Available Scripts
- `npm run dev`: Start local development  
- `npm run build`: Build production files (output to `dist/`)  
- `npm run preview`: Preview the built production version
