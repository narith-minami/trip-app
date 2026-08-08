/**
 * src/server/services/facilitySearch.ts
 *
 * Facility keyword search backed by Yahoo!ローカルサーチAPI (YOLP).
 * https://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/localsearch.html
 */

const LOCAL_SEARCH_ENDPOINT = "https://map.yahooapis.jp/search/local/V1/localSearch";

export interface FacilitySearchResult {
  name: string;
  address: string | null;
  phone: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
}

interface YahooLocalSearchFeature {
  Name?: string;
  Property?: {
    Address?: string;
    Tel1?: string;
    Url?: string;
  };
  Geometry?: {
    Coordinates?: string;
  };
}

interface YahooLocalSearchResponse {
  Feature?: YahooLocalSearchFeature[];
}

function parseCoordinates(coordinates: string | undefined): {
  lat: number | null;
  lng: number | null;
} {
  if (!coordinates) return { lat: null, lng: null };
  const [lonStr, latStr] = coordinates.split(",");
  const lon = Number(lonStr);
  const lat = Number(latStr);
  if (!Number.isFinite(lon) || !Number.isFinite(lat)) return { lat: null, lng: null };
  return { lat, lng: lon };
}

function toFacilitySearchResult(feature: YahooLocalSearchFeature): FacilitySearchResult {
  const { lat, lng } = parseCoordinates(feature.Geometry?.Coordinates);
  return {
    name: feature.Name ?? "",
    address: feature.Property?.Address ?? null,
    phone: feature.Property?.Tel1 ?? null,
    url: feature.Property?.Url ?? null,
    lat,
    lng,
  };
}

/**
 * Search facilities (stores, sights, etc.) by keyword via YOLP.
 * Throws on network failure, non-2xx response, or malformed JSON.
 */
export async function searchFacilitiesByKeyword(
  query: string,
  appId: string
): Promise<FacilitySearchResult[]> {
  const url = new URL(LOCAL_SEARCH_ENDPOINT);
  url.searchParams.set("appid", appId);
  url.searchParams.set("query", query);
  url.searchParams.set("output", "json");
  url.searchParams.set("results", "10");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YOLP local search failed with status ${response.status}`);
  }

  const data = (await response.json()) as YahooLocalSearchResponse;
  return (data.Feature ?? []).map(toFacilitySearchResult);
}
