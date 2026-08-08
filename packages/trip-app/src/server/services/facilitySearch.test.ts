/**
 * src/server/services/facilitySearch.test.ts
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { searchFacilitiesByKeyword } from "./facilitySearch";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("searchFacilitiesByKeyword", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes YOLP Feature entries into FacilitySearchResult", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        Feature: [
          {
            Name: "東京タワー",
            Property: {
              Address: "東京都港区芝公園4-2-8",
              Tel1: "03-3433-5111",
              Url: "https://www.tokyotower.co.jp/",
            },
            Geometry: { Coordinates: "139.745433,35.658581" },
          },
        ],
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchFacilitiesByKeyword("東京タワー", "test-app-id");

    expect(results).toEqual([
      {
        name: "東京タワー",
        address: "東京都港区芝公園4-2-8",
        phone: "03-3433-5111",
        url: "https://www.tokyotower.co.jp/",
        lat: 35.658581,
        lng: 139.745433,
      },
    ]);

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestedUrl.origin + requestedUrl.pathname).toBe(
      "https://map.yahooapis.jp/search/local/V1/localSearch"
    );
    expect(requestedUrl.searchParams.get("appid")).toBe("test-app-id");
    expect(requestedUrl.searchParams.get("query")).toBe("東京タワー");
  });

  it("returns an empty array when the response has no Feature list", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({})));

    const results = await searchFacilitiesByKeyword("該当なし", "test-app-id");

    expect(results).toEqual([]);
  });

  it("falls back to null lat/lng when coordinates are missing or malformed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          Feature: [{ Name: "座標なし施設", Property: {} }],
        })
      )
    );

    const results = await searchFacilitiesByKeyword("座標なし", "test-app-id");

    expect(results).toEqual([
      { name: "座標なし施設", address: null, phone: null, url: null, lat: null, lng: null },
    ]);
  });

  it("throws when the API responds with a non-2xx status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ Error: "invalid" }, 401)));

    await expect(searchFacilitiesByKeyword("query", "bad-app-id")).rejects.toThrow();
  });

  it("throws when the response body is not valid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json", { status: 200 })));

    await expect(searchFacilitiesByKeyword("query", "test-app-id")).rejects.toThrow();
  });
});
