import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { items, shipping, paymentMethod = "Demo Payment" } = req.body;

    if (!items?.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!shipping?.fullName || !shipping?.address || !shipping?.city ||
        !shipping?.postalCode || !shipping?.phone) {
      return res.status(400).json({ message: "Complete shipping details are required" });
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: "A product no longer exists" });
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `${product.name} does not have enough stock`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });

      total += product.price * quantity;
      product.stock -= quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shipping,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "Demo Payment" ? "Paid" : "Pending",
    });

    res.status(201).json(order);
  } catch {
    res.status(400).json({ message: "Unable to place order" });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Unable to load orders" });
  }
});

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch {
    res.status(500).json({ message: "Unable to load orders" });
  }
});

router.patch("/:id/status", auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch {
    res.status(400).json({ message: "Unable to update order status" });
  }
});

export default router;
