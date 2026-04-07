# 🤖 AI_FEATURE_Menu Modal Confirmation

> This feature displays an order confirmation modal with selected items, prices, and order submission handling.
> The modal manages the entire order confirmation flow including loading, success, and error states.

---

## Feature Identity

- **Feature Name:** Menu Modal Confirmation
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Critical (Final step before order creation)
- **Dependencies:** Navigation Structure (modal routing), Restaurant Menu Page (item data), Order Creation (API endpoint)

---

## Feature Goal

Provide a confirmation interface that:
1. **Displays order summary** with accurate product details
2. **Shows itemized pricing** with currency formatting
3. **Enables order submission** to the backend
4. **Handles loading state** during API request
5. **Shows success confirmation** with visual feedback
6. **Handles errors gracefully** with retry capability
7. **Maintains clear UX** throughout entire flow

The confirmation modal is the **final checkpoint** where customers review and submit their order.

---

## Feature Scope

### In Scope (Included)

- **Confirmation Modal Component** — `app/(tabs)/(restaurant)/modal.tsx`
- **Order Summary Display** — Itemized list of selected items
- **Price Display** — Item prices, total price, currency formatting
- **Confirm Order Button** — Submit order to backend
- **Processing State** — Loading UI during API request
- **Success State** — Checkmark + success message
- **Error State** — Error message + retry capability
- **Button State Management** — Enable/disable based on state
- **Modal Styling** — Match wireframe design
- **Data Validation** — Accurate item details display
- **Total Calculation** — Sum of all item prices

### Out of Scope (Excluded)

- Payment processing (order creation only)
- Delivery address selection (not in MVP)
- Special instructions/notes (not required)
- Promo code/discount entry (out of scope)
- Order tracking (separate feature)
- Email confirmation (backend handles)
- Receipt printing (not required)
- Order modifications (create new order instead)

---

## Sub-Requirements (Feature Breakdown)

1. **Confirmation Modal Screen** — `app/(tabs)/(restaurant)/modal.tsx`
   - Receives selected items from restaurant menu
   - Displays order summary
   - Manages modal state (default, processing, success, error)
   - Handles API call to create order
   - Shows loading, success, or error UI

2. **Order Summary Display**
   - List of selected items
   - Each item: name, quantity, unit price, line total
   - Format: "2x Pepperoni Pizza @ $12.99 = $25.98"
   - All prices displayed with currency format
   - Scrollable if many items

3. **Price Display & Formatting**
   - All prices show: `$XX.XX` format
   - Unit price per item
   - Line total per item (price × quantity)
   - Subtotal (sum of all line totals)
   - Final total at bottom
   - No negative prices (validation)

4. **Confirm Order Button**
   - Label: "Confirm Order" or "Place Order"
   - Default state: enabled, tappable
   - Processing state: disabled, shows "Processing Order…"
   - Success state: hidden/removed
   - Error state: re-enabled, retry text

5. **Processing State**
   - Show loading spinner
   - Disable button
   - Change button text to "Processing Order…"
   - Prevent user interaction during request
   - Optional: Dim modal background (reduce opacity)
   - Display for duration of API request

6. **Success State**
   - Hide/remove Confirm Order button
   - Show green checkmark icon
   - Display success message: "Order created successfully!"
   - Optional: Order ID display
   - Stay visible for 2-3 seconds, then navigate
   - Navigate to order history or confirmation screen

7. **Error State**
   - Show red X or error icon
   - Display error message (from API)
   - Re-enable "Confirm Order" button
   - Allow user to retry
   - Show retry button or text

8. **Order Creation API**
   - POST request to create order
   - Endpoint: `/api/v1/orders` or `/api/v1/restaurants/{id}/orders`
   - Body: selected items with quantities and prices
   - Include JWT token in headers
   - Response: order ID and confirmation details

