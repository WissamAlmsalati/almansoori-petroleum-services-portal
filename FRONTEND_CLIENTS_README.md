## Clients Web UI - Implementation Guide

This guide describes how to build the Clients management UI for the Oil Field System frontend. It includes API contracts, pages, routing, components, permissions, and example requests so the web agent can implement it quickly.

### API Base
- Base URL (local dev): `http://127.0.0.1:8000`
- All API routes are prefixed with `/api`
- Auth: Laravel Sanctum Bearer tokens
  - Set header: `Authorization: Bearer <token>`

### Endpoints (Clients)
These are defined under `routes/api.php` inside the `Route::prefix('clients')` group (protected by `auth:sanctum`).

- List clients
  - Method: GET `/api/clients`
  - Query params (optional in future): `page`, `per_page`, `search`
  - Returns: array of client objects (consider supporting pagination if present)

- Create client
  - Method: POST `/api/clients`
  - Body (JSON):
    - `name` (string, required)
    - `address` (string, optional)
    - `contact_email` (string, optional)
    - `contact_phone` (string, optional)
    - Other domain fields if present in `app/Models/Client.php`

- Update client
  - Method: PUT `/api/clients/{id}`
  - Body: same schema as create; send fields to update

- Delete client
  - Method: DELETE `/api/clients/{id}`

Notes:
- All clients routes require a valid token and appropriate role (see Permissions section).

### Permissions
- Back-end protects clients under `auth:sanctum`.
- If role checks are added later, assume:
  - View (list): Any authenticated user
  - Create/Update/Delete: Admin or Editor roles
- On 401/403, show an access error UI and route to Login if unauthenticated.

### Frontend Pages & Routes
Use a standard SPA router (React Router or Next.js App Routes). Suggested routes:

- `/clients` – Clients List
  - Table with: Name, Contact, Actions
  - Search (client name), pagination
  - Actions: View (optional), Edit, Delete
  - Primary CTA: “Add Client”

- `/clients/new` – Create Client
  - Form with validation
  - Submit to POST `/api/clients`

- `/clients/:id/edit` – Edit Client
  - Fetch current client
  - Submit to PUT `/api/clients/:id`

- (Optional) `/clients/:id` – Client Details
  - Show read-only fields and related data (e.g., sub-agreements)

### UI Components (suggested)
- `ClientsTable`
  - Props: `items`, `loading`, `pagination`, callbacks for edit/delete
- `ClientForm`
  - Props: `initialValues`, `mode` ('create'|'edit'), `onSubmit`, `submitting`, `error`
- `ConfirmDialog`
  - For destructive actions (delete)
- `SearchBar`
  - Controls search term and triggers refetch

### State & Data Layer
- Use a fetch layer (Axios/Fetch) with an interceptor to attach token
- Suggested abstraction:
  - `clientService.list({ page, perPage, search })`
  - `clientService.create(payload)`
  - `clientService.update(id, payload)`
  - `clientService.remove(id)`
- Use React Query (preferred) or similar for caching, loading, and error states.

### Forms & Validation
- Required: `name`
- Optional fields: `address`, `contact_email`, `contact_phone`
- Client-side validation (Yup / Zod) and display API validation errors (422) inline near fields and a general alert.

### Error Handling
- 401: redirect to Login; clear token
- 403: show “You don’t have permission”
- 422: show validation errors
- 5xx: show generic error toast and retry actions where possible

### Example Types (TypeScript)
```ts
export type Client = {
  id: number;
  name: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  data: T[];
  meta?: { page: number; per_page: number; total: number };
};
```

### Example API Service (Axios)
```ts
import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const clientService = {
  list: async (params?: { page?: number; perPage?: number; search?: string }) => {
    const res = await api.get('/clients', { params });
    return res.data;
  },
  create: async (payload: any) => {
    const res = await api.post('/clients', payload);
    return res.data;
  },
  update: async (id: number, payload: any) => {
    const res = await api.put(`/clients/${id}`, payload);
    return res.data;
  },
  remove: async (id: number) => {
    const res = await api.delete(`/clients/${id}`);
    return res.data;
  },
};
```

### Example Flows
1) List
   - On mount: `clientService.list({ page, perPage, search })`
   - Show loading state, table rows, and pagination controls

2) Create
   - Show `ClientForm` with empty `initialValues`
   - On submit: `clientService.create(payload)`
   - On success: toast + navigate to `/clients`

3) Edit
   - Fetch by id (if a show endpoint is later added) or pre-load from list state
   - Show `ClientForm` with `initialValues`
   - On submit: `clientService.update(id, payload)`
   - On success: toast + navigate back

4) Delete
   - Confirm dialog
   - `clientService.remove(id)`; on success refetch list

### UX Details
- Keep consistent spacing, table density, and responsive layout
- Provide clear success/error toasts
- Disable submit while saving
- Confirm before delete
- Preserve query params (`?page=2&search=acme`) on refresh

### Auth Integration
- Ensure the token is set after login
- If any request returns 401, clear token and redirect to `/login`

### Environment Variables
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`

### Testing
- Unit test `clientService` with mocked Axios
- Component tests for `ClientsTable` and `ClientForm`
- E2E happy paths: list -> create -> edit -> delete

### Deliverables Summary
- Pages: `/clients`, `/clients/new`, `/clients/:id/edit` (and optional `/clients/:id`)
- Components: `ClientsTable`, `ClientForm`, `ConfirmDialog`, `SearchBar`
- Services: `clientService` (list/create/update/remove)
- Routing, auth guard, error handling, and tests


