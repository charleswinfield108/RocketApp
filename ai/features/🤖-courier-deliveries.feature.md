# 🤖 AI_FEATURE_Courier Deliveries

> This feature gives couriers a dedicated section to view their assigned deliveries,
> advance order statuses through a button tap, and inspect full delivery details via a modal.

---

## Feature Identity

- **Feature Name:** Courier Deliveries
- **Module:** 14 (new feature)
- **Related Area:** Mobile Frontend — Courier section (`app/(courier)/`)
- **Priority:** Critical (core courier functionality)
- **Dependencies:**
  - Navigation Structure (`🤖-navigation-structure.feature.md`) — `(courier)` tab group must exist
  - Role-Based Navigation (`🤖-role-based-navigation.feature.md`) — courier must be authenticated with `courierId`
  - AuthContext — `courierId` and `authToken` must be available via `useAuth()`

---

## Feature Scope

### In Scope (Included)

- Courier delivery list screen (`app/(courier)/deliveries.tsx`)
- Delivery details modal — overlay on the list screen (not a separate route)
- Status badge as a tappable advance button (PENDING → IN PROGRESS → DELIVERED)
- Status locked at DELIVERED — no further advancement
- Status color coding: PENDING (red), IN PROGRESS (orange), DELIVERED (green)
- VIEW button (magnifying glass) that opens the delivery details modal
- Loading and error states for the list and status update
- `useFocusEffect` to refresh deliveries on every tab visit

### Out of Scope (Excluded)

- Courier account management (see `🤖-account-management.feature.md`)
- Order assignment (handled server-side — courier cannot assign themselves)
- Customer-facing order history (different section, different endpoints)
- Real-time status updates / push notifications
- Filtering or searching deliveries

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Status Button** | The order status is a clickable button. Each click advances the order to the next stage and updates the database. |
| **Status Progression** | Status moves in this order: PENDING (red) → IN PROGRESS (orange) → DELIVERED (green). |
| **Lock After Delivered** | Once the status is DELIVERED, it cannot be changed again. |
| **View Button** | Clicking "View" opens the Delivery Detail modal for the selected order. |

---

## Sub-Requirements (Feature Breakdown)

### 1. Delivery List Screen — `app/(courier)/deliveries.tsx`

**Layout (from wireframe):**
- Page heading: **MY DELIVERIES**
- Table with four columns: **ORDER ID | ADDRESS | STATUS | VIEW**
- Each row represents one order assigned to the logged-in courier

**Each row contains:**

| Column | Content | Behaviour |
|--------|---------|-----------|
| ORDER ID | Order ID number | Display only |
| ADDRESS | Delivery (customer) address | Display only |
| STATUS | Coloured status badge | **Tappable — advances status on each tap** |
| VIEW | Magnifying glass icon button | Opens Delivery Details Modal |

**Data source:**
```
GET /api/v1/orders?type=courier&id={courierId}
```
- Returns full order list for the logged-in courier
- Fetch on mount and on every tab focus (via `useFocusEffect`)

---

### 2. Status Badge as Advance Button

The STATUS column badge is **both a display and a control**. Tapping it advances the order to the next status and immediately calls the API.

**Status Progression:**
```
PENDING (ID: 1) → tap → IN PROGRESS (ID: 2) → tap → DELIVERED (ID: 3) → LOCKED
```

**Status IDs (confirmed from server `DataSeeder.java`):**

| Status String | `order_status_id` | Badge Color | Tappable? |
|--------------|-------------------|------------|-----------|
| `pending` | `1` | Red (`#C1392B`) | Yes → advances to ID 2 |
| `in progress` | `2` | Orange | Yes → advances to ID 3 |
| `delivered` | `3` | Green / Teal | **No — locked** |

**Next status mapping:**
```typescript
const nextStatusId: Record<string, number> = {
  'pending':     2,
  'in progress': 3,
};
// 'delivered' is not in this map — used to detect lock state
```

**On status badge tap (if not DELIVERED):**
1. Optimistically update local state (immediate UI feedback)
2. Call `PUT /api/v1/orders/{id}` with `order_status_id` set to `nextStatusId[currentStatus]`
3. On API error: revert local state, show error message

