import { describe, expect, it } from "vitest";
import { CreateTripSchema, TripQueryParamsSchema } from "@/lib/schemas/trip";

describe("CreateTripSchema", () => {
  it("accepts a valid trip payload", () => {
    const result = CreateTripSchema.safeParse({
      title: "Summer Vacation",
      startDate: "2026-07-01",
      endDate: "2026-07-10",
      location: "Paris, France",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = CreateTripSchema.safeParse({
      title: "",
      startDate: "2026-07-01",
      endDate: "2026-07-10",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date format", () => {
    const result = CreateTripSchema.safeParse({
      title: "Trip",
      startDate: "07/01/2026",
      endDate: "2026-07-10",
    });
    expect(result.success).toBe(false);
  });
});

describe("TripQueryParamsSchema", () => {
  it("applies defaults when fields are omitted", () => {
    const result = TripQueryParamsSchema.parse({});
    expect(result).toEqual({
      page: 1,
      limit: 20,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  });

  it("coerces numeric strings for pagination", () => {
    const result = TripQueryParamsSchema.parse({ page: "2", limit: "50" });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
  });
});
