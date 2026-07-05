import { useEffect, useRef } from "react";
import type { ScheduleItem } from "@/types/entities";
import { timeToMinutes } from "./calendarLayout";

interface UseCalendarScrollOptions {
  getElement: () => HTMLDivElement | null;
  items: ScheduleItem[];
  currentDate: string;
  pxPerMinRef: React.RefObject<number>;
  consumePendingScroll: () => number | null;
}

export function useCalendarScroll({
  getElement,
  items,
  currentDate,
  pxPerMinRef,
  consumePendingScroll,
}: UseCalendarScrollOptions) {
  const lastScrolledDateRef = useRef<string | null>(null);

  useEffect(() => {
    const el = getElement();
    if (!el) return;
    const pendingScroll = consumePendingScroll();
    if (pendingScroll !== null) {
      el.scrollTop = pendingScroll;
    }
  }, [consumePendingScroll, getElement]);

  useEffect(() => {
    const el = getElement();
    if (!el || !items.length) return;
    if (lastScrolledDateRef.current === currentDate) return;

    const dateItems = items.filter((i) => i.date === currentDate && i.startTime);
    if (dateItems.length === 0) {
      el.scrollTop = 9 * 60 * pxPerMinRef.current;
    } else {
      const firstMin = Math.min(...dateItems.map((i) => timeToMinutes(i.startTime)));
      el.scrollTop = Math.max(0, firstMin * pxPerMinRef.current - 80);
    }
    lastScrolledDateRef.current = currentDate;
  }, [currentDate, items, pxPerMinRef, getElement]);
}