**On status badge tap (if DELIVERED):**
- No action taken
- Badge is non-interactive (visual feedback: no press highlight)

---

### 3. Status Update API Call

**Endpoint:** `PUT /api/v1/orders/{id}`

**Request body (`ApiUpdateOrderDTO`):**
```json
{
  "restaurant_id": 5,
  "customer_id": 2,
  "order_status_id": 2,
  "restaurant_rating": null
}
```

> ⚠️ **Important:** The API requires `restaurant_id` and `customer_id` in the body alongside `order_status_id`. These values come from the order data already loaded in the delivery list — they must be stored on each row item and included in the PUT request. Do not make an extra GET call just to retrieve them.

**Success Response (HTTP 200):**
```json
{
  "message": "Success",
  "data": {
    "id": 1,
    "status": "in progress",
    ...
  }
}
```

**Error Response (HTTP 404):** Order not found  
**Error Response (HTTP 400):** Invalid data

---

### 4. Delivery Details Modal

Opened by tapping the VIEW (magnifying glass) icon on any row. Rendered as an **overlay on the deliveries screen** — not a route change, not a separate screen.

**Layout (from wireframe):**
- Header: **DELIVERY DETAILS** (in brand red/orange)
- Sub-label: *"Status: [CURRENT_STATUS_STRING]"*
- Content:
  - Delivery Address: `[customer_address]`
  - Restaurant: `[restaurant_name]`
  - Order Date: `[created_on]` formatted as `YYYY/MM/DD`
  - **Order Details** section:
    - Each product line: `[product name]` | `x[quantity]` | `$ [unit_price × quantity]`
  - **TOTAL:** `$ [total_cost / 100]` (server stores cost in cents)
- Close button (×) dismisses the modal

**Data source:**
- All data comes from the delivery list already fetched — no additional API call needed
- The modal receives the selected order object as a prop

**Modal state managed locally:**
```typescript
const [selectedOrder, setSelectedOrder] = useState<ApiOrderDTO | null>(null);

// Open: setSelectedOrder(order)
// Close: setSelectedOrder(null)
```

---

### 5. Loading and Error States

**List loading:**
- Show `ActivityIndicator` while `GET /api/v1/orders` is in-flight
- Show empty state message if the returned list is empty: *"No deliveries assigned."*
- Show error state with retry button if the request fails

**Status update loading:**
- Show a brief loading indicator on the specific status badge being updated
- Disable all status badges while any update is in-flight (prevent concurrent updates)
- On success: update the badge colour and text in the list row
- On failure: revert to previous status, show error message

---

## User Flow / Logic (High Level)

```
Courier navigates to Deliveries tab
  ↓
[useFocusEffect] → GET /api/v1/orders?type=courier&id={courierId}
  ├─ Loading → ActivityIndicator
  ├─ Error → Error message + Retry button
  └─ Success → Render MY DELIVERIES table
      │
      ├─ Tap STATUS badge (not DELIVERED)
      │   ├─ Optimistically update badge in UI
      │   ├─ PUT /api/v1/orders/{id} with next order_status_id
      │   ├─ Success → badge stays updated
      │   └─ Error → revert badge, show error
      │
      ├─ Tap STATUS badge (DELIVERED)
      │   └─ No action — badge is locked
      │
      └─ Tap VIEW icon (magnifying glass)
          └─ Open Delivery Details Modal (overlay)
              │
              ├─ Displays: address, restaurant, date, items, total
              └─ Tap × → close modal (setSelectedOrder(null))
```

---

## Interfaces (Pages, Endpoints, Screens)

### Files Created

| File | Purpose |
|------|---------|
| `app/(courier)/deliveries.tsx` | Delivery list screen + modal |
| `components/DeliveryCard.tsx` | Optional: single delivery row component (if extracted) |
| `components/StatusBadge.tsx` | Shared status badge with color logic (used by customer order history too) |
| `services/courierService.ts` | API calls for courier delivery list and status update |

### Backend API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/orders?type=courier&id={courierId}` | Fetch all deliveries for the logged-in courier |
| `PUT` | `/api/v1/orders/{id}` | Update order status |

