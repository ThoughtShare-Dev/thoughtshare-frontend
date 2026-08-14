# ThoughtShare — Frontend

Peer-to-peer skill learning platform. This is the member-facing web client.

Built by a team of three:

- **Dev 1** (this scaffold): project setup, routing, authentication, API client, Navbar, global styles, integration/reviews.
- **Dev 2**: Profile & Discovery (Search, Search Results, Member Profile, My Profile, Edit Profile).
- **Dev 3**: Requests & Engagement (Requests, Notifications, Reviews, Report User, contact-method reveal).

## Getting started

```bash
npm install
Create a `.env` file and add the API URL:
VITE_API_URL=http://localhost:3000
npm run dev
```

App runs at `http://localhost:5173`.

```bash
npm run lint      # ESLint
npm run build     # production build
npm run preview   # preview the production build locally
```

## Folder structure

```
src/
  assets/            static images, icons
  components/        shared, reusable UI (Navbar, PlaceholderPage, ErrorBoundary, ...)
  features/
    auth/             Login, Register                       <- Dev 1
    profile/          Profile, Edit Profile, Member Profile  <- Dev 2
    search/           Search, Search Results                <- Dev 2
    requests/         Requests, RequestCard                  <- Dev 3
    notifications/    Notifications                          <- Dev 3
    reviews/          Leave/Edit Review                       <- Dev 3
    reports/          Report User                             <- Dev 3
  hooks/              shared hooks (useAuth, ...)
  services/           api.js (axios instance) + one file per resource
  context/            AuthContext.jsx
  routes/             AppRoutes.jsx, ProtectedRoute.jsx, AdminRoute.jsx
  pages/              Landing, Dashboard, ErrorPage
  styles/             global.css — design tokens & base styles
```

**Where your screens go:** create a folder under `src/features/` (or `src/pages/`
for something simple) and a matching resource file under `src/services/`
(e.g. `src/services/profileApi.js`, built on top of `api.js` — see below).
Then swap your screen into `src/routes/AppRoutes.jsx` in place of the matching
`<PlaceholderPage />`. Every route already exists, so this should be the only
change you need to make in a shared file.

## Git workflow

- `main` is always demoable — nothing broken gets merged directly to it.
- One feature branch per screen: `feature/login`, `feature/search-results`,
  `feature/requests-list`, etc.
- Every PR needs a review before merging (Dev 1 reviews by default).
- PR description should say which screen/PRD section it implements.
- Changes to shared files (`services/api.js`, `context/AuthContext.jsx`,
  `routes/`, `components/Navbar.jsx`, `styles/global.css`) go through Dev 1 —
  flag what you need changed rather than editing directly, since three people
  depend on those contracts staying stable.

## The contracts you build on

### Auth — `useAuth()`

```js
import { useAuth } from "../../hooks/useAuth.js";

const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

### Auth — `useAuth()`

```js
import { useAuth } from "../../hooks/useAuth.js";

const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
```

Never read the token or call the auth endpoints directly — this hook is the
only supported way to read or change auth state. `user` is `null` when signed
out, and looks like `{ id, name, email, role, ... }` when signed in (`role`
is decoded from the JWT, since the documented `/auth/me` response doesn't
include it — see `src/utils/jwt.js`). `isLoading` is `true` only during the
initial session check on app load.

`register(name, email, password)` takes three arguments — the backend
requires a name (2–100 characters) at signup, per the API contract.

### API contract

Backend contract: `docs/API_CONTRACT.md` in the `nexus-thoughtshare-app`
repo. Key things that affect how you call it:

- Base URL is `.../api/v1` — already baked into `VITE_API_BASE_URL`, don't
  repeat `/api/v1` in your own resource files.
- Every success response is wrapped: `{ success: true, data: {...} }`. Read
  `res.data.data`, not `res.data`, to get the actual payload.
- Collections come back as `{ items, page, pageSize, total, totalPages }`
  inside `data` — build pagination UI against that shape.
- Errors are `{ success: false, error: { code, message, field? } }`. Prefer
  checking `error.code` (e.g. `EMAIL_TAKEN`, `REQUEST_ALREADY_PENDING`,
  `EDIT_LIMIT_REACHED`) over the HTTP status alone where the contract
  defines multiple codes for the same status — see the Error Contract table
  in the doc.
- Contact fields (`preferredContactType`/`preferredContactValue`) are
  omitted/null server-side until a connection is `ACCEPTED` — don't add
  client-side hiding logic for this, the API already won't send it.

### API client — `services/api.js`

```js
import api, { getErrorMessage, getErrorField, getErrorStatus } from "../../services/api.js";

// build a resource file on top of it, e.g. services/profileApi.js:
const profileApi = {
  getMe: () => api.get("/profile/me"),
  updateMe: (data) => api.put("/profile/me", data),
};
```

- The auth token is attached automatically — don't set headers yourself.
- A 401 anywhere triggers an automatic logout + redirect to `/login`; you
  don't need to handle 401 in your own screens.
- Use `getErrorMessage(err)` to get a user-facing string from any failed
  request instead of parsing `err.response.data` yourself. `getErrorField(err)`
  and `getErrorStatus(err)` are available for field-level and status-code
  handling (400 field errors, 409 conflicts, etc.).

### Design tokens — `styles/global.css`

Use the CSS variables defined there (`--color-primary`, `--space-3`,
`--radius-md`, etc.) rather than introducing new colors or spacing values, so
all three of our screens look like one product. Shared classes already
available: `.btn` (`--primary` / `--secondary` / `--ghost` / `--block`),
`.field` (form inputs with built-in error/hint styling), `.banner`
(`--error` / `--success`), `.page` / `.page--centered` for layout, and
`.spinner` for loading states.

### Routing

Full route table lives in `src/routes/AppRoutes.jsx`. Wrap anything that
requires a signed-in member in `<ProtectedRoute>` (already done for every
route above) and anything admin-only in `<AdminRoute>`.

## Environment variables

| Variable            | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL for the backend API, e.g. `http://localhost:3000/api/v1` |
