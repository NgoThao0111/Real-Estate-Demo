import express from 'express';
import session from "express-session"
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"
import userRoutes from "./routes/user.route.js"
import listingRoutes from "./routes/list.route.js"

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 30 phút
  })
);

app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);

app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.listen(PORT, () => {
  connectDB();
  console.log('Server is running on port 5000');
});