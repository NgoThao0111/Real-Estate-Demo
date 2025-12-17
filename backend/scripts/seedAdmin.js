import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

dotenv.config();

const seed = async () => {
  await connectDB();

  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@123";
  const name = process.env.SEED_ADMIN_NAME || "Super Admin";
  const phone = process.env.SEED_ADMIN_PHONE || "0000000000";

  try {
    let user = await User.findOne({ username });
    if (user) {
      console.log("Admin user already exists:", username);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ username, password: hashed, name, phone, role: "admin" });
    await user.save();

    console.log("Created admin user:", username);
    console.log("Password:", password);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
