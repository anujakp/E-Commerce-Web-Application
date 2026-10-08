import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
