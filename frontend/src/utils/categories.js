import { Scissors, Flower2, Utensils } from "lucide-react";

export const CATEGORIES = [
  { key: "barbershop", label: "Barbershops", icon: Scissors, cover: "from-brand-500 to-brand-800", action: "Book Now" },
  { key: "salon", label: "Beauty Salons", icon: Flower2, cover: "from-fuchsia-500 to-brand-700", action: "Book Now" },
  { key: "restaurant", label: "Restaurants", icon: Utensils, cover: "from-accent-400 to-accent-600", action: "Order Food" },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export const getCategory = (key) => CATEGORIES.find((c) => c.key === key);