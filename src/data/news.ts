export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  image?: string;
  tag?: string;
  time: string; // e.g. "2h ago"
};

export const NEWS_FEED: NewsItem[] = [
  {
    id: "n1",
    title: "HIIT boosts VO₂ max in just 4 weeks",
    excerpt: "Small study shows 3x/week HIIT improved aerobic capacity vs steady state cardio.",
    tag: "Research",
    time: "2h ago",
    image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "n2",
    title: "Protein timing: does it really matter?",
    excerpt: "Meta‑analysis suggests total daily protein > timing for muscle protein synthesis.",
    tag: "Nutrition",
    time: "6h ago",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200&auto=format&fit=crop"
  },
  {
    id: "n3",
    title: "Mobility routine for desk workers",
    excerpt: "5‑minute daily flow to open hips and t‑spine. No equipment required.",
    tag: "Mobility",
    time: "Yesterday",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1200&auto=format&fit=crop"
  }
];
