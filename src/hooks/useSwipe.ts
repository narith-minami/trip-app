import { useCallback, useRef } from "react";

interface UseSwipeOptions {
  threshold?: number;
}

export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  options: UseSwipeOptions = {}
) {
  const { threshold = 50 } = options;
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null || e.changedTouches.length === 0)
        return;
      const deltaX = e.changedTouches[0].clientX - startX.current;
      const deltaY = e.changedTouches[0].clientY - startY.current;
      startX.current = null;
      startY.current = null;

      if (Math.abs(deltaX) < threshold) return;
      // 縦スクロールの動きが横スワイプより大きい場合は無視する
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (deltaX < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return { onTouchStart, onTouchEnd };
}
