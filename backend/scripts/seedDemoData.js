import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import Listing from "../models/listing.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seed = async () => {
  await connectDB();

  try {
    // Create demo users: some over last 7 days
    const demoUsers = [];
    for (let i = 0; i < 20; i++) {
      const username = `demouser${i}`;
      let u = await User.findOne({ username });
      if (!u) {
        const hashed = await bcrypt.hash("Password1!", 10);
        u = await User.create({ username, password: hashed, name: `Demo User ${i}`, phone: "0000000000", role: "guest", createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 3600 * 1000) });
      }
      demoUsers.push(u);
    }

    // Create demo listings
    const statuses = ["approved", "pending", "sold"];
    for (let i = 0; i < 40; i++) {
      const title = `Demo Listing ${i}`;
      let l = await Listing.findOne({ title });
      if (!l) {
        const owner = demoUsers[i % demoUsers.length];
        const status = statuses[i % statuses.length];
        await Listing.create({
          title,
          description: "Demo listing",
          area: 50 + i,
          price: 100000 + i * 1000,
          status,
          rental_type: "rent",
          owner: owner._id,
          property_type: null,
          location: { province: "Demo Province", ward: "Ward", detail: "Demo Address", coords: { type: "Point", coordinates: [105.8 + i * 0.001, 21.0 + i * 0.001] } },
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 3600 * 1000)
        });
      }
    }

    console.log("Demo data seeded");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
