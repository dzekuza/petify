# Updated Landing Page Structure

## New Landing Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Hero Section                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Search Form                            │   │
│  │  [Location] [Provider] [Date] [Search Button]      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Latest Section                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Latest                    [View All →]            │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │   │
│  │  │Card1│ │Card2│ │Card3│ │Card4│ │Card5│ │Card6│   │   │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Kirpyklos Section                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Kirpyklos              [View All →]               │   │
│  │  [←] ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ [→]          │   │
│  │      │Card1│ │Card2│ │Card3│ │Card4│              │   │
│  │      └─────┘ └─────┘ └─────┘ └─────┘              │   │
│  │      ● ○ ○ ○ (dots indicator)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Jūsų šuniui Section                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Jūsų šuniui           [View All →]                │   │
│  │  [←] ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ [→]          │   │
│  │      │Card1│ │Card2│ │Card3│ │Card4│              │   │
│  │      └─────┘ └─────┘ └─────┘ └─────┘              │   │
│  │      ● ○ ○ ○ (dots indicator)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Veterinarija Section                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Veterinarija           [View All →]               │   │
│  │  [←] ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ [→]          │   │
│  │      │Card1│ │Card2│ │Card3│ │Card4│              │   │
│  │      └─────┘ └─────┘ └─────┘ └─────┘              │   │
│  │      ● ○ ○ ○ (dots indicator)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Dresūra Section                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dresūra                [View All →]               │   │
│  │  [←] ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ [→]          │   │
│  │      │Card1│ │Card2│ │Card3│ │Card4│              │   │
│  │      └─────┘ └─────┘ └─────┘ └─────┘              │   │
│  │      ● ○ ○ ○ (dots indicator)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                Prižiūrėjimas Section                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Prižiūrėjimas          [View All →]               │   │
│  │  [←] ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ [→]          │   │
│  │      │Card1│ │Card2│ │Card3│ │Card4│              │   │
│  │      └─────┘ └─────┘ └─────┘ └─────┘              │   │
│  │      ● ○ ○ ○ (dots indicator)                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Key Features Implemented

### 1. ProviderSlider Component

- **Responsive Design**: Automatically adjusts items per view based on screen
  size
  - Mobile: 1 item
  - Small tablet: 2 items
  - Large tablet: 3 items
  - Desktop: 4 items
- **Navigation Controls**: Left/right arrow buttons for scrolling
- **Smooth Scrolling**: CSS smooth scroll behavior
- **Dots Indicator**: Shows current position and allows direct navigation
- **Auto-hide Controls**: Navigation buttons only show when there are more items
  than can fit
- **Scrollbar Hidden**: Clean appearance with hidden scrollbars

### 2. CategorySection Component

- **Dynamic Data Fetching**: Fetches providers by category from the API
- **Loading States**: Shows skeleton loading while fetching data
- **Error Handling**: Gracefully handles API errors
- **Configurable Limits**: Can limit the number of providers shown
- **View All Links**: Links to search page with category filter

### 3. Updated Hero Section

- **Multiple Categories**: Now includes 5 different service categories:
  - Latest (existing grid layout)
  - Kirpyklos (Grooming)
  - Jūsų šuniui (For your dog - Boarding)
  - Veterinarija (Veterinary)
  - Dresūra (Training)
  - Prižiūrėjimas (Sitting)
- **Consistent Spacing**: 12 units spacing between sections
- **Responsive Layout**: All sections adapt to different screen sizes

### 4. Technical Improvements

- **TypeScript Support**: Full type safety throughout
- **Performance Optimized**: Efficient rendering and state management
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Mobile-First**: Responsive design starting from mobile
- **Error Boundaries**: Graceful error handling

## Usage

The landing page now provides a much richer experience with:

- **Better Discovery**: Users can easily browse different service categories
- **Improved Navigation**: Slider controls make it easy to browse through
  providers
- **Visual Appeal**: Clean, modern design with smooth animations
- **Mobile Friendly**: Works perfectly on all device sizes

Each category section is independent and will show relevant providers based on
the service type, making it easy for users to find exactly what they're looking
for.
