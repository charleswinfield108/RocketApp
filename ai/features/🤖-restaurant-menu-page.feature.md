# 🤖 AI_FEATURE_Restaurant Menu Page

> This feature displays a restaurant's menu with items and quantities.
> Users can adjust item quantities using stepper buttons and place orders with confirmation.

---

## Feature Identity

- **Feature Name:** Restaurant Menu Page
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Critical (Core ordering functionality)
- **Dependencies:** Navigation Structure (dynamic routing), Restaurant List (restaurant ID param), Header & Footer (persistent UI), Order Creation (confirmation modal)

---

## Feature Goal

Provide an interactive menu interface that:
1. **Displays restaurant menu items** with details and pricing
2. **Shows a static restaurant image** (RestaurantMenu.jpg)
3. **Enables quantity adjustment** via stepper buttons only
4. **Prevents invalid quantities** (minimum 1, no negative values)
5. **Resets quantities** when switching restaurants
6. **Disables order creation** when no items selected
7. **Opens confirmation modal** when order is ready
8. **Maintains consistent UX** matching the wireframe design

The restaurant menu is where customers **select items and quantities** before order confirmation.

---

## Feature Scope

### In Scope (Included)

- **Restaurant Menu Screen** — `app/(tabs)/(restaurant)/[id].tsx`
- **Restaurant Header** — Name, image (RestaurantMenu.jpg), basic info
- **Menu Item Component** — Individual item display with quantity
- **Menu Item List** — Display all items for restaurant
- **Stepper Component** — +/- buttons for quantity adjustment
- **Quantity Display** — Show current quantity for each item
- **Create Order Button** — Submit selected items
- **Button State Management** — Disabled when no items selected
- **Quantity Validation** — Prevent negative/zero invalid states
- **Quantity Reset Logic** — Clear all quantities on restaurant change
- **API Integration** — Fetch menu items from backend
- **Loading & Error States** — Visual feedback during data fetch
- **Order Summary** — Optional: show total items/price before modal

### Out of Scope (Excluded)

- Adding items to favorites (not in MVP)
- Item details/descriptions modal (not required)
- Quantity limits (backend validates)
- Recommendation engine (not in scope)
- Item customization/modifiers (not required)
- Item image variations (not in scope)
- Special dietary filters (not required)
- Stock status (assume all available)

---

## Sub-Requirements (Feature Breakdown)

1. **Restaurant Menu Screen** — `app/(tabs)/(restaurant)/[id].tsx`
   - Receives restaurant ID from route parameter
   - Fetches menu items for restaurant from API
   - Displays restaurant name and image
   - Renders menu items list
   - Manages quantity state for all items
   - Handles quantity reset on route change
   - Renders Create Order button

2. **Restaurant Header Section**
   - Display restaurant name at top
   - Display static image: RestaurantMenu.jpg
   - Image from local assets or static URL
   - Image sizing: responsive, not distorted
   - Optional: restaurant rating/info (from list data)

3. **Static Menu Image**
   - File: `client/assets/images/RestaurantMenu.jpg`
   - ALL restaurants use THIS SAME image
   - No dynamic image per restaurant
   - Confirmed: Use local static asset

4. **Menu Item Component** — `components/MenuItem.tsx`
   - Displays item name and price
   - Shows item description (if available)
   - Contains quantity stepper
   - Shows current quantity
   - TypeScript props interface

5. **Stepper Component** — `components/Stepper.tsx`
   - Two buttons: Decrement (-) and Increment (+)
   - Display current quantity between buttons
   - NO text input field
   - Minimum value: 0 (no negative)
   - No maximum limit (backend validates)
   - Decrement button disabled when value = 0
   - Increment always enabled

6. **Quantity Management Logic**
   - Initialize all items with quantity = 0
   - Store quantities in state object: `{ [itemId]: quantity }`
   - Update quantity on stepper button press
   - Reset all quantities to 0 when route changes (restaurant changes)
   - Track which items have quantity > 0

7. **Menu Items API**
   - GET request to fetch items for restaurant
   - Endpoint: `/api/v1/restaurants/{id}/menu` or `/api/v1/menus?restaurantId={id}`
   - Response: array of menu items
   - Include JWT token in headers

8. **Menu Item Data Structure**
   ```json
   {
     "id": "item-123",
     "name": "Pepperoni Pizza",
     "description": "Classic pizza with pepperoni",
     "price": 12.99,
     "restaurantId": "rest-001"
   }
   ```

