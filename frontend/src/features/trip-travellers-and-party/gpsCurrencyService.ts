// GPS and Geolocation Currency Detection Service for TripWallet (PS-08 Canonical)
import { CANONICAL_COUNTRIES, CANONICAL_CITIES, getCurrencyForCountry } from '../../data/canonicalReferences'

export interface DetectedLocationCurrency {
  countryName: string
  countryCode: string
  cityName: string
  currency: string
  currencySymbol: string
  source: 'gps' | 'timezone' | 'fallback'
  latitude?: number
  longitude?: number
  message?: string
}

// Canonical city coordinates for Haversine distance matching
const CITY_COORDINATES: Record<string, { lat: number; lng: number; country: string; city: string; currency: string; symbol: string }> = {
  cty_bangalore: { lat: 12.9716, lng: 77.5946, country: 'India', city: 'Bengaluru', currency: 'INR', symbol: '₹' },
  cty_delhi: { lat: 28.6139, lng: 77.209, country: 'India', city: 'New Delhi', currency: 'INR', symbol: '₹' },
  cty_mumbai: { lat: 19.076, lng: 72.8777, country: 'India', city: 'Mumbai', currency: 'INR', symbol: '₹' },
  cty_goa: { lat: 15.2993, lng: 74.124, country: 'India', city: 'Goa', currency: 'INR', symbol: '₹' },
  cty_paris: { lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris', currency: 'EUR', symbol: '€' },
  cty_rome: { lat: 41.9028, lng: 12.4964, country: 'Italy', city: 'Rome', currency: 'EUR', symbol: '€' },
  cty_milan: { lat: 45.4642, lng: 9.19, country: 'Italy', city: 'Milan', currency: 'EUR', symbol: '€' },
  cty_london: { lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London', currency: 'GBP', symbol: '£' },
  cty_zurich: { lat: 47.3769, lng: 8.5417, country: 'Switzerland', city: 'Zurich', currency: 'CHF', symbol: 'CHF' },
  cty_tokyo: { lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo', currency: 'JPY', symbol: '¥' },
  cty_dubai: { lat: 25.2048, lng: 55.2708, country: 'United Arab Emirates', city: 'Dubai', currency: 'AED', symbol: 'AED' },
  cty_singapore: { lat: 1.3521, lng: 103.8198, country: 'Singapore', city: 'Singapore', currency: 'SGD', symbol: 'S$' },
  cty_bangkok: { lat: 13.7563, lng: 100.5018, country: 'Thailand', city: 'Bangkok', currency: 'THB', symbol: '฿' },
  cty_newyork: { lat: 40.7128, lng: -74.006, country: 'United States', city: 'New York', currency: 'USD', symbol: '$' },
  cty_sydney: { lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney', currency: 'AUD', symbol: 'A$' },
}

// Haversine formula to compute great-circle distance in kilometers
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Fallback lookup using Browser TimeZone
export function detectFromTimezone(): DetectedLocationCurrency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    const matchingCity = CANONICAL_CITIES.find((c) => c.timezone.toLowerCase() === tz.toLowerCase())
    if (matchingCity) {
      const country = CANONICAL_COUNTRIES.find((cnt) => cnt.id === matchingCity.countryId)
      if (country) {
        return {
          countryName: country.name,
          countryCode: country.iso2,
          cityName: matchingCity.name,
          currency: country.defaultCurrency,
          currencySymbol: country.currencySymbol,
          source: 'timezone',
          message: `Detected via local timezone (${tz})`,
        }
      }
    }

    if (tz.includes('Kolkata') || tz.includes('India')) {
      return {
        countryName: 'India',
        countryCode: 'IN',
        cityName: 'Bengaluru',
        currency: 'INR',
        currencySymbol: '₹',
        source: 'timezone',
        message: 'Detected India via timezone',
      }
    }
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago')) {
      return {
        countryName: 'United States',
        countryCode: 'US',
        cityName: 'New York',
        currency: 'USD',
        currencySymbol: '$',
        source: 'timezone',
        message: 'Detected US via timezone',
      }
    }
    if (tz.includes('Paris') || tz.includes('Berlin') || tz.includes('Rome')) {
      return {
        countryName: 'France',
        countryCode: 'FR',
        cityName: 'Paris',
        currency: 'EUR',
        currencySymbol: '€',
        source: 'timezone',
        message: 'Detected Europe via timezone',
      }
    }
  } catch (e) {
    console.warn('Timezone detection error:', e)
  }

  return {
    countryName: 'India',
    countryCode: 'IN',
    cityName: 'Bengaluru',
    currency: 'INR',
    currencySymbol: '₹',
    source: 'fallback',
    message: 'Default canonical fallback (INR)',
  }
}

// Primary GPS / Geolocation detection with Timezone Fallback
export async function detectLocationAndCurrency(): Promise<DetectedLocationCurrency> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(detectFromTimezone())
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        let closestKey = ''
        let minDistance = Infinity

        for (const [key, city] of Object.entries(CITY_COORDINATES)) {
          const dist = getHaversineDistanceKm(latitude, longitude, city.lat, city.lng)
          if (dist < minDistance) {
            minDistance = dist
            closestKey = key
          }
        }

        if (closestKey && CITY_COORDINATES[closestKey]) {
          const match = CITY_COORDINATES[closestKey]
          resolve({
            countryName: match.country,
            countryCode: match.country === 'India' ? 'IN' : 'US',
            cityName: match.city,
            currency: match.currency,
            currencySymbol: match.symbol,
            source: 'gps',
            latitude,
            longitude,
            message: `📍 GPS locked: ${match.city}, ${match.country} (${Math.round(minDistance)} km away)`,
          })
        } else {
          resolve(detectFromTimezone())
        }
      },
      (err) => {
        console.warn('GPS location request warning/denied:', err.message)
        const tzFallback = detectFromTimezone()
        tzFallback.message = `Location access unavailable; detected via system timezone (${tzFallback.countryName})`
        resolve(tzFallback)
      },
      {
        timeout: 4000,
        enableHighAccuracy: true,
        maximumAge: 60000,
      }
    )
  })
}
