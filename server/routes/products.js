import express from "express";
import Product from "../models/Product.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { search = "", category = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Unable to load products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ message: "Invalid product ID" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch {
    res.status(400).json({ message: "Unable to create product" });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch {
    res.status(400).json({ message: "Unable to update product" });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(400).json({ message: "Unable to delete product" });
  }
});

export default router;