9. **Create Order Button**
   - Label: "Create Order" or "Place Order"
   - Positioned at bottom of menu
   - **Enabled only if:** At least one item has quantity > 0
   - **Disabled if:** All items have quantity = 0
   - Visual feedback showing disabled state (grayed out/opacity)
   - On click: Open Order Confirmation Modal

10. **Order Summary (Before Modal)**
    - Optional: Show total items selected (count)
    - Optional: Show estimated total price
    - Clear visual indication something is selected

11. **Quantity Reset on Navigation**
    - When `restaurantId` route param changes (switching restaurants)
    - Clear all quantities back to 0
    - Use useEffect with dependency on route param
    - Occurs BEFORE menu items load for new restaurant

12. **Loading & Error States**
    - Show loading spinner while fetching menu items
    - Show error message if menu fetch fails
    - Retry button for failed requests
    - Disable stepper during loading (optional)

---

## User Flow / Logic (High Level)

```
User Taps Restaurant from List
  ↓
[Navigation to /(tabs)/(restaurant)/[id]]
  ├─ Route param: id = restaurantId
  └─ Previous restaurant's quantities RESET to 0
  ↓
[Restaurant Menu Screen Mounts]
  ├─ Show loading spinner
  └─ Fetch menu items for restaurant ID
  ↓
[Menu Items API Response]
  ├─ Store items in state
  ├─ Initialize quantities: { item1: 0, item2: 0, ... }
  └─ Hide loading spinner
  ↓
[Render Menu Screen]
  ├─ Restaurant header (name + image)
  ├─ Menu items with steppers
  │   └─ Each item shows: name, price, stepper (quantity)
  └─ Create Order button (DISABLED because all quantities = 0)
  ↓
[User Adjusts Quantities]
  ├─ User taps + button on first item → quantity = 1
  ├─ User taps + button on second item → quantity = 1
  ├─ → Create Order button becomes ENABLED
  └─ User can continue adjusting
  ↓
[User Clicks Create Order Button (Enabled)]
  ├─ Collect selected items and quantities
  ├─ Build order object: [{ itemId, quantity }, ...]
  └─ Open Order Confirmation Modal (SEPARATE FEATURE)
  ↓
[Order Confirmation Modal Displayed]
  └─ (Handled by separate order-confirmation feature)
  ↓
[User Switches to Different Restaurant]
  ├─ Navigate back to list or directly to another restaurant
  ├─ Route change detected
  ├─ ALL quantities RESET to 0
  └─ New menu loads with fresh state
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Screen Component

```
app/(tabs)/(restaurant)/[id].tsx (Restaurant Menu Screen)
├─ Restaurant Header Section
│  ├─ Restaurant name
│  └─ Static image (RestaurantMenu.jpg)
├─ Menu Items List (FlatList or ScrollView)
│  └─ MenuItem component (repeating)
│     ├─ Item name
│     ├─ Item price
│     ├─ Item description (optional)
│     └─ Stepper component (quantity +/-)
├─ Order Summary Section (optional)
│  └─ Total items count + estimated price
└─ Create Order Button
   └─ Enabled/Disabled based on quantities
```

### Subcomponents

| Component | File | Purpose |
|-----------|------|---------|
| MenuItem | `components/MenuItem.tsx` | Individual menu item display |
| Stepper | `components/Stepper.tsx` | Quantity +/- buttons |
| RestaurantMenu | `app/(tabs)/(restaurant)/[id].tsx` | Main screen |

### Props Interfaces

**MenuItem Props:**
```typescript
interface MenuItemProps {
  item: MenuItem;
  quantity: number;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
}
```

**Stepper Props:**
```typescript
interface StepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  disabled?: boolean;
}
```

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/restaurants/{id}/menu` | Fetch menu items for restaurant |

**Request:**
```
GET /api/v1/restaurants/rest-001/menu
Headers: Authorization: Bearer <JWT_TOKEN>
```

**Success Response (HTTP 200):**
```json
{
  "restaurantId": "rest-001",
  "items": [
    {
      "id": "item-001",
      "name": "Pepperoni Pizza",
      "description": "Classic pizza with pepperoni",
      "price": 12.99
    },
    {
      "id": "item-002",
      "name": "Margherita Pizza",
      "description": "Fresh mozzarella and basil",
      "price": 11.99
    }
    // ... more items
  ]
}
```