9. **Order Payload Structure**
   ```json
   {
     "restaurantId": "rest-001",
     "items": [
       {
         "itemId": "item-001",
         "name": "Pepperoni Pizza",
         "quantity": 2,
         "price": 12.99,
         "lineTotal": 25.98
       },
       {
         "itemId": "item-002",
         "name": "Margherita Pizza",
         "quantity": 1,
         "price": 11.99,
         "lineTotal": 11.99
       }
     ],
     "totalPrice": 37.97
   }
   ```

10. **Modal Navigation**
    - Opened from restaurant menu screen
    - Item data passed via route params or Context
    - On success: navigate away or mark order as complete
    - On error: stay on modal, allow retry

11. **Data Validation**
    - Verify all items have: name, quantity, price
    - Verify quantities are positive integers
    - Verify prices are non-negative numbers
    - Verify restaurant ID is present
    - Display accurate, unmodified data

12. **Loading & Retry Logic**
    - Show loading for entire API request duration
    - Timeout: 30 seconds (show error if exceeded)
    - On error: allow immediate retry
    - Retry sends same request again
    - No duplicate order prevention (backend validates)

---

## User Flow / Logic (High Level)

```
User on Restaurant Menu Page
  ↓
User Adjusts Quantities and Clicks "Create Order"
  ↓
[Collect Selected Items]
  ├─ Extract items where quantity > 0
  ├─ Calculate line totals and total
  └─ Pass to modal
  ↓
[Navigate to Confirmation Modal]
  ├─ Modal receives item data
  └─ Display order summary
  ↓
[Modal Displays Default State]
  ├─ Item list with prices
  ├─ Total price at bottom
  └─ "Confirm Order" button (enabled)
  ↓
User Reviews Order
  └─ Reads items, quantities, prices
  ↓
User Clicks "Confirm Order" Button
  ↓
[Processing State Activated]
  ├─ Button disables
  ├─ Button text changes to "Processing Order…"
  ├─ Loading spinner shows (optional)
  └─ POST request sent to API
  ↓
[API Response]
  ├─ IF success (HTTP 201)
  │   ├─ Show green checkmark
  │   ├─ Display success message
  │   ├─ Hide button
  │   ├─ Wait 2-3 seconds
  │   └─ Navigate to order history/confirmation
  │
  └─ IF failure (HTTP 400/500)
      ├─ Show red X icon
      ├─ Display error message (from API)
      ├─ Re-enable "Confirm Order" button
      └─ Allow user to retry
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Modal Component

```
app/(tabs)/(restaurant)/modal.tsx (Confirmation Modal)
├─ Modal Header (optional)
│  └─ "Order Confirmation" title
├─ Order Summary Section
│  ├─ Item 1: name, qty, price, total
│  ├─ Item 2: name, qty, price, total
│  └─ ... more items
├─ Total Price Section
│  └─ "Total: $XX.XX"
├─ Status Section (state-dependent)
│  ├─ [DEFAULT] Confirm Order button
│  ├─ [PROCESSING] Loading spinner + "Processing Order…"
│  ├─ [SUCCESS] Checkmark + "Order created successfully!"
│  └─ [ERROR] X icon + error message + retry button
└─ Modal Close/Dismiss (optional)
```

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/orders` | Create new order |

**Request:**
```
POST /api/v1/orders
Headers: Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "restaurantId": "rest-001",
  "items": [
    {
      "itemId": "item-001",
      "quantity": 2,
      "price": 12.99
    },
    {
      "itemId": "item-002",
      "quantity": 1,
      "price": 11.99
    }
  ],
  "totalPrice": 37.97
}
```

**Success Response (HTTP 201):**
```json
{
  "orderId": "ord-12345",
  "restaurantId": "rest-001",
  "status": "confirmed",
  "totalPrice": 37.97,
  "createdAt": "2026-04-07T16:45:00Z"
}
```

**Error Response (HTTP 400/500):**
```json
{
  "error": "Invalid order data" or "Order creation failed",
  "message": "One or more items are unavailable"
}
```

