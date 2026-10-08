import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const productSections = [
  {
    id: "groceries",
    title: "Groceries",
    subtitle: "Fresh everyday essentials for your home",
    keywords: ["grocer", "food", "produce"],
  },
  {
    id: "clothing",
    title: "Clothes & Fashion",
    subtitle: "Comfortable styles for every day",
    keywords: ["cloth", "fashion", "apparel"],
  },
  {
    id: "electronics",
    title: "Electronics",
    subtitle: "Smart tech and accessories worth discovering",
    keywords: ["electronic", "tech", "gadget"],
  },
];

function productImageForCategory(category = "") {
  const normalizedCategory = category.toLowerCase();
  if (productSections[0].keywords.some((keyword) => normalizedCategory.includes(keyword))) {
    return "/products/groceries.svg";
  }
  if (productSections[1].keywords.some((keyword) => normalizedCategory.includes(keyword))) {
    return "/products/clothing.svg";
  }
  if (productSections[2].keywords.some((keyword) => normalizedCategory.includes(keyword))) {
    return "/products/electronics.svg";
  }
  if (["home", "furniture"].some((keyword) => normalizedCategory.includes(keyword))) {
    return "/products/home.svg";
  }
  return "/products/product.svg";
}

function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function ProductCard({ product, onAdd }) {
  const handleImageError = (event) => {
    const image = event.currentTarget;
    if (image.dataset.fallback !== "true") {
      image.dataset.fallback = "true";
      image.src = productImageForCategory(product.category);
      return;
    }
    image.parentElement?.classList.add("image-error");
    image.style.display = "none";
  };

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={product.image || productImageForCategory(product.category)} alt={product.name} onError={handleImageError} />
        <span className="image-fallback">{product.name.slice(0, 2).toUpperCase()}</span>
      </div>
      <div className="product-info">
        <span className="category">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-bottom">
          <strong>{money(product.price)}</strong>
          <button className="primary small-btn" disabled={!product.stock} onClick={() => onAdd(product)}>
            {product.stock ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </article>
  );
}

