import { useEffect, useLayoutEffect, useRef, useState } from "react";

const MIN_PX_PER_MIN = 0.5;
const MAX_PX_PER_MIN = 3.0;

interface UsePinchZoomOptions {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  initialPxPerMin?: number;
}

export interface UsePinchZoomResult {
  pxPerMin: number;
  pxPerMinRef: React.RefObject<number>;
  consumePendingScroll: () => number | null;
}

interface PinchState {
  initialDist: number;
  initialPxPerMin: number;
  focalMinute: number;
  relativeCenterY: number;
}

function initPinchState(e: TouchEvent, el: HTMLDivElement, pxPerMin: number): PinchState | null {
  if (e.touches.length !== 2) return null;
  const t1 = e.touches[0];
  const t2 = e.touches[1];
  const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  if (dist === 0) return null;
  const centerY = (t1.clientY + t2.clientY) / 2;
  const relativeCenterY = centerY - el.getBoundingClientRect().top;
  const focalMinute = (el.scrollTop + relativeCenterY) / pxPerMin;
  return { initialDist: dist, initialPxPerMin: pxPerMin, focalMinute, relativeCenterY };
}

function calcPinchResult(
  e: TouchEvent,
  pinch: PinchState
): { newPxPerMin: number; newScrollTop: number } {
  const t1 = e.touches[0];
  const t2 = e.touches[1];
  const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  const ratio = dist / pinch.initialDist;
  const newPxPerMin = Math.min(
    MAX_PX_PER_MIN,
    Math.max(MIN_PX_PER_MIN, pinch.initialPxPerMin * ratio)
  );
  const newScrollTop = Math.max(0, pinch.focalMinute * newPxPerMin - pinch.relativeCenterY);
  return { newPxPerMin, newScrollTop };
}

export function usePinchZoom({
  scrollRef,
  initialPxPerMin = 1.5,
}: UsePinchZoomOptions): UsePinchZoomResult {
  const [pxPerMin, setPxPerMin] = useState(initialPxPerMin);
  const pxPerMinRef = useRef(initialPxPerMin);
  const pendingScrollRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const pinchRef = useRef<PinchState | null>(null);

  const consumePendingScroll = (): number | null => {
    const value = pendingScrollRef.current;
    pendingScrollRef.current = null;
    return value;
  };

  // Keep pxPerMinRef in sync with state for use in native event handlers
  useLayoutEffect(() => {
    pxPerMinRef.current = pxPerMin;
  }, [pxPerMin]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional – reads live value via pxPerMinRef
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      pinchRef.current = initPinchState(e, el, pxPerMinRef.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      if (rafRef.current !== null) return;
      const { newPxPerMin, newScrollTop } = calcPinchResult(e, pinchRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        pendingScrollRef.current = newScrollTop;
        setPxPerMin(newPxPerMin);
      });
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { pxPerMin, pxPerMinRef, consumePendingScroll };
}
