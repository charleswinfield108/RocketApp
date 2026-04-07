# 🤖 AI_FEATURE_Order History Modal

> This feature displays detailed information about a specific past order in a modal dialog.
> Shows complete order details including items, prices, status, delivery information, and courier details.

---

## Feature Identity

- **Feature Name:** Order History Modal
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** High (Detail view for orders)
- **Dependencies:** Navigation Structure (modal routing), Order History Page (trigger modal)

---

## Feature Goal

Provide an order detail view that:
1. **Displays complete order information** (ID, status, date, total)
2. **Shows all ordered items** with quantities and prices
3. **Displays courier information** (name, status)
4. **Shows accurate pricing** with currency formatting
5. **Provides delivery details** if available
6. **Maintains data accuracy** from API
7. **Allows easy dismissal** (back or close button)

The detail modal is the **comprehensive view of a single past order**.

---

## Feature Scope

### In Scope (Included)

- **Order Detail Modal** — Display full order information
- **Order Header** — Order ID, date, total price, status
- **Items List** — All ordered items with prices
- **Item Details** — Name, quantity, unit price, line total
- **Pricing Section** — Itemized pricing + total
- **Courier Information** — Courier name, contact (if available)
- **Delivery Status** — Current delivery status
- **Data Fetching** — GET order details from API
- **Loading State** — Show spinner while fetching
- **Error Handling** — Show error if fetch fails
- **Modal Header/Footer** — Close button, navigation
- **Price Formatting** — All prices in $XX.XX format
- **Date Display** — Formatted creation date

### Out of Scope (Excluded)

- Order cancellation (not MVP)
- Order modification (not allowed)
- Courier contact/messaging (not MVP)
- Live tracking map (out of scope)
- Receipt download/print (not required)
- Order refund requests (not MVP)
- Reorder functionality (not MVP)
- Payment receipt details (not in scope)
- Customer support integration (not required)
- Order rating/review (separate feature)

---

## Sub-Requirements (Feature Breakdown)

1. **Order Detail Modal** — Dynamic route modal (e.g., `app/(tabs)/history/[id].tsx`)
   - Opens from Order History Page
   - Receives order ID via route params
   - Fetches full order details from API
   - Displays comprehensive order information
   - Allows dismissal (close button or back navigation)

2. **Order Header Section**
   - **Order ID** — "Order #ORD-12345"
   - **Status Badge** — Current status (confirmed, preparing, out for delivery, delivered, cancelled)
   - **Order Date** — "Placed on Apr 7, 2026 at 4:45 PM"
   - **Total Price** — "$37.97" prominently displayed
   - **Status Color** — Match color scheme (green, blue, orange, red)

3. **Ordered Items Section**
   - **Items List** — All items from the order
   - **Per Item Display:** Name, quantity, unit price, line total
   - **Format:** "2x Pepperoni Pizza @ $12.99 = $25.98"
   - **Scrollable** — If many items
   - **Item Count** — Optional display of total items

4. **Pricing Details Section**
   - **Subtotal** — Sum of all item prices (optional)
   - **Taxes/Fees** — If applicable (optional)
   - **Total Price** — Final amount with currency formatting
   - **All prices in $XX.XX format** — No rounding errors
   - **Clear breakdown** — Easy to understand pricing

5. **Courier Information Section**
   - **Courier Name** — "Driver: John Smith" (if available)
   - **Courier Status** — "Preparing your order" or "On the way"
   - **Contact Info** — Phone number (if MVP allows)
   - **Real-time Status** — "Estimated delivery: 25 minutes" (if available)
   - **Optional Section** — May be empty if order not yet out for delivery

6. **Delivery Status Section**
   - **Current Status** — "Delivered" or "Preparing" or "Out for delivery"
   - **Status Progress** — Optional visual timeline
   - **Delivery Address** — Where order was delivered
   - **Delivery Date/Time** — When delivered (if completed)
   - **Next Action** — What to expect

7. **Data Fetching & API**
   - GET request to `/api/v1/orders/{orderId}` or similar
   - Include JWT token in headers
   - Execute on component mount
   - Fetch full order details including items, courier, status

8. **API Response Structure**
   ```json
   {
     "order": {
       "orderId": "ORD-12345",
       "restaurantId": "rest-001",
       "restaurantName": "Pizza Palace",
       "status": "delivered",
       "totalPrice": 37.97,
       "subtotal": 37.97,
       "tax": 0.00,
       "createdAt": "2026-04-07T16:45:00Z",
       "deliveredAt": "2026-04-07T17:15:00Z",
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
       "courier": {
         "courierId": "courier-001",
         "name": "John Smith",
         "phone": "+1-555-1234",
         "status": "delivered",
         "deliveryTime": "30 minutes"
       },
       "deliveryAddress": "123 Main Street, Apt 4B, City, State 12345"
     }
   }
   ```