function CartView({ setView }) {
  const { cart, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [shipping, setShipping] = useState({
    fullName: user?.name || "", address: "", city: "", postalCode: "", phone: ""
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const checkout = async (e) => {
    e.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      await api.createOrder({ items: cart, shipping, paymentMethod: "Demo Payment" });
      clearCart();
      setMessage("Order placed successfully!");
      setTimeout(() => setView("orders"), 600);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length) {
    return (
      <section className="page-section">
        <div className="empty">
          <h2>Your cart is empty</h2>
          <button className="primary" onClick={() => setView("store")}>Continue Shopping</button>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-grid">
      <div className="panel">
        <h2>Your Cart</h2>
        {cart.map((item) => (
          <div className="cart-item" key={item.product}>
            <div className="cart-thumb">{item.image ? <img src={item.image} alt="" /> : "Item"}</div>
            <div className="cart-copy">
              <strong>{item.name}</strong>
              <span>{money(item.price)}</span>
            </div>
            <div className="qty">
              <button onClick={() => updateQuantity(item.product, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.product, item.quantity + 1)}>+</button>
            </div>
            <button className="link-danger" onClick={() => removeFromCart(item.product)}>Remove</button>
          </div>
        ))}
        <div className="cart-total">Total <strong>{money(total)}</strong></div>
      </div>

      <form className="panel form-stack" onSubmit={checkout}>
        <h2>Checkout</h2>
        <label>Full Name<input required value={shipping.fullName} onChange={(e) => setShipping({...shipping, fullName:e.target.value})} /></label>
        <label>Address<textarea required rows="3" value={shipping.address} onChange={(e) => setShipping({...shipping, address:e.target.value})} /></label>
        <label>City<input required value={shipping.city} onChange={(e) => setShipping({...shipping, city:e.target.value})} /></label>
        <label>Postal Code<input required value={shipping.postalCode} onChange={(e) => setShipping({...shipping, postalCode:e.target.value})} /></label>
        <label>Phone<input required value={shipping.phone} onChange={(e) => setShipping({...shipping, phone:e.target.value})} /></label>
        {message && <div className="success">{message}</div>}
        <button className="primary" disabled={busy}>{busy ? "Placing Order..." : `Place Order · ${money(total)}`}</button>
        <button type="button" className="secondary" onClick={clearCart}>Clear Cart</button>
      </form>
    </section>
  );
}

function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.myOrders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  return (
    <section className="page-section">
      <h2>My Orders</h2>
      {error && <div className="error">{error}</div>}
      {!orders.length && !error ? <div className="empty">No orders yet.</div> : (
        <div className="orders">
          {orders.map((order) => (
            <article className="order-card" key={order._id}>
              <div>
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span>
                <strong>{money(order.total)}</strong>
              </div>
              <p>{order.items.map((x) => `${x.name} × ${x.quantity}`).join(" · ")}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function AdminView() {
  const empty = { name:"", description:"", price:"", image:"", category:"", stock:"" };
  const [form, setForm] = useState(empty);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [p, o] = await Promise.all([api.products(), api.allOrders()]);
    setProducts(p);
    setOrders(o);
  }, []);

  useEffect(() => { load().catch((e) => setMessage(e.message)); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      if (editing) await api.updateProduct(editing, payload);
      else await api.createProduct(payload);
      setForm(empty);
      setEditing(null);
      setMessage("Product saved.");
      await load();
    } catch (e) { setMessage(e.message); }
  };

  const edit = (p) => {
    setEditing(p._id);
    setForm({
      name:p.name, description:p.description, price:p.price,
      image:p.image, category:p.category, stock:p.stock
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    try { await api.deleteProduct(id); await load(); } catch(e) { setMessage(e.message); }
  };

  return (
    <section className="admin-grid">
      <form className="panel form-stack" onSubmit={save}>
        <h2>{editing ? "Edit Product" : "Add Product"}</h2>
        <label>Name<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label>
        <label>Description<textarea value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label>
        <label>Price<input required type="number" min="0" value={form.price} onChange={(e)=>setForm({...form,price:e.target.value})}/></label>
        <label>Image URL<input value={form.image} onChange={(e)=>setForm({...form,image:e.target.value})}/></label>
        <label>Category<input required value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}/></label>
        <label>Stock<input required type="number" min="0" value={form.stock} onChange={(e)=>setForm({...form,stock:e.target.value})}/></label>
        {message && <div className="info">{message}</div>}
        <button className="primary">{editing ? "Update Product" : "Add Product"}</button>
        {editing && <button type="button" className="secondary" onClick={()=>{setEditing(null);setForm(empty)}}>Cancel</button>}
      </form>

      <div className="admin-content">
        <div className="panel">
          <h2>Products</h2>
          <div className="admin-list">
            {products.map((p) => (
              <div className="admin-row" key={p._id}>
                <div><strong>{p.name}</strong><span>{p.category} · {money(p.price)} · Stock {p.stock}</span></div>
                <div className="row-actions"><button className="secondary small-btn" onClick={()=>edit(p)}>Edit</button><button className="danger small-btn" onClick={()=>remove(p._id)}>Delete</button></div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Orders</h2>
          <div className="admin-list">
            {orders.map((o) => (
              <div className="admin-row" key={o._id}>
                <div><strong>#{o._id.slice(-8).toUpperCase()} · {o.user?.name}</strong><span>{money(o.total)} · {new Date(o.createdAt).toLocaleDateString()}</span></div>
                <select value={o.status} onChange={async(e)=>{await api.updateOrderStatus(o._id,e.target.value);await load()}}>
                  {["Placed","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Store({ view, setView }) {
  const { user, logout } = useAuth();
  const { count, addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const data = await api.products({ search });
      setProducts(data);
      setCategories(["All", ...new Set(data.map((p) => p.category))]);
      setError("");
    } catch (e) { setError(e.message); }
  }, [search]);

  const filteredProducts = products.filter((product) =>
    category === "All" || product.category === category
  );
  const displayedSections = productSections
    .map((section) => ({
      ...section,
      products: filteredProducts.filter((product) =>
        section.keywords.some((keyword) => product.category.toLowerCase().includes(keyword))
      ),
    }))
    .filter((section) => section.products.length > 0);
  const uncategorizedProducts = filteredProducts.filter((product) =>
    !productSections.some((section) =>
      section.keywords.some((keyword) => product.category.toLowerCase().includes(keyword))
    )
  );

  useEffect(() => {
    const t = setTimeout(loadProducts, 200);
    return () => clearTimeout(t);
  }, [loadProducts]);

  return (
    <main className="app">
      <header className="navbar">
        <button className="nav-brand" onClick={()=>setView("store")}>
          <span className="logo small-logo">S</span>
          <span>ShopSphere</span>
        </button>

        <nav>
          <button className={view==="store" ? "nav-active" : ""} onClick={()=>setView("store")}>Products</button>
          <button className={view==="orders" ? "nav-active" : ""} onClick={()=>setView("orders")}>My Orders</button>
          {user.role === "admin" && <button className={view==="admin" ? "nav-active" : ""} onClick={()=>setView("admin")}>Admin</button>}
          <button className="cart-button" onClick={()=>setView("cart")}>Cart ({count})</button>
        </nav>

        <div className="user-nav">
          <span>{user.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {view === "cart" ? <CartView setView={setView}/> :
       view === "orders" ? <OrdersView/> :
       view === "admin" ? <AdminView/> :
       (
        <section className="store-section">
          <div className="promo-strip">
            <span>🔥 Top deals of the week</span>
            <span>Free delivery over ₹999</span>
            <span>100% secure checkout</span>
          </div>

          <div className="store-hero">
            <div className="hero-copy">
              <span className="eyebrow">ONLINE STORE</span>
              <h1>Everything you need,<br/><span>in one place.</span></h1>
              <p>Browse products, add them to your cart and place an order in a few clicks.</p>
              <div className="hero-badges">
                <span>⚡ Fast Delivery</span>
                <span>💳 COD Available</span>
                <span>⭐ Top Rated</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-card hero-card-primary">
                <span className="mini-tag">New Season</span>
                <strong>Smart Essentials</strong>
                <small>Up to 50% off</small>
              </div>
              <div className="hero-card hero-card-secondary">
                <span>12k+ happy shoppers</span>
                <strong>4.8/5 avg rating</strong>
              </div>
            </div>
          </div>

          <div className="filters">
            <input className="search-input" placeholder="Search products..." value={search} onChange={(e)=>setSearch(e.target.value)}/>
            <select value={category} onChange={(e)=>setCategory(e.target.value)}>
              {categories.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          {error && <div className="error">{error}</div>}
          {displayedSections.map((section) => (
            <section className={`category-section category-section-${section.id}`} key={section.id}>
              <div className="category-section-heading">
                <div>
                  <span className="category-section-kicker">{section.products.length} products</span>
                  <h2>{section.title}</h2>
                  <p>{section.subtitle}</p>
                </div>
              </div>
              <div className="products-grid">
                {section.products.map((product) => (
                  <ProductCard key={product._id} product={product} onAdd={addToCart}/>
                ))}
              </div>
            </section>
          ))}
          {uncategorizedProducts.length > 0 && (
            <section className="category-section category-section-more">
              <div className="category-section-heading">
                <div>
                  <span className="category-section-kicker">{uncategorizedProducts.length} products</span>
                  <h2>More to explore</h2>
                  <p>Discover more picks from across the store</p>
                </div>
              </div>
              <div className="products-grid">
                {uncategorizedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} onAdd={addToCart}/>
                ))}
              </div>
            </section>
          )}
          {!filteredProducts.length && !error && <div className="empty">No products found.</div>}
        </section>
       )}
    </main>
  );
}
