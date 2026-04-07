# 🤖 AI_FEATURE_Order History Page

> This feature displays a list of customer orders in a structured table with order details, status, and quick access to view full details via modal.
> Provides customers with a view of their past orders and order statuses.

---

## Feature Identity

- **Feature Name:** Order History Page
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** High (Post-order feature)
- **Dependencies:** Navigation Structure (tab routing), Menu Modal Confirmation (source of orders), Order History Modal (detail view)

---

## Feature Goal

Provide an order history interface that:
1. **Displays past orders** in a structured, easy-to-scan list
2. **Shows key order info** at a glance (order ID, status, date)
3. **Enables detail viewing** via View button
4. **Supports order tracking** with current status
5. **Refreshes order list** when page is visited
6. **Handles empty state** gracefully (no orders)
7. **Provides clear navigation** to order details

The history page is the **primary view for post-purchase order tracking**.

---

## Feature Scope

### In Scope (Included)

- **Order History Tab Page** — `app/(tabs)/history.tsx` (or similar)
- **Order List Display** — Table with structured rows per order
- **Table Headings** — Order (ID/date), Status, View (action)
- **Order Row** — Each order displays: order ID and date, current status, View button
- **View Button** — Opens Order History Detail modal
- **Status Display** — Visual status indicators (confirmed, preparing, out for delivery, delivered)
- **Refresh on Mount** — Fetch latest orders when page opens
- **Empty State** — Message when no orders exist
- **List Scrolling** — Vertical scroll if many orders
- **Data Fetching** — GET request to fetch order history from API
- **Loading State** — Show spinner while fetching
- **Error Handling** — Show error message if fetch fails

### Out of Scope (Excluded)

- Order cancellation (not MVP)
- Order modification (not allowed)
- Delivery address changes (not in MVP)
- Tracking map/location (not required)
- Print receipt (not required)
- Share order (not required)
- Refund/return requests (not in MVP)
- Real-time order updates/WebSocket (not required)
- Order filtering/sorting (basic list only)
- Payment history (not in scope)
- Reorder functionality (not MVP)

---

## Sub-Requirements (Feature Breakdown)

1. **Order History List Page** — `app/(tabs)/history.tsx`
   - Displays all customer orders in table format
   - Fetches order history on mount
   - Shows loading spinner while fetching
   - Displays error message if fetch fails
   - Scrollable vertical list if many orders
   - Refresh capability (pull-to-refresh or manual)

2. **Table Structure**
   - **Column Headers:** "Order", "Status", "View" (3 columns)
   - **Order Column:** Order ID + date (e.g., "ORD-12345 • Apr 7, 2026")
   - **Status Column:** Current status badge (e.g., "Delivered", "Preparing")
   - **View Column:** Button or icon to open detail modal

3. **Order Row Display**
   - Each row displays one order
   - Row format: `[Order ID + Date] | [Status Badge] | [View Button]`
   - Example row: `ORD-67890 • Apr 6, 2026 | Delivered | [📋]`
   - Rows organized chronologically (newest first)
   - Tappable rows or explicit View button

4. **Status Indicators**
   - **Status Options:** confirmed, preparing, out for delivery, delivered, cancelled
   - **Visual Styling:** Badges with color-coded backgrounds
     - Green: delivered
     - Blue: preparing
     - Orange: out for delivery
     - Red: cancelled
     - Gray: confirmed (pending)

5. **View Button/Icon**
   - Location: Right side of each row
   - Icon: Info icon or "View" text button
   - Tappable area: Entire button (not just icon)
   - On tap: Opens Order History Detail modal
   - Passes order ID to modal

6. **Data Fetching**
   - GET request to `/api/v1/customer/orders` or `/api/v1/orders`
   - Include JWT token in headers
   - Execute on component mount
   - Execute on page focus (see order details → back → refreshed list)
   - Endpoint should return array of orders

