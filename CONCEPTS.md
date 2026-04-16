# CONCEPTS.md — Three Challenging Concepts

---

## Concept 1: Account Selection Screen for Dual-Role Users

### Purpose in the Project
RocketApp supports users who hold both a customer role and a courier role under
the same login. When such a user signs in, the app cannot automatically enter
either tab layout — it must first ask which role the user wants to act as for
this session. The account selection screen handles that decision and stores the
active role in React context so the rest of the app can respond accordingly.

### Why It Was Challenging
The challenge was managing a three-way authentication state: customer-only,
courier-only, and dual-role. The auth guard in `_layout.tsx` runs a `useEffect`
that reads `customerId`, `courierId`, and `activeRole` from context every time
any of those values change. Getting the branching logic right — including the
`isDualRole && activeRole === null` condition that triggers the selection screen —
required careful reasoning about which state combinations were valid and in what
order they could arrive.

A second challenge was navigation: the selection screen uses `router.replace()`
so it is removed from the navigation stack after the user picks a role, making
it impossible to navigate back to it during a session.

### Usage Location
- `client/app/(auth)/account-selection.tsx` — the selection screen UI
- `client/services/authContext.tsx` — `activeRole` state, `setActiveRole()` method
- `client/app/_layout.tsx` — lines 27–37, the tri-branch auth guard logic

---

## Concept 2: Account Management Screens with Role-Specific API Endpoints

### Purpose in the Project
Both customers and couriers can view and update their contact details (email and
phone number) from their respective Account tabs. The primary login email is
displayed read-only; only the role-specific email and phone are editable. All
changes persist to the database via REST API calls.

### Why It Was Challenging
Two distinct challenges arose here.

**First — API endpoint design:** The GET and POST endpoints follow opposite
conventions. The GET request includes the user type as a query parameter
(`GET /api/account/{id}?type={user_type}`) so the server knows which
role-specific record to fetch. The POST/PUT request omits the query parameter
(`PUT /api/account/{id}`) because the request body contains the full update
payload. Getting these backwards caused silent failures that were hard to
diagnose.

**Second — Component reuse:** Rather than writing two separate account screens
for customer and courier, a single `AccountForm` component accepts a `role` prop
(`'customer' | 'courier'`). It uses that prop to select the correct field labels,
pass the type to the GET request, and read the right nested object
(`account.customer` vs `account.courier`) from the API response. This pattern
avoids duplication but requires careful prop-driven branching throughout the
component.

### Usage Location
- `client/components/AccountForm.tsx` — the shared form component; role prop
  drives labels, GET type param, and response field selection
- `client/services/accountService.ts` — `getAccount(userId, type)` and
  `updateAccount(userId, data)` with the correct endpoint shapes
- `client/app/(tabs)/account.tsx` — customer entry point (`role="customer"`)
- `client/app/(courier)/account.tsx` — courier entry point (`role="courier"`)

---

## Concept 3: Order Confirmation Modal with Multi-State UI and Notification Preferences

### Purpose in the Project
Before placing an order, the customer sees a confirmation modal that summarises
the items and total. The modal also lets the user opt in to receive their order
confirmation by email and/or SMS using checkboxes. On confirm, the modal manages
a processing state, shows a success or error result, and then auto-closes.

### Why It Was Challenging
Two problems made this more complex than a typical confirmation dialog.

**First — Multi-state UI management:** The modal moves through four states:
`idle` → `processing` → `success` or `error`. Each state changes which UI
elements are visible (buttons, spinner, success tick, error message) and which
are interactive. A separate challenge was that the parent component clears the
cart immediately after the API call, which would blank out the order summary
mid-display. The fix was to snapshot the cart contents at the moment the user
presses Confirm, so the summary stays populated during processing and on the
success screen.

**Second — Notification parameter naming:** The order POST body must include two
boolean fields named exactly `sendEmail` and `sendSMS` (camelCase, with SMS in
all caps). Using snake_case (`send_email`, `send_sms`) or inconsistent casing
caused the server to silently ignore the fields. The checkbox state flows from
the modal's internal state → `onConfirm` callback → `handleConfirmOrder` in the
screen → the API request body.

### Usage Location
- `client/components/ConfirmationModal.tsx` — modal states, snapshot pattern
  (line 41), checkbox UI (lines 141–178), `onConfirm(sendEmail, sendSms)` call
- `client/app/(tabs)/(restaurant)/[id].tsx` — `handleConfirmOrder` function
  (lines 103–123); builds the POST body with `sendEmail` and `sendSMS`
