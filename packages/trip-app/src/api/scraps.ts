/**
 * src/api/scraps.ts
 *
 * Scraps API query functions.
 */

import { apiClient } from "./client";

export interface ScrapInput {
  content?: string | null;
  imageData?: string | null;
  tags?: string[];
}

/**
 * Fetch all scraps (newest first).
 */
export async function fetchScraps() {
  const res = await apiClient.api.scraps.$get();
  if (!res.ok) {
    throw new Error("Failed to fetch scraps");
  }
  return res.json();
}

/**
 * Create a scrap.
 */
export async function createScrap(data: ScrapInput) {
  const res = await apiClient.api.scraps.$post({ json: data });
  if (!res.ok) {
    throw new Error("Failed to create scrap");
  }
  return res.json();
}

/**
 * Update a scrap.
 */
export async function updateScrap(scrapId: string, data: ScrapInput) {
  const res = await apiClient.api.scraps[":scrapId"].$put({
    param: { scrapId },
    json: data,
  });
  if (!res.ok) {
    throw new Error("Failed to update scrap");
  }
  return res.json();
}

/**
 * Delete a scrap.
 */
export async function deleteScrap(scrapId: string) {
  const res = await apiClient.api.scraps[":scrapId"].$delete({
    param: { scrapId },
  });
  if (!res.ok) {
    throw new Error("Failed to delete scrap");
  }
  return res.json();
}
