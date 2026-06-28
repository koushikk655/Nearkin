import { env, hasGoogleMapsConfig } from '../../config/env.js';
import { ConfigError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import type { GeoPoint, GeoProvider } from '../ports.js';

const GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

interface GoogleGeocodeResponse {
  status: string;
  results: Array<{
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }>;
}

/**
 * Google Maps Geocoding adapter (free $200/month credit). Implements the
 * GeoProvider seam over the Geocoding REST API. Wired and ready (e.g. for
 * address geocoding) even though no use-case consumes it yet.
 */
export class GoogleMapsGeoAdapter implements GeoProvider {
  readonly name = 'google-maps';

  isConfigured(): boolean {
    return hasGoogleMapsConfig;
  }

  private apiKey(): string {
    if (!hasGoogleMapsConfig || !env.GOOGLE_MAPS_API_KEY) {
      throw new ConfigError(
        'Google Maps is not configured. Set GOOGLE_MAPS_API_KEY. See SETUP_THIRD_PARTY.md.',
      );
    }
    return env.GOOGLE_MAPS_API_KEY;
  }

  async geocode(address: string): Promise<GeoPoint | null> {
    const url = `${GEOCODE_URL}?address=${encodeURIComponent(address)}&key=${this.apiKey()}`;
    const data = await this.request(url);
    const loc = data?.results[0]?.geometry.location;
    return loc ? { lat: loc.lat, lng: loc.lng } : null;
  }

  async reverseGeocode(point: GeoPoint): Promise<string | null> {
    const url = `${GEOCODE_URL}?latlng=${point.lat},${point.lng}&key=${this.apiKey()}`;
    const data = await this.request(url);
    return data?.results[0]?.formatted_address ?? null;
  }

  private async request(url: string): Promise<GoogleGeocodeResponse | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        logger.warn({ status: res.status }, 'Google Maps geocode HTTP error');
        return null;
      }
      const data = (await res.json()) as GoogleGeocodeResponse;
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        logger.warn({ status: data.status }, 'Google Maps geocode API returned non-OK status');
      }
      return data;
    } catch (err) {
      logger.error({ err }, 'Google Maps geocode request failed');
      return null;
    }
  }
}
