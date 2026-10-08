import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import { seedDemoProducts } from "./data/demoProducts.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174,http://localhost:5175")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ShopSphere API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
 try {
   await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
   await seedDemoProducts();
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 } catch (error) {
   console.error("Server startup failed:", error.message);
    process.exit(1);
 }
}

startServer();