**Error Response (HTTP 401/500):**
```json
{
  "error": "Unauthorized" or "Menu not found"
}
```

### Route Navigation

| Source | Target | Parameter |
|--------|--------|-----------|
| Route change | `/(tabs)/(restaurant)/[id]` | `id` = restaurant.id |
| Menu item click | Stay on same screen | None (manage quantity inline) |
| Create Order | Open modal | Pass selected items |

---

## Data Used or Modified

### Screen State (Local)

| State | Type | Initial | Updated On |
|-------|------|---------|------------|
| `menuItems` | MenuItem[] | `[]` | API response |
| `quantities` | { [itemId]: number } | `{}` (all 0) | Stepper button press |
| `loading` | boolean | `true` | API fetch start/end |
| `error` | string \| null | `null` | API error |
| `restaurantId` | string | From route param | Route change |

### MenuItem Data Object

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "item-001" | Unique menu item ID |
| name | string | "Pepperoni Pizza" | Item name |
| description | string (optional) | "Classic pizza" | Brief description |
| price | number | 12.99 | Item price |
| restaurantId | string | "rest-001" | Associated restaurant |

### Quantity State Structure

```typescript
type QuantityState = {
  [itemId: string]: number; // Value is always >= 0
}

// Example:
{
  "item-001": 2,    // 2 pepperoni pizzas
  "item-002": 1,    // 1 margherita pizza
  "item-003": 0,    // not selected
  "item-004": 0     // not selected
}
```

### Calculations

**Total Items Selected:**
```
totalItems = sum of all quantity values where quantity > 0
```

**Estimated Total Price:**
```
totalPrice = sum of (menuItem.price * quantity) for all items
```

**Order Ready:**
```
canCreateOrder = totalItems > 0
```

### No Data Modifications
- Menu items are read-only
- Quantities are local-only (not persisted until order creation)
- No API calls for quantity updates (just local state)

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Language:** TypeScript
- **UI Framework:** React Native
- **Navigation:** expo-router (route params, dynamic [id])
- **HTTP Client:** Axios
- **State Management:** React useState
- **Layout:** ScrollView or FlatList for menu items

### Stepper Component Rules

✅ **MUST HAVE:**
- Two buttons (increment +, decrement -)
- Quantity displayed between buttons
- NO text input field (buttons only)
- Minimum value: 0
- Decrement disabled when value = 0
- No maximum validation (backend validates)

❌ **MUST NOT HAVE:**
- Text input for typing quantity
- Negative number possibility
- Manual quantity entry

### Image Constraints

- **All restaurants:** Use the SAME image
- **Image name:** `RestaurantMenu.jpg`
- **Location:** `client/assets/images/RestaurantMenu.jpg`
- **Size:** Responsive (not hardcoded dimensions)
- **Mode:** `resizeMode="cover"`

### API Integration Rules

- Use base URL from `.env`
- Include JWT bearer token in headers (axios interceptor)
- Timeout: 30 seconds
- No retry on 4xx errors (show error to user)

### Styling Constraints

- **Colors:** Use `constants/colors.ts`
- **Fonts:** Arial (text), Oswald (headings)
- **Button disabled state:** Visual indication (opacity or grayed out)
- **Active stepper buttons:** Visual feedback on press
- **Menu grid/list:** Responsive layout

### Route Parameter Handling

- Extract restaurant ID from route: `const { id } = useLocalSearchParams()`
- Watch for ID changes: `useEffect(() => { ... }, [id])`
- Reset quantities when ID changes
- Fetch new menu when ID changes

---

## Acceptance Criteria

- [ ] `app/(tabs)/(restaurant)/[id].tsx` screen created
- [ ] Route parameter (restaurantId) extracted correctly
- [ ] Menu items fetched from API on screen mount
- [ ] API include JWT bearer token
- [ ] Menu items display in list/grid format
- [ ] Restaurant header (name + image) displayed
- [ ] Static image (RestaurantMenu.jpg) displays for ALL restaurants
- [ ] Image is not distorted (proper resizeMode)
- [ ] MenuItem component created and displays correctly
- [ ] Stepper component created with +/- buttons
- [ ] Stepper shows correct quantity value
- [ ] NO text input field exists (buttons only)
- [ ] Decrement button disabled when quantity = 0
- [ ] Quantities initialize to 0 for all items
- [ ] Quantities reset to 0 when restaurant changes
- [ ] Create Order button is DISABLED initially (all quantities = 0)
- [ ] Create Order button ENABLED when quantity > 0 for any item
- [ ] Create Order button DISABLED when all quantities = 0 again
- [ ] Create Order button click opens confirmation modal
- [ ] Button disabled state has clear visual indication
- [ ] Stepper buttons respond immediately to taps
- [ ] Loading spinner shown while fetching menu
- [ ] Error message shown if menu fetch fails
- [ ] Retry button works on error
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android simulator
- [ ] Responsive on different screen sizes

