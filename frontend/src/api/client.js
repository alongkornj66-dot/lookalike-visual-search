const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore body parse errors
    }
    throw new Error(message);
  }
  return res.json();
}

export function imageUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

export async function fetchProducts({ category } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const res = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
  return handleResponse(res);
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_BASE_URL}/api/products/${id}`);
  return handleResponse(res);
}

export async function searchByImage(file, { category, limit } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (limit) params.set("limit", String(limit));

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(res);
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  return handleResponse(res);
}
