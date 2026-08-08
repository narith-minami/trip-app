/**
 * src/mocks/api/scraps.ts
 *
 * Mock scraps API. CRUD over an in-memory list of standalone memos.
 * Mirrors the exported functions of src/api/scraps.ts (AGENTS.md #24).
 */

import type { Scrap, UserSummary } from "@/types/entities";
import type { ScrapInput } from "../../api/scraps";

const mockUser: UserSummary = {
  id: "user-1",
  name: "Dev User",
  email: "dev@example.com",
  image: null,
};

const otherUser: UserSummary = {
  id: "user-2",
  name: "Hanako",
  email: "hanako@example.com",
  image: null,
};

const now = Date.now();

const seed: Scrap[] = [
  {
    id: "scrap-1",
    content: "京都で見つけた小さな喫茶店。抹茶パフェが絶品だった。",
    imageData: null,
    authorId: "user-1",
    author: mockUser,
    tags: ["京都", "グルメ"],
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    updatedAt: now - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "scrap-2",
    content: "次の旅行で行きたい温泉宿のメモ。露天風呂付き客室が良さそう。",
    imageData: null,
    authorId: "user-2",
    author: otherUser,
    tags: ["温泉", "宿"],
    createdAt: now - 1 * 24 * 60 * 60 * 1000,
    updatedAt: now - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "scrap-3",
    content: "パッキングリスト：モバイルバッテリー、変換プラグ、常備薬。",
    imageData: null,
    authorId: "user-1",
    author: mockUser,
    tags: ["持ち物"],
    createdAt: now - 3 * 60 * 60 * 1000,
    updatedAt: now - 3 * 60 * 60 * 1000,
  },
];

const scraps = structuredClone(seed);

function sortDesc(list: Scrap[]) {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export async function fetchScraps() {
  return sortDesc(scraps);
}

export async function createScrap(data: ScrapInput) {
  const ts = Date.now();
  const newScrap: Scrap = {
    id: `scrap-${ts}`,
    content: data.content?.trim() ? data.content : null,
    imageData: data.imageData ?? null,
    authorId: mockUser.id,
    author: mockUser,
    tags: [...new Set(data.tags ?? [])],
    createdAt: ts,
    updatedAt: ts,
  };
  scraps.push(newScrap);
  return newScrap;
}

export async function updateScrap(scrapId: string, data: ScrapInput) {
  const scrap = scraps.find((s) => s.id === scrapId);
  if (!scrap) throw new Error(`Scrap ${scrapId} not found`);

  scrap.content = data.content?.trim() ? data.content : null;
  scrap.imageData = data.imageData ?? null;
  scrap.tags = [...new Set(data.tags ?? [])];
  scrap.updatedAt = Date.now();
  return scrap;
}

export async function deleteScrap(scrapId: string) {
  const index = scraps.findIndex((s) => s.id === scrapId);
  if (index === -1) throw new Error(`Scrap ${scrapId} not found`);
  scraps.splice(index, 1);
  return { success: true };
}
