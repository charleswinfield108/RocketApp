# 🤖 AI_FEATURE_Order Rating

> This feature allows customers to submit a 1–5 star rating for any completed (delivered) order.
> The rating is tied to the restaurant and contributes to that restaurant's overall average rating,
> which is used to filter and sort restaurants on the restaurant list screen.

---

## Feature Identity

- **Feature Name:** Order Rating
- **Module:** 14
- **Related Area:** Mobile Frontend — `components/OrderHistoryDetailModal.tsx`, `services/orderHistoryService.ts`, `services/api.ts`
- **Priority:** Required (grading criterion)
- **Dependencies:**
  - Order History Screen (`app/(tabs)/history.tsx`) — triggers the detail modal
  - `OrderHistoryDetailModal` — rating UI is embedded here
  - AuthContext — `authToken` required for the PUT request header

---

## Feature Scope

### In Scope (Included)

- Star rating UI (1–5) inside the `OrderHistoryDetailModal`
- Rating visible and interactive only when order status is `"delivered"` and not yet rated
- Already-rated orders: show the submitted rating as read-only
- `PUT /api/v1/orders/{id}/rating` API call with `{ "restaurant_rating": int }`
- Success state: stars become read-only, confirmation message displayed
- Error state: message shown, stars remain interactive for retry
- `Order` type updated to include `restaurantRating`

### Out of Scope (Excluded)

- Rating restaurants directly (ratings are always attached to a specific order)
- Editing or deleting a submitted rating (one submission per order, enforced by UI)
- Courier ratings
- Written review / comment text
- Rating display on the restaurant list or menu screens (server-side average handles that)

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Rate Completed Orders** | Customers can rate an order that is already completed. |
| **Rating Range** | The rating range will be from 1 (worst) to 5 (best). |
| **Restaurant Impact** | Ratings submitted by customers will impact the overall restaurant's rating. |

---

## Sub-Requirements (Feature Breakdown)

### 1. Eligibility Rules

Not every order in the history list is rateable. The rating UI is shown or hidden based on two conditions:

| Condition | Rating Section |
|-----------|----------------|
| Status is **not** `"delivered"` | Hidden — order not complete yet |
| Status is `"delivered"` and `restaurantRating` is `null` | Interactive stars — prompt customer to rate |
| Status is `"delivered"` and `restaurantRating` is `1–5` | Read-only stars — already rated |

```typescript
const isDelivered = order.status.toLowerCase() === 'delivered';
const hasRating   = order.restaurantRating !== null && order.restaurantRating !== undefined;

// Show nothing:
if (!isDelivered) return null;

// Show read-only:
if (hasRating) return <ReadOnlyStars rating={order.restaurantRating} />;

// Show interactive:
return <RatingInput orderId={order.orderId} />;
```

---

### 2. Rating UI — Inside `OrderHistoryDetailModal`

The rating section is added below the TOTAL line within the existing modal's `ScrollView`.

**Layout:**
```
─────────────────────────────
                   TOTAL: $ XX.XX
─────────────────────────────
Rate this order:
★ ★ ★ ★ ★
[SUBMIT RATING]
```

**Interactive state (unrated delivered order):**
- Row of 5 star icons (☆ empty / ★ filled)
- Tapping a star selects that value and fills all stars up to it
- A "SUBMIT RATING" button below the stars
- Button disabled until at least one star is selected
- Tapping the already-selected star does NOT deselect it (minimum 1)

**Read-only state (already rated):**
- Row of 5 stars with the submitted value pre-filled
- No button — label reads "Your Rating:" instead of "Rate this order:"
- Stars are not tappable

**Success state (just submitted):**
- Stars become read-only at the submitted value
- Button replaced with: *"Thank you for your rating!"*

**Error state:**
- Error message shown below the button
- Stars and button remain interactive for retry

---

### 3. Star Component

A simple inline star component — no external library required.

```typescript
interface StarRowProps {
  value: number;       // 0 = none selected, 1–5 = selection
  onChange?: (n: number) => void;  // undefined = read-only
  disabled?: boolean;
}

const StarRow: React.FC<StarRowProps> = ({ value, onChange, disabled }) => (
  <View style={styles.starRow}>
    {[1, 2, 3, 4, 5].map((n) => (
      <TouchableOpacity
        key={n}
        onPress={() => onChange?.(n)}
        disabled={disabled || !onChange}
        style={styles.starButton}
        activeOpacity={0.7}
      >
        <Text style={[styles.star, n <= value && styles.starFilled]}>
          {n <= value ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
```

**Styling:**
- Empty star (`☆`): `color: '#CCCCCC'`, `fontSize: 28`
- Filled star (`★`): `color: '#DA583B'`, `fontSize: 28` (brand orange)
- Each star touch target: minimum 44×44 pt

---

