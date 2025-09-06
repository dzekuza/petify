export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  style: 'mapbox://styles/dzekuza/cm4ujxdlt000301safql0df3b',
  defaultCenter: [23.8813, 54.6872], // Vilnius, Lithuania
  defaultZoom: 12,
  maxZoom: 18,
  minZoom: 10,
  defaultCountry: 'LT' // Lithuania country code
}

export const MAP_STYLES = {
  custom: 'mapbox://styles/dzekuza/cm4ujxdlt000301safql0df3b',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11'
}

export const MAP_MARKERS = {
  provider: {
    size: 40,
    color: '#00A699', // Airbnb green
    borderColor: '#FFFFFF',
    borderWidth: 2
  },
  selected: {
    size: 50,
    color: '#FF5A5F', // Airbnb red
    borderColor: '#FFFFFF',
    borderWidth: 3
  },
  hover: {
    size: 45,
    color: '#00A699', // Airbnb green
    borderColor: '#FFFFFF',
    borderWidth: 2
  }
}
