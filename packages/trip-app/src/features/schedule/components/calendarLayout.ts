import type { ScheduleItem } from "@/types/entities";

export const PX_PER_MIN = 1.5;
export const SNAP_MIN = 10;

const COLORS = ["#FF6B47", "#4F7EF7", "#2EC4B6", "#E9C46A", "#9B5DE5", "#F77F00", "#06D6A0"];

export function eventColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

export function timeToMinutes(t: string | null | undefined): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m ?? 0);
}

export function minutesToTime(min: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 50, min));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const DOW = ["日", "月", "火", "水", "木", "金", "土"] as const;

export function formatDayHeading(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;
  const [y, mo, d] = parts;
  const date = new Date(y, mo - 1, d);
  if (Number.isNaN(date.getTime())) return dateStr;
  const dow = DOW[date.getDay()];
  return `${mo}/${d} (${dow})`;
}

export interface LayoutItem {
  item: ScheduleItem;
  col: number;
  numCols: number;
}

function getItemEnd(item: ScheduleItem): number {
  const start = timeToMinutes(item.startTime);
  return item.endTime ? timeToMinutes(item.endTime) : start + 60;
}

function buildClusters(sorted: ScheduleItem[]): ScheduleItem[][] {
  const clusters: ScheduleItem[][] = [];
  let currentCluster: ScheduleItem[] = [];
  let maxEnd = 0;

  for (const item of sorted) {
    const start = timeToMinutes(item.startTime);
    const end = getItemEnd(item);
    if (start >= maxEnd && currentCluster.length > 0) {
      clusters.push(currentCluster);
      currentCluster = [];
      maxEnd = 0;
    }
    currentCluster.push(item);
    maxEnd = Math.max(maxEnd, end);
  }
  if (currentCluster.length > 0) clusters.push(currentCluster);

  return clusters;
}

function placeCluster(
  cluster: ScheduleItem[]
): Array<{ item: ScheduleItem; col: number; numCols: number }> {
  const colEnds: number[] = [];
  const placed: Array<{ item: ScheduleItem; col: number }> = [];

  for (const item of cluster) {
    const start = timeToMinutes(item.startTime);
    const end = getItemEnd(item);
    let col = colEnds.findIndex((e) => e <= start);
    if (col === -1) {
      col = colEnds.length;
      colEnds.push(end);
    } else {
      colEnds[col] = end;
    }
    placed.push({ item, col });
  }

  const numCols = Math.max(1, colEnds.length);
  return placed.map((p) => ({ ...p, numCols }));
}

export function computeLayout(items: ScheduleItem[]): LayoutItem[] {
  const sorted = [...items].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  return buildClusters(sorted).flatMap(placeCluster);
}

export type PendingChange = { startTime: string; endTime: string };

export function computeDisplayItems(
  allDateItems: ScheduleItem[],
  deletedIds: Set<string>,
  pendingChanges: Map<string, PendingChange>
): ScheduleItem[] {
  return allDateItems
    .filter((i) => !deletedIds.has(i.id))
    .map((i) => {
      const pending = pendingChanges.get(i.id);
      if (!pending) return i;
      return { ...i, startTime: pending.startTime, endTime: pending.endTime };
    });
}