7. **API Response Structure**
   ```json
   {
     "orders": [
       {
         "orderId": "ORD-12345",
         "restaurantId": "rest-001",
         "restaurantName": "Pizza Palace",
         "status": "delivered",
         "totalPrice": 37.97,
         "createdAt": "2026-04-07T16:45:00Z",
         "items": [
           {
             "itemId": "item-001",
             "name": "Pepperoni Pizza",
             "quantity": 2,
             "price": 12.99
           }
         ]
       },
       {
         "orderId": "ORD-67890",
         "restaurantId": "rest-002",
         "restaurantName": "Burger House",
         "status": "confirmed",
         "totalPrice": 28.50,
         "createdAt": "2026-04-06T12:30:00Z",
         "items": [
           {
             "itemId": "item-003",
             "name": "Classic Burger",
             "quantity": 1,
             "price": 9.99
           }
         ]
       }
     ]
   }
   ```

8. **Loading State**
   - Show activity indicator (spinner) while fetching
   - Optional: "Loading your orders..." text
   - Loading state only on initial fetch (not on refresh in some cases)
   - Timeout: 30 seconds (then show error)

9. **Empty State**
   - If no orders: Display message
   - Example: "No orders yet. Start by ordering from a restaurant!"
   - Optional: Button to navigate to restaurants tab
   - Centered on screen

10. **Error Handling**
    - If fetch fails: Show error message
    - Example: "Failed to load orders. Please try again."
    - Retry button: User can tap to retry
    - Show specific error from API if available

11. **Page Refresh/Focus**
    - Refresh order list when tab is focused
    - Use `useFocusEffect` hook
    - Fetches latest orders on each visit
    - Allows viewing updated order statuses

12. **Row Interaction**
    - Tap any part of row or View button: Opens detail modal
    - Passes order ID to modal
    - Modal displays full order details
    - Returning from modal: List remains open, list can refresh if needed

---

## User Flow / Logic (High Level)

```
User on Restaurants Tab
  ↓
User Places Order (triggers navigation)
  └─ Navigation to History Tab
  ↓
[Order History Page Mounts]
  ├─ Execute useFocusEffect
  ├─ Show loading spinner
  ├─ Fetch GET /api/v1/customer/orders
  └─ Include JWT token
  ↓
[API Response Received]
  ├─ IF success (HTTP 200)
  │   ├─ Hide loading spinner
  │   ├─ Display order list
  │   ├─ Orders sorted newest first
  │   └─ Each row shows: Order ID + Date, Status, View button
  │
  └─ IF failure (HTTP 400/500)
      ├─ Hide loading spinner
      ├─ Show error message
      └─ Show retry button
  ↓
[User Reviews Order List]
  ├─ Reads order IDs, dates, statuses
  └─ Identifies order of interest
  ↓
User Taps View Button on an Order
  ↓
[Detail Modal Opens]
  ├─ Modal receives order ID
  ├─ Modal fetches/displays full order details
  └─ User sees all order information
  ↓
User Closes Modal or Navigates Away
  ↓
[Return to Order List]
  ├─ List may refresh to show updated status
  ├─ Focus effect triggers new fetch
  └─ Display updated orders
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Page Component

```
app/(tabs)/history.tsx (Order History Tab)
├─ Header (part of tab navigation)
├─ Loading State (Optional)
│  └─ Activity Indicator + "Loading..."
├─ Table Header Row
│  ├─ "Order" (left)
│  ├─ "Status" (center)
│  └─ "View" (right)
├─ Order List (Scrollable)
│  ├─ Row 1: [ORD-12345 • Apr 7, 2026] | [Delivered 🟢] | [View 📋]
│  ├─ Row 2: [ORD-67890 • Apr 6, 2026] | [Preparing 🔵] | [View 📋]
│  └─ ... more rows
├─ Empty State (if no orders)
│  └─ "No orders yet. Start by ordering!"
└─ Error State (if fetch fails)
   ├─ Error message
   └─ Retry button
```

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/customer/orders` | Fetch all customer orders |

**Request:**
```
GET /api/v1/customer/orders
Headers: Authorization: Bearer <JWT_TOKEN>
Accept: application/json
```

**Success Response (HTTP 200):**
```json
{
  "orders": [
    {
      "orderId": "ORD-12345",
      "restaurantId": "rest-001",
      "restaurantName": "Pizza Palace",
      "status": "delivered",
      "totalPrice": 37.97,
      "createdAt": "2026-04-07T16:45:00Z",
      "items": [
        {
          "itemId": "item-001",
          "name": "Pepperoni Pizza",
          "quantity": 2,
          "price": 12.99
        }
      ]
    }
  ]
}
```