---

## Notes for the AI

### Important Implementation Details

1. **Route Parameter Extraction**
   - Use `useLocalSearchParams()` from expo-router
   - Extract `id` parameter: `const { id } = useLocalSearchParams()`
   - This ID is the restaurantId
   - **Verify:** Parameter name is `id` (not `restaurantId`)

2. **Quantity Reset on Restaurant Change**
   - **Approach:** Use `useEffect` with `id` in dependency array
   - When `id` changes (user navigates to different restaurant):
     1. Immediately clear quantities: `setQuantities({})`
     2. Then fetch new menu
   - **Important:** Reset happens FIRST, before loading new menu
   - Example:
   ```typescript
   useEffect(() => {
     // Reset quantities when restaurant changes
     setQuantities({});
     // Then fetch new menu
     fetchMenuItems(id);
   }, [id]);
   ```

3. **Stepper Component (Buttons Only)**
   - Create as separate reusable component
   - Accept props: `value`, `onIncrement`, `onDecrement`, `disabled`
   - Decrement button: Disabled when `value === 0`
   - Display: `[−] value [+]` button layout
   - No text input field at all
   - Ensure buttons are large enough to tap

4. **Create Order Button State**
   - Calculate: `hasItems = Object.values(quantities).some(q => q > 0)`
   - Button disabled: `disabled={!hasItems}`
   - Visual feedback: Opacity or grayed-out color
   - Text should change or button should show disabled state clearly

5. **Quantity State Management**
   - Initialize: `{ item1: 0, item2: 0, ... }`
   - OR use `selectedItems` object: `{ [itemId]: { item, quantity } }`
   - Update handler:
   ```typescript
   const handleQuantityChange = (itemId: string, newQuantity: number) => {
     setQuantities(prev => ({
       ...prev,
       [itemId]: Math.max(0, newQuantity) // Prevent negative
     }));
   };
   ```

6. **Image Handling**
   - Import static image: `import restaurantMenuImage from '../assets/images/RestaurantMenu.jpg';`
   - Use in Image component: `<Image source={restaurantMenuImage} />`
   - Set fixed aspect ratio or responsive size
   - Use `resizeMode="cover"` for consistent appearance

7. **API Integration**
   - Endpoint structure: `/api/v1/restaurants/{id}/menu`
   - Verify endpoint with backend API docs
   - Alternative: `/api/v1/menus?restaurantId={id}`
   - Always include JWT token (handled by axios interceptor)
   - Response might be `{ items: [...] }` or `{ restaurantId, items: [...] }`

8. **Modal Integration**
   - When Create Order button clicked:
     1. Collect selected items: `Object.entries(quantities).map(([itemId, qty]) => ({ itemId, qty, ...itemData }))`
     2. Open modal: `router.push('/modal')` or show modal component
     3. Pass order data via route params or Context
   - Modal is separate feature (order confirmation)

### Example Implementation Pattern

