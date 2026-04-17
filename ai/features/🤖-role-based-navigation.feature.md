# 🤖 AI_FEATURE_Role-Based Navigation

> This feature controls where a user is sent after successful login based on whether
> they are a customer, a courier, or both. It introduces the account selection screen
> for dual-role users and updates AuthContext to carry role state.

---

## Feature Identity

- **Feature Name:** Role-Based Navigation
- **Module:** 14 (new feature)
- **Related Area:** Mobile Frontend — Auth flow, AuthContext, Login screen
- **Priority:** Critical (blocks all customer and courier features)
- **Dependencies:**
  - Navigation Structure (`🤖-navigation-structure.feature.md`) — routes must exist before redirects work
  - Login Page (`🤖-login-page.feature.md`) — login response is the source of role data
  - AuthContext (`client/services/authContext.tsx`) — must be extended to hold `courierId` and `activeRole`

---

## Client Requirements (Official)

> After entering the correct credentials, the user will be prompted to select which account they would like to log in as — a Courier or Customer. The user should only be directed to this page if they have both accounts. Otherwise, it will take them to the Courier / Customer app directly after login, whichever account they have.

| Scenario | Condition | Outcome |
|----------|-----------|---------|
| **Scenario 1** | User has a **customer account only** | Taken to the **Customer app** directly after successful login |
| **Scenario 2** | User has a **courier account only** | Taken to the **Courier app** directly after successful login |
| **Scenario 3** | User has **both a customer and courier account** | Taken to the **Account Selection page** after login, then redirected to the selected account app |

---

## Feature Goal

After a successful login, route the user to the correct section of the app based on their role(s):

1. **Customer only** → navigate directly to the Customer section (`/(tabs)/(restaurant)`)
2. **Courier only** → navigate directly to the Courier section (`/(courier)/deliveries`)
3. **Both roles (dual-role)** → navigate to the Account Selection screen; user picks their role for the session, then navigates to the chosen section

Role detection happens **in the login screen** by reading the API response. The chosen role for dual-role users is stored in `AuthContext` for the session only — it is never persisted to AsyncStorage.

---

## Feature Scope

### In Scope (Included)

- Role detection logic in `login.tsx` (parse `customer_id` and `courier_id` from response)
- Three routing scenarios: customer-only, courier-only, dual-role
- Account selection screen (`app/(auth)/account-selection.tsx`) — UI and navigation
- `AuthContext` extensions: `courierId`, `activeRole`, `setActiveRole`
- Updated `signIn()` signature to accept `courierId`
- Updated `signOut()` to clear `courierId` from AsyncStorage
- Blocking back-navigation from account selection back to login

### Out of Scope (Excluded)

- Login form UI (see `🤖-login-page.feature.md`)
- Customer tab screens (see respective feature specs)
- Courier tab screens (see `🤖-courier-deliveries.feature.md`)
- Account management screens (see `🤖-account-management.feature.md`)
- Role-based API access control (handled server-side)
- Persisting role across app restarts (session-only by design)

---

## Sub-Requirements (Feature Breakdown)

### 1. Login Response — Role Detection

The existing login API response already returns both IDs. The login screen must extract both:

```typescript
// Current (Module 13) — only reads customer_id
const { accessToken, customer_id } = authData;

// Required (Module 14) — reads both IDs
const { accessToken, customer_id, courier_id } = authData;
```

**API Response Shape (from `/api/v1/auth/login`):**
```json
{
  "accessToken": "eyJhbGci...",
  "customer_id": 2,
  "courier_id": null
}
```
- `customer_id` is a number if the user is a customer, `null` otherwise
- `courier_id` is a number if the user is a courier, `null` otherwise
- A dual-role user will have both as non-null numbers
- At least one ID will always be non-null on a successful login (the server validates this)

**Current issue in `login.tsx` (line 67-71):** The Module 13 implementation rejects login if `customer_id` is null. This guard must be **removed** in Module 14 — a courier-only user has no `customer_id` and must be allowed through.

---

### 2. Role Routing Logic — In `login.tsx`

After `signIn()` succeeds, determine the routing target:

```typescript
const isCustomer = customer_id !== null && customer_id !== undefined;
const isCourier  = courier_id  !== null && courier_id  !== undefined;

if (isCustomer && isCourier) {
  // Dual-role: go to account selection
  router.replace('/(auth)/account-selection');
} else if (isCustomer) {
  // Customer only: go directly to customer app
  router.replace('/(tabs)/(restaurant)');
} else if (isCourier) {
  // Courier only: go directly to courier app
  router.replace('/(courier)/deliveries');
} else {
  // Neither role: show error — this should not happen with valid credentials
  setError('This account is not associated with any role.');
}
```

**Rule:** Always use `router.replace()` — never `router.push()`. Back navigation to the login screen after a successful login must be impossible.

