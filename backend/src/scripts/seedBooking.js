import "dotenv/config";
import mongoose from "mongoose";
import Business from "../modules/businesses/business.model.js";
import Service from "../modules/services/service.model.js";
import Staff from "../modules/staff/staff.model.js";

const ALL = [0, 1, 2, 3, 4, 5, 6];
const MON_SAT = [1, 2, 3, 4, 5, 6];
// Days not listed are days off
const shift = (days, start, end, extra = {}) => days.map((day) => ({ day, start, end, ...extra }));
const lunch = { breakStart: "12:30", breakEnd: "13:30" };

// service: [name, description, price in birr, duration in minutes]
// staff:   [name, title, service names | "all", working hours]
const catalog = {
  "royal-cuts-barber-shop": {
    autoConfirm: true, // bookings are confirmed instantly here
    services: [
      ["Haircut", "Classic or modern cut with a clean finish.", 150, 30],
      ["Beard Trim", "Shape and tidy your beard.", 100, 30],
      ["Haircut + Beard", "The full grooming package.", 220, 60],
      ["Hair Styling", "Styling for events and special days.", 200, 45],
    ],
    staff: [
      ["Dawit Alemu", "Senior Barber", "all", shift(ALL, "08:00", "20:00", lunch)],
      ["Samuel Tesfaye", "Barber", ["Haircut", "Beard Trim", "Haircut + Beard"], shift(MON_SAT, "10:00", "21:00")],
      ["Yonas Bekele", "Barber", ["Haircut", "Hair Styling"], shift([0, 2, 4, 6], "08:00", "17:00")],
    ],
  },
  "habesha-fade-studio": {
    autoConfirm: false,
    services: [
      ["Fade Cut", "Skin, low, mid or high fade.", 180, 30],
      ["Classic Cut", "Timeless scissor cut.", 150, 30],
      ["Hot-Towel Shave", "Relaxing traditional shave.", 120, 30],
    ],
    staff: [
      ["Abel Mengistu", "Master Barber", "all", shift(MON_SAT, "08:30", "20:30")],
      ["Robel Haile", "Barber", "all", shift([0, 1, 2, 3, 4, 5], "09:00", "20:00", lunch)],
    ],
  },
  "sharp-and-co-barbers": {
    autoConfirm: false,
    services: [
      ["Haircut", "Cut and style for all ages.", 140, 30],
      ["Kids Cut", "Gentle cuts for children.", 100, 30],
      ["Beard Trim", "Quick beard tidy-up.", 80, 15],
    ],
    staff: [
      ["Kidus Girma", "Barber", "all", shift(ALL, "08:00", "20:00")],
      ["Nahom Tadesse", "Barber", ["Haircut", "Kids Cut"], shift([1, 3, 5, 6], "09:00", "19:00")],
    ],
  },
  "bella-beauty-salon": {
    autoConfirm: false,
    services: [
      ["Hair Styling", "Wash, blow-dry and style.", 350, 60],
      ["Braids", "Protective braided styles.", 800, 180],
      ["Manicure", "Nail care and polish.", 250, 45],
      ["Facial", "Deep cleansing facial treatment.", 400, 60],
    ],
    staff: [
      ["Hanna Worku", "Senior Stylist", ["Hair Styling", "Braids"], shift(MON_SAT, "09:00", "20:00")],
      ["Meron Assefa", "Nail & Skin Specialist", ["Manicure", "Facial"], shift(MON_SAT, "09:30", "19:30", { breakStart: "13:00", breakEnd: "14:00" })],
      ["Selamawit Kebede", "Stylist", ["Hair Styling", "Braids", "Manicure"], shift([2, 3, 4, 5, 6], "10:00", "20:00")],
    ],
  },
  "selam-hair-and-beauty": {
    autoConfirm: false,
    services: [
      ["Braids", "Neat, long-lasting braids.", 700, 180],
      ["Hair Color", "Professional coloring.", 900, 120],
      ["Pedicure", "Foot care and polish.", 300, 60],
    ],
    staff: [
      ["Tigist Lemma", "Braiding Specialist", ["Braids"], shift(MON_SAT, "09:00", "19:30")],
      ["Rahel Demissie", "Colorist", ["Hair Color", "Pedicure"], shift(MON_SAT, "09:00", "19:00")],
    ],
  },
  "glow-studio-addis": {
    autoConfirm: true,
    services: [
      ["Event Makeup", "Full makeup for weddings and events.", 1200, 90],
      ["Facial", "Glow-boosting facial.", 450, 60],
      ["Hair Styling", "Styling for any occasion.", 400, 60],
    ],
    staff: [
      ["Bethlehem Tadesse", "Makeup Artist", ["Event Makeup", "Facial"], shift(MON_SAT, "10:00", "20:00")],
      ["Eden Yilma", "Stylist", ["Hair Styling"], shift(MON_SAT, "10:00", "19:00")],
    ],
  },
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const [slug, cfg] of Object.entries(catalog)) {
    const business = await Business.findOne({ slug });
    if (!business) {
      console.warn(`⚠️  ${slug} not found. Run: node src/scripts/seed.js first`);
      continue;
    }

    await Business.updateOne({ _id: business._id }, { $set: { "bookingSettings.autoConfirm": cfg.autoConfirm } });

    const ids = {};
    let order = 0;
    for (const [name, description, price, duration] of cfg.services) {
      const s = await Service.findOneAndUpdate(
        { businessId: business._id, name },
        { $set: { description, priceMinor: price * 100, durationMinutes: duration, active: true, sortOrder: order++ } },
        { upsert: true, new: true }
      );
      ids[name] = s._id;
    }

    for (const [name, title, svc, workingHours] of cfg.staff) {
      const serviceIds = svc === "all" ? Object.values(ids) : svc.map((n) => ids[n]);
      await Staff.updateOne(
        { businessId: business._id, name },
        { $set: { title, serviceIds, workingHours, active: true } },
        { upsert: true }
      );
    }

    console.log(`✅ ${business.name}: ${cfg.services.length} services, ${cfg.staff.length} staff`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});