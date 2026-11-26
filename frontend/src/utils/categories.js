import { Scissors, Flower2, Utensils } from "lucide-react";

export const CATEGORIES = [
  {
    key: "barbershop",
    label: "Barbershops",
    icon: Scissors,
    cover: "from-brand-500 to-brand-800",
    action: "Book Now",
    photo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "salon",
    label: "Beauty Salons",
    icon: Flower2,
    cover: "from-fuchsia-500 to-brand-700",
    action: "Book Now",
    photo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
  },
  {
    key: "restaurant",
    label: "Restaurants",
    icon: Utensils,
    cover: "from-accent-400 to-accent-600",
    action: "Order Food",
    photo: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export const getCategory = (key) => CATEGORIES.find((c) => c.key === key);