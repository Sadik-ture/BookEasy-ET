import "dotenv/config";
import mongoose from "mongoose";
import Business from "../modules/businesses/business.model.js";

const weekly = (open, close, closedDays = []) =>
  [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open, close, closed: closedDays.includes(day) }));

// Sample data for development. Ratings are placeholders, not real reviews.
const businesses = [
  // Barbershops
  {
    name: "Royal Cuts Barber Shop",
    slug: "royal-cuts-barber-shop",
    category: "barbershop",
    description: "Professional haircuts, beard styling and more.",
    phone: "+251 911 000 001",
    address: { line: "Bole Road", area: "Bole", city: "Addis Ababa" },
    tags: ["Haircut", "Beard Trim", "Hair Styling"],
    openingHours: weekly("08:00", "21:00"),
    ratingAvg: 4.8,
    ratingCount: 1200,
  },
  {
    name: "Habesha Fade Studio",
    slug: "habesha-fade-studio",
    category: "barbershop",
    description: "Clean fades, classic cuts and hot-towel shaves.",
    phone: "+251 911 000 002",
    address: { line: "Churchill Avenue", area: "Piassa", city: "Addis Ababa" },
    tags: ["Fade", "Haircut", "Shave"],
    openingHours: weekly("08:30", "20:30"),
    ratingAvg: 4.6,
    ratingCount: 640,
  },
  {
    name: "Sharp & Co. Barbers",
    slug: "sharp-and-co-barbers",
    category: "barbershop",
    description: "Family-friendly barbershop with kids cuts and beard care.",
    phone: "+251 911 000 003",
    address: { line: "CMC Road", area: "CMC", city: "Addis Ababa" },
    tags: ["Haircut", "Kids Cuts", "Beard Trim"],
    openingHours: weekly("08:00", "20:00"),
    ratingAvg: 4.5,
    ratingCount: 310,
  },
  // Beauty salons
  {
    name: "Bella Beauty Salon",
    slug: "bella-beauty-salon",
    category: "salon",
    description: "Hair, nails and skincare in a relaxing space.",
    phone: "+251 911 000 004",
    address: { line: "Kazanchis Main Street", area: "Kazanchis", city: "Addis Ababa" },
    tags: ["Hair Styling", "Braids", "Manicure", "Facial"],
    openingHours: weekly("09:00", "20:00", [0]),
    ratingAvg: 4.7,
    ratingCount: 856,
  },
  {
    name: "Selam Hair & Beauty",
    slug: "selam-hair-and-beauty",
    category: "salon",
    description: "Braiding, coloring and pedicures by experienced stylists.",
    phone: "+251 911 000 005",
    address: { line: "Megenagna Square", area: "Megenagna", city: "Addis Ababa" },
    tags: ["Braids", "Hair Color", "Pedicure"],
    openingHours: weekly("09:00", "19:30", [0]),
    ratingAvg: 4.4,
    ratingCount: 420,
  },
  {
    name: "Glow Studio Addis",
    slug: "glow-studio-addis",
    category: "salon",
    description: "Makeup, facials and styling for every occasion.",
    phone: "+251 911 000 006",
    address: { line: "Sarbet Road", area: "Sarbet", city: "Addis Ababa" },
    tags: ["Makeup", "Facial", "Hair Styling"],
    openingHours: weekly("10:00", "20:00", [0]),
    ratingAvg: 4.9,
    ratingCount: 230,
  },
  // Restaurants
  {
    name: "Habesha Restaurant",
    slug: "habesha-restaurant",
    category: "restaurant",
    description: "Traditional Ethiopian dishes, served fresh.",
    phone: "+251 911 000 007",
    address: { line: "Churchill Avenue", area: "Piassa", city: "Addis Ababa" },
    tags: ["Traditional", "Injera", "Takeaway"],
    openingHours: weekly("07:00", "22:00"),
    ratingAvg: 4.6,
    ratingCount: 2100,
  },
  {
    name: "Lalibela Kitchen",
    slug: "lalibela-kitchen",
    category: "restaurant",
    description: "Ethiopian favorites for dine-in or takeaway.",
    phone: "+251 911 000 008",
    address: { line: "Bole Medhanialem", area: "Bole", city: "Addis Ababa" },
    tags: ["Ethiopian", "Dine-in", "Takeaway"],
    openingHours: weekly("08:00", "22:30"),
    ratingAvg: 4.5,
    ratingCount: 980,
  },
  {
    name: "Addis Grill & Cafe",
    slug: "addis-grill-and-cafe",
    category: "restaurant",
    description: "Grills, burgers and fresh Ethiopian coffee.",
    phone: "+251 911 000 009",
    address: { line: "Gerji Main Road", area: "Gerji", city: "Addis Ababa" },
    tags: ["Grill", "Coffee", "Fast Food"],
    openingHours: weekly("07:00", "23:00"),
    ratingAvg: 4.3,
    ratingCount: 540,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const b of businesses) {
    await Business.updateOne({ slug: b.slug }, { $set: { ...b, status: "approved" } }, { upsert: true });
  }

  const total = await Business.countDocuments({ status: "approved" });
  console.log(`✅ Seeded ${businesses.length} businesses (${total} approved in database)`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});