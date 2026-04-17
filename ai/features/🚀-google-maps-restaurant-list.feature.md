# 🚀 AI_FEATURE_Google Maps Restaurant List

> This bonus feature adds a map view option to the restaurant list screen.
> Customers can toggle between the existing grid view and a Google Maps view
> that plots every (filtered) restaurant as a tappable marker.
> Requires all restaurants to have valid geocodable addresses, seeded from the
> [rrad](https://github.com/EthanRBrown/rrad) real-address dataset.

---

## Feature Identity

- **Feature Name:** Google Maps Restaurant List
- **Module:** 14 (Bonus)
- **Related Area:** Mobile Frontend — `app/(tabs)/(restaurant)/index.tsx`, `components/RestaurantMap.tsx`; Server — `Address.java`, `ApiRestaurantDTO.java`, seed data
- **Priority:** Bonus (not required for base grade)
- **Dependencies:**
  - Restaurant List Screen (`app/(tabs)/(restaurant)/index.tsx`) — toggle lives here
  - `FilterBar` — filters apply to both list and map views
  - `restaurantsAPI` — map uses the same data fetch
  - Server `Address` model — must expose `latitude` and `longitude`
  - Google Maps API key — required for both `react-native-maps` and map tile rendering

---

## Feature Goal

1. **Give customers a spatial view** of nearby restaurants without leaving the app
2. **Reuse existing filters** — the same rating/price filters apply to map markers
3. **Enable tap-to-navigate** from a map marker directly to the restaurant's menu
4. **Require zero extra API calls** — lat/lng is included in the existing `GET /api/v1/restaurants` response
5. **Enforce real addresses** — seed data sourced from the rrad dataset so markers land on real streets

---

## Feature Scope

### In Scope (Included)

- View toggle button (list icon ↔ map icon) on the restaurant list screen
- `RestaurantMap` component — `MapView` with one `Marker` per filtered restaurant
- Marker callout — restaurant name, star rating, price range, "View Menu" button
- Tapping "View Menu" in callout navigates to `/(tabs)/(restaurant)/[id]` (same flow as card tap)
- Server: `latitude` and `longitude` columns added to the `addresses` table
- Server: `ApiRestaurantDTO` updated to include `address` object with lat/lng
- Seed data updated using real US addresses from the [rrad](https://github.com/EthanRBrown/rrad) dataset
- Map centered on the centroid of all loaded restaurants on first render
- Filters (rating, price) reduce markers just as they reduce cards in list view

### Out of Scope (Excluded)

- User location / "near me" centering (`expo-location` permission flow — optional enhancement only)
- Clustering of overlapping markers
- Custom marker artwork (use default Google Maps pin, tinted `#DA583B`)
- Directions or routing
- Real-time restaurant availability on the map
- Search by location / radius
- Saving a favorite location

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Map View Option** | A view option to display restaurants with Google Maps. |
| **Real Addresses** | All restaurant addresses must be valid, real addresses. |
| **Address Source** | Use the [rrad](https://github.com/EthanRBrown/rrad) repository to obtain real US addresses. |

---

## Sub-Requirements (Feature Breakdown)

### 1. View Toggle

A pair of icon buttons sits to the right of the "NEARBY RESTAURANTS" heading (or inline with the section title row). Only one mode is active at a time.

| State | Icon | Action |
|-------|------|--------|
| Viewing list | Map icon (`faMap`) | Switch to map view |
| Viewing map | List icon (`faList`) | Switch to list view |

```typescript
const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
```

The toggle does **not** re-fetch data — both views share the same `filteredRestaurants` array already in state.

---

### 2. RestaurantMap Component

A new component `components/RestaurantMap.tsx` that renders a `MapView` from `react-native-maps`.

```
RestaurantMap
├─ MapView (Google Maps provider, fills available space)
│   └─ Marker × N  (one per filtered restaurant)
│       └─ Callout
│           ├─ Restaurant name (Oswald Bold)
│           ├─ Star rating  (e.g. "★ 4.2")
│           ├─ Price range  (e.g. "$$")
│           └─ "VIEW MENU" TouchableOpacity
```

**Props:**
```typescript
interface RestaurantMapProps {
  restaurants: RestaurantWithCoords[];
  onSelectRestaurant: (id: number) => void;
}
```

**Initial region** — centered on the mean lat/lng of all restaurants, with a span large enough to show all markers:
```typescript
const initialRegion = useMemo(() => {
  if (restaurants.length === 0) return DEFAULT_REGION;
  const lats = restaurants.map(r => r.latitude);
  const lngs = restaurants.map(r => r.longitude);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  return {
    latitude:       (minLat + maxLat) / 2,
    longitude:      (minLng + maxLng) / 2,
    latitudeDelta:  (maxLat - minLat) * 1.4 + 0.02,
    longitudeDelta: (maxLng - minLng) * 1.4 + 0.02,
  };
}, [restaurants]);
```

**Default region** (fallback when list is empty):
```typescript
const DEFAULT_REGION = {
  latitude: 37.7749,   // San Francisco — matches rrad dataset
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};
```

---

### 3. Map Markers and Callouts

Each marker uses the default Google Maps pin with `pinColor="#DA583B"` (brand orange).

```tsx
<Marker
  key={r.id}
  coordinate={{ latitude: r.latitude, longitude: r.longitude }}
  pinColor="#DA583B"
>
  <Callout onPress={() => onSelectRestaurant(r.id)} tooltip={false}>
    <View style={styles.callout}>
      <Text style={styles.calloutName}>{r.name}</Text>
      <Text style={styles.calloutMeta}>★ {r.rating.toFixed(1)}  {'$'.repeat(r.price_range)}</Text>
      <Text style={styles.calloutCta}>VIEW MENU</Text>
    </View>
  </Callout>
</Marker>
```

Tapping the callout (or the "VIEW MENU" text) calls `onSelectRestaurant(r.id)`, which in the parent screen calls `router.push(...)` — the same path used by `RestaurantCard`.

---

### 4. Address Data — Server Changes Required

The current `ApiRestaurantDTO` does **not** include address data. Two server files need updating.

#### 4a. `Address.java` — add lat/lng columns

```java
@Column(name = "latitude", nullable = false)
private double latitude;

@Column(name = "longitude", nullable = false)
private double longitude;
```

A Flyway (or Liquibase) migration must add these columns:
```sql
ALTER TABLE addresses ADD COLUMN latitude  DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE addresses ADD COLUMN longitude DOUBLE PRECISION NOT NULL DEFAULT 0;
```

#### 4b. `ApiRestaurantDTO.java` — expose address

```java
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class ApiRestaurantDTO {
    int    id;
    String name;

    @JsonProperty("price_range")
    int priceRange;

    int rating;

    ApiAddressDTO address;   // ← NEW
}

// Nested DTO (new file: ApiAddressDTO.java)
@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class ApiAddressDTO {
    @JsonProperty("street_address")
    String streetAddress;

    String city;

    @JsonProperty("postal_code")
    String postalCode;

    double latitude;
    double longitude;
}
```

#### 4c. Service / mapper update

Wherever `ApiRestaurantDTO` is constructed (the restaurant service layer), populate the nested `address` field from the `restaurant.getAddress()` relation.

---

### 5. Seed Data — rrad Real Addresses

The [rrad dataset](https://github.com/EthanRBrown/rrad) (`addresses.json`) provides an array of US addresses each with `address1`, `city`, `state`, `postalCode`, `coordinates.lat`, `coordinates.lng`.

**Steps:**
1. Download `addresses.json` from the rrad repo
2. Pick one unique address per restaurant (no duplicates)
3. Update the database seed SQL (or Flyway seed migration) with real `street_address`, `city`, `postal_code`, `latitude`, `longitude` values
4. Verify every restaurant row has a non-zero lat/lng after seeding

**Sample rrad entry → DB row mapping:**
```
rrad field           → DB column
─────────────────────────────────
address1             → street_address   e.g. "1234 Market St"
city                 → city             e.g. "San Francisco"
postalCode           → postal_code      e.g. "94102"
coordinates.lat      → latitude         e.g. 37.7749
coordinates.lng      → longitude        e.g. -122.4194
```

---

### 6. Client-Side Type Updates

Add `latitude` and `longitude` to the `Restaurant` interface in `app/(tabs)/(restaurant)/index.tsx` (and any shared type file if one is introduced):

```typescript
interface Restaurant {
  id: number;
  name: string;
  rating: number;
  price_range: number;
  imageUrl?: string;
  address: {
    street_address: string;
    city: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
}

// Alias used by RestaurantMap:
type RestaurantWithCoords = Restaurant & {
  address: { latitude: number; longitude: number };
};
```

---

### 7. Required Package

| Package | Purpose | Install |
|---------|---------|---------|
| `react-native-maps` | MapView, Marker, Callout | `npx expo install react-native-maps` |

**`app.json` update — add Google Maps API key:**
```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_GOOGLE_MAPS_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_GOOGLE_MAPS_KEY"
      }
    }
  }
}
```

Store the key in `.env` as `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` and reference it from `app.config.js` if using dynamic config. **Never commit raw API keys to git.**

---

## User Flow / Logic

```
Customer opens Restaurants tab
  ↓
[RestaurantListScreen mounts — existing flow]
  ├─ Fetches restaurants (now includes address.latitude / address.longitude)
  └─ Default view: grid list ("list" mode)

Customer applies filters (optional)
  └─ filteredRestaurants updates — affects both list and map

Customer taps MAP icon (toggle)
  ↓
viewMode → 'map'
  └─ RestaurantMap renders with filteredRestaurants
      ├─ MapView centered on restaurant centroid
      └─ One marker per filtered restaurant

Customer taps a marker
  └─ Callout appears: name, rating, price, "VIEW MENU"

Customer taps "VIEW MENU" in callout
  ↓
router.push({ pathname: '/(tabs)/(restaurant)/[id]', params: { id } })
  └─ Restaurant menu screen loads (existing flow)

Customer taps LIST icon (toggle)
  ↓
viewMode → 'list'
  └─ FlatList grid renders again (state preserved — no re-fetch)
```

---

## Data Changes

### Server — Address table

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| `latitude` | `DOUBLE PRECISION` | `0` | Added via migration |
| `longitude` | `DOUBLE PRECISION` | `0` | Added via migration |

### Server — `GET /api/v1/restaurants` response shape (updated)

```json
{
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "price_range": 2,
      "rating": 4,
      "address": {
        "street_address": "1234 Market St",
        "city": "San Francisco",
        "postal_code": "94102",
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    }
  ]
}
```

### Client — no new API call

The map view consumes the same `filteredRestaurants` array already in state. Zero additional network requests.

---

## Component State (additions to `index.tsx`)

```typescript
const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

// No new loading/error state needed — map shares existing fetch state
```

---

## Files Modified

| File | Change |
|------|--------|
| `app/(tabs)/(restaurant)/index.tsx` | Add `viewMode` state; view toggle button; render `<RestaurantMap>` when `viewMode === 'map'` |
| `client` `services/api.ts` | No change — `restaurantsAPI.getAll()` already used |

## Files Created

| File | Purpose |
|------|---------|
| `components/RestaurantMap.tsx` | `MapView` + markers + callouts |

## Server Files Modified

| File | Change |
|------|--------|
| `models/Address.java` | Add `latitude: double`, `longitude: double` fields |
| `dtos/restaurant/ApiRestaurantDTO.java` | Add nested `ApiAddressDTO address` field |
| `dtos/restaurant/ApiAddressDTO.java` (new) | Nested DTO: streetAddress, city, postalCode, latitude, longitude |
| Restaurant service layer | Populate `address` field when building `ApiRestaurantDTO` |
| DB seed / Flyway migration | Real addresses + lat/lng from rrad dataset |

---

## Styles (RestaurantMap)

```typescript
// components/RestaurantMap.tsx
const styles = StyleSheet.create({
  map: {
    flex: 1,                   // fills the space below FilterBar + title row
  },
  callout: {
    width: 180,
    padding: 10,
  },
  calloutName: {
    fontFamily: OswaldFonts.bold,
    fontSize: 14,
    color: '#222126',
    marginBottom: 4,
  },
  calloutMeta: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
  },
  calloutCta: {
    fontFamily: OswaldFonts.bold,
    fontSize: 13,
    color: '#DA583B',
    textAlign: 'center',
  },
});
```

**View toggle button styles (add to `index.tsx` styles):**
```typescript
viewToggleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 12,
},
viewToggleBtn: {
  padding: 6,
},
```

---

## Acceptance Criteria

### View Toggle
- [ ] Map icon visible on restaurant list screen
- [ ] Tapping map icon switches to map view
- [ ] Tapping list icon switches back to grid view
- [ ] Active view icon is visually distinct (e.g. tinted `#DA583B`)
- [ ] Toggle does not trigger a re-fetch

### Map View
- [ ] `MapView` renders using Google Maps provider
- [ ] One marker rendered per filtered restaurant
- [ ] Map centered on centroid of loaded restaurants
- [ ] Markers are tinted `#DA583B`
- [ ] Filtering by rating reduces visible markers
- [ ] Filtering by price reduces visible markers
- [ ] No markers shown when filter matches zero restaurants

### Callout
- [ ] Tapping a marker shows a callout
- [ ] Callout displays restaurant name
- [ ] Callout displays star rating (one decimal)
- [ ] Callout displays price range in `$` symbols
- [ ] "VIEW MENU" button visible in callout
- [ ] Tapping "VIEW MENU" navigates to correct restaurant menu screen

### Address Data
- [ ] All restaurants have non-zero `latitude` and `longitude` in API response
- [ ] Addresses are real US addresses (verifiable by checking one on Google Maps)
- [ ] No two restaurants share the same address
- [ ] `ApiRestaurantDTO` includes `address` object with lat/lng

### Integration
- [ ] Existing grid view still works after changes
- [ ] Existing filters still work in both views
- [ ] No console errors in either view mode
- [ ] Works on iOS (physical or simulator)
- [ ] Works on Android (physical or emulator)

---

## Notes for the AI

### Where to Place the Toggle in `index.tsx`

Replace the plain `<Text style={styles.sectionTitle}>` row with a flex row that holds the title and the toggle icons:

```tsx
{/* Title + view toggle */}
<View style={styles.viewToggleRow}>
  <Text style={styles.sectionTitle}>NEARBY RESTAURANTS</Text>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <TouchableOpacity
      style={styles.viewToggleBtn}
      onPress={() => setViewMode('list')}
    >
      <FontAwesomeIcon
        icon={faList}
        size={18}
        color={viewMode === 'list' ? '#DA583B' : '#999999'}
      />
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.viewToggleBtn}
      onPress={() => setViewMode('map')}
    >
      <FontAwesomeIcon
        icon={faMap}
        size={18}
        color={viewMode === 'map' ? '#DA583B' : '#999999'}
      />
    </TouchableOpacity>
  </View>
</View>

{/* Conditional view */}
{viewMode === 'list' ? (
  /* existing FlatList / empty state */
) : (
  <RestaurantMap
    restaurants={filteredRestaurants.filter(r => r.address?.latitude && r.address?.longitude)}
    onSelectRestaurant={(id) =>
      router.push({ pathname: '/(tabs)/(restaurant)/[id]', params: { id } })
    }
  />
)}
```

### Handling Missing Coordinates

Before passing restaurants to `RestaurantMap`, filter out any that lack valid coordinates. This prevents marker crashes during development when seed data is partially migrated:

```typescript
const mappableRestaurants = filteredRestaurants.filter(
  r => r.address?.latitude !== 0 && r.address?.longitude !== 0
);
```

### iOS vs Android MapView Differences

`react-native-maps` uses Apple Maps by default on iOS. To enforce Google Maps on both platforms, set the provider explicitly:

```tsx
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

<MapView provider={PROVIDER_GOOGLE} ... />
```

On iOS this requires a valid Google Maps API key configured in `app.json`. On Android, it is always Google Maps regardless of the `provider` prop.

### Callout Tap on iOS

On iOS, `onPress` on a `<Callout>` is unreliable — it does not fire consistently. The safe pattern is to wrap the callout content in a single `<TouchableOpacity>`:

```tsx
<Callout tooltip={false}>
  <TouchableOpacity onPress={() => onSelectRestaurant(r.id)}>
    <View style={styles.callout}>
      ...
    </View>
  </TouchableOpacity>
</Callout>
```

### Common Mistakes to Avoid

- ❌ Omitting `PROVIDER_GOOGLE` on iOS — defaults to Apple Maps, ignores the API key
- ❌ Committing the Google Maps API key to git — use `.env` + `app.config.js`
- ❌ Seeding lat/lng as `0, 0` (Gulf of Guinea) — always verify coordinates after seed
- ❌ Passing all `restaurants` (unfiltered) to `RestaurantMap` — filters must apply to both views
- ❌ Calling a new API endpoint for map data — reuse `filteredRestaurants` already in state
- ❌ Forgetting to update the restaurant service to populate the nested `address` field in `ApiRestaurantDTO`
- ❌ `latitudeDelta: 0` — always add a minimum delta so the map is not zoomed to a point

---

## References

- **Restaurant List Screen (existing):** `client/app/(tabs)/(restaurant)/index.tsx` — add toggle + map branch here
- **Restaurant API (existing):** `client/services/api.ts` — `restaurantsAPI.getAll()` already used
- **Address Model (server):** `server/serverJAVA/.../models/Address.java` — add lat/lng fields
- **Restaurant DTO (server):** `server/serverJAVA/.../dtos/restaurant/ApiRestaurantDTO.java` — add `address`
- **rrad Dataset:** https://github.com/EthanRBrown/rrad — `addresses.json` with real US addresses + coordinates
- **react-native-maps docs:** https://github.com/react-native-maps/react-native-maps — `MapView`, `Marker`, `Callout` API
- **UI Standards:** `ai/features/🤖-ui.feature.md` — `OswaldFonts`, `Colors.light.tint = #DA583B`
- **Restaurant List Feature:** `ai/features/🤖-restaurant-list-page.feature.md` — existing list behaviour

---

**The map view is a lens over data that is already fetched — it adds no new API surface and shares the filter state with the grid. The only new backend work is exposing lat/lng in the restaurant response and seeding real addresses.**