9. **Modal Navigation**
   - Opened from Order History Page
   - Receives order ID via route params
   - Dismissible by: Back button, close button, or swipe-down
   - On dismiss: Return to order list

10. **Loading State**
    - Show activity indicator while fetching
    - "Loading order details..." text (optional)
    - Timeout: 30 seconds

11. **Error State**
    - Show error message if fetch fails
    - Retry button to refetch
    - Back button to return to list

12. **Empty/Null Data Handling**
    - If courier not assigned: Show placeholder "Not yet assigned"
    - If delivery time not set: Show "Pending"
    - If address not available: Skip section
    - Graceful fallbacks for all optional fields

---

## User Flow / Logic (High Level)

```
User on Order History Page
  ↓
User Taps View Button on an Order
  └─ Order ID passed to modal route
  ↓
[Order Detail Modal Mounts]
  ├─ Extract order ID from route params
  ├─ Show loading spinner
  ├─ Fetch GET /api/v1/orders/{id}
  └─ Include JWT token
  ↓
[API Response Received]
  ├─ IF success (HTTP 200)
  │   ├─ Hide loading spinner
  │   ├─ Display complete order details
  │   ├─ Show items list with prices
  │   ├─ Show courier info if available
  │   └─ Show delivery status
  │
  └─ IF failure (HTTP 400/404/500)
      ├─ Hide loading spinner
      ├─ Show error message
      └─ Show retry button
  ↓
[User Reviews Order Details]
  ├─ Reads order info, items, prices
  ├─ Checks delivery status
  └─ Reviews courier information
  ↓
User Dismisses Modal (Close / Back Button)
  ↓
[Return to Order History Page]
  └─ List remains open
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Modal Component

```
Dynamic Route Modal (e.g., app/(tabs)/history/[id].tsx)
├─ Modal Header
│  ├─ Order ID (e.g., "Order #ORD-12345")
│  ├─ Status Badge (colored)
│  └─ Close Button (X)
├─ Order Summary Section
│  ├─ Order Date (e.g., "Placed on Apr 7, 2026")
│  ├─ Status Text (e.g., "Delivered")
│  └─ Total Price (e.g., "$37.97")
├─ Items Section
│  ├─ Item 1: name, qty, price, total
│  ├─ Item 2: name, qty, price, total
│  └─ ... more items
├─ Pricing Breakdown Section
│  ├─ Subtotal (optional)
│  ├─ Taxes/Fees (optional)
│  └─ Total
├─ Courier Section (if available)
│  ├─ Courier Name
│  ├─ Courier Status
│  └─ Estimated Delivery Time
├─ Delivery Section
│  ├─ Status (e.g., "Delivered")
│  ├─ Address
│  └─ Delivery Time (if completed)
└─ Modal Footer
   ├─ Back/Close Button
   └─ Optional: Reorder button (future)
```

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/orders/{orderId}` | Fetch order details |

**Request:**
```
GET /api/v1/orders/ORD-12345
Headers: Authorization: Bearer <JWT_TOKEN>
Accept: application/json
```

**Success Response (HTTP 200):**
```json
{
  "order": {
    "orderId": "ORD-12345",
    "restaurantId": "rest-001",
    "restaurantName": "Pizza Palace",
    "status": "delivered",
    "totalPrice": 37.97,
    "subtotal": 37.97,
    "createdAt": "2026-04-07T16:45:00Z",
    "deliveredAt": "2026-04-07T17:15:00Z",
    "items": [
      {
        "itemId": "item-001",
        "name": "Pepperoni Pizza",
        "quantity": 2,
        "price": 12.99,
        "lineTotal": 25.98
      }
    ],
    "courier": {
      "name": "John Smith",
      "phone": "+1-555-1234",
      "status": "delivered"
    },
    "deliveryAddress": "123 Main Street, Apt 4B, City, State 12345"
  }
}
```

**Error Response (HTTP 404/500):**
```json
{
  "error": "Order not found" or "Internal server error",
  "message": "Unable to retrieve order details"
}
```

### Route Navigation

| From | To | Data Passed |
|------|----|----|
| Order History Page | `/(tabs)/history/[id]` | Order ID (route param) |
| Detail Modal | Back to History | None (modal closes) |

