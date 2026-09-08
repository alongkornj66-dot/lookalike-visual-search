const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function req(path, method = "GET", body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const getStats         = (t)           => req("/api/admin/stats", "GET", null, t);
export const getAllOrders      = (t)           => req("/api/admin/orders", "GET", null, t);
export const updateOrderStatus= (id, s, t)    => req(`/api/admin/orders/${id}/status`, "PATCH", { status: s }, t);
export const getAllUsers       = (t)           => req("/api/admin/users", "GET", null, t);
export const toggleUserActive  = (id, t)      => req(`/api/admin/users/${id}/toggle-active`, "PATCH", {}, t);
export const getAdminProducts  = (t)          => req("/api/admin/products", "GET", null, t);
export const createProduct     = (body, t)    => req("/api/admin/products", "POST", body, t);
export const updateProduct     = (id, body, t)=> req(`/api/admin/products/${id}`, "PUT", body, t);
export const deleteProduct     = (id, t)      => req(`/api/admin/products/${id}`, "DELETE", null, t);
export const receiveStock      = (id, qty, t) => req(`/api/admin/products/${id}/receive-stock`, "PATCH", { qty }, t);
