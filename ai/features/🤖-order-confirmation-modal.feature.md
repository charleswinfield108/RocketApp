# 🤖 AI_FEATURE_Order Confirmation Modal

> This feature is the final step of the customer order flow. The customer reviews their
> order summary, optionally opts in to email and/or SMS confirmation, then submits the order.
> Module 14 adds the notification opt-in checkboxes to the existing Module 13 modal stub.

---

## Feature Identity

- **Feature Name:** Order Confirmation Modal
- **Module:** 14 (extends Module 13 stub)
- **Related Area:** Mobile Frontend — `app/(tabs)/(restaurant)/modal.tsx`
- **Priority:** Critical (final step of order placement)
- **Dependencies:**
  - Restaurant Menu Page (`🤖-restaurant-menu-page.feature.md`) — passes selected items
  - Navigation Structure (`🤖-navigation-structure.feature.md`) — modal route exists
  - AuthContext — `customerId` and `authToken` required for POST body and header

---

## Feature Scope

### In Scope (Included)

- Order summary display — selected items, quantities, prices, total
- Notification opt-in checkboxes: "By Email" and "By Phone"
- `POST /api/v1/orders` with `send_email` and `send_sms` boolean fields
- Processing → Success → Error state machine
- Success: auto-navigate to Order History after 2.5 seconds
- Error: show message and allow retry

### Out of Scope (Excluded)

- Payment processing (order creation only)
- Delivery address selection
- Promo/discount codes
- Editing item quantities from the modal (read-only)
- Email/SMS rendering (handled entirely server-side)

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Notification Checkbox** | Users can choose to receive a confirmation via SMS and/or email through a checkbox. |
| **Notification Parameters** | The order POST request includes two boolean fields: `sendSMS` and `sendEmail`. |

> ⚠️ **API Field Name Correction:** The requirement uses camelCase (`sendSMS`, `sendEmail`) but the
> actual server DTO (`ApiCreateOrderDTO.java`) uses snake_case with `@JsonProperty`:
> - `send_email` (boolean, default `false`)
> - `send_sms` (boolean, default `false`)
>
> The mobile app must send `send_email` and `send_sms` in the JSON body. The UI checkbox labels
> remain "By Email" and "By Phone" as shown in the wireframe.

---

## Sub-Requirements (Feature Breakdown)

### 1. Order Summary Display

Shown at the top of the modal before the notification section.

**Layout (from wireframe):**
```
Order Confirmation          [×]
─────────────────────────────
Order Summary
[Product Name]        x1    $ XX.XX
...
─────────────────────────────
                   TOTAL: $ XX.XX
```

**Each product row:**
- Product name (left)
- `x[quantity]` (center)
- `$ [unit_price]` formatted as `$ XX.XX` (right)

**Total row:**
- Label: `TOTAL:` (bold)
- Value: `$ [sum]` formatted as `$ XX.XX`

**Price note:** Prices come from the menu screen as unit prices in **dollars** (not cents — the menu API returns prices in cents, so divide by 100 before passing to modal).

---

### 2. Notification Opt-In Checkboxes (Module 14 Addition)

Shown below the TOTAL line, above the CONFIRM ORDER button.

**Layout (from wireframe):**
```
Would you like to receive your order
confirmation by email and/or text?

□ By Email          □ By Phone
```

**Behaviour:**
- Both checkboxes unchecked by default
- Each checkbox is independent — user can select neither, one, or both
- Checking "By Email" → `sendEmail = true` in the POST body
- Checking "By Phone" → `sendSms = true` in the POST body
- Label "By Phone" maps to SMS — do not rename the checkbox
- Checkboxes remain visible and changeable until CONFIRM ORDER is tapped
- During processing/success/error states, checkboxes are disabled (not interactive)

**State:**
```typescript
const [sendEmail, setSendEmail] = useState(false);
const [sendSms, setSendSms]     = useState(false);
```

---

### 3. Order Submission — POST `/api/v1/orders`

