const STATUS_KEY = "status:v1";
const REVIEWS_KEY = "reviews:v1";

export type StatusMap = Record<string, string>;
export type ReviewsMap = Record<string, string[]>;

const readJson = <T>(k: string, fallback: T): T => {
  try {
    const txt = localStorage.getItem(k);
    if (!txt) return fallback;
    return JSON.parse(txt) as T;
  } catch { return fallback; }
};

const writeJson = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));

export const getStatusForUser = (id: string) => readJson<StatusMap>(STATUS_KEY, {})[id] ?? "";
export const setStatusForUser = (id: string, status: string) => {
  const map = readJson<StatusMap>(STATUS_KEY, {});
  map[id] = status;
  writeJson(STATUS_KEY, map);
  document.dispatchEvent(new Event("profile:changed"));
};

export const getReviewsForUser = (id: string) => readJson<ReviewsMap>(REVIEWS_KEY, {})[id] ?? [];
export const addReview = (id: string, badgeId: string) => {
  const map = readJson<ReviewsMap>(REVIEWS_KEY, {});
  const arr = map[id] ?? [];
  if (!arr.includes(badgeId)) arr.push(badgeId);
  map[id] = arr;
  writeJson(REVIEWS_KEY, map);
  document.dispatchEvent(new Event("profile:changed"));
};
export const removeReview = (id: string, badgeId: string) => {
  const map = readJson<ReviewsMap>(REVIEWS_KEY, {});
  map[id] = (map[id] ?? []).filter(x => x !== badgeId);
  writeJson(REVIEWS_KEY, map);
  document.dispatchEvent(new Event("profile:changed"));
};