### Route Navigation

| From | To | Data Passed |
|------|----|----|
| Restaurant Menu | `/(tabs)/(restaurant)/modal` | Selected items JSON |
| Modal (success) | `/(tabs)/history` | Order ID |
| Modal (dismiss) | Back to Menu | None |

---

## Data Used or Modified

### Modal State (Local)

| State | Type | Initial | Updated On |
|-------|------|---------|------------|
| `selectedItems` | OrderItem[] | From route params | Never (read-only) |
| `orderState` | 'default' \| 'processing' \| 'success' \| 'error' | `'default'` | Button click / API response |
| `totalPrice` | number | Calculated | On mount |
| `errorMessage` | string \| null | `null` | API error |
| `successMessage` | string \| null | `null` | API success |

### OrderItem Data Object

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| itemId | string | "item-001" | Menu item ID |
| name | string | "Pepperoni Pizza" | Item display name |
| quantity | number | 2 | Ordered quantity |
| price | number | 12.99 | Unit price |
| lineTotal | number | 25.98 | price × quantity |

### Calculations

**Line Total (per item):**
```
lineTotal = price * quantity
```

**Total Price (all items):**
```
totalPrice = sum of all lineTotal values
```

**Price Formatting:**
```typescript
formatted = totalPrice.toLocaleString('en-US', {
  style: 'currency',
  currency: 'USD'
})
// Output: $37.97
```

### No Direct Data Modifications
- Modal only reads order items (no edits)
- Does not modify restaurant or menu data
- Creates new order in backend (not modifying existing)

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Language:** TypeScript
- **UI Framework:** React Native
- **Navigation:** expo-router (modal routing)
- **HTTP Client:** Axios
- **State Management:** React useState
- **Icons:** FontAwesome (@fortawesome/react-native-fontawesome)

### State Management

**Three-State Flow:**
1. **Default:** Ready to submit
2. **Processing:** Awaiting API response
3. **Success/Error:** Showing final status

**Transitions:**
```
DEFAULT → (user taps button) → PROCESSING → (API response) → SUCCESS or ERROR
ERROR → (retry click) → PROCESSING → SUCCESS or ERROR
```

### Button Behavior

**Default State:**
- Text: "Confirm Order"
- Color: Primary action color
- Enabled: `true`
- Icon: None

**Processing State:**
- Text: "Processing Order…"
- Color: Disabled/gray
- Enabled: `false`
- Icon: Loading spinner (optional)

**Success State:**
- Visibility: Hidden/removed
- Icon: Green checkmark
- Message: "Order created successfully!"
- Auto-dismiss: 2-3 seconds

**Error State:**
- Text: "Confirm Order"
- Color: Primary action color (re-enabled)
- Enabled: `true`
- Icon: Red X
- Message: Error text from API
- Retry: Immediate

### Price Formatting Rule

- **Always use:** `$XX.XX` format
- **Use Locale:** `toLocaleString('en-US', { style: 'currency', currency: 'USD' })`
- **No rounding errors:** Calculate totals with proper decimal math
- **Display throughout:** All prices (unit, line, total) formatted same way

### API Integration Rules

- Use base URL from `.env`
- Include JWT bearer token (via axios interceptor)
- Timeout: 30 seconds
- No retry automatic (user clicks retry button)
- Validate response has orderId

### Modal UI Rules

- Overlay background: Semi-transparent (optional but recommended)
- Scrollable content: If item list is long
- Dismiss: Optional close button (X) or swipe-down
- Fixed bottom button: Optional, depends on design

---

## Acceptance Criteria

