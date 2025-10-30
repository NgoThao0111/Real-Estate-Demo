import express from 'express';
import dotenv from "dotenv";
import { connectDB } from "./config/db.js"
import userRoutes from "./routes/user.route.js"

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000

app.use(express.json());
app.use("/api/users", userRoutes);

app.get('/', (req, res) => {
    res.send('Server is up and running');
});

app.listen(PORT, () => {
  connectDB();
  console.log('Server is running on port 5000');
});