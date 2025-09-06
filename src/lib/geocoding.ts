import { MAPBOX_CONFIG } from './mapbox'

export interface GeocodingResult {
  lat: number
  lng: number
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface GeocodingError {
  error: string
  message: string
}

/**
 * Geocode an address using Mapbox Geocoding API
 * @param address - The address to geocode
 * @returns Promise with geocoding result or error
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult | GeocodingError> => {
  if (!MAPBOX_CONFIG.accessToken) {
    return {
      error: 'NO_ACCESS_TOKEN',
      message: 'Mapbox access token is not configured'
    }
  }

  if (!address || address.trim().length === 0) {
    return {
      error: 'INVALID_ADDRESS',
      message: 'Address cannot be empty'
    }
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?` +
      `access_token=${MAPBOX_CONFIG.accessToken}&` +
      `country=${MAPBOX_CONFIG.defaultCountry}&` +
      `types=address,poi&` +
      `limit=1&` +
      `language=en`
    )

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return {
        error: 'NO_RESULTS',
        message: 'No results found for the given address'
      }
    }

    const feature = data.features[0]
    const context = feature.context || []
    
    // Extract address components from context
    let city = ''
    let state = ''
    let zipCode = ''
    let country = ''
    
    context.forEach((item: Record<string, unknown>) => {
      if (item.id && typeof item.id === 'string' && item.id.startsWith('place.')) {
        city = item.text as string
      } else if (item.id && typeof item.id === 'string' && item.id.startsWith('region.')) {
        state = item.text as string
      } else if (item.id && typeof item.id === 'string' && item.id.startsWith('postcode.')) {
        zipCode = item.text as string
      } else if (item.id && typeof item.id === 'string' && item.id.startsWith('country.')) {
        country = item.text as string
      }
    })

    // Extract coordinates (Mapbox returns [lng, lat])
    const [lng, lat] = feature.center

    return {
      lat,
      lng,
      address: feature.place_name || address,
      city,
      state,
      zipCode,
      country
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return {
      error: 'GEOCODING_FAILED',
      message: error instanceof Error ? error.message : 'Unknown geocoding error'
    }
  }
}

/**
 * Geocode multiple addresses in batch
 * @param addresses - Array of addresses to geocode
 * @returns Promise with array of geocoding results
 */
export const geocodeAddresses = async (addresses: string[]): Promise<(GeocodingResult | GeocodingError)[]> => {
  const promises = addresses.map(address => geocodeAddress(address))
  return Promise.all(promises)
}

/**
 * Reverse geocode coordinates to get address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with reverse geocoding result
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<GeocodingResult | GeocodingError> => {
  if (!MAPBOX_CONFIG.accessToken) {
    return {
      error: 'NO_ACCESS_TOKEN',
      message: 'Mapbox access token is not configured'
    }
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?` +
      `access_token=${MAPBOX_CONFIG.accessToken}&` +
      `types=address,poi&` +
      `limit=1&` +
      `language=en`
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return {
        error: 'NO_RESULTS',
        message: 'No results found for the given coordinates'
      }
    }

    const feature = data.features[0]
    const context = feature.context || []
    
    // Extract address components from context
    let city = ''
    let state = ''
    let zipCode = ''
    let country = ''
    
    context.forEach((item: Record<string, unknown>) => {
      if (item.id && typeof item.id === 'string' && item.id.startsWith('place.')) {
        city = item.text as string
      } else if (item.id && typeof item.id === 'string' && item.id.startsWith('region.')) {
        state = item.text as string
      } else if (item.id && typeof item.id === 'string' && item.id.startsWith('postcode.')) {
        zipCode = item.text as string
      } else if (item.id && typeof item.id === 'string' && item.id.startsWith('country.')) {
        country = item.text as string
      }
    })

    return {
      lat,
      lng,
      address: feature.place_name || `${lat}, ${lng}`,
      city,
      state,
      zipCode,
      country
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return {
      error: 'REVERSE_GEOCODING_FAILED',
      message: error instanceof Error ? error.message : 'Unknown reverse geocoding error'
    }
  }
}
