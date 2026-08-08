/**
 * src/api/scraps.ts
 *
 * Scraps API query functions.
 */

import { apiClient } from "./client";
import { unwrap, unwrapData } from "./unwrap";

export interface ScrapInput {
  content?: string | null;
  imageData?: string | null;
  tags?: string[];
}

/**
 * Fetch all scraps (newest first).
 */
export async function fetchScraps() {
  return unwrapData(await apiClient.api.scraps.$get(), "Failed to fetch scraps");
}

/**
 * Create a scrap.
 */
export async function createScrap(data: ScrapInput) {
  return unwrap(await apiClient.api.scraps.$post({ json: data }), "Failed to create scrap");
}

/**
 * Update a scrap.
 */
export async function updateScrap(scrapId: string, data: ScrapInput) {
  return unwrap(
    await apiClient.api.scraps[":scrapId"].$put({
      param: { scrapId },
      json: data,
    }),
    "Failed to update scrap"
  );
}

/**
 * Delete a scrap.
 */
export async function deleteScrap(scrapId: string) {
  return unwrap(
    await apiClient.api.scraps[":scrapId"].$delete({
      param: { scrapId },
    }),
    "Failed to delete scrap"
  );
}
