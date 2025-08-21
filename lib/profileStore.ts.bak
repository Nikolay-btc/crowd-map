const STATUS_KEY = "status:v1";
const REVIEWS_KEY = "reviews:v1";

export type StatusMap = Record<string, string>;     // userId -> короткий статус
export type ReviewsMap = Record<string, string[]>;  // targetUserId -> [badgeId,...]

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

// STATUS
export function getStatus(userId: string): string {
  const map = read<StatusMap>(STATUS_KEY, {});
  return map[userId] || "";
}

export function setStatus(userId: string, status: string) {
  const map = read<StatusMap>(STATUS_KEY, {});
  map[userId] = (status || "").slice(0, 100);
  write(STATUS_KEY, map);
}

// REVIEWS (только позитивные бейджи)
export function getReviewsForUser(targetUserId: string): string[] {
  const map = read<ReviewsMap>(REVIEWS_KEY, {});
  return map[targetUserId] || [];
}

export function addReview(targetUserId: string, badgeId: string) {
  const map = read<ReviewsMap>(REVIEWS_KEY, {});
  const arr = map[targetUserId] || [];
  if (!arr.includes(badgeId)) arr.push(badgeId);
  map[targetUserId] = arr;
  write(REVIEWS_KEY, map);
}

export function removeReview(targetUserId: string, badgeId: string) {
  const map = read<ReviewsMap>(REVIEWS_KEY, {});
  const arr = (map[targetUserId] || []).filter(x => x !== badgeId);
  map[targetUserId] = arr;
  write(REVIEWS_KEY, map);
}