**Error Response (HTTP 401/500):**
```json
{
  "error": "Unauthorized" or "Internal server error",
  "message": "Failed to retrieve orders"
}
```

### Route Navigation

| From | To | Data Passed |
|------|----|----|
| Menu Modal (success) | `/(tabs)/history` | Auto-nav, order created |
| Restaurant List Tab | `/(tabs)/history` | User tap on tab |
| History Page | Detail Modal | Order ID |
| Detail Modal | Back to History | None (modal closes) |

---

## Data Used or Modified

### Page State (Local)

| State | Type | Initial | Updated On |
|-------|------|---------|------------|
| `orders` | Order[] | `[]` | API fetch |
| `isLoading` | boolean | `true` | API response |
| `error` | string \| null | `null` | API error |
| `selectedOrderId` | string \| null | `null` | View button click |

### Order Data Object

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| orderId | string | "ORD-12345" | Unique order ID |
| restaurantId | string | "rest-001" | Restaurant ID |
| restaurantName | string | "Pizza Palace" | For display |
| status | string | "delivered" \| "preparing" \| "out for delivery" \| "confirmed" \| "cancelled" | Order status |
| totalPrice | number | 37.97 | Total order amount |
| createdAt | string (ISO) | "2026-04-07T16:45:00Z" | Order creation time |
| items | OrderItem[] | [{name, quantity, price}] | Items in order |

### No Direct Data Modifications
- Page only reads order data (no edits)
- Does not modify order status
- Does not cancel/modify orders
- Read-only display

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Language:** TypeScript
- **UI Framework:** React Native
- **Navigation:** expo-router (tab routing + modal)
- **HTTP Client:** Axios
- **State Management:** React useState
- **Hooks:** useFocusEffect (to refresh on tab focus)
- **Icons:** FontAwesome (@fortawesome/react-native-fontawesome)

### Data Fetching Pattern

**On Mount:**
1. Show loading spinner
2. Execute GET request
3. On success: Hide spinner, display orders
4. On error: Hide spinner, show error message

**On Tab Focus:**
1. Use `useFocusEffect` hook
2. Refresh order list (optional loading indicator)
3. Update statuses if changed

### Component Structure

```
HistoryPage
├─ State: orders, isLoading, error
├─ useFocusEffect: Trigger fetch on focus
├─ useEffect: Fetch on mount
├─ HeaderRow (static)
├─ LoadingState (conditional)
├─ OrderList (FlatList or ScrollView)
│  └─ OrderRow (repeated per order)
│     ├─ OrderInfo (id + date)
│     ├─ StatusBadge (colored)
│     └─ ViewButton (tap handler)
├─ EmptyState (conditional)
└─ ErrorState (conditional)
```

### Status Color Mapping

```typescript
const statusColors = {
  confirmed: '#9CA3AF',      // Gray
  preparing: '#3B82F6',      // Blue
  'out for delivery': '#F97316', // Orange
  delivered: '#22C55E',      // Green
  cancelled: '#EF4444'       // Red
};
```

### Date Formatting

- Format: Use `new Date(createdAt).toLocaleDateString()` or similar
- Pattern: "Apr 7, 2026" or "4/7/2026"
- Consistent format throughout

### API Integration

- **Base URL:** From `.env`
- **Token:** Include via axios interceptor
- **Headers:** Include JWT bearer token
- **Cache:** Optional (no caching required for order history)

### Refresh Behavior

- **On Mount:** Fetch order list
- **On Tab Focus:** Re-fetch (using useFocusEffect)
- **On Error Retry:** Re-fetch
- **On Manual Refresh:** Store refreshing state if implementing pull-to-refresh

---

## Acceptance Criteria

