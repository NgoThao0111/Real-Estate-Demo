import express from 'express';
import session from "express-session"
import cors from "cors"
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"
import userRoutes from "./routes/user.route.js"
import listingRoutes from "./routes/list.route.js"

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - allow frontend to send credentials (cookies)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}))

app.use(
  session({
    secret: process.env.SECRET_KEY || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      // in development we don't use secure, in production set secure: true
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 // 1 hour
    }
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