export type PlanetSummary = {
  name: string;
  diameter: string;
  terrain: string;
  population: string;
  rotation_period: string;
  orbital_period: string;
  climate: string;
  gravity: string;
  surface_water: string;
  residents: string[];
  films: string[];
  url: string;
};

type SwapiListResponse = {
  results: PlanetSummary[];
};

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function getPlanetIdFromUrl(url: string) {
  const match = url.match(/\/planets\/(\d+)\/?$/);
  return match ? match[1] : url;
}

export async function fetchPlanets(searchTerm: string, signal?: AbortSignal) {
  // Use URL so query params are always encoded correctly.
  const endpoint = new URL(`${API_BASE}/planets`, window.location.origin);
  if (searchTerm.trim()) {
    endpoint.searchParams.set('search', searchTerm.trim());
  }

  const response = await fetch(endpoint.toString(), { signal });
  if (!response.ok) {
    throw new Error('Failed to load planets.');
  }

  const data = (await response.json()) as SwapiListResponse;
  return data.results;
}

export async function fetchPlanetById(planetId: string, signal?: AbortSignal) {
  // Forward AbortSignal so route transitions can cancel pending requests.
  const response = await fetch(`${API_BASE}/planets/${planetId}`, { signal });
  if (!response.ok) {
    throw new Error('Failed to load planet details.');
  }

  return (await response.json()) as PlanetSummary;
}
