import { describe, expect, it } from "vitest";
import { shiftEndTime } from "./calendarLayout";

describe("shiftEndTime", () => {
  it("shifts endTime by the same delta the start time moved forward", () => {
    expect(shiftEndTime("10:00", "11:00", "12:00")).toBe("13:00");
  });

  it("shifts endTime by the same delta the start time moved backward", () => {
    expect(shiftEndTime("10:00", "09:30", "12:00")).toBe("11:30");
  });

  it("clamps the shifted endTime to the end of the day", () => {
    expect(shiftEndTime("22:00", "23:50", "23:50")).toBe("23:50");
  });
});
