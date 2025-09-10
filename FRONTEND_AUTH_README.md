## Auth (Login) Web UI - Implementation Guide

This guide describes how to implement Login/Logout and session handling for the web UI using the existing backend auth endpoints.

### API Base
- Base URL (local dev): `http://127.0.0.1:8000`
- API prefix: `/api`
- Auth: Laravel Sanctum using token in `Authorization: Bearer <token>`

### Endpoints
- Login
  - POST `/api/auth/login`
  - Body (JSON):
    - `email` (string, required)
    - `password` (string, required)
  - Response: `{ token: string, user: { id, name, email, roles: string[] } }` (shape may vary; inspect backend response)

- Me (current user)
  - GET `/api/auth/me`
  - Header: `Authorization: Bearer <token>`
  - Response: `{ id, name, email, roles: string[] }`

- Logout
  - POST `/api/auth/logout`
  - Header: `Authorization: Bearer <token>`

- Register (optional; currently made public)
  - POST `/api/auth/register`
  - Use only if your UI supports admin/public signup.

### Pages & Routes
- `/login`
  - Email, Password fields
  - “Remember me” (optional)
  - Submit button
  - Link to registration (optional) and password reset (if implemented later)

- Protected pages (example):
  - `/clients`, `/dashboard`, etc. should require token; redirect to `/login` if missing/invalid

### UX Behavior
- After successful login:
  - Store token (localStorage preferred) and user info
  - Navigate to last-intended route or a default (e.g., `/clients`)
- On 401 from any request:
  - Clear token & user; redirect to `/login`
- Display inline validation errors (422) and general errors as toasts

### Token & Session Handling
- Store token in `localStorage` (e.g., key `token`)
- Attach token in `Authorization` header via HTTP interceptor
- On app boot, if token exists, call `/api/auth/me` to hydrate user state
- Provide `logout()` that calls API and clears local state

### Example Types (TypeScript)
```ts
export type User = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
};

export type LoginResponse = {
  token: string;
  user: User;
};
```

### Example Auth Service (Axios)
```ts
import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      // redirect to login (router-dependent)
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data as LoginResponse;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data as User;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
};
```

### Example Login Flow (React)
```ts
import { useState } from 'react';
import { authService } from '../services/auth';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      // optional: fetch user and store globally
      window.location.href = '/clients';
    } catch (err: any) {
      if (err?.response?.status === 422) setError('Invalid credentials');
      else setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
      {error && <div role="alert">{error}</div>}
      <button disabled={loading} type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
    </form>
  );
}
```

### Route Guard (Example)
```ts
// Pseudocode for guarding protected routes
export function requireAuth(Component: React.ComponentType) {
  return function Guarded(props: any) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (typeof window !== 'undefined') window.location.href = '/login?next='+encodeURIComponent(window.location.pathname);
      return null;
    }
    return <Component {...props} />;
  };
}
```

### Error Handling
- 401 Unauthorized: clear token, redirect to `/login`
- 422 Validation (bad credentials): show inline message
- 5xx: show general error toast and allow retry

### Environment
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

### Testing
- Unit test `authService`
- Login page component test (valid & invalid credentials)
- Guard behavior: redirect to `/login` when no token

### Deliverables Summary
- Page: `/login`
- Service: `authService` (login, me, logout)
- Interceptors: attach token; handle 401
- Guarded routes and logout action


