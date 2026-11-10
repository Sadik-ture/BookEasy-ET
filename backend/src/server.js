import "dotenv/config"; // must be the first import
import dns from "node:dns";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Fix for networks where the SRV DNS lookup for MongoDB Atlas times out
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
});