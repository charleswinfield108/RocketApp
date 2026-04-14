# 🤖 AI_FEATURE_Account Details

> This feature allows both customers and couriers to view their account information
> and update their role-specific email and phone number. A single shared component
> renders both screens — the role determines the labels and the API payload.

---

## Feature Identity

- **Feature Name:** Account Details
- **Module:** 14 (new feature)
- **Related Area:** Mobile Frontend — Customer Account tab + Courier Account tab
- **Priority:** High
- **Dependencies:**
  - Navigation Structure (`🤖-navigation-structure.feature.md`) — `account.tsx` must exist in both `(tabs)/` and `(courier)/`
  - Role-Based Navigation (`🤖-role-based-navigation.feature.md`) — `activeRole` determines which labels and endpoint type to use
  - AuthContext — `userId`, `authToken`, and `activeRole` must be available via `useAuth()`

---

## Feature Scope

### In Scope (Included)

- Customer account screen (`app/(tabs)/account.tsx`)
- Courier account screen (`app/(courier)/account.tsx`)
- Shared `AccountForm` component used by both screens
- `GET /api/v1/account/{userId}` — fetch account data on screen load
- `PUT /api/v1/account/{userId}?type={customer|courier}` — save updated fields
- Three displayed fields: primary email (read-only), role email (editable), role phone (editable)
- `UPDATE ACCOUNT` button — submits both editable fields at once
- Loading and error states

### Out of Scope (Excluded)

- Changing the primary login email or password (read-only by design)
- Role switching from the account screen (handled by logout + account selection)
- Address field (returned by API but not shown in wireframe)
- Employee role accounts (employee type exists in API but not in mobile app scope)

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Field Display** | Display user email, user-type email, and user-type phone, based on whether the user is a courier or customer. |
| **Editable Fields** | The user can edit the user-type email and phone. User email is read-only. All changes update the database. |
| **GET request** | `/api/v1/account/{id}?type={user_type}` |
| **PUT request** | `/api/v1/account/{id}` |

> ⚠️ **API Endpoint Correction:** The actual server implementation differs from the spec above.
> Confirmed from `UserApiController.java`:
> - **GET** is `GET /api/v1/account/{id}` — **no `type` query parameter**
> - **UPDATE** is `PUT /api/v1/account/{id}?type={customer|courier}` — `type` is on the **PUT**, not the GET
> - The update method is **PUT**, not POST
>
> The mobile app must use the actual server endpoints. The spec descriptions above reflect client intent; the implementation section below reflects server reality.

---

## Sub-Requirements (Feature Breakdown)

### 1. `user_id` Storage — Required AuthContext Update

The account endpoint uses the **user ID** (`user_id`), not the `customer_id` or `courier_id`.

The login response (`AuthResponseSuccessDTO`) already returns `user_id`, but the current `login.tsx` and `authContext.tsx` do not store it.

**Login response shape (confirmed from `AuthResponseSuccessDTO.java`):**
```json
{
  "accessToken": "eyJhbGci...",
  "success": true,
  "user_id": 1,
  "customer_id": 2,
  "courier_id": null
}
```

**Required changes:**

`authContext.tsx` — add `userId`:
```typescript
interface AuthContextType {
  // ... existing fields
  userId: number | null;       // NEW
}
```
- Store `userId` in AsyncStorage under key `userId`
- Load from AsyncStorage in `bootstrapAsync`
- Pass through `signIn()` alongside `customerId` and `courierId`
- Clear on `signOut()`

`login.tsx` — extract and pass `user_id`:
```typescript
const { accessToken, user_id, customer_id, courier_id } = authData;
await signIn(email, accessToken, user_id, customer_id, courier_id);
```

---

### 2. Fetch Account Data — GET `/api/v1/account/{userId}`

Called on component mount. No `type` parameter needed — the response includes all roles the user has.

**Response shape (`ApiAccountDTO`):**
```json
{
  "id": 1,
  "name": "Erica Ger",
  "email": "erica.ger@gmail.com",
  "customer": {
    "id": 2,
    "phone": "817-268-8862",
    "email": "miguelina_powlowski.edit@adams.org",
    "address": "123 Main St."
  },
  "courier": null
}
```

