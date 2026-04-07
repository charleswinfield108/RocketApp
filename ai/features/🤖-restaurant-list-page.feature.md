# 🤖 AI_FEATURE_Restaurant List Page

> This feature displays available restaurants in a grid layout and enables users to filter by rating and price.
> The restaurant list is the primary interface users interact with after login.

---

## Feature Identity

- **Feature Name:** Restaurant List Page
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Critical (Core user journey)
- **Dependencies:** Navigation Structure (routing), Login Page (authentication), Header & Footer (persistent UI)

---

## Feature Goal

Provide an intuitive restaurant browsing interface that:
1. **Displays all available restaurants** on initial load
2. **Shows restaurant cards** in a grid layout with relevant information
3. **Enables filtering** by rating and price range
4. **Updates results dynamically** as filters are applied
5. **Navigates to restaurant menu** when a restaurant is selected
6. **Maintains consistent styling** matching the wireframe design

The restaurant list is the **primary interface** where customers begin their ordering journey.

---

## Feature Scope

### In Scope (Included)

- **Restaurant List Screen** — `app/(tabs)/index.tsx`
- **Restaurant Card Component** — Displays individual restaurant info
- **Grid Layout** — Multiple restaurants displayed in responsive columns
- **API Integration** — Fetch restaurants from backend
- **Filter Controls** — UI for rating and price filters
- **Filter Logic** — Filter restaurants based on user selection
- **Dynamic Results** — Update restaurant list as filters change
- **Navigation** — Tap restaurant card to view menu
- **Restaurant ID Passing** — Route parameter to restaurant detail screen
- **Loading State** — Visual feedback while fetching restaurants
- **Empty State** — Message when no restaurants match filters
- **Styling** — Match wireframe design and color scheme

### Out of Scope (Excluded)

- Restaurant search by name (filtering only, not implemented)
- Restaurant details on the list (full details on detail page)
- User reviews/ratings display (not in MVP)
- Restaurant hours/availability (out of scope)
- Favorites or bookmarks (not required)
- Pagination (assume all restaurants fit on screen)
- Real-time restaurant availability (out of scope)

---

## Sub-Requirements (Feature Breakdown)

1. **Restaurant List Screen** — `app/(tabs)/index.tsx`
   - Renders restaurant cards in grid layout
   - Fetches restaurants from API on mount
   - Stores restaurant data in state
   - Passes data to child components
   - Handles loading and error states

2. **Restaurant Card Component** — `components/RestaurantCard.tsx`
   - Displays restaurant image
   - Shows restaurant name
   - Shows rating (numeric, e.g., 4.5 stars)
   - Shows price range (e.g., $ or $$$)
   - Tappable/navigable card
   - Responsive sizing

3. **Grid Layout**
   - Multiple columns (2-3 depending on screen width)
   - Responsive to different screen sizes
   - Proper spacing between cards
   - Scrollable container (FlatList or ScrollView)

4. **Filter Controls UI** — `components/FilterBar.tsx` or inline on list
   - Rating filter dropdown or buttons (e.g., 4+, 3+, 2+)
   - Price filter dropdown or buttons (e.g., $, $$, $$$)
   - Filter labels/placeholders when not selected
   - Show selected filter values
   - Optional: Clear all filters button

