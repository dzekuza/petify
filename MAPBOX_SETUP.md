# Mapbox Integration Setup

This guide explains how to set up Mapbox maps in your Petify application.

## Prerequisites

1. Create a Mapbox account at [mapbox.com](https://mapbox.com)
2. Get your Mapbox access token from the
   [Mapbox account dashboard](https://account.mapbox.com/access-tokens/)

## Environment Setup

1. Create a `.env.local` file in your project root:

```bash
# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

2. Replace `your_mapbox_access_token_here` with your actual Mapbox access token.

## Features Included

### 🗺️ Interactive Map Component

- **MapboxMap**: Main map component with markers and popups
- **Multiple map styles**: Streets, Satellite, Light, and Dark themes
- **Responsive design**: Works on desktop and mobile devices
- **Custom markers**: Different icons for different service types

### 🎛️ Map Controls

- **Style selector**: Switch between different map styles
- **Search button**: For location-based searches
- **Filters button**: For filtering providers
- **Fullscreen mode**: Expand map to full screen
- **Navigation controls**: Zoom, pan, and geolocation

### 📍 Provider Markers

- **Service-specific icons**: Different emojis for grooming, veterinary,
  boarding, etc.
- **Interactive popups**: Click markers to see provider details
- **Hover effects**: Visual feedback on marker interaction
- **Selected state**: Highlight selected providers

### 🎨 Custom Styling

- **Tailwind integration**: Consistent with app design system
- **Custom CSS**: Enhanced popup and control styling
- **Responsive controls**: Scaled for mobile devices
- **Smooth animations**: Hover and selection effects

## Usage Example

```tsx
import { MapboxMap } from '@/components/mapbox-map'

function SearchPage() {
  const results = [...] // Your provider data
  
  return (
    <MapboxMap
      results={results}
      onMarkerClick={(result) => console.log('Clicked:', result)}
      onSearchClick={() => console.log('Search clicked')}
      onFiltersClick={() => console.log('Filters clicked')}
      showControls={true}
      className="h-96"
    />
  )
}
```

## Components

### MapboxMap

Main map component with all interactive features.

**Props:**

- `results`: Array of SearchResult objects
- `onMarkerClick`: Callback when marker is clicked
- `selectedProviderId`: ID of currently selected provider
- `onSearchClick`: Callback for search button
- `onFiltersClick`: Callback for filters button
- `showControls`: Whether to show map controls
- `className`: Additional CSS classes

### MapControls

Control panel with style selector, search, filters, and fullscreen buttons.

**Props:**

- `onStyleChange`: Callback when map style changes
- `onSearchClick`: Callback for search button
- `onFiltersClick`: Callback for filters button
- `onFullscreenClick`: Callback for fullscreen toggle
- `currentStyle`: Current map style
- `resultCount`: Number of results found

## Configuration

Map configuration is managed in `src/lib/mapbox.ts`:

```typescript
export const MAPBOX_CONFIG = {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "",
    style: "mapbox://styles/mapbox/streets-v12",
    defaultCenter: [-122.4194, 37.7749], // San Francisco
    defaultZoom: 12,
    maxZoom: 18,
    minZoom: 10,
};
```

## Troubleshooting

### Map Not Loading

1. Check that your Mapbox access token is correctly set in `.env.local`
2. Ensure the token has the correct permissions
3. Verify the environment variable is accessible:
   `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

### Styling Issues

1. Check that `mapbox-gl/dist/mapbox-gl.css` is imported
2. Verify custom CSS in `globals.css` is not conflicting
3. Ensure Tailwind classes are properly applied

### Performance

1. Limit the number of markers displayed at once
2. Use clustering for large datasets
3. Implement lazy loading for marker data

## Next Steps

- Add geocoding for address search
- Implement marker clustering for better performance
- Add custom map layers for service areas
- Integrate with real-time data updates
- Add route planning between providers

## Dependencies

- `mapbox-gl`: Core Mapbox GL JS library
- `react-map-gl`: React wrapper for Mapbox GL JS
- `@types/mapbox-gl`: TypeScript definitions

All dependencies are already installed and configured in the project.