- `email` (top-level) — the primary login email — **read-only**
- `customer` — present only if user has a customer role, `null` otherwise
- `courier` — present only if user has a courier role, `null` otherwise
- Fields within `customer` / `courier`: `id`, `phone`, `email`, `address`

**Field mapping to wireframe:**

| Wireframe Label | API Field | Editable? |
|-----------------|-----------|-----------|
| Primary Email (Read Only) | `response.email` | No |
| Customer Email / Courier Email | `response.customer.email` or `response.courier.email` | Yes |
| Customer Phone / Courier Phone | `response.customer.phone` or `response.courier.phone` | Yes |

---

### 3. Update Account — PUT `/api/v1/account/{userId}?type={customer|courier}`

Called when the user taps **UPDATE ACCOUNT**.

**Request (query param + body):**
```
PUT /api/v1/account/1?type=customer
Content-Type: application/json

{
  "email": "new.customer.email@example.com",
  "phone": "555-123-4567"
}
```

**Body fields (`ApiUpdateAccountDTO`):**
- `email` — new role-specific email (customer email or courier email)
- `phone` — new role-specific phone number

**`type` query param values:**
- `"customer"` when updating from the customer account screen
- `"courier"` when updating from the courier account screen

**Success response (HTTP 200):** Returns updated `ApiAccountDTO`  
**Error response (HTTP 404):** User or role not found  
**Error response (HTTP 400):** Invalid type parameter

---

### 4. Screen Layout — Both Customer and Courier

**Layout (from wireframe, identical structure for both roles):**

```
[Header: Rocket Food Delivery logo + LOG OUT button]

MY ACCOUNT

Logged In As: [Customer | Courier]

Primary Email (Read Only)
┌─────────────────────────────────┐
│ erica.ger@gmail.com             │  ← read-only, greyed out
└─────────────────────────────────┘
Email used to login to the application.

[Customer Email | Courier Email]:
┌─────────────────────────────────┐
│ miguelina_powlowski@adams.org   │  ← editable
└─────────────────────────────────┘
Email used for your [Customer | Courier] account.

[Customer Phone | Courier Phone]:
┌─────────────────────────────────┐
│ 817-268-8862                    │  ← editable
└─────────────────────────────────┘
Phone number for your [Customer | Courier] account.

[ UPDATE ACCOUNT ]  ← brand orange button, full width
```

**Footer:**
- Customer screen: Restaurants | OrderHistory | **Account** (Account tab active)
- Courier screen: Deliveries | **Account** (Account tab active)

---

### 5. Shared `AccountForm` Component

Both screens use the same component to avoid code duplication.

```typescript
// components/AccountForm.tsx
interface AccountFormProps {
  role: 'customer' | 'courier';
  userId: number;
}
```

**Component responsibilities:**
- Fetches account data from `GET /api/v1/account/{userId}` on mount
- Manages local state for editable fields (`roleEmail`, `rolePhone`)
- Submits `PUT /api/v1/account/{userId}?type={role}` on button press
- Renders the three-field layout with correct labels per role
- Shows loading spinner during fetch and submit
- Shows success or error feedback after submit

**Usage:**
```typescript
// app/(tabs)/account.tsx
export default function CustomerAccountScreen() {
  const { userId } = useAuth();
  return <AccountForm role="customer" userId={userId!} />;
}

// app/(courier)/account.tsx
export default function CourierAccountScreen() {
  const { userId } = useAuth();
  return <AccountForm role="courier" userId={userId!} />;
}
```

---

### 6. Loading and Error States

**On fetch:**
- Show `ActivityIndicator` while GET is in-flight
- Show error message with retry button if GET fails
- Do not render form until data is loaded

**On submit:**
- Disable `UPDATE ACCOUNT` button during PUT call
- Show loading indicator inside or beside button
- On success: show success message (e.g., *"Account updated successfully"*)
- On error: show error message below button

---

## User Flow / Logic (High Level)

```
User navigates to Account tab (customer or courier)
  ↓
[AccountForm mounts]
  ↓
GET /api/v1/account/{userId}
  ├─ Loading → ActivityIndicator
  ├─ Error   → Error message + Retry button
  └─ Success → Populate fields
      ├─ Primary Email input: response.email  (read-only)
      ├─ Role Email input:    response.[role].email  (editable)
      └─ Role Phone input:    response.[role].phone  (editable)

User edits Role Email and/or Role Phone
  ↓
User taps UPDATE ACCOUNT
  ↓
PUT /api/v1/account/{userId}?type={role}
Body: { email: roleEmail, phone: rolePhone }
  ├─ Loading → button disabled, spinner shown
  ├─ Error   → error message shown below button
  └─ Success → success message shown, fields updated with response data
```