**GET Response (array of `ApiOrderDTO`):**
```json
{
  "data": [
    {
      "id": 1,
      "customer_id": 2,
      "customer_name": "John Doe",
      "customer_address": "111 1st Ave.",
      "restaurant_id": 5,
      "restaurant_name": "Sushi California",
      "restaurant_address": "...",
      "courier_id": 3,
      "courier_name": "...",
      "status": "pending",
      "products": [
        { "id": 1, "name": "Salmon Roll", "quantity": 2, "unit_cost": 325 }
      ],
      "total_cost": 1200,
      "created_on": "2023-02-27T00:00:00"
    }
  ]
}
```

> **Note:** `total_cost` and `unit_cost` are stored in **cents** (e.g., `1200` = `$12.00`). Divide by 100 before displaying.

**PUT Request body:**
```json
{
  "restaurant_id": 5,
  "customer_id": 2,
  "order_status_id": 2,
  "restaurant_rating": null
}
```

---

## Data Used or Modified

### Component State

| State | Type | Purpose |
|-------|------|---------|
| `deliveries` | `ApiOrderDTO[]` | Full list of courier's orders |
| `loading` | boolean | List fetch in-flight |
| `error` | string \| null | List fetch error |
| `selectedOrder` | `ApiOrderDTO \| null` | Currently viewed in modal (null = modal closed) |
| `updatingOrderId` | number \| null | ID of order whose status is being updated |

### Status ID Constants
```typescript
// constants/orderStatus.ts (or inline)
export const ORDER_STATUS = {
  PENDING:     { id: 1, label: 'pending',     display: 'PENDING',      color: '#C1392B' },
  IN_PROGRESS: { id: 2, label: 'in progress', display: 'IN PROGRESS',  color: '#E67E22' },
  DELIVERED:   { id: 3, label: 'delivered',   display: 'DELIVERED',    color: '#27AE60' },
} as const;

export const NEXT_STATUS_ID: Record<string, number> = {
  'pending':     ORDER_STATUS.IN_PROGRESS.id,
  'in progress': ORDER_STATUS.DELIVERED.id,
};
```

### Shared Component: `StatusBadge`
```typescript
interface StatusBadgeProps {
  status: string;           // 'pending' | 'in progress' | 'delivered'
  onPress?: () => void;     // undefined = non-interactive (used in modal)
  loading?: boolean;        // show loading indicator inside badge
}
```
- Used in courier delivery list (interactive — `onPress` provided)
- Used in customer order history (display only — no `onPress`)
- Used in delivery details modal (display only — no `onPress`)

---

## Tech Constraints (Feature-Level)

### API Contract Rules
- `PUT /api/v1/orders/{id}` requires `restaurant_id` and `customer_id` in the body — store these from the list response, never make a second GET to retrieve them
- Status string from API is **lowercase** (`"pending"`, `"in progress"`, `"delivered"`) — UI displays uppercase (`"PENDING"`, etc.)
- `total_cost` is in cents — always divide by 100 before display

### Status Lock Rule
```typescript
const isLocked = (status: string) => status === 'delivered';

// In render:
<TouchableOpacity
  onPress={isLocked(order.status) ? undefined : () => handleAdvanceStatus(order)}
  activeOpacity={isLocked(order.status) ? 1 : 0.7}
>
  <StatusBadge status={order.status} />
</TouchableOpacity>
```

### Delivery Modal as Overlay
- The modal is rendered inline within `deliveries.tsx` using React Native `Modal` component
- It is **not** a separate route or file
- `visible` prop controlled by `selectedOrder !== null`

### No Extra API Calls for Modal
- Modal data comes from the list state — the `ApiOrderDTO` already contains all fields needed (products, address, restaurant, date)
- No `GET /api/v1/orders/{id}` call is made when opening the modal

---

## Acceptance Criteria

### Delivery List
- [ ] Screen heading shows **MY DELIVERIES**
- [ ] Table renders with columns: ORDER ID, ADDRESS, STATUS, VIEW
- [ ] One row per delivery assigned to the logged-in courier
- [ ] Correct data shown: order ID, customer address, status badge, view icon
- [ ] `useFocusEffect` triggers re-fetch on every tab visit
- [ ] `ActivityIndicator` shown during initial fetch
- [ ] Empty state shown when no deliveries are returned
- [ ] Error state shown with retry when API call fails

