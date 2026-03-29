/* mockUsers.js — Simulated user database using localStorage
   Replace with real API calls when backend is ready */

const STORAGE_KEY = 'luxe_users';

/* Seed one pre-approved brand and one buyer so the app works out of the box */
const SEED_USERS = [
  {
    id: 'u1',
    name: 'Admin Brand',
    email: 'brand@luxe.com',
    password: 'brand123',
    phone: '+1 555-000-0001',
    role: 'brand',
    brandName: 'Maison Luxe',
    location: 'Paris, France',
    brandValue: 5000000,
    status: 'approved', // pre-approved seed
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Jane Buyer',
    email: 'buyer@luxe.com',
    password: 'buyer123',
    phone: '+1 555-000-0002',
    role: 'buyer',
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];

/* Load users from localStorage, seeding defaults on first run */
export function getUsers() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  return JSON.parse(raw);
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/* Find user by email (case-insensitive) */
export function findByEmail(email) {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/* Register a new user — returns { ok, error, user } */
export function registerUser(data) {
  const users = getUsers();

  if (findByEmail(data.email)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const user = {
    ...data,
    id: `u${Date.now()}`,
    /* Brands start as pending; buyers are immediately approved */
    status: data.role === 'brand' ? 'pending' : 'approved',
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, user]);
  return { ok: true, user };
}

/* Authenticate — returns { ok, error, user } */
export function authenticateUser(email, password) {
  const user = findByEmail(email);

  if (!user)           return { ok: false, error: 'No account found with this email.' };
  if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
  if (user.status === 'pending')  return { ok: false, error: 'pending_approval' };

  /* Return user without password */
  const { password: _pw, ...safeUser } = user;
  return { ok: true, user: safeUser };
}

/* Generate a mock JWT-style token (base64 payload — NOT cryptographically secure) */
export function generateToken(user) {
  const payload = btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
  return `luxe.${payload}.mock`;
}

/* Decode and validate a mock token */
export function validateToken(token) {
  try {
    if (!token || !token.startsWith('luxe.')) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now()) return null; // expired
    const users = getUsers();
    const user = users.find(u => u.id === payload.id);
    if (!user) return null;
    const { password: _pw, ...safeUser } = user;
    return safeUser;
  } catch {
    return null;
  }
}