---

### 3. Account Selection Screen — `app/(auth)/account-selection.tsx`

Shown only when the user is dual-role. Presents two tappable cards and routes to the chosen section.

**Layout (from wireframe):**
- Rocket Food Delivery logo centered at top
- "Select Account Type" label below logo
- Two side-by-side cards:
  - Left card: person icon + "Customer" label
  - Right card: taxi/car icon + "Courier" label

**On card tap:**
```typescript
// Customer card tapped
setActiveRole('customer');
router.replace('/(tabs)/(restaurant)');

// Courier card tapped
setActiveRole('courier');
router.replace('/(courier)/deliveries');
```

**Rules:**
- `setActiveRole` is called **before** `router.replace`
- Back navigation is blocked — this screen uses `router.replace` for all outbound navigation
- No header or tab bar is visible on this screen
- This screen is only reachable after a successful login with dual roles — it cannot be reached directly

---

### 4. AuthContext Extensions — `client/services/authContext.tsx`

The existing `AuthContext` only tracks `customerId`. Module 14 requires two additions:

#### New state: `courierId`
- Type: `number | null`
- Stored in AsyncStorage under key `courierId`
- Loaded during `bootstrapAsync` on app start alongside `authToken`
- Written by `signIn()`
- Cleared by `signOut()`

#### New state: `activeRole`
- Type: `'customer' | 'courier' | null`
- **Session-only** — lives in React Context only, never written to AsyncStorage
- Set by `setActiveRole()` when user taps a card on the account selection screen
- Defaults to `null` on app start
- Cleared on `signOut()`
- For single-role users: `activeRole` stays `null` — root layout reads `customerId`/`courierId` directly for routing decisions

#### Updated `signIn()` signature:
```typescript
// Current (Module 13)
signIn: (email: string, token: string, customerId: number) => Promise<void>

// Required (Module 14)
signIn: (email: string, token: string, customerId: number | null, courierId: number | null) => Promise<void>
```

#### New `setActiveRole()` function:
```typescript
setActiveRole: (role: 'customer' | 'courier') => void
```

#### Updated `AuthContextType` interface:
```typescript
interface AuthContextType {
  isSignedIn: boolean;
  isLoading: boolean;
  authToken: string | null;
  customerId: number | null;
  courierId: number | null;          // NEW
  activeRole: 'customer' | 'courier' | null;  // NEW
  signIn: (email: string, token: string, customerId: number | null, courierId: number | null) => Promise<void>;
  setActiveRole: (role: 'customer' | 'courier') => void;  // NEW
  signOut: () => Promise<void>;
}
```

#### Updated `bootstrapAsync` — load `courierId` from AsyncStorage:
```typescript
const bootstrapAsync = async () => {
  const token          = await AsyncStorage.getItem('authToken');
  const storedCustId   = await AsyncStorage.getItem('customerId');
  const storedCourierId = await AsyncStorage.getItem('courierId');  // NEW

  if (token) {
    setAuthToken(token);
    setIsSignedIn(true);
  }
  if (storedCustId)    setCustomerId(parseInt(storedCustId, 10));
  if (storedCourierId) setCourierId(parseInt(storedCourierId, 10));  // NEW
  setIsLoading(false);
};
```

#### Updated `signOut()` — clear `courierId`:
```typescript
const signOut = async () => {
  await AsyncStorage.multiRemove(['authToken', 'customerId', 'courierId']);  // NEW
  setAuthToken(null);
  setCustomerId(null);
  setCourierId(null);     // NEW
  setActiveRole(null);    // NEW — clear session role
  setIsSignedIn(false);
};
```

---

### 5. Root Layout — Role-Aware Routing Guard

The root layout (`app/_layout.tsx`) already has a `useEffect` that routes based on `isSignedIn`. Module 14 extends this to also consider `courierId` and `activeRole`:

```typescript
useEffect(() => {
  if (isLoading) return;

  if (!isSignedIn) {
    router.replace('/(auth)/login');
    return;
  }

  const isCustomer = customerId !== null;
  const isCourier  = courierId  !== null;
  const isDualRole = isCustomer && isCourier;

  if (isDualRole && activeRole === null) {
    // Dual-role and no role chosen yet — send to account selection
    router.replace('/(auth)/account-selection');
  } else if (activeRole === 'courier' || (!isCustomer && isCourier)) {
    router.replace('/(courier)/deliveries');
  } else {
    router.replace('/(tabs)/(restaurant)');
  }
}, [isSignedIn, isLoading, customerId, courierId, activeRole]);
```

**Note:** The root layout routing guard acts as a safety net. The primary routing decision happens in `login.tsx` immediately after `signIn()`. The root layout guard handles app restarts and edge cases.

---

## User Flow / Logic (High Level)

