import Product from "../models/Product.js";

const demoProducts = [
  {
    name: "Fresh Red Apples",
    description: "Crisp, naturally sweet apples selected for everyday snacking.",
    price: 160,
    image: "/products/groceries.svg",
    category: "Groceries",
    stock: 40,
  },
  {
    name: "Farm Fresh Bananas",
    description: "Ripe, energy-rich bananas delivered fresh to your kitchen.",
    price: 60,
    image: "/products/groceries.svg",
    category: "Groceries",
    stock: 55,
  },
  {
    name: "Whole Milk 1L",
    description: "Fresh, creamy whole milk for your daily routine.",
    price: 68,
    image: "/products/groceries.svg",
    category: "Groceries",
    stock: 35,
  },
  {
    name: "Premium Basmati Rice 5kg",
    description: "Long-grain aromatic basmati rice for family meals.",
    price: 599,
    image: "/products/groceries.svg",
    category: "Groceries",
    stock: 24,
  },
  {
    name: "Organic Spinach",
    description: "Tender, farm-fresh spinach leaves, ready for your recipes.",
    price: 45,
    image: "/products/groceries.svg",
    category: "Groceries",
    stock: 30,
  },
  {
    name: "Everyday Cotton T-Shirt",
    description: "Soft, breathable cotton with an easy everyday fit.",
    price: 599,
    image: "/products/clothing.svg",
    category: "Clothing",
    stock: 32,
  },
  {
    name: "Classic Denim Jacket",
    description: "A versatile denim layer with a timeless, comfortable fit.",
    price: 1899,
    image: "/products/clothing.svg",
    category: "Clothing",
    stock: 18,
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable wireless sound with rich audio for any room.",
    price: 2499,
    image: "/products/electronics.svg",
    category: "Electronics",
    stock: 20,
  },
  {
    name: "Fast Charge Power Bank 20000mAh",
    description: "High-capacity portable charging for your everyday devices.",
    price: 1799,
    image: "/products/electronics.svg",
    category: "Electronics",
    stock: 26,
  },
  {
    name: "Smartphone 128GB",
    description: "A bright, responsive smartphone with generous storage.",
    price: 14999,
    image: "/products/electronics.svg",
    category: "Electronics",
    stock: 12,
  },
];

export async function seedDemoProducts() {
  const result = await Product.bulkWrite(
    demoProducts.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $setOnInsert: product },
        upsert: true,
      },
    }))
  );

  console.log(`Demo catalog ready (${result.upsertedCount} products added)`);
}
