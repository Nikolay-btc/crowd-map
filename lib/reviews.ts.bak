export type ReviewBadge = { id: string; label: string; emoji: string };

export const REVIEW_BADGES: ReviewBadge[] = [
  { id: "firestarter", label: "Человек-зажигалка", emoji: "🔥" },
  { id: "right-drink", label: "Пьёт что надо", emoji: "🍻" },
  { id: "karaoke", label: "Тянет караоке", emoji: "🎤" },
  { id: "dancefloor", label: "Король танцпола", emoji: "🕺" },
  { id: "memelord", label: "Мемолог", emoji: "😂" },
  { id: "dj-soul", label: "DJ души компании", emoji: "🎶" },
  { id: "organizer", label: "Заводила", emoji: "🎯" },
  { id: "optimist", label: "Никогда не ноет", emoji: "🥂" },
  { id: "wingman", label: "Всегда выведет на движ", emoji: "🤝" },
  { id: "top", label: "Просто топ", emoji: "🌟" }
];

export function findBadge(id: string) {
  return REVIEW_BADGES.find(b => b.id === id);
}