export type ReviewBadge = { id: string; label: string; emoji: string };

export const REVIEW_BADGES: ReviewBadge[] = [
  { id: "vibe",        label: "life of the party", emoji: "🔥" },
  { id: "dance",       label: "dance lover",       emoji: "💃" },
  { id: "karaoke",     label: "karaoke pro",       emoji: "🎤" },
  { id: "sociable",    label: "super friendly",    emoji: "🫶" },
  { id: "organizer",   label: "organizer",         emoji: "📅" },
  { id: "chill",       label: "chill vibes",       emoji: "🧊" },
  { id: "funny",       label: "very funny",        emoji: "😄" },
  { id: "photo",       label: "photogenic",        emoji: "📸" },
  { id: "polite",      label: "very polite",       emoji: "🙇" },
  { id: "punctual",    label: "always on time",    emoji: "⏱️" },
];

export const findBadge = (id: string) => REVIEW_BADGES.find(b => b.id === id);