### 4. API Call — `PUT /api/v1/orders/{id}/rating`

Called when the customer taps "SUBMIT RATING".

**Endpoint:**

| Method | Path | Auth |
|--------|------|------|
| `PUT` | `/api/v1/orders/{id}/rating` | Bearer token required |

**Request body (`ApiUpdateRatingDTO`):**
```json
{ "restaurant_rating": 4 }
```

**Field:** `restaurant_rating` — integer, 1–5. The server enforces `@Min(1)` and `@Max(5)`.

**Success Response (HTTP 200):**
```json
{
  "message": "Success",
  "data": {
    "id": 111,
    "restaurant_rating": 4,
    ...
  }
}
```

**Error Response (HTTP 404):** Order not found  
**Error Response (HTTP 400):** Rating out of range (server-side validation)

**Service function to add in `services/api.ts`:**
```typescript
rateOrder: (orderId: number, rating: number) =>
  apiClient.put(`/api/v1/orders/${orderId}/rating`, { restaurant_rating: rating }),
```

---

### 5. Restaurant Rating Impact

The server calculates each restaurant's average rating dynamically from all `restaurant_rating` values on its orders using a native SQL query. The mobile app does not need to do anything extra — submitting the rating via the API is sufficient.

When a customer returns to the restaurant list screen after rating, the restaurant's displayed star rating will reflect the updated average on the next data fetch.

---

## User Flow / Logic

```
Customer opens Order History
  ↓
Taps VIEW on a delivered order
  ↓
OrderHistoryDetailModal opens
  ├─ If already rated → show read-only stars ("Your Rating: ★★★★☆")
  └─ If not yet rated → show interactive stars + SUBMIT RATING button

Customer taps stars to select a value (1–5)
  ↓
Customer taps SUBMIT RATING
  ↓
[SUBMITTING]
  ├─ Button disabled
  ├─ Stars disabled
  └─ PUT /api/v1/orders/{id}/rating → { "restaurant_rating": N }
      ↓
      ├─ HTTP 200 → stars become read-only, show "Thank you for your rating!"
      └─ HTTP 4xx/5xx → show error message, re-enable stars + button for retry
```

---

## Data Changes

### `Order` interface — `services/orderHistoryService.ts`

Add `restaurantRating` to the `Order` type and map it from the API response:

```typescript
// Add to Order interface:
export interface Order {
  orderId: string;
  restaurantName: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
  courier?: Courier;
  restaurantRating: number | null;  // null = not yet rated
}

// Add to ApiOrder interface:
interface ApiOrder {
  ...
  restaurant_rating: number | null;
}

// Add to mapOrder():
const mapOrder = (o: ApiOrder): Order => ({
  ...
  restaurantRating: o.restaurant_rating ?? null,
});
```

### `ordersAPI` — `services/api.ts`

Add the rating function alongside the existing `create` function:

```typescript
export const ordersAPI = {
  create: (payload: CreateOrderPayload) =>
    apiClient.post('/api/v1/orders', payload),

  rateOrder: (orderId: number, rating: number) =>
    apiClient.put(`/api/v1/orders/${orderId}/rating`, { restaurant_rating: rating }),
};
```

---

## Component State

Inside `OrderHistoryDetailModal`, add local state for the rating interaction:

```typescript
const [selectedRating, setSelectedRating] = useState<number>(0);
const [ratingState, setRatingState]       = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
const [ratingError, setRatingError]       = useState<string | null>(null);

const handleSubmitRating = async () => {
  if (selectedRating === 0 || !order) return;
  setRatingState('submitting');
  setRatingError(null);
  try {
    await ordersAPI.rateOrder(Number(order.orderId), selectedRating);
    setRatingState('success');
  } catch (err: unknown) {
    const axiosErr = err as { response?: { data?: { error?: string } } };
    setRatingError(axiosErr.response?.data?.error ?? 'Failed to submit rating. Please try again.');
    setRatingState('error');
  }
};

const isSubmitting = ratingState === 'submitting' || ratingState === 'success';
```

**Reset state when the modal closes or a new order is opened:**
```typescript
useEffect(() => {
  if (!visible) {
    setSelectedRating(0);
    setRatingState('idle');
    setRatingError(null);
  }
}, [visible]);
```

---

## Files Modified

| File | Change |
|------|--------|
| `components/OrderHistoryDetailModal.tsx` | Add rating section below TOTAL; `StarRow` component; local rating state + submit logic |
| `services/orderHistoryService.ts` | Add `restaurantRating` to `Order` and `ApiOrder`; update `mapOrder` |
| `services/api.ts` | Add `ordersAPI.rateOrder()` |

---

## Acceptance Criteria

### Eligibility
- [ ] Rating section hidden for orders with status other than `"delivered"`
- [ ] Rating section shown for delivered + unrated orders (interactive)
- [ ] Rating section shown for delivered + rated orders (read-only)
- [ ] Pending and in-progress orders have no rating UI