```typescript
// app/(tabs)/(restaurant)/[id].tsx
import { useEffect, useState } from 'react';
import { View, FlatList, Image, ScrollView, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { MenuItem } from '../../components/MenuItem';
import { Stepper } from '../../components/Stepper';
import restaurantMenuImage from '../../assets/images/RestaurantMenu.jpg';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export default function RestaurantMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [quantities, setQuantities] = useState<{ [itemId: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Reset quantities and fetch menu when restaurant changes
  useEffect(() => {
    setQuantities({}); // Reset all quantities
    fetchMenuItems(id);
  }, [id]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/v1/restaurants/${restaurantId}/menu`);
      setMenuItems(response.data.items);
      
      // Initialize quantities to 0 for all items
      const initialQuantities: { [key: string]: number } = {};
      response.data.items.forEach((item: MenuItem) => {
        initialQuantities[item.id] = 0;
      });
      setQuantities(initialQuantities);
    } catch (err: any) {
      setError('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, prev[itemId] + delta)
    }));
  };

  const hasSelectedItems = Object.values(quantities).some(q => q > 0);

  const handleCreateOrder = () => {
    if (!hasSelectedItems) return;
    
    // Collect selected items
    const selectedItems = menuItems
      .filter(item => quantities[item.id] > 0)
      .map(item => ({
        itemId: item.id,
        name: item.name,
        quantity: quantities[item.id],
        price: item.price
      }));

    // Navigate to confirmation modal with data
    router.push({
      pathname: '/(tabs)/(restaurant)/modal',
      params: { selectedItems: JSON.stringify(selectedItems) }
    });
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return (
    <View>
      <Text>{error}</Text>
      <TouchableOpacity onPress={() => fetchMenuItems(id!)}>
        <Text>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Restaurant header */}
      <Image source={restaurantMenuImage} style={styles.image} />
      
      {/* Menu items */}
      <View style={styles.menuList}>
        {menuItems.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
            </View>
            <Stepper
              value={quantities[item.id]}
              onIncrement={() => handleQuantityChange(item.id, 1)}
              onDecrement={() => handleQuantityChange(item.id, -1)}
              disabled={false}
            />
          </View>
        ))}
      </View>

      {/* Create Order button */}
      <TouchableOpacity
        style={[styles.button, !hasSelectedItems && styles.buttonDisabled]}
        disabled={!hasSelectedItems}
        onPress={handleCreateOrder}
      >
        <Text style={styles.buttonText}>Create Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

### Common Mistakes to Avoid

- ❌ Using text input for quantity (buttons only!)
- ❌ Allowing negative quantities (Math.max(0, value))
- ❌ Not resetting quantities on restaurant change
- ❌ Not extracting route parameter correctly
- ❌ Using different image per restaurant (use single RestaurantMenu.jpg)
- ❌ Not disabling Create Order button when no items selected
- ❌ Not handling API error with retry option
- ❌ Hardcoding image path (use require/import)
- ❌ Not including JWT token in API request
- ❌ Forgetting to initialize quantities for fetched items

### Testing Checklist

1. **Navigation & Route**
   - [ ] Route parameter (id) extracted correctly
   - [ ] New menu loads when navigating to different restaurant
   - [ ] Back button navigates to restaurant list

2. **Menu Display**
   - [ ] Menu items load and display (no loading spinner after load)
   - [ ] Restaurant image displays (RestaurantMenu.jpg)
   - [ ] Image doesn't distort
   - [ ] Items show name, price, quantity

3. **Stepper Functionality**
   - [ ] + button increases quantity
   - [ ] - button decreases quantity
   - [ ] Quantity shows correct value
   - [ ] NO text input field (only buttons)
   - [ ] - button disabled when quantity = 0
   - [ ] Quantity never goes negative

4. **Quantity Management**
   - [ ] All items start at quantity 0
   - [ ] Quantities reset to 0 when switching restaurants
   - [ ] Multiple items can have different quantities
   - [ ] Quantities persist while on same restaurant (until reset)

5. **Create Order Button**
   - [ ] Button is DISABLED initially (all quantities = 0)
   - [ ] Button becomes ENABLED when any quantity > 0
   - [ ] Button becomes DISABLED again if all quantities set back to 0
   - [ ] Disabled state visually apparent
   - [ ] Button click opens confirmation modal

6. **Error Handling**
   - [ ] Error message shown if menu fetch fails
   - [ ] Retry button re-fetches menu
   - [ ] No infinite loading loop

7. **Cross-Platform**
   - [ ] Works on iOS simulator
   - [ ] Works on Android simulator
   - [ ] Responsive on different screen sizes
   - [ ] Stepper buttons easily tappable

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Tech stack, API auth, styling)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Dynamic routing [id])
- **Restaurant List:** `./ai/features/restaurant-list-page.feature.md` (Navigation source)
- **Header Feature:** `./ai/features/header-footer.feature.md` (Persistent header)
- **Order Confirmation:** `./ai/features/order-confirmation.feature.md` (Modal from menu)
- **API Service:** `./client/services/api.ts` (Axios setup)
- **REST API Docs:** From Module 12 (Menu endpoint spec)
- **Wireframe Design:** `support_materials_13/Design/` (Menu screen layout)
- **Static Image:** `client/assets/images/RestaurantMenu.jpg` (Required)

---

**This feature is where customers select items and quantities before confirming their order.**