Called when user taps **CONFIRM ORDER**.

**Request body (`ApiCreateOrderDTO`):**
```json
{
  "restaurant_id": 5,
  "customer_id": 2,
  "products": [
    { "id": 12, "quantity": 1 },
    { "id": 7,  "quantity": 2 }
  ],
  "send_email": true,
  "send_sms": false
}
```

**Field sources:**

| Field | Source |
|-------|--------|
| `restaurant_id` | Passed from restaurant menu screen via route params |
| `customer_id` | `customerId` from `AuthContext` |
| `products[].id` | Product ID from menu item |
| `products[].quantity` | Quantity selected by user on menu screen |
| `send_email` | State of "By Email" checkbox |
| `send_sms` | State of "By Phone" checkbox |

> **Important:** `products` only contains `id` and `quantity` — do not send price or name in
> the products array. The server calculates costs from its own product table.

**Success Response (HTTP 201):**
```json
{
  "data": {
    "id": 111,
    "customer_id": 2,
    "restaurant_id": 5,
    "status": "pending",
    "products": [...],
    "total_cost": 1200
  }
}
```

**Error Response (HTTP 400):** Invalid or missing parameters  
**Error Response (HTTP 404):** Restaurant or customer not found

---

### 4. Modal State Machine

```
IDLE → PROCESSING → SUCCESS
                 ↘ ERROR → PROCESSING (retry) → SUCCESS
                                              ↘ ERROR
```

| State | CONFIRM ORDER button | Checkboxes | Displays |
|-------|---------------------|------------|---------|
| `idle` | Enabled — "CONFIRM ORDER" | Interactive | Order summary + checkboxes |
| `processing` | Disabled — spinner | Disabled | Same + loading indicator |
| `success` | Hidden | Disabled | Success message |
| `error` | Re-enabled — "CONFIRM ORDER" | Re-enabled | Error message + retry |

---

### 5. Success State

- Hide the CONFIRM ORDER button
- Show a success message: *"Order created successfully!"*
- After **2.5 seconds**, automatically navigate to Order History: `router.replace('/(tabs)/history')`
- Use `router.replace` (not `push`) so back-navigation returns to Restaurants, not the modal

---

### 6. Error State

- Show error message extracted from API response: `error.response?.data?.error`
- Fallback if no message: *"Order creation failed. Please try again."*
- Re-enable the CONFIRM ORDER button
- Re-enable the checkboxes (user can change notification preference before retrying)
- User can tap CONFIRM ORDER again immediately

---

## User Flow / Logic (High Level)

```
User on Restaurant Menu
  ↓
Taps "Create Order" button (at least one item selected)
  ↓
Modal opens
  ↓
[IDLE STATE]
Order Summary displayed
  ├─ Item name | x[qty] | $ price
  └─ TOTAL: $ [sum]

"Would you like to receive your order confirmation by email and/or text?"
  ├─ □ By Email  (unchecked by default)
  └─ □ By Phone  (unchecked by default)

User (optionally) checks one or both boxes
  ↓
User taps CONFIRM ORDER
  ↓
[PROCESSING STATE]
  ├─ Button disabled + spinner
  ├─ Checkboxes disabled
  └─ POST /api/v1/orders
      {
        restaurant_id, customer_id,
        products: [{ id, quantity }],
        send_email: true|false,
        send_sms: true|false
      }
  ↓
[API RESPONSE]
  ├─ HTTP 201 → SUCCESS STATE
  │   ├─ Button hidden
  │   ├─ "Order created successfully!" shown
  │   └─ After 2.5s → router.replace('/(tabs)/history')
  │
  └─ HTTP 4xx/5xx → ERROR STATE
      ├─ Error message shown
      ├─ Button re-enabled
      └─ Checkboxes re-enabled (user can retry)
```

---

## Interfaces (Pages, Endpoints, Screens)

### File Modified

| File | Change |
|------|--------|
| `app/(tabs)/(restaurant)/modal.tsx` | Full implementation — replaces the Module 13 stub |