---

## Interfaces (Pages, Endpoints, Screens)

### Files Created

| File | Purpose |
|------|---------|
| `app/(tabs)/account.tsx` | Customer account screen — renders `<AccountForm role="customer" />` |
| `app/(courier)/account.tsx` | Courier account screen — renders `<AccountForm role="courier" />` |
| `components/AccountForm.tsx` | Shared form component for both roles |
| `services/accountService.ts` | API calls: `getAccount(userId)` and `updateAccount(userId, type, data)` |

### Files Modified

| File | Change |
|------|--------|
| `client/services/authContext.tsx` | Add `userId` state, store/load from AsyncStorage |
| `client/app/(auth)/login.tsx` | Extract `user_id` from response, pass to `signIn()` |

### Backend API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/account/{userId}` | Fetch account data (no type param) |
| `PUT` | `/api/v1/account/{userId}?type={customer\|courier}` | Update role-specific email and phone |

**GET Response (`ApiAccountDTO`):**
```json
{
  "data": {
    "id": 1,
    "name": "Erica Ger",
    "email": "erica.ger@gmail.com",
    "customer": {
      "id": 2,
      "phone": "817-268-8862",
      "email": "miguelina_powlowski.edit@adams.org",
      "address": "123 Main St."
    },
    "courier": null
  }
}
```

**PUT Request body:**
```json
{
  "email": "updated.email@example.com",
  "phone": "555-987-6543"
}
```

**PUT Success Response:** Updated `ApiAccountDTO` (same shape as GET response)

---

## Data Used or Modified

### AsyncStorage Keys

| Key | Type | Written By | New in M14? |
|-----|------|-----------|------------|
| `authToken` | string | `signIn()` | No |
| `customerId` | string | `signIn()` | No |
| `courierId` | string | `signIn()` | Yes |
| `userId` | string | `signIn()` | **Yes** |

### AuthContext State

| State | Type | Source | Used By |
|-------|------|--------|---------|
| `userId` | number \| null | `signIn()` → AsyncStorage | `AccountForm` (as `{id}` in API path) |
| `activeRole` | `'customer' \| 'courier' \| null` | `setActiveRole()` | `AccountForm` (as `type` query param) |

### Component State (`AccountForm`)

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `primaryEmail` | string | `""` | Read-only display — from `response.email` |
| `roleEmail` | string | `""` | Editable — from `response.[role].email` |
| `rolePhone` | string | `""` | Editable — from `response.[role].phone` |
| `loading` | boolean | `false` | Fetch or submit in-flight |
| `error` | string \| null | `null` | Fetch or submit error |
| `success` | string \| null | `null` | Submit success message |

---

## Tech Constraints (Feature-Level)

### API Rules
- The `{id}` in the endpoint is the **user ID** (`user_id` from login), not `customer_id` or `courier_id`
- `type` parameter is on the **PUT** request, not the GET
- The update method is **PUT** — do not use POST or PATCH
- Only `email` and `phone` are sent in the update body — do not send `address` or `name`

### Component Rules
- `AccountForm` must be reused — no duplicate form logic in the two screen files
- `primaryEmail` input must be non-editable: `editable={false}`, visually greyed out
- `roleEmail` and `rolePhone` inputs must be fully editable

### Validation (Client-Side)
- Role email: valid email format (regex check before submit)
- Role phone: non-empty string (no specific format enforced client-side)
- If validation fails: show inline error, do not call API

### Label Map by Role
```typescript
const LABELS = {
  customer: {
    loggedInAs:   'Logged In As: Customer',
    emailLabel:   'Customer Email:',
    emailHelper:  'Email used for your Customer account.',
    phoneLabel:   'Customer Phone:',
    phoneHelper:  'Phone number for your Customer account.',
  },
  courier: {
    loggedInAs:   'Logged In As: Courier',
    emailLabel:   'Courier Email:',
    emailHelper:  'Email used for your Courier account.',
    phoneLabel:   'Courier Phone:',
    phoneHelper:  'Phone number for your Courier account.',
  },
};
```