### Interactive Stars
- [ ] 5 stars render in a row
- [ ] Tapping star N fills stars 1 through N in orange (`#DA583B`)
- [ ] Unfilled stars render in grey (`#CCCCCC`)
- [ ] Tapping a different star updates the selection
- [ ] Minimum touch target is 44×44 pt per star

### Submission
- [ ] SUBMIT RATING button disabled until at least one star is selected
- [ ] Tapping SUBMIT RATING calls `PUT /api/v1/orders/{id}/rating`
- [ ] Request body is `{ "restaurant_rating": N }` (snake_case, integer)
- [ ] Stars and button disabled during submission
- [ ] On success: stars become read-only, confirmation message shown
- [ ] On error: error message shown, stars and button re-enabled for retry

### Already Rated
- [ ] Modal opens with existing rating pre-filled as read-only stars
- [ ] "Your Rating:" label replaces "Rate this order:" label
- [ ] No SUBMIT RATING button shown

### State Reset
- [ ] Rating state resets when modal is closed
- [ ] Rating state resets when a different order is opened

### Data
- [ ] `Order` type includes `restaurantRating: number | null`
- [ ] `restaurantRating` correctly mapped from `restaurant_rating` in API response
- [ ] `null` means unrated; `1–5` means rated

---

## Notes for the AI

### Where to Place the Rating Section in the Modal

Inside `OrderHistoryDetailModal`, add the rating section after the total row and before the closing of the `ScrollView`:

```tsx
{/* Existing total row */}
<View style={styles.totalRow}>...</View>

{/* Rating Section — only for delivered orders */}
{order.status.toLowerCase() === 'delivered' && (
  <View style={styles.ratingSection}>
    <View style={styles.ratingDivider} />
    {/* Read-only: already rated */}
    {(order.restaurantRating !== null || ratingState === 'success') && (
      <>
        <Text style={styles.ratingLabel}>Your Rating:</Text>
        <StarRow
          value={ratingState === 'success' ? selectedRating : order.restaurantRating ?? 0}
          disabled
        />
      </>
    )}
    {/* Interactive: not yet rated and not just submitted */}
    {order.restaurantRating === null && ratingState !== 'success' && (
      <>
        <Text style={styles.ratingLabel}>Rate this order:</Text>
        <StarRow
          value={selectedRating}
          onChange={setSelectedRating}
          disabled={isSubmitting}
        />
        {ratingState === 'error' && (
          <Text style={styles.ratingError}>{ratingError}</Text>
        )}
        <TouchableOpacity
          style={[styles.submitRatingBtn, (selectedRating === 0 || isSubmitting) && styles.btnDisabled]}
          onPress={handleSubmitRating}
          disabled={selectedRating === 0 || isSubmitting}
        >
          <Text style={styles.submitRatingBtnText}>
            {ratingState === 'submitting' ? 'SUBMITTING...' : 'SUBMIT RATING'}
          </Text>
        </TouchableOpacity>
      </>
    )}
    {/* Success message */}
    {ratingState === 'success' && (
      <Text style={styles.ratingSuccess}>Thank you for your rating!</Text>
    )}
  </View>
)}
```

### Common Mistakes to Avoid

- ❌ Sending `restaurantRating` (camelCase) — server expects `restaurant_rating` (snake_case)
- ❌ Sending a rating of `0` — server enforces `@Min(1)`; disable the button until a star is selected
- ❌ Showing the rating UI for non-delivered orders — only `"delivered"` status qualifies
- ❌ Not resetting state when the modal closes — stale rating state from order A will show on order B
- ❌ Hardcoding star color — use `Colors.light.tint` (`#DA583B`) for filled stars

---

## References

- **Rating Endpoint:** `server/serverJAVA/.../controller/api/OrderApiController.java` — `PUT /orders/{id}/rating`
- **Rating DTO:** `server/serverJAVA/.../dtos/order/ApiUpdateRatingDTO.java` — `restaurant_rating: int`
- **Order Model:** `server/serverJAVA/.../models/Order.java` — `restaurantRating` is nullable `Integer`, `@Min(1)`, `@Max(5)`
- **Restaurant Average:** Computed server-side from all order ratings — no extra client call needed
- **Detail Modal (existing):** `client/components/OrderHistoryDetailModal.tsx` — add rating section here
- **Order History Service (existing):** `client/services/orderHistoryService.ts` — add `restaurantRating` field
- **API Service (existing):** `client/services/api.ts` — add `ordersAPI.rateOrder()`
- **UI Standards:** `ai/features/🤖-ui.feature.md` — star color = `Colors.light.tint`

---

**A rating is submitted once and cannot be changed. The UI enforces this by switching to read-only immediately on success.**