### Data Passed from Menu Screen (Route Params)

```typescript
// Passed via router.push to modal
type ModalParams = {
  restaurantId: number;
  items: Array<{
    id: number;         // product ID
    name: string;       // for display
    quantity: number;   // selected qty
    unitPrice: number;  // in dollars (already divided by 100)
  }>;
};
```

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/orders` | Create order with notification flags |

**Full request body:**
```json
{
  "restaurant_id": 5,
  "customer_id": 2,
  "products": [
    { "id": 12, "quantity": 1 },
    { "id": 7,  "quantity": 2 }
  ],
  "send_email": false,
  "send_sms": true
}
```

---

## Data Used or Modified

### Component State

| State | Type | Default | Purpose |
|-------|------|---------|---------|
| `orderState` | `'idle' \| 'processing' \| 'success' \| 'error'` | `'idle'` | Controls which UI is shown |
| `sendEmail` | boolean | `false` | "By Email" checkbox value |
| `sendSms` | boolean | `false` | "By Phone" checkbox value |
| `errorMessage` | string \| null | `null` | Error to display |

### Price Formatting Rule

```typescript
// Prices arrive as dollars (already divided by 100 from menu screen)
const formatPrice = (dollars: number): string => `$ ${dollars.toFixed(2)}`;
// Output: "$ 19.50"
```

**Total calculation:**
```typescript
const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
```

---

## Tech Constraints (Feature-Level)

### Checkbox Implementation
- Use React Native `CheckBox` from `@react-native-community/checkbox` OR a custom `TouchableOpacity`-based toggle
- Do not use `Switch` — the wireframe shows square checkboxes, not toggles
- Both checkboxes must be visually independent

### Notification Field Mapping
```typescript
// Checkbox label → JSON field name
"By Email" → send_email: boolean
"By Phone" → send_sms: boolean
```

### API Payload Build
```typescript
const payload = {
  restaurant_id: restaurantId,
  customer_id: customerId,           // from useAuth()
  products: items.map(item => ({
    id: item.id,
    quantity: item.quantity,
    // do NOT include price or name — server calculates from its own data
  })),
  send_email: sendEmail,
  send_sms: sendSms,
};
```

### Navigation After Success
- Use `router.replace('/(tabs)/history')` — not `router.push()`
- Replace prevents the user from pressing back to return to a completed modal

---

## Acceptance Criteria

### Order Summary
- [ ] Modal heading: "Order Confirmation"
- [ ] "Order Summary" section label visible
- [ ] Each selected item shown: name, `x[qty]`, `$ price`
- [ ] TOTAL displayed as `TOTAL: $ XX.XX`
- [ ] No items with 0 quantity shown
- [ ] Prices formatted correctly (`$ XX.XX`)

### Notification Checkboxes
- [ ] Prompt text visible: "Would you like to receive your order confirmation by email and/or text?"
- [ ] "By Email" checkbox visible and unchecked by default
- [ ] "By Phone" checkbox visible and unchecked by default
- [ ] Checking "By Email" → `sendEmail` state becomes `true`
- [ ] Checking "By Phone" → `sendSms` state becomes `true`
- [ ] Both can be checked simultaneously
- [ ] Checkboxes disabled during `processing` and `success` states

### POST Request
- [ ] `POST /api/v1/orders` called on CONFIRM ORDER tap
- [ ] Body includes `restaurant_id`, `customer_id`, `products`
- [ ] `send_email: true` when "By Email" is checked, `false` when unchecked
- [ ] `send_sms: true` when "By Phone" is checked, `false` when unchecked
- [ ] `products` array contains only `{ id, quantity }` — no price or name
- [ ] Bearer token included in request header

### State Machine
- [ ] `idle`: CONFIRM ORDER button enabled, checkboxes interactive
- [ ] `processing`: button disabled with spinner, checkboxes disabled
- [ ] `success`: button hidden, success message shown, auto-navigate after 2.5s
- [ ] `error`: error message shown, button re-enabled, checkboxes re-enabled

### Success
- [ ] "Order created successfully!" message displayed
- [ ] Navigates to `/(tabs)/history` after 2.5 seconds via `router.replace()`

### Error / Retry
- [ ] Error message from API response displayed
- [ ] Fallback message shown if no API error text
- [ ] CONFIRM ORDER button re-enabled for retry
- [ ] Retry sends a fresh POST with current checkbox state

### Cross-Platform
- [ ] Modal renders correctly on iOS
- [ ] Modal renders correctly on Android

---

## Notes for the AI

### Implementation Pattern

```typescript
// app/(tabs)/(restaurant)/modal.tsx
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/services/authContext';
import { ordersAPI } from '@/services/api';