- [ ] `app/(tabs)/history.tsx` component created
- [ ] Page displays as tab (visible in tab navigation)
- [ ] Table headers display: "Order", "Status", "View"
- [ ] Loading spinner shows while fetching
- [ ] GET request sent to correct endpoint with JWT token
- [ ] Order list displays all returned orders
- [ ] Orders sorted chronologically (newest first)
- [ ] Each order shows: Order ID, date, status, View button
- [ ] Status badges display with correct colors
- [ ] View button is tappable on each row
- [ ] Clicking View button opens detail modal
- [ ] Order ID passed correctly to modal
- [ ] Empty state message displays when no orders
- [ ] Error message displays on API failure
- [ ] Retry button works to refetch orders
- [ ] Page refreshes when tab is focused (useFocusEffect)
- [ ] Updated order statuses reflect when returning to page
- [ ] All dates formatted consistently
- [ ] All prices display with currency format (if shown)
- [ ] List scrollable for multiple orders
- [ ] No hardcoded order data
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android simulator
- [ ] Responsive to different screen sizes

---

## Notes for the AI

### Important Implementation Details

1. **Fetching Order History**
   ```typescript
   const fetchOrderHistory = async () => {
     setIsLoading(true);
     setError(null);
     try {
       const response = await axios.get('/api/v1/customer/orders');
       setOrders(response.data.orders || []);
     } catch (error: any) {
       setError(error.response?.data?.error || 'Failed to load orders');
     } finally {
       setIsLoading(false);
     }
   };
   ```

2. **Tab Focus Effect**
   - Use `useFocusEffect` to refresh on every tab visit
   - This ensures order statuses are updated when user returns
   ```typescript
   import { useFocusEffect } from 'expo-router';
   
   useFocusEffect(
     React.useCallback(() => {
       fetchOrderHistory();
       // Cleanup if needed
       return () => {};
     }, [])
   );
   ```

3. **List Rendering**
   - Use `FlatList` for better performance with many orders
   - Or use `ScrollView` for simpler implementation
   ```typescript
   <FlatList
     data={orders}
     keyExtractor={(item) => item.orderId}
     renderItem={({ item }) => (
       <OrderRow order={item} onViewPress={() => handleViewOrder(item.orderId)} />
     )}
   />
   ```

4. **Order Row Component**
   ```typescript
   const OrderRow = ({ order, onViewPress }: { order: Order; onViewPress: () => void }) => {
     return (
       <View style={styles.row}>
         <View style={styles.orderColumn}>
           <Text style={styles.orderId}>{order.orderId}</Text>
           <Text style={styles.date}>
             {new Date(order.createdAt).toLocaleDateString()}
           </Text>
         </View>
         
         <View style={styles.statusColumn}>
           <View style={[styles.badge, { backgroundColor: statusColors[order.status] }]}>
             <Text style={styles.statusText}>{order.status}</Text>
           </View>
         </View>
         
         <TouchableOpacity onPress={onViewPress} style={styles.viewButton}>
           <FontAwesomeIcon icon={faEye} size={20} />
         </TouchableOpacity>
       </View>
     );
   };
   ```

5. **Status Color Mapping**
   ```typescript
   const statusColors: Record<string, string> = {
     confirmed: '#9CA3AF',
     preparing: '#3B82F6',
     'out for delivery': '#F97316',
     delivered: '#22C55E',
     cancelled: '#EF4444'
   };
   ```

6. **Date Formatting**
   ```typescript
   const formatOrderDate = (dateString: string) => {
     const date = new Date(dateString);
     return date.toLocaleDateString('en-US', {
       month: 'short',
       day: 'numeric',
       year: 'numeric'
     });
     // Output: "Apr 7, 2026"
   };
   ```

7. **Navigation to Detail Modal**
   ```typescript
   const handleViewOrder = (orderId: string) => {
     router.push({
       pathname: '/(tabs)/history/[id]',
       params: { id: orderId }
     });
   };
   ```

8. **Empty State Handling**
   ```typescript
   if (isLoading) {
     return <LoadingSpinner />;
   }

   if (error) {
     return (
       <ErrorState
         message={error}
         onRetry={fetchOrderHistory}
       />
     );
   }

   if (orders.length === 0) {
     return (
       <View style={styles.emptyContainer}>
         <Text style={styles.emptyText}>No orders yet.</Text>
         <Text style={styles.emptySubtext}>Start by ordering from a restaurant!</Text>
       </View>
     );
   }

   return <OrderList orders={orders} />;
   ```

### Example Implementation Pattern

