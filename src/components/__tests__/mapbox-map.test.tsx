import { render, screen } from '@testing-library/react'
import { MapboxMap } from '../mapbox-map'
import { SearchResult } from '@/types'

// Mock react-map-gl
jest.mock('react-map-gl/mapbox', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="mapbox-map" {...props}>
      {children}
    </div>
  ),
  Marker: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  ),
  Popup: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  ),
  NavigationControl: () => <div data-testid="navigation-control" />,
  FullscreenControl: () => <div data-testid="fullscreen-control" />,
  ScaleControl: () => <div data-testid="scale-control" />,
  GeolocateControl: () => <div data-testid="geolocate-control" />,
}))

// Mock mapbox configuration
jest.mock('@/lib/mapbox', () => ({
  MAPBOX_CONFIG: {
    accessToken: 'test-token',
    style: 'mapbox://styles/mapbox/streets-v12',
    defaultCenter: [-122.4194, 37.7749],
    defaultZoom: 12,
    maxZoom: 18,
    minZoom: 10
  },
  MAP_MARKERS: {
    provider: { size: 40, color: '#3B82F6', borderColor: '#FFFFFF', borderWidth: 2 },
    selected: { size: 50, color: '#EF4444', borderColor: '#FFFFFF', borderWidth: 3 },
    hover: { size: 45, color: '#8B5CF6', borderColor: '#FFFFFF', borderWidth: 2 }
  }
}))

const mockResults: SearchResult[] = [
  {
    provider: {
      id: '1',
      userId: 'user1',
      businessName: 'Happy Paws Grooming',
      description: 'Professional pet grooming',
      services: ['grooming'],
      location: {
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        coordinates: { lat: 37.7749, lng: -122.4194 }
      },
      rating: 4.9,
      reviewCount: 127,
      priceRange: { min: 45, max: 85 },
      availability: {
        monday: [{ start: '09:00', end: '17:00', available: true }],
        tuesday: [{ start: '09:00', end: '17:00', available: true }],
        wednesday: [{ start: '09:00', end: '17:00', available: true }],
        thursday: [{ start: '09:00', end: '17:00', available: true }],
        friday: [{ start: '09:00', end: '17:00', available: true }],
        saturday: [{ start: '10:00', end: '16:00', available: true }],
        sunday: []
      },
      images: ['/placeholder-grooming.jpg'],
      certifications: ['Certified Pet Groomer'],
      experience: 10,
      status: 'active',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    services: [],
    distance: 2.3
  }
]

describe('MapboxMap', () => {
  it('renders map with markers', () => {
    render(<MapboxMap results={mockResults} />)
    
    expect(screen.getByTestId('mapbox-map')).toBeInTheDocument()
    expect(screen.getByTestId('marker')).toBeInTheDocument()
    expect(screen.getByTestId('navigation-control')).toBeInTheDocument()
  })

  it('shows controls when showControls is true', () => {
    render(<MapboxMap results={mockResults} showControls={true} />)
    
    expect(screen.getByTestId('navigation-control')).toBeInTheDocument()
    expect(screen.getByTestId('fullscreen-control')).toBeInTheDocument()
    expect(screen.getByTestId('scale-control')).toBeInTheDocument()
    expect(screen.getByTestId('geolocate-control')).toBeInTheDocument()
  })

  it('hides controls when showControls is false', () => {
    render(<MapboxMap results={mockResults} showControls={false} />)
    
    expect(screen.queryByText('Search')).not.toBeInTheDocument()
    expect(screen.queryByText('Filters')).not.toBeInTheDocument()
  })

  it('displays fallback when no access token', () => {
    // Mock empty access token
    jest.doMock('@/lib/mapbox', () => ({
      MAPBOX_CONFIG: {
        accessToken: '',
        style: 'mapbox://styles/mapbox/streets-v12',
        defaultCenter: [-122.4194, 37.7749],
        defaultZoom: 12,
        maxZoom: 18,
        minZoom: 10
      }
    }))

    render(<MapboxMap results={mockResults} />)
    
    expect(screen.getByText('Map Unavailable')).toBeInTheDocument()
    expect(screen.getByText('Please add your Mapbox access token to environment variables')).toBeInTheDocument()
  })
})