type OrderState = 'idle' | 'processing' | 'success' | 'error';

export default function OrderConfirmationModal() {
  const router = useRouter();
  const { customerId } = useAuth();
  const params = useLocalSearchParams();

  // Parse items passed from menu screen
  const restaurantId = Number(params.restaurantId);
  const items = JSON.parse(params.items as string) as Array<{
    id: number; name: string; quantity: number; unitPrice: number;
  }>;

  const [orderState, setOrderState] = useState<OrderState>('idle');
  const [sendEmail, setSendEmail]   = useState(false);
  const [sendSms, setSendSms]       = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const formatPrice = (n: number) => `$ ${n.toFixed(2)}`;

  const handleConfirm = async () => {
    setOrderState('processing');
    setErrorMessage(null);
    try {
      await ordersAPI.create({
        restaurant_id: restaurantId,
        customer_id: customerId!,
        products: items.map(({ id, quantity }) => ({ id, quantity })),
        send_email: sendEmail,
        send_sms: sendSms,
      });
      setOrderState('success');
      setTimeout(() => router.replace('/(tabs)/history'), 2500);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.error ?? 'Order creation failed. Please try again.'
      );
      setOrderState('error');
    }
  };

  const isDisabled = orderState === 'processing' || orderState === 'success';

  return (
    // ... render order summary, checkboxes, button
  );
}
```

### Checkbox Pattern (no external library)
```typescript
// Simple touchable checkbox — no @react-native-community/checkbox needed
const Checkbox = ({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) => (
  <TouchableOpacity style={styles.checkboxRow} onPress={onToggle} disabled={isDisabled}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);
```

### Common Mistakes to Avoid

- ❌ Sending `send_sms` / `send_email` with camelCase — server expects snake_case JSON keys
- ❌ Including `price` or `name` in the `products` array — server only accepts `id` and `quantity`
- ❌ Using `router.push()` after success — use `router.replace()` to prevent back-nav to modal
- ❌ Not re-enabling checkboxes on error — user should be able to change opt-in before retry
- ❌ Prices in cents in the modal — divide by 100 before passing from menu screen
- ❌ Not disabling the button during `processing` — causes duplicate order submissions
- ❌ Using `Switch` instead of `CheckBox` — wireframe shows square checkboxes

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — Notification opt-in section, wireframe reference
- **Module 13 Spec:** `ai/features/🤖-menu-modal-confirmation.feature.md` — inherited modal flow
- **Create Order DTO:** `server/serverJAVA/.../dtos/order/ApiCreateOrderDTO.java`
- **Order API Controller:** `server/serverJAVA/.../controller/api/OrderApiController.java`
- **Modal Stub (current):** `client/app/(tabs)/(restaurant)/modal.tsx`
- **API Service:** `client/services/api.ts` — `ordersAPI.create()`
- **AuthContext:** `client/services/authContext.tsx` — `customerId`
- **Wireframe:** `support_materials_14/Design/` — Order Confirmation modal with checkboxes

---

**`send_email` and `send_sms` are already built into `ApiCreateOrderDTO.java` — they default to `false`. The mobile app simply passes the checkbox state into the existing POST body.**