```typescript
// app/(tabs)/history.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  restaurantName: string;
  status: 'confirmed' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

const statusColors: Record<string, string> = {
  confirmed: '#9CA3AF',
  preparing: '#3B82F6',
  'out for delivery': '#F97316',
  delivered: '#22C55E',
  cancelled: '#EF4444'
};

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrderHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/customer/orders');
      setOrders(response.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  React.useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  // Fetch on tab focus
  useFocusEffect(
    useCallback(() => {
      fetchOrderHistory();
      return () => {};
    }, [fetchOrderHistory])
  );

  const handleViewOrder = (orderId: string) => {
    router.push({
      pathname: '/(tabs)/history/[id]',
      params: { id: orderId }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderHistory}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No orders yet</Text>
        <Text style={styles.emptySubtext}>Start by ordering from a restaurant!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.orderColumn]}>Order</Text>
        <Text style={[styles.headerCell, styles.statusColumn]}>Status</Text>
        <Text style={[styles.headerCell, styles.actionColumn]}>View</Text>
      </View>

      {/* Order List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.orderId}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={[styles.cell, styles.orderColumn]}>
              <Text style={styles.orderId}>{item.orderId}</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>

            <View style={[styles.cell, styles.statusColumn]}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[item.status] }
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={[styles.cell, styles.actionColumn]}>
              <TouchableOpacity
                onPress={() => handleViewOrder(item.orderId)}
                style={styles.viewButton}
              >
                <FontAwesomeIcon icon={faEye} size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
    marginBottom: 8
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1F2937'
  },
  orderColumn: {
    flex: 1.5
  },
  statusColumn: {
    flex: 1
  },
  actionColumn: {
    flex: 0.6,
    textAlign: 'center'
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center'
  },
  cell: {
    justifyContent: 'center'
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff'
  },
  viewButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center'
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8
  }
});
```

### Common Mistakes to Avoid

- ❌ Not using `useFocusEffect` to refresh on tab return (stale data)
- ❌ Not including JWT token in API request (401 error)
- ❌ Hardcoding empty state or error messages
- ❌ Not sorting orders by date (confusing order)
- ❌ Using wrong status color for badge
- ❌ Not formatting dates consistently
- ❌ Disabling View button or not making it tappable
- ❌ Not handling empty orders array
- ❌ Not handling API errors gracefully
- ❌ Re-fetching too frequently (use useFocusEffect wisely)

### Testing Checklist

1. **Data Display**
   - [ ] All orders display in table format
   - [ ] Order IDs displayed correctly
   - [ ] Dates formatted correctly (e.g., "Apr 7, 2026")
   - [ ] Status badges show correct colors
   - [ ] Status text matches backend data
   - [ ] Newest orders appear first
   - [ ] No duplicate orders displayed

2. **Loading State**
   - [ ] Spinner shows while fetching
   - [ ] "Loading..." text visible
   - [ ] Timeout occurs if API slow

3. **Error Handling**
   - [ ] Error message displays on API failure
   - [ ] Retry button works
   - [ ] Retry re-fetches data correctly

4. **Empty State**
   - [ ] "No orders yet" message shows when list empty
   - [ ] Message text clear and helpful

5. **View Button**
   - [ ] View button visible for each order
   - [ ] View button tappable
   - [ ] Clicking View opens detail modal
   - [ ] Order ID passed to modal correctly

6. **Tab Navigation**
   - [ ] Page appears as tab
   - [ ] Tab is labeled correctly
   - [ ] Switching to another tab and back refreshes list
   - [ ] Updated statuses shown on return

7. **Cross-Platform**
   - [ ] Displays correctly on iOS
   - [ ] Displays correctly on Android
   - [ ] Table layout responsive
   - [ ] Scrollable for many orders

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Tech stack, API auth, styling)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Tab routing)
- **Menu Modal Confirmation:** `./ai/features/menu-modal-confirmation.feature.md` (Source of orders)
- **Order History Modal:** `./ai/features/order-history-modal.feature.md` (Detail view)
- **API Service:** `./client/services/api.ts` (Axios setup)
- **REST API Docs:** From Module 12 (Order list endpoint spec)

---

**This feature provides the primary interface for customers to view and track their past orders.**
