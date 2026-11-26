import "dotenv/config";
import mongoose from "mongoose";
import Business from "../modules/businesses/business.model.js";
import MenuCategory from "../modules/menu/menuCategory.model.js";
import MenuItem from "../modules/menu/menuItem.model.js";

// [category name, [[item name, description, price in birr], ...]]
const menus = {
  "habesha-restaurant": [
    ["Traditional Dishes", [
      ["Injera with Tibs", "Traditional Ethiopian dish", 180],
      ["Doro Wat", "Spicy chicken stew", 200],
      ["Kitfo", "Minced beef with spiced butter", 220],
      ["Shiro", "Chickpea stew with injera", 120],
      ["Firfir", "Shredded injera in spicy sauce", 130],
    ]],
    ["Fast Food", [
      ["Beef Burger", "Grilled beef patty with fries", 160],
      ["Chicken Sandwich", "Crispy chicken with fresh salad", 150],
      ["French Fries", "Golden and crispy", 70],
    ]],
    ["Drinks", [
      ["Ethiopian Coffee", "Freshly roasted buna", 30],
      ["Spiced Tea", "Hot tea with cinnamon and cloves", 20],
      ["Fresh Juice", "Mango, avocado or papaya", 50],
      ["Soft Drink", "Chilled bottle", 25],
    ]],
  ],
  "lalibela-kitchen": [
    ["Main Dishes", [
      ["Tibs Firfir", "Sauteed beef mixed with injera", 190],
      ["Gored Gored", "Cubed raw beef with awaze", 240],
      ["Misir Wat", "Spicy red lentil stew", 110],
      ["Special Combo Platter", "A tasting platter for two", 350],
    ]],
    ["Sides", [
      ["Ayib", "Fresh Ethiopian cottage cheese", 40],
      ["House Salad", "Tomato, onion and green pepper", 50],
      ["Extra Injera", "Two pieces", 20],
    ]],
    ["Drinks", [
      ["Buna", "Traditional coffee", 30],
      ["Mango Juice", "Freshly blended", 55],
      ["Bottled Water", "500 ml", 15],
    ]],
  ],
  "addis-grill-and-cafe": [
    ["Grill", [
      ["Mixed Grill Plate", "Beef, chicken and sausage with sides", 380],
      ["Grilled Chicken (Half)", "Marinated and flame grilled", 260],
      ["Beef Skewers", "Served with dipping sauce", 210],
    ]],
    ["Burgers and Wraps", [
      ["Classic Burger", "Beef patty, lettuce and tomato", 170],
      ["Cheese Burger", "With melted cheese", 190],
      ["Chicken Wrap", "Grilled chicken in a soft wrap", 160],
    ]],
    ["Coffee and Drinks", [
      ["Macchiato", "Espresso with milk foam", 35],
      ["Cappuccino", "Espresso with steamed milk", 45],
      ["Iced Coffee", "Cold and refreshing", 55],
      ["Fresh Juice", "Seasonal fruit", 50],
    ]],
  ],
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const [slug, categories] of Object.entries(menus)) {
    const business = await Business.findOne({ slug, category: "restaurant" });
    if (!business) {
      console.warn(`⚠️  ${slug} not found. Run: node src/scripts/seed.js first`);
      continue;
    }

    let itemCount = 0;
    let catOrder = 0;
    for (const [catName, items] of categories) {
      const category = await MenuCategory.findOneAndUpdate(
        { businessId: business._id, name: catName },
        { $set: { sortOrder: catOrder++, active: true } },
        { upsert: true, new: true }
      );

      let itemOrder = 0;
      for (const [name, description, price] of items) {
        await MenuItem.updateOne(
          { businessId: business._id, name },
          { $set: { categoryId: category._id, description, priceMinor: price * 100, available: true, sortOrder: itemOrder++ } },
          { upsert: true }
        );
        itemCount++;
      }
    }
    console.log(`✅ ${business.name}: ${categories.length} categories, ${itemCount} items`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});