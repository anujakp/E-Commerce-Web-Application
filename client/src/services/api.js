const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  register: (payload) => request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  login: (payload) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  me: () => request("/auth/me"),

  products: ({ search = "", category = "" } = {}) => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    if (category) p.set("category", category);
    return request(`/products?${p.toString()}`);
  },
  createProduct: (payload) => request("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateProduct: (id, payload) => request(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  createOrder: (payload) => request("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  myOrders: () => request("/orders/my"),
  allOrders: () => request("/orders"),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }),
};