---

## Data Used or Modified

### Modal State (Local)

| State | Type | Initial | Updated On |
|-------|------|---------|------------|
| `order` | Order \| null | `null` | API fetch success |
| `isLoading` | boolean | `true` | API response |
| `error` | string \| null | `null` | API error |

### Order Data Object

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| orderId | string | "ORD-12345" | Unique order ID |
| restaurantName | string | "Pizza Palace" | For display |
| status | string | "delivered" | Order status |
| totalPrice | number | 37.97 | Total order amount |
| subtotal | number | 37.97 | Before tax |
| createdAt | string (ISO) | "2026-04-07T16:45:00Z" | Creation time |
| deliveredAt | string (ISO) \| null | "2026-04-07T17:15:00Z" | Delivery completion time |
| items | OrderItem[] | [{...}] | Items in order |
| courier | Courier \| null | {name, phone, status} | Delivery person info |
| deliveryAddress | string | "123 Main St..." | Delivery location |

### OrderItem Data

| Field | Type | Example |
|-------|------|---------|
| itemId | string | "item-001" |
| name | string | "Pepperoni Pizza" |
| quantity | number | 2 |
| price | number | 12.99 |
| lineTotal | number | 25.98 |

### Courier Data

| Field | Type | Example | Optional |
|-------|------|---------|----------|
| courierId | string | "courier-001" | No |
| name | string | "John Smith" | No |
| phone | string | "+1-555-1234" | Yes |
| status | string | "delivered" | No |
| estimatedTime | string | "25 minutes" | Yes |

### No Direct Data Modifications
- Modal only reads order data (no edits)
- Does not modify order or courier info
- Read-only display

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Language:** TypeScript
- **UI Framework:** React Native
- **Navigation:** expo-router (dynamic routes + modals)
- **HTTP Client:** Axios
- **State Management:** React useState
- **Icons:** FontAwesome (@fortawesome/react-native-fontawesome)

### Dynamic Route Pattern

```typescript
// app/(tabs)/history/[id].tsx
// Route structure enables: /history/ORD-12345

const { id: orderId } = useLocalSearchParams();
```

### Modal Styling Pattern

- Overlay background: Transparent or semi-transparent
- Modal content: Centered or slide-up
- Scrollable content: If many items
- Dismiss: Swipe down or close button

### Status Color Mapping

```typescript
const statusColors = {
  confirmed: '#9CA3AF',
  preparing: '#3B82F6',
  'out for delivery': '#F97316',
  delivered: '#22C55E',
  cancelled: '#EF4444'
};
```

### Price Formatting

- Format: `price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })`
- Pattern: "$XX.XX"
- All prices formatted consistently

### Date & Time Formatting

- Order Date: "Apr 7, 2026 at 4:45 PM"
- Delivery Time: "Apr 7, 2026 at 5:15 PM" (if delivered)
- Use `toLocaleDateString()` and `toLocaleTimeString()`

### Data Validation

- Verify order ID exists before fetching
- Handle null/undefined courier gracefully
- Display placeholder if delivery address missing
- Show "Pending" if delivery time not set

### API Integration

- **Base URL:** From `.env`
- **Token:** Include via axios interceptor
- **Path:** `/api/v1/orders/{orderId}`
- **Timeout:** 30 seconds

---

## Acceptance Criteria

- [ ] `app/(tabs)/history/[id].tsx` dynamic route created
- [ ] Modal opens when triggered from history page
- [ ] Order ID extracted from route params correctly
- [ ] Loading spinner shows while fetching
- [ ] GET request sent with correct order ID and JWT token
- [ ] Full order details display from API response
- [ ] Order ID displayed (e.g., "Order #ORD-12345")
- [ ] Status badge displays with correct color
- [ ] Order date formatted correctly (e.g., "Apr 7, 2026")
- [ ] All ordered items display in list
- [ ] Each item shows: name, quantity, unit price, line total
- [ ] All prices formatted as $XX.XX
- [ ] Total price calculated and displayed correctly
- [ ] Subtotal displays (if included)
- [ ] Courier name displays (if assigned)
- [ ] Courier status displays (if available)
- [ ] Delivery address displays (if available)
- [ ] Delivery time displays (if completed)
- [ ] Empty/null fields handled gracefully
- [ ] Error message displays on API failure
- [ ] Retry button works to refetch data
- [ ] Modal can be dismissed (close button or back)
- [ ] Return to history page on dismiss
- [ ] All data accurate (no modifications)
- [ ] No hardcoded order data
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android simulator
- [ ] Responsive to different screen sizes
- [ ] Scrollable content if many items

