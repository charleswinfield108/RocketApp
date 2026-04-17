/**
 * Seed coordinates for restaurants.
 * The server API does not return lat/lng — these realistic Montreal-area
 * coordinates are assigned by restaurant ID for the map view.
 * IDs cycle through the pool for any ID not explicitly listed.
 */

export interface LatLng {
  latitude: number;
  longitude: number;
}

const COORDINATE_POOL: LatLng[] = [
  { latitude: 45.5017, longitude: -73.5673 }, // Downtown Montreal
  { latitude: 45.5088, longitude: -73.5540 }, // Plateau-Mont-Royal
  { latitude: 45.4950, longitude: -73.5780 }, // Old Montreal
  { latitude: 45.5231, longitude: -73.6057 }, // Mile End
  { latitude: 45.4837, longitude: -73.5764 }, // Griffintown
  { latitude: 45.5197, longitude: -73.5860 }, // Little Italy
  { latitude: 45.5143, longitude: -73.5341 }, // Rosemont
  { latitude: 45.4762, longitude: -73.5930 }, // Verdun
  { latitude: 45.5312, longitude: -73.6180 }, // Outremont
  { latitude: 45.4680, longitude: -73.7449 }, // LaSalle
];

export function getCoordinatesForRestaurant(id: number): LatLng {
  return COORDINATE_POOL[(id - 1) % COORDINATE_POOL.length];
}

// Initial map region centred on Montreal
export const MONTREAL_REGION = {
  latitude: 45.5017,
  longitude: -73.5673,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};