- [ ] `app/(tabs)/(restaurant)/modal.tsx` component created
- [ ] Modal receives selected items from route params
- [ ] Order summary displays all selected items
- [ ] Each item shows: name, quantity, unit price, line total
- [ ] All prices formatted as `$XX.XX`
- [ ] Total price calculated and displayed correctly
- [ ] "Confirm Order" button visible in default state
- [ ] Button is enabled and tappable
- [ ] Clicking button triggers API call
- [ ] Processing state shows "Processing Order…" text
- [ ] Processing state disables button
- [ ] Loading spinner shown during processing (optional)
- [ ] API request includes correct endpoint and JWT token
- [ ] Success response shows green checkmark
- [ ] Success response displays "Order created successfully!"
- [ ] Success state hides button
- [ ] Success auto-dismisses after 2-3 seconds
- [ ] Success navigates to order history
- [ ] Error response shows red X icon
- [ ] Error response displays error message from API
- [ ] Error state re-enables button
- [ ] Retry functionality works (can resubmit)
- [ ] No data validation errors (items display correctly)
- [ ] No negative prices or invalid quantities
- [ ] Prices match restaurant menu (no modifications)
- [ ] Modal can be dismissed (optional)
- [ ] All state transitions work smoothly
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android simulator
- [ ] Responsive on different screen sizes

---

## Notes for the AI

### Important Implementation Details

1. **Receiving Order Data**
   - Data passed from menu screen via route params
   - Extract from route: `const route = useRoute(); const { items } = route.params;`
   - OR use Context/Redux if route params too large
   - Verify items array structure before rendering

2. **State Management Pattern**
   ```typescript
   type OrderState = 'default' | 'processing' | 'success' | 'error';
   const [state, setState] = useState<OrderState>('default');
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [successMessage, setSuccessMessage] = useState<string | null>(null);
   ```

3. **Price Calculation & Formatting**
   - Avoid floating-point errors: use cents math if needed
   - Format with: `price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })`
   - Verify calculation: `sum(item.price * item.quantity for each item)`
   - Example: 2 × $12.99 = $25.98 (display: $25.98)

4. **Order Submission**
   ```typescript
   const handleConfirmOrder = async () => {
     setState('processing');
     try {
       const response = await axios.post('/api/v1/orders', {
         restaurantId: restaurantId,
         items: selectedItems,
         totalPrice: totalPrice
       });
       
       setState('success');
       setSuccessMessage('Order created successfully!');
       
       // Auto-navigate after 2-3 seconds
       setTimeout(() => {
         router.push('/(tabs)/history');
       }, 2500);
     } catch (error: any) {
       setErrorMessage(error.response?.data?.error || 'Order creation failed');
       setState('error');
     }
   };
   ```

5. **Button Conditional Rendering**
   - **Default:** Show button, enable it
   - **Processing:** Show button with "Processing Order…", disable it
   - **Success:** Hide button, show checkmark
   - **Error:** Show button "Confirm Order", enable it

6. **Error Message Display**
   - Extract from response: `error.response?.data?.error`
   - Fallback message: "Order creation failed. Please try again."
   - Show in red color
   - Allow retry immediately

7. **Success Auto-Navigation**
   - After 2-3 seconds, navigate away
   - Destination: `/(tabs)/history` (order history)
   - Alternative: Show confirmation page before history
   - Use `setTimeout(() => router.push(...), 2500)`

8. **Modal Dismissal**
   - Optional: Add X button to dismiss
   - On dismiss: Clear modal state
   - Return to restaurant menu with quantities intact (or cleared)
   - Decide based on UX (usually return to menu with quantities cleared)

9. **Data Validation**
   - Verify all items have required fields before rendering
   - Log any missing data for debugging
   - Don't display incomplete items
   - Show error if order data is invalid

### Example Implementation Pattern