---

## Notes for the AI

### Important Implementation Details

1. **Dynamic Route Creation**
   - Create `app/(tabs)/history/[id].tsx`
   - This allows route like `/history/ORD-12345`
   ```typescript
   export default function OrderDetailModal() {
     const { id: orderId } = useLocalSearchParams();
     // ...
   }
   ```

2. **Fetching Order Details**
   ```typescript
   const fetchOrderDetails = async (orderId: string) => {
     setIsLoading(true);
     setError(null);
     try {
       const response = await axios.get(`/api/v1/orders/${orderId}`);
       setOrder(response.data.order);
     } catch (error: any) {
       setError(error.response?.data?.error || 'Failed to load order details');
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **Modal Header Rendering**
   ```typescript
   <View style={styles.modalHeader}>
     <Text style={styles.orderId}>Order #{order.orderId}</Text>
     <View
       style={[
         styles.statusBadge,
         { backgroundColor: statusColors[order.status] }
       ]}
     >
       <Text style={styles.statusText}>{order.status}</Text>
     </View>
     <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
       <FontAwesomeIcon icon={faTimes} size={20} />
     </TouchableOpacity>
   </View>
   ```

4. **Items List Rendering**
   ```typescript
   <View style={styles.itemsSection}>
     <Text style={styles.sectionTitle}>Items</Text>
     {order.items.map((item) => (
       <View key={item.itemId} style={styles.itemRow}>
         <View style={styles.itemInfo}>
           <Text style={styles.itemName}>
             {item.quantity}x {item.name}
           </Text>
           <Text style={styles.itemPrice}>
             {formatPrice(item.price)} each
           </Text>
         </View>
         <Text style={styles.itemTotal}>{formatPrice(item.lineTotal)}</Text>
       </View>
     ))}
   </View>
   ```

5. **Price Formatting Function**
   ```typescript
   const formatPrice = (price: number) => {
     return price.toLocaleString('en-US', {
       style: 'currency',
       currency: 'USD'
     });
   };
   ```

6. **Date Formatting Function**
   ```typescript
   const formatOrderDate = (dateString: string) => {
     const date = new Date(dateString);
     const datePart = date.toLocaleDateString('en-US', {
       month: 'short',
       day: 'numeric',
       year: 'numeric'
     });
     const timePart = date.toLocaleTimeString('en-US', {
       hour: '2-digit',
       minute: '2-digit'
     });
     return `${datePart} at ${timePart}`;
   };
   ```

7. **Courier Section (Conditional)**
   ```typescript
   {order.courier && (
     <View style={styles.courierSection}>
       <Text style={styles.sectionTitle}>Courier</Text>
       <Text style={styles.courierName}>{order.courier.name}</Text>
       <Text style={styles.courierStatus}>{order.courier.status}</Text>
       {order.courier.phone && (
         <Text style={styles.courierPhone}>{order.courier.phone}</Text>
       )}
     </View>
   )}
   ```

8. **Null Data Handling**
   ```typescript
   const displayCourierStatus = order.courier?.status || 'Not yet assigned';
   const displayDeliveryTime = order.deliveredAt
     ? formatOrderDate(order.deliveredAt)
     : 'Pending';
   ```

9. **Error & Loading States**
   ```typescript
   if (isLoading) {
     return (
       <View style={styles.container}>
         <ActivityIndicator size="large" color="#0000ff" />
         <Text style={styles.loadingText}>Loading order details...</Text>
       </View>
     );
   }

   if (error) {
     return (
       <View style={styles.container}>
         <Text style={styles.errorText}>{error}</Text>
         <TouchableOpacity
           style={styles.retryButton}
           onPress={() => fetchOrderDetails(orderId)}
         >
           <Text style={styles.retryText}>Retry</Text>
         </TouchableOpacity>
       </View>
     );
   }
   ```

### Example Implementation Pattern

```typescript
// app/(tabs)/history/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface Courier {
  name: string;
  phone?: string;
  status: string;
}

interface Order {
  orderId: string;
  restaurantName: string;
  status: 'confirmed' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';
  totalPrice: number;
  subtotal: number;
  createdAt: string;
  deliveredAt?: string;
  items: OrderItem[];
  courier?: Courier;
  deliveryAddress: string;
}