5. **Filter Logic**
   - Filter restaurants by selected rating threshold
   - Filter restaurants by selected price range
   - Apply multiple filters simultaneously
   - Re-filter when any filter changes
   - Maintain original restaurant list (don't mutate)

6. **API Integration**
   - GET request to fetch all restaurants
   - Endpoint: `/api/v1/restaurants` or similar
   - Response: array of restaurant objects
   - Include JWT token in request headers

7. **Restaurant Data Structure**
   ```json
   {
     "id": "rest-123",
     "name": "Pizza Palace",
     "rating": 4.5,
     "priceRange": 2,
     "image": "url-to-image",
     "description": "Italian cuisine"
   }
   ```

8. **Navigation to Restaurant Detail**
   - Tap restaurant card
   - Extract restaurant ID
   - Navigate to `/(tabs)/(restaurant)/[id]` with ID parameter
   - Menu page receives and displays restaurant details

9. **Loading & Error States**
   - Show loading spinner during fetch
   - Show error message if fetch fails
   - Retry button for failed requests
   - Hide filters during loading (optional)

10. **Empty State**
    - Message when no restaurants (unlikely unless API empty)
    - Message when filter returns zero results (likely)
    - Clear filters button on empty state

---

## User Flow / Logic (High Level)

```
User Logs In Successfully
  ↓
[Root Layout Detects AuthToken]
  ↓
[App Stack Shown → Tab Navigator]
  ↓
[Restaurants Tab Active (Default)]
  ↓
[Restaurant List Screen Mounts]
  ├─ Show loading spinner
  └─ Fetch all restaurants from API
  ↓
[API Response Received]
  ├─ Store restaurants in state
  └─ Hide loading spinner
  ↓
[Render Grid of Restaurant Cards]
├─ Each card: name, rating, price, image
├─ Cards are tappable
└─ Filter controls visible (default: no filters)
  ↓
[User Interacts with Filters]
  ├─ IF user selects rating filter → Re-filter list
  ├─ IF user selects price filter → Re-filter list
  ├─ IF user selects both filters → Re-filter list
  └─ Updated grid displayed
  ↓
[User Taps Restaurant Card]
  ├─ Extract restaurant ID
  ├─ Navigate to /(tabs)/(restaurant)/[id]
  └─ Restaurant detail/menu screen loads
  ↓
[Restaurant Menu Screen Displays]
  └─ (Separate feature)
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Screen Component

```
app/(tabs)/index.tsx (Restaurant List Screen)
├─ FilterBar component (header)
│  ├─ Rating filter
│  └─ Price filter
├─ FlatList container
│  └─ RestaurantCard (repeating)
│     ├─ Restaurant image (tappable)
│     ├─ Name
│     ├─ Rating
│     └─ Price range
└─ Loading/Error states
```

### Subcomponents

| Component | File | Purpose |
|-----------|------|---------|
| RestaurantCard | `components/RestaurantCard.tsx` | Individual restaurant display |
| FilterBar | `components/FilterBar.tsx` or inline | Filter controls |
| RestaurantList | `app/(tabs)/index.tsx` | Main screen container |

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/v1/restaurants` | Fetch all restaurants (no pagination) |

**Request:**
```
GET /api/v1/restaurants
Headers: Authorization: Bearer <JWT_TOKEN>
```

**Success Response (HTTP 200):**
```json
{
  "restaurants": [
    {
      "id": "rest-001",
      "name": "Pizza Palace",
      "rating": 4.5,
      "priceRange": 2,
      "image": "url-to-image.jpg",
      "description": "Italian cuisine"
    },
    {
      "id": "rest-002",
      "name": "Burger Barn",
      "rating": 4.0,
      "priceRange": 1,
      "image": "url-to-image.jpg",
      "description": "American fast food"
    }
    // ... more restaurants
  ]
}
```

**Error Response (HTTP 401/500):**
```json
{
  "error": "Unauthorized" or "Server error"
}
```

### Route Navigation

| Source | Target | Parameter |
|--------|--------|-----------|
| Restaurant Card tap | `/(tabs)/(restaurant)/[id]` | `id` = restaurant.id |
| Filter/Search | Stay on `/(tabs)/index` | None |

---

## Data Used or Modified

### Screen State (Local)

| State | Type | Initial | Updated On |
|-------|------|---------|------------|
| `restaurants` | Restaurant[] | `[]` | API response |
| `filteredRestaurants` | Restaurant[] | `[]` | Filter change |
| `selectedRating` | number \| null | `null` | User filter selection |
| `selectedPrice` | number \| null | `null` | User filter selection |
| `loading` | boolean | `true` | API fetch start/end |
| `error` | string \| null | `null` | API error |

### Restaurant Data Object

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | "rest-123" | Unique identifier |
| name | string | "Pizza Palace" | Restaurant name |
| rating | number | 4.5 | Rating out of 5 |
| priceRange | number | 2 | 1-3 scale ($, $$, $$$) |
| image | string (URL) | "image-url.jpg" | Restaurant image |
| description | string (optional) | "Italian cuisine" | Optional brief description |

### Filter Logic

**Rating Filter:**
- Option 1: Show restaurants with rating >= selected value
- Example: User selects "4+" → Show restaurants with rating >= 4.0

**Price Filter:**
- Option 2: Show restaurants matching selected price range
- 1 = $ (low)
- 2 = $$ (medium)
- 3 = $$$ (high)
- Example: User selects "$$" → Show restaurants with priceRange == 2

**Combined Filters:**
- Apply both filters with AND logic
- Example: rating >= 4 AND priceRange == 2

### No Data Modifications
- Restaurant list is read-only
- No creating, updating, or deleting restaurants
- Filters only modify local display state

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Language:** TypeScript
- **UI Framework:** React Native
- **Layout:** FlatList or ScrollView for grid
- **HTTP Client:** Axios (configured from previous features)
- **Navigation:** expo-router (linking to restaurant detail)
- **State Management:** React useState

### Styling Constraints

- **Layout:** Grid layout using FlatList with `numColumns: 2` or `3`
- **Colors:** Use `constants/colors.ts`
- **Fonts:** Arial (text), Oswald (headings)
- **Spacing:** Responsive (no hardcoded pixels where possible)
- **Images:** Use Image component from React Native

### API Integration Rules

- Use base URL from `.env`
- Include JWT bearer token in headers (via axios interceptor)
- Timeout: 30 seconds
- No retry logic on 4xx errors (just show error)
- Show loading spinner during fetch

### Filter Rules

- Filter is client-side (all restaurants fetched once)
- No API call per filter change
- Filters are optional (default: show all)
- Multiple filters use AND logic (not OR)
- Filter state persists while on screen (clears on unmount)

### Image Handling

- All restaurants use PROVIDED image (not dynamic)
- Image path: from API response or local static image
- Use React Native Image component
- Set fixed width/height for cards
- Use resizeMode: 'cover' for cards

---

## Acceptance Criteria

- [ ] `app/(tabs)/index.tsx` screen created
- [ ] RestaurantCard component created
- [ ] FilterBar component created (or filter logic inline)
- [ ] API fetch request sent on screen mount
- [ ] All restaurants displayed in grid on load
- [ ] Loading spinner shown during fetch
- [ ] Restaurant cards display: name, rating, price, image
- [ ] Restaurant cards are tappable without errors
- [ ] Rating filter dropdown/buttons working
- [ ] Price filter dropdown/buttons working
- [ ] Filters show placeholder text when not selected
- [ ] Selected filter values displayed clearly
- [ ] List updates dynamically when filter is changed
- [ ] Multiple filters work together (AND logic)
- [ ] Tap restaurant card navigates to restaurant detail
- [ ] Restaurant ID passed correctly to detail screen
- [ ] Empty state message shows when no results (if applicable)
- [ ] Error message shown if API fails
- [ ] Retry button works if API fails
- [ ] No console errors
- [ ] Grid is responsive on iPhone and Android
- [ ] Grid responds to screen rotation (if applicable)

---

## Notes for the AI

### Important Implementation Details

1. **Grid Layout**
   - Use FlatList for optimal performance
   - Set `numColumns: 2` for 2-column grid
   - Or `numColumns: 3` for 3-column if space allows
   - Add `key` prop correctly for list items
   - Ensure each card has consistent height

2. **Filter Logic**
   - **Recommended approach:**
     ```typescript
     const filtered = restaurants.filter(r => {
       const ratingOk = !selectedRating || r.rating >= selectedRating;
       const priceOk = !selectedPrice || r.priceRange === selectedPrice;
       return ratingOk && priceOk;
     });
     ```
   - Do NOT modify original `restaurants` array
   - Update `filteredRestaurants` state when filters change

3. **Restaurant Image**
   - All restaurants use the SAME image: `RestaurantMenu.jpg`
   - OR use image URL from API response
   - Verify image renders (not broken links)
   - Use `resizeMode="cover"` for consistent appearance

4. **API Token in Headers**
   - This is handled by axios interceptor (if set up correctly)
   - Verify token is included: Check Network tab in dev tools
   - If 401 error, check token retrieval from AsyncStorage

5. **Navigation to Restaurant Detail**
   - Use `router.push()` from expo-router
   - Pass ID as parameter: `router.push({ pathname: '/(restaurant)/[id]', params: { id } })`
   - OR use Link component: `<Link href={`/(restaurant)/${id}`}>`
   - Verify ID is correctly extracted and passed

6. **Loading & Error States**
   - Show ActivityIndicator while `loading === true`
   - Hide when `loading === false`
   - Show error text if `error !== null`
   - Retry button should clear error and re-fetch

7. **Performance Considerations**
   - FlatList is optimized for large lists
   - Use `removeClippedSubviews={true}` if list is very long
   - Memoize RestaurantCard with React.memo to prevent unnecessary re-renders
   - Use `getItemLayout` if all items have same height

### Example Implementation Pattern

```typescript
// app/(tabs)/index.tsx
import { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { RestaurantCard } from '../components/RestaurantCard';
import { FilterBar } from '../components/FilterBar';

interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceRange: number;
  image: string;
}

export default function RestaurantsScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/v1/restaurants');
      setRestaurants(response.data.restaurants);
      setFilteredRestaurants(response.data.restaurants);
    } catch (err: any) {
      setError('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = restaurants.filter(r => {
      const ratingOk = !selectedRating || r.rating >= selectedRating;
      const priceOk = !selectedPrice || r.priceRange === selectedPrice;
      return ratingOk && priceOk;
    });
    setFilteredRestaurants(filtered);
  }, [selectedRating, selectedPrice, restaurants]);

  const handleRestaurantPress = (id: string) => {
    router.push({ pathname: '/(tabs)/(restaurant)/[id]', params: { id } });
  };

  if (loading) return <ActivityIndicator size="large" />;
  if (error) return (
    <View>
      <Text>{error}</Text>
      <TouchableOpacity onPress={fetchRestaurants}>
        <Text>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FilterBar
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        selectedPrice={selectedPrice}
        onPriceChange={setSelectedPrice}
      />
      
      <FlatList
        data={filteredRestaurants}
        numColumns={2}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={() => handleRestaurantPress(item.id)}
          />
        )}
      />
    </View>
  );
}
```

### Common Mistakes to Avoid

- ❌ Mutating original `restaurants` array (create new filtered array)
- ❌ Not including JWT token in API request (set up interceptor)
- ❌ Hardcoding API endpoint (use .env variable)
- ❌ Not handling loading state (show spinner)
- ❌ Not handling API errors (show error message)
- ❌ Using `map()` instead of FlatList (performance issue)
- ❌ Missing `key` prop on FlatList items
- ❌ Navigation parameters not passed correctly (verify ID)
- ❌ Filters not clearing when component unmounts
- ❌ Image not rendering (verify URL or local path)

### Testing Checklist

1. **API Integration**
   - [ ] API endpoint called correctly
   - [ ] JWT token included in headers
   - [ ] Response data extracted correctly
   - [ ] Restaurants stored in state

2. **Rendering**
   - [ ] Restaurant cards display in grid
   - [ ] Grid has correct number of columns
   - [ ] Card layout matches wireframe
   - [ ] Images render without breaking

3. **Filtering**
   - [ ] Rating filter works
   - [ ] Price filter works
   - [ ] Filters work together
   - [ ] No filter shows all restaurants
   - [ ] Changing filter updates list immediately

4. **Navigation**
   - [ ] Tapping card navigates to restaurant detail
   - [ ] Restaurant ID passes correctly
   - [ ] Detail screen loads restaurant data

5. **States**
   - [ ] Loading spinner shows on mount
   - [ ] Error message shows if API fails
   - [ ] Empty state shows if no results
   - [ ] Retry button re-fetches on error

6. **Cross-Platform**
   - [ ] Works on iOS
   - [ ] Works on Android
   - [ ] Responsive to screen size
   - [ ] Grid adapts to orientation (if vertical/horizontal)

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Tech stack, API auth, styling)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Tab routing)
- **Login Feature:** `./ai/features/login-page.feature.md` (Authentication)
- **Header Feature:** `./ai/features/header-footer.feature.md` (Persistent UI)
- **API Service:** `./client/services/api.ts` (Axios setup)
- **REST API Docs:** From Module 12 (Restaurants endpoint spec)
- **Wireframe Design:** `support_materials_13/Design/` (Card layout reference)

---

**This feature is the primary interface where customers begin their restaurant discovery and ordering journey.**