```typescript
// app/(tabs)/(restaurant)/modal.tsx
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useRoute, useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

export default function ConfirmationModal() {
  const route = useRoute();
  const router = useRouter();
  const { items: selectedItems, restaurantId } = route.params as {
    items: OrderItem[];
    restaurantId: string;
  };

  const [state, setState] = useState<'default' | 'processing' | 'success' | 'error'>('default');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const handleConfirmOrder = async () => {
    setState('processing');
    setErrorMessage(null);

    try {
      const orderPayload = {
        restaurantId,
        items: selectedItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice
      };

      const response = await axios.post('/api/v1/orders', orderPayload);
      
      setState('success');
      
      // Auto-navigate after 2.5 seconds
      setTimeout(() => {
        router.push('/(tabs)/history');
      }, 2500);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Order creation failed. Please try again.';
      setErrorMessage(message);
      setState('error');
    }
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modal}>
          <Text style={styles.title}>Order Summary</Text>

          <ScrollView style={styles.itemsList}>
            {selectedItems.map(item => (
              <View key={item.itemId} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.price)} each = {formatPrice(item.price * item.quantity)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
          </View>

          {/* Status Section */}
          {state === 'success' && (
            <View style={styles.successContainer}>
              <FontAwesomeIcon icon={faCheckCircle} size={40} color="green" />
              <Text style={styles.successText}>Order created successfully!</Text>
            </View>
          )}

          {state === 'error' && (
            <View style={styles.errorContainer}>
              <FontAwesomeIcon icon={faXmarkCircle} size={40} color="red" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Button */}
          {state !== 'success' && (
            <TouchableOpacity
              style={[styles.button, state === 'processing' && styles.buttonDisabled]}
              onPress={handleConfirmOrder}
              disabled={state === 'processing'}
            >
              {state === 'processing' ? (
                <View style={styles.processingContainer}>
                  <ActivityIndicator color="white" />
                  <Text style={styles.buttonText}>Processing Order…</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Confirm Order</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}
```

### Common Mistakes to Avoid

- ❌ Not formatting prices as currency (use toLocaleString)
- ❌ Floating-point math errors (be careful with decimal calculations)
- ❌ Not disabling button during processing (causes duplicate submissions)
- ❌ Hardcoding total instead of calculating (verify math)
- ❌ Not extracting error message from API response
- ❌ Not allowing retry on error (user stuck)
- ❌ Auto-navigating too quickly (user doesn't see success)
- ❌ Not including JWT token in API request (401 error)
- ❌ Modifying order items (read-only display)
- ❌ Missing null checks on route params (crash risk)

### Testing Checklist

1. **Data Display**
   - [ ] All selected items display with correct details
   - [ ] Quantities shown correctly
   - [ ] Prices formatted as $XX.XX
   - [ ] Total calculated correctly
   - [ ] No duplicate items
   - [ ] No modified data

2. **Button Behavior**
   - [ ] "Confirm Order" button visible initially
   - [ ] Button enabled and tappable
   - [ ] Text changes to "Processing Order…" on click
   - [ ] Button disables during processing
   - [ ] Spinner shows (if implemented)

3. **API Integration**
   - [ ] Correct endpoint called
   - [ ] JWT token included in request
   - [ ] Correct payload sent (items, restaurantId, total)
   - [ ] Success response handled
   - [ ] Error response handled

4. **Success State**
   - [ ] Green checkmark appears
   - [ ] Success message displayed
   - [ ] Button hidden
   - [ ] Navigate to order history after 2-3 seconds
   - [ ] Order ID matches backend response

5. **Error State**
   - [ ] Red X icon appears
   - [ ] Error message from API displayed
   - [ ] Button re-enabled
   - [ ] Can retry immediately
   - [ ] Multiple retries work

6. **Cross-Platform**
   - [ ] Modal appears correctly on iOS
   - [ ] Modal appears correctly on Android
   - [ ] Scrollable if many items
   - [ ] Responsive text sizing

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Tech stack, API auth, styling)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Modal routing)
- **Restaurant Menu:** `./ai/features/restaurant-menu-page.feature.md` (Item data source)
- **API Service:** `./client/services/api.ts` (Axios setup)
- **REST API Docs:** From Module 12 (Order creation endpoint spec)
- **Wireframe Design:** `support_materials_13/Design/` (Modal layout reference)

---

**This feature is the final checkpoint where customers confirm their order before submission.**