```
User submits login credentials
  ↓
POST /api/v1/auth/login
  ↓
[API Response]
  ├─ HTTP 401/400 → show error, stay on login
  └─ HTTP 200
      ├─ Extract: accessToken, customer_id, courier_id
      ├─ Neither ID present → show error ("account not associated with any role")
      └─ Call signIn(email, accessToken, customer_id, courier_id)
          ↓
          [Determine role scenario]
          │
          ├─ customer_id ≠ null, courier_id = null
          │     → router.replace('/(tabs)/(restaurant)')
          │     → Customer tabs load
          │
          ├─ customer_id = null, courier_id ≠ null
          │     → router.replace('/(courier)/deliveries')
          │     → Courier tabs load
          │
          └─ customer_id ≠ null, courier_id ≠ null
                → router.replace('/(auth)/account-selection')
                ↓
                Account Selection Screen
                  ├─ Tap "Customer"
                  │     → setActiveRole('customer')
                  │     → router.replace('/(tabs)/(restaurant)')
                  │
                  └─ Tap "Courier"
                        → setActiveRole('courier')
                        → router.replace('/(courier)/deliveries')
```

---

## Interfaces (Pages, Endpoints, Screens)

### Files Modified

| File | Change |
|------|--------|
| `client/services/authContext.tsx` | Add `courierId`, `activeRole`, `setActiveRole`; update `signIn`, `signOut` |
| `client/app/(auth)/login.tsx` | Extract `courier_id`, remove customer-only guard, add role routing logic |
| `client/app/_layout.tsx` | Read `courierId`, `activeRole` from context; extend routing `useEffect` |

### Files Created

| File | Purpose |
|------|---------|
| `client/app/(auth)/account-selection.tsx` | Role picker UI for dual-role users |

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/auth/login` | Authenticate user — returns token + role IDs |

**Full Response (Module 14 expected shape):**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "customer_id": 2,
  "courier_id": null
}
```

> **Verify:** Confirm that the Module 12 API actually returns `courier_id` in the login response.
> If the field name differs (e.g., `courierId`), update the destructuring in `login.tsx` accordingly.
> The API is not modified — the mobile app adapts to whatever the server returns.

---

## Data Used or Modified

### AsyncStorage Keys

| Key | Type | Written By | Read By | Cleared By |
|-----|------|-----------|---------|-----------|
| `authToken` | string | `signIn()` | `bootstrapAsync`, API interceptor | `signOut()` |
| `customerId` | string | `signIn()` | `bootstrapAsync` | `signOut()` |
| `courierId` | string | `signIn()` *(NEW)* | `bootstrapAsync` *(NEW)* | `signOut()` *(NEW)* |

### AuthContext State

| State | Type | Persisted | Source | Cleared By |
|-------|------|-----------|--------|-----------|
| `isSignedIn` | boolean | No | Set by `signIn()` | `signOut()` |
| `authToken` | string \| null | Yes (AsyncStorage) | `signIn()` | `signOut()` |
| `customerId` | number \| null | Yes (AsyncStorage) | `signIn()` | `signOut()` |
| `courierId` | number \| null | Yes (AsyncStorage) *(NEW)* | `signIn()` | `signOut()` |
| `activeRole` | `'customer' \| 'courier' \| null` | **No — session only** *(NEW)* | `setActiveRole()` | `signOut()` |

### Why `activeRole` is Not Persisted

On app restart, the root layout re-evaluates `customerId` and `courierId` from AsyncStorage. A dual-role user will be sent back to account selection to explicitly choose their role. This is intentional — it prevents a courier from accidentally operating as a customer due to a stale persisted role.

---

## Tech Constraints (Feature-Level)

### Required Technologies
- **State:** React Context (`AuthProvider`) — `courierId` and `activeRole` live here
- **Storage:** AsyncStorage — `courierId` persisted; `activeRole` never persisted
- **Routing:** expo-router — `router.replace()` for all post-login navigation
- **Icons:** FontAwesome — person icon for Customer card, taxi icon for Courier card

### Routing Rules
- `router.replace()` **always** used for post-login redirects (no back navigation to login or account selection)
- `router.push()` is **never** used for auth flow transitions

### AuthContext Contract
- All screens that need role information use `useAuth()` hook
- No component reads `AsyncStorage` directly for role — always go through `AuthContext`
- `setActiveRole` is the only way to update `activeRole` — no direct state mutation

---

## Acceptance Criteria

### Customer-Only Redirection
- [ ] User with only `customer_id` (non-null) in login response goes directly to `/(tabs)/(restaurant)`
- [ ] Customer tabs are visible immediately — no account selection screen shown
- [ ] `customerId` stored in AsyncStorage
- [ ] `courierId` stored as null / not set in AsyncStorage