---

## Acceptance Criteria

### Field Display
- [ ] **MY ACCOUNT** heading visible on both customer and courier screens
- [ ] "Logged In As: Customer" or "Logged In As: Courier" label shown correctly
- [ ] Primary Email field populated with login email, marked read-only, visually greyed
- [ ] Helper text *"Email used to login to the application."* shown below primary email
- [ ] Role Email field populated with `response.[role].email`
- [ ] Role Phone field populated with `response.[role].phone`
- [ ] Correct labels shown per role (Customer Email vs Courier Email, etc.)

### Editable Fields
- [ ] Primary Email input is non-editable (tapping does nothing)
- [ ] Role Email input accepts text input
- [ ] Role Phone input accepts text input
- [ ] UPDATE ACCOUNT button visible and tappable

### GET Request
- [ ] `GET /api/v1/account/{userId}` called on screen mount
- [ ] `userId` from `AuthContext` used as path parameter (not `customerId` or `courierId`)
- [ ] No `type` query parameter sent on GET
- [ ] Bearer token included in request header
- [ ] Loading indicator shown during fetch
- [ ] Error state shown with retry if fetch fails

### PUT Request
- [ ] `PUT /api/v1/account/{userId}?type={customer|courier}` called on UPDATE ACCOUNT press
- [ ] Correct `type` query param used for the active role
- [ ] Body contains only `email` and `phone`
- [ ] Bearer token included
- [ ] Button disabled during PUT call
- [ ] Success message shown on HTTP 200
- [ ] Error message shown on failure

### Shared Component
- [ ] `AccountForm` component used by both `(tabs)/account.tsx` and `(courier)/account.tsx`
- [ ] No duplicated form logic between the two screen files

### Cross-Platform
- [ ] Account screen works on iOS simulator
- [ ] Account screen works on Android simulator

---

## Notes for the AI

### Implementation Order

1. Update `AuthContextType` to add `userId: number | null`
2. Update `bootstrapAsync` to load `userId` from AsyncStorage
3. Update `signIn()` to accept and store `userId`
4. Update `signOut()` to clear `userId` from AsyncStorage
5. Update `login.tsx` to extract `user_id` and pass to `signIn()`
6. Create `services/accountService.ts`
7. Create `components/AccountForm.tsx`
8. Create `app/(tabs)/account.tsx` — thin wrapper around `AccountForm`
9. Create `app/(courier)/account.tsx` — thin wrapper around `AccountForm`

### `accountService.ts` Pattern
```typescript
// services/accountService.ts
import apiClient from './api';
import { ApiAccountDTO, ApiUpdateAccountDTO } from '@/types';

export const accountService = {
  getAccount: (userId: number) =>
    apiClient.get(`/api/v1/account/${userId}`),

  updateAccount: (userId: number, type: 'customer' | 'courier', data: { email: string; phone: string }) =>
    apiClient.put(`/api/v1/account/${userId}?type=${type}`, data),
};
```

### Common Mistakes to Avoid

- ❌ Using `customer_id` or `courier_id` as the path parameter — it must be `user_id`
- ❌ Adding `?type=` to the GET request — type param is only on PUT
- ❌ Using POST instead of PUT for the update
- ❌ Sending `address` in the PUT body — only `email` and `phone`
- ❌ Duplicating form logic in each screen file — use `AccountForm` component
- ❌ Making the primary email input editable — it must be read-only

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — Account Management section, shared `AccountForm` rules
- **Navigation Structure:** `ai/features/🤖-navigation-structure.feature.md` — `account.tsx` file locations
- **Role-Based Navigation:** `ai/features/🤖-role-based-navigation.feature.md` — `userId` in AuthContext
- **User API Controller:** `server/serverJAVA/.../controller/api/UserApiController.java`
- **Account DTO (response):** `server/serverJAVA/.../dtos/user/ApiAccountDTO.java`
- **Update DTO (request body):** `server/serverJAVA/.../dtos/user/ApiUpdateAccountDTO.java`
- **Auth Response DTO:** `server/serverJAVA/.../dtos/auth/AuthResponseSuccessDTO.java`
- **Wireframe:** `support_materials_14/Design/` — Customer Account Page + Courier Account Page

---

**The `userId` from the login response is the key that ties this feature together — it must be stored in AuthContext or the account endpoint cannot be called.**
