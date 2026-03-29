const BASE = '/api';

function authHeaders() {
  const token = localStorage.getItem('luxe_token');
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

async function request(method, path, body) {
  const res  = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Auth
export const registerBuyer = (data) => request('POST', '/buyers/register', data);
export const loginBuyer    = (data) => request('POST', '/buyers/login', data);
export const getProfile    = ()     => request('GET',  '/buyers/profile');
export const updateProfile = (data) => request('PUT',  '/buyers/profile', data);

// Addresses
export const addAddress    = (data)     => request('POST',   '/buyers/addresses', data);
export const updateAddress = (id, data) => request('PUT',    `/buyers/addresses/${id}`, data);
export const deleteAddress = (id)       => request('DELETE', `/buyers/addresses/${id}`);

// Wishlist
export const addToWishlist      = (pid) => request('POST',   `/buyers/wishlist/${pid}`);
export const removeFromWishlist = (pid) => request('DELETE', `/buyers/wishlist/${pid}`);

// Products
export const getProducts = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request('GET', `/products${qs ? '?' + qs : ''}`);
};
export const getFeaturedProducts = ()         => request('GET',  '/products/featured');
export const getProductById      = (id)       => request('GET',  `/products/${id}`);
export const addReview           = (id, data) => request('POST', `/products/${id}/reviews`, data);

// Orders
export const createOrder      = (data)       => request('POST', '/orders', data);
export const getMyOrders      = ()           => request('GET',  '/orders/my');
export const getOrderById     = (id)         => request('GET',  `/orders/${id}`);
export const verifyPayment    = (id, data)   => request('POST', `/orders/${id}/verify-payment`, data);
export const requestRefund    = (id, reason) => request('POST', `/orders/${id}/refund`, { reason });
