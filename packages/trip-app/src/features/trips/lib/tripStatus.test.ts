import { describe, expect, it } from "vitest";
import { getTripStatus } from "@/features/trips/lib/tripStatus";

describe("getTripStatus", () => {
  const today = new Date(2026, 7, 8); // 2026-08-08

  it("returns upcoming with days remaining before the trip starts", () => {
    expect(getTripStatus("2026-08-11", "2026-08-15", today)).toEqual({
      type: "upcoming",
      label: "あと3日",
    });
  });

  it("returns ongoing on the start date", () => {
    expect(getTripStatus("2026-08-08", "2026-08-15", today)).toEqual({
      type: "ongoing",
      label: "開催中",
    });
  });

  it("returns ongoing between start and end date", () => {
    expect(getTripStatus("2026-08-01", "2026-08-15", today)).toEqual({
      type: "ongoing",
      label: "開催中",
    });
  });

  it("returns ongoing on the end date", () => {
    expect(getTripStatus("2026-08-01", "2026-08-08", today)).toEqual({
      type: "ongoing",
      label: "開催中",
    });
  });

  it("returns finished after the end date", () => {
    expect(getTripStatus("2026-07-01", "2026-08-07", today)).toEqual({
      type: "finished",
      label: "終了",
    });
  });
});