### Courier-Only Redirection
- [ ] User with only `courier_id` (non-null) in login response goes directly to `/(courier)/deliveries`
- [ ] Courier tabs are visible immediately — no account selection screen shown
- [ ] `courierId` stored in AsyncStorage
- [ ] `customerId` stored as null / not set in AsyncStorage

### Dual-Role Redirection to Account Selection
- [ ] User with both `customer_id` and `courier_id` (both non-null) is routed to account selection
- [ ] Account selection screen shows before any app section loads
- [ ] Back button on account selection does NOT navigate to login

### Account Selection — Customer Option
- [ ] Tapping "Customer" card calls `setActiveRole('customer')`
- [ ] Navigates to `/(tabs)/(restaurant)` using `router.replace()`
- [ ] Customer tab bar is visible on arrival
- [ ] Account tab reflects "Logged In As: Customer"

### Account Selection — Courier Option
- [ ] Tapping "Courier" card calls `setActiveRole('courier')`
- [ ] Navigates to `/(courier)/deliveries` using `router.replace()`
- [ ] Courier tab bar is visible on arrival
- [ ] Account tab reflects "Logged In As: Courier"

### AuthContext
- [ ] `courierId` available via `useAuth()` in any component
- [ ] `activeRole` available via `useAuth()` in any component
- [ ] `setActiveRole()` accessible via `useAuth()`
- [ ] On logout: `courierId`, `activeRole`, `customerId`, `authToken` all cleared
- [ ] On app restart with stored `courierId`: dual-role user lands on account selection again

### Error Cases
- [ ] Login response with neither `customer_id` nor `courier_id` shows an error message
- [ ] Login response with missing `accessToken` shows an error message

### Cross-Platform
- [ ] All three routing scenarios work on iOS simulator
- [ ] All three routing scenarios work on Android simulator

---

## Notes for the AI

### What Needs to Change in Existing Files

**`client/services/authContext.tsx`:**
1. Add `courierId` state (`useState<number | null>(null)`)
2. Add `activeRole` state (`useState<'customer' | 'courier' | null>(null)`)
3. Update `bootstrapAsync` to load `courierId` from AsyncStorage
4. Update `signIn()` to accept and store `courierId`
5. Update `signOut()` to clear `courierId` and reset `activeRole`
6. Add `setActiveRole` function and expose it on context value
7. Update `AuthContextType` interface with new fields

**`client/app/(auth)/login.tsx`:**
1. Extract `courier_id` alongside `customer_id` from the response (line 59)
2. **Remove** the customer-only guard (lines 67-71) — replace with role detection
3. Update `signIn()` call to pass both IDs: `await signIn(email, accessToken, customer_id, courier_id)`
4. Replace `router.replace('/(tabs)/(restaurant)/index')` with role-routing logic

**`client/app/_layout.tsx`:**
1. Destructure `courierId` and `activeRole` from `useAuth()`
2. Extend the `useEffect` routing logic to handle courier-only and dual-role scenarios

### Common Mistakes to Avoid

- ❌ Persisting `activeRole` to AsyncStorage — it must be session-only
- ❌ Using `router.push()` after login — always `router.replace()`
- ❌ Keeping the `if (!customer_id)` guard from Module 13 — it will break courier-only logins
- ❌ Assuming `courier_id` is always present in the response — check for null explicitly
- ❌ Calling `setActiveRole` after `router.replace` — set role first, then navigate
- ❌ Reading `AsyncStorage` directly in components — always use `useAuth()`

### Implementation Order

1. Update `AuthContextType` interface in `authContext.tsx`
2. Add `courierId` and `activeRole` state to `AuthProvider`
3. Update `bootstrapAsync` to load `courierId`
4. Update `signIn()` to accept and persist `courierId`
5. Update `signOut()` to clear `courierId` and `activeRole`
6. Add `setActiveRole` to context value
7. Update `login.tsx` — extract `courier_id`, remove customer guard, add routing logic
8. Update `_layout.tsx` — extend routing `useEffect`
9. Create `app/(auth)/account-selection.tsx`
10. Test all three scenarios: customer-only, courier-only, dual-role

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — Role Detection Logic, Navigation Architecture
- **Navigation Structure:** `ai/features/🤖-navigation-structure.feature.md` — route targets
- **Login Feature:** `ai/features/🤖-login-page.feature.md` — login form and API call
- **AuthContext (existing):** `client/services/authContext.tsx`
- **Login Screen (existing):** `client/app/(auth)/login.tsx`
- **Root Layout (existing):** `client/app/_layout.tsx`
- **API Service (existing):** `client/services/api.ts`
- **Wireframe:** `support_materials_14/Design/` — Account Selection screen layout

---

**This feature is the decision point for the entire app. All role-specific sections depend on role detection and routing being correct.**
