const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function req(path, method = "GET", body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const getProfile    = (token)           => req("/api/user/profile", "GET", null, token);
export const updateProfile = (body, token)     => req("/api/user/profile", "PUT", body, token);
export const changePassword= (body, token)     => req("/api/user/password", "PUT", body, token);
export const getAddresses  = (token)           => req("/api/user/addresses", "GET", null, token);
export const addAddress    = (body, token)     => req("/api/user/addresses", "POST", body, token);
export const updateAddress = (id, body, token) => req(`/api/user/addresses/${id}`, "PUT", body, token);
export const deleteAddress = (id, token)       => req(`/api/user/addresses/${id}`, "DELETE", null, token);
export const getOrders     = (token)           => req("/api/orders", "GET", null, token);
export const getOrder      = (id, token)       => req(`/api/orders/${id}`, "GET", null, token);
export const placeOrder    = (body, token)     => req("/api/orders", "POST", body, token);