### Status Button
- [ ] PENDING badge is red and tappable
- [ ] Tapping PENDING advances status to IN PROGRESS — API call made, badge updates
- [ ] IN PROGRESS badge is orange and tappable
- [ ] Tapping IN PROGRESS advances status to DELIVERED — API call made, badge updates
- [ ] DELIVERED badge is green and **not tappable** — no action on press
- [ ] Loading indicator shown on badge during API call
- [ ] All badges disabled while any status update is in-flight
- [ ] On API error: status badge reverts to previous state, error message shown

### Status Update API
- [ ] `PUT /api/v1/orders/{id}` called with correct `order_status_id`
- [ ] `restaurant_id` and `customer_id` included in body (sourced from list data)
- [ ] `restaurant_rating` sent as `null`
- [ ] Bearer token included in request header

### View Button / Delivery Details Modal
- [ ] Tapping magnifying glass icon opens modal overlay
- [ ] Modal shows: DELIVERY DETAILS heading, Status sub-label
- [ ] Modal shows: delivery address, restaurant name, order date (YYYY/MM/DD)
- [ ] Modal shows: each product line with name, quantity, and price
- [ ] Modal shows: TOTAL formatted as `$ XX.XX`
- [ ] Prices calculated correctly from cents (divide by 100)
- [ ] × close button dismisses modal
- [ ] No additional API call made when opening modal

### Cross-Platform
- [ ] All delivery interactions work on iOS simulator
- [ ] All delivery interactions work on Android simulator

---

## Notes for the AI

### Implementation Sequence

1. Create `services/courierService.ts` with `getDeliveries(courierId)` and `updateOrderStatus(orderId, payload)`
2. Add `ordersAPI.update(id, dto)` to `services/api.ts` if not present: `PUT /api/v1/orders/{id}`
3. Define `ORDER_STATUS` and `NEXT_STATUS_ID` constants
4. Create `components/StatusBadge.tsx` (shared with customer order history)
5. Build `app/(courier)/deliveries.tsx` with list + modal in one file

### Status Update Helper
```typescript
// services/courierService.ts
export const advanceOrderStatus = async (order: ApiOrderDTO): Promise<ApiOrderDTO> => {
  const nextId = NEXT_STATUS_ID[order.status];
  if (!nextId) throw new Error('Order is already delivered');

  const response = await ordersAPI.update(order.id, {
    restaurant_id: order.restaurant_id,
    customer_id: order.customer_id,
    order_status_id: nextId,
    restaurant_rating: null,
  });

  return response.data.data || response.data;
};
```

### Common Mistakes to Avoid

- ❌ Using `PATCH` — the API only supports `PUT` for order updates
- ❌ Sending only `order_status_id` — the full `ApiUpdateOrderDTO` is required
- ❌ Making a `GET /api/v1/orders/{id}` call just to open the modal — all data is already in the list
- ❌ Using status display strings ("PENDING") for comparisons — use lowercase API strings ("pending")
- ❌ Displaying `total_cost` directly — divide by 100 first
- ❌ Allowing status tap when status is `"delivered"` — must be locked
- ❌ Not disabling all badges during an update — prevents race conditions

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — Status badge colors, courier tab structure
- **Navigation Structure:** `ai/features/🤖-navigation-structure.feature.md` — `(courier)` folder layout
- **Role-Based Navigation:** `ai/features/🤖-role-based-navigation.feature.md` — courier auth
- **Order API Controller:** `server/serverJAVA/.../controller/api/OrderApiController.java`
- **Update Order DTO:** `server/serverJAVA/.../dtos/order/ApiUpdateOrderDTO.java`
- **Order DTO:** `server/serverJAVA/.../dtos/order/ApiOrderDTO.java`
- **Status IDs:** `server/serverJAVA/.../DataSeeder.java` → `seedOrderStatuses()`
- **Wireframe:** `support_materials_14/Design/` — MY DELIVERIES table, modal layout, status badge colors
- **API Service (existing):** `client/services/api.ts`

---

**Status IDs are seeded in order: 1=pending, 2=in progress, 3=delivered. These are stable and can be used as constants.**