const statusColors: Record<string, string> = {
  confirmed: '#9CA3AF',
  preparing: '#3B82F6',
  'out for delivery': '#F97316',
  delivered: '#22C55E',
  cancelled: '#EF4444'
};

export default function OrderDetailModal() {
  const { id: orderId } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId as string);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/v1/orders/${id}`);
      setOrder(response.data.order);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchOrderDetails(orderId as string)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.orderId}>Order #{order.orderId}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[order.status] }
              ]}
            >
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <FontAwesomeIcon icon={faTimes} size={20} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.content}>
            {/* Order Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Restaurant:</Text>
                <Text style={styles.value}>{order.restaurantName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>

            {/* Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items</Text>
              {order.items.map((item) => (
                <View key={item.itemId} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {formatPrice(item.price)} each
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>{formatPrice(item.lineTotal)}</Text>
                </View>
              ))}
            </View>

            {/* Pricing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pricing</Text>
              <View style={styles.pricingRow}>
                <Text style={styles.label}>Subtotal:</Text>
                <Text style={styles.value}>{formatPrice(order.subtotal)}</Text>
              </View>
              <View style={styles.pricingRow}>
                <Text style={styles.labelBold}>Total:</Text>
                <Text style={styles.valueBold}>{formatPrice(order.totalPrice)}</Text>
              </View>
            </View>

            {/* Courier */}
            {order.courier && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Courier</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Driver:</Text>
                  <Text style={styles.value}>{order.courier.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Status:</Text>
                  <Text style={styles.value}>{order.courier.status}</Text>
                </View>
              </View>
            )}

            {/* Delivery */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Address:</Text>
                <Text style={styles.value}>{order.deliveryAddress}</Text>
              </View>
              {order.deliveredAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Delivered:</Text>
                  <Text style={styles.value}>{formatDate(order.deliveredAt)}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '90%',
    paddingTop: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 8
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12
  },
  closeButton: {
    padding: 8
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  section: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  labelBold: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold'
  },
  value: {
    fontSize: 14,
    color: '#1F2937'
  },
  valueBold: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold'
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  itemPrice: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  backButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center'
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280'
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center'
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
```

### Common Mistakes to Avoid

- ❌ Not extracting order ID from route params correctly
- ❌ Not including JWT token in API request (401 error)
- ❌ Not formatting prices as currency ($XX.XX)
- ❌ Not handling null courier data (display placeholder)
- ❌ Not formatting dates consistently
- ❌ Not showing loading state while fetching
- ❌ Not handling API errors gracefully
- ❌ Hardcoding order details (use API data)
- ❌ Not allowing modal dismissal
- ❌ Floating-point math errors (careful with calculations)

### Testing Checklist

1. **Data Accuracy**
   - [ ] Order ID displayed correctly
   - [ ] All order items show correct details (name, qty, price)
   - [ ] Prices formatted as $XX.XX
   - [ ] Total price calculated and displayed correctly
   - [ ] Courier name and status accurate (if assigned)
   - [ ] Delivery address correct
   - [ ] All dates formatted consistently

2. **Loading State**
   - [ ] Spinner shows while fetching
   - [ ] "Loading..." text visible
   - [ ] Timeout occurs if API slow (30 seconds)

3. **Error Handling**
   - [ ] Error message displays on API failure
   - [ ] Retry button works
   - [ ] Retry re-fetches data correctly

4. **Status Display**
   - [ ] Status badge shows correct color
   - [ ] Status text matches backend
   - [ ] Status matches order (e.g., "delivered" if order completed)

5. **Conditionals**
   - [ ] Courier section hides if no courier assigned
   - [ ] Delivery time shows only if delivered
   - [ ] All optional fields handled gracefully

6. **Modal Behavior**
   - [ ] Modal displays correctly
   - [ ] Close button works
   - [ ] Back button returns to history page
   - [ ] Scrollable content if many items
   - [ ] Content legible and properly laid out

7. **Cross-Platform**
   - [ ] Displays correctly on iOS
   - [ ] Displays correctly on Android
   - [ ] Responsive text sizing
   - [ ] No layout overflow

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Tech stack, API auth, styling)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Modal routing)
- **Order History Page:** `./ai/features/order-history-page.feature.md` (List view, trigger modal)
- **Menu Modal Confirmation:** `./ai/features/menu-modal-confirmation.feature.md` (Order creation)
- **API Service:** `./client/services/api.ts` (Axios setup)
- **REST API Docs:** From Module 12 (Order detail endpoint spec)

---

**This feature provides the detailed view for customers to review complete information about a specific past order.**
