# 🤖 AI_FEATURE_Navigation Structure

> This feature establishes the complete navigation hierarchy of the RocketApp mobile application.
> It implements the three-level nested navigation pattern required by the project specification.

---

## Feature Identity

- **Feature Name:** Navigation Structure
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Foundational (Core to all other features)
- **Dependencies:** None (foundation layer)

---

## Feature Goal

Establish a robust, three-level nested navigation architecture that allows users to seamlessly navigate between:
1. Authentication screens (Login)
2. Customer application tabs (Restaurants, Order History, Profile)
3. Restaurant details and menus within the customer context

The navigation structure provides the **backbone** for the entire application, enabling other features (login, restaurant browsing, ordering) to be properly nested and accessible.

---

## Feature Scope

### In Scope (Included)

- **Root Stack Navigator** — Controls auth vs. authenticated app flow
- **Customer Tab Navigator** — Bottom navigation for authenticated users
- **Restaurant Stack Navigator** — Nested stack for restaurant browsing
- **Footer Component** — Visual container with two tabs (Restaurants, Order History)
- **Navigation Links** — Proper routing between all three levels
- **Route Parameters** — Restaurant ID passing for dynamic routes
- **Back Button Behavior** — Standard back navigation within stacks
- **Screen Transitions** — Smooth animations between screens

### Out of Scope (Excluded)

- Login screen implementation (separate feature)
- Restaurant list UI rendering (separate feature)
- Restaurant menu display (separate feature)
- Order history UI rendering (separate feature)
- Real API data fetching (handled by other features)
- Profile screen implementation (separate feature)

---

## Sub-Requirements (Feature Breakdown)

1. **Root Level Stack Navigation** — `app/_layout.tsx`
   - Manage top-level navigation between Auth and App screens
   - Conditionally show Auth stack (login) OR App stack (tabs) based on authentication state
   - Use React Context or state to track authentication

2. **Customer Tabs Navigation** — `app/(tabs)/_layout.tsx`
   - Implement Tab Navigator with two visible tabs: Restaurants, Order History
   - Third tab (Profile) accessible but less prominent
   - Bottom tab bar always visible (except on login)
   - Each tab links to its respective screen

3. **Restaurant Nested Stack** — `app/(restaurant)/_layout.tsx`
   - Implement Stack Navigator within the Restaurants tab
   - Support navigation from restaurants list to individual restaurant detail
   - Accept restaurant ID as route parameter
   - Enable back navigation to restaurants list

4. **Footer Component** — `app/(tabs)/_layout.tsx` or dedicated component
   - Visual footer with two navigation buttons/tabs
   - Clear active state indicator
   - Responsive to screen size
   - Matches wireframe design exactly

5. **Dynamic Routing**
   - Restaurant details screen accepts ID parameter: `[id]`
   - Allows passing data between screens
   - Enables deep linking if needed

---

## User Flow / Logic (High Level)

```
App Launch
  ↓
[Root Navigator] — Checks authentication state
  ├─ IF not authenticated → Show Auth Stack
  │   └─ Login Screen (authentication handled separately)
  │
  └─ IF authenticated → Show App Stack
      ↓
      [Tab Navigator] — Customer area with bottom tabs
         ├─ Restaurants Tab (default)
         │   ↓
         │   [Restaurant List]
         │   ↓
         │   [Tap Restaurant Card]
         │   ↓
         │   [Stack Navigator]
         │   ├─ Restaurant Detail [id]
         │   ├─ Order Confirmation Modal
         │   └─ Back → Restaurant List
         │
         ├─ Order History Tab
         │   ↓
         │   [Order List]
         │   ├─ Tap Order
         │   └─ Order Detail Modal
         │
         └─ Profile Tab
             ↓
             [User Profile]
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Routes (File Structure)

```
app/
├── _layout.tsx                    # Root Stack Navigator
├── (auth)/
│   ├── _layout.tsx               # Auth Stack Layout
│   └── login.tsx                 # Login screen (separate feature)
│
└── (tabs)/
    ├── _layout.tsx               # Tab Navigator (with footer)
    ├── index.tsx                 # Restaurants screen (tab 1)
    ├── history.tsx               # Order History screen (tab 2)
    ├── profile.tsx               # Profile screen (tab 3)
    │
    └── (restaurant)/
        ├── _layout.tsx           # Restaurant Stack Navigator
        ├── [id].tsx              # Restaurant detail/menu screen
        └── modal.tsx             # Confirmation/detail modals
```

### Route Names & Parameters

| Route | Purpose | Parameters |
|-------|---------|-----------|
| `(auth)/login` | User login | None |
| `(tabs)/index` | Restaurant list | None |
| `(tabs)/history` | Order history | None |
| `(tabs)/profile` | User profile | None |
| `(tabs)/(restaurant)/[id]` | Restaurant menu | `id` (restaurant ID) |
| `(tabs)/(restaurant)/modal` | Order confirmation | Passed via route state |

### No Backend Endpoints Required
- Navigation is frontend-only (no API calls)
- Data fetching is handled by separate features

---

## Data Used or Modified

### Navigation State (Local)

| State | Type | Purpose |
|-------|------|---------|
| `authToken` | string \| null | Determines if user is authenticated |
| `currentTab` | 'restaurants' \| 'history' \| 'profile' | Active tab indicator |
| `selectedRestaurantID` | string \| null | Current restaurant being viewed |

### Route Parameters

| Parameter | Type | Source | Used By |
|-----------|------|--------|---------|
| `id` | string | Restaurant list screen | Restaurant detail screen |

### No Data Modifications
- Navigation structure does not modify user data
- Data flows are handled by feature-specific services

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Framework:** expo-router (file-based routing, not React Navigation manual setup)
- **Navigation Type:** Nested Stack + Tab Navigation (3 levels)
- **State Management:** React Context or Local State (auth check)
- **Animations:** react-native-reanimated (smooth transitions)

### Structural Rules

- **Use expo-router conventions** — Directory structure defines routes automatically
- **No manual route registration** — Routes derived from file paths
- **Nested folders indicate nesting** — `(tabs)` and `(restaurant)` create layout groups
- **Dynamic segments** — `[id]` parameter syntax for restaurant details
- **Layout files control navigation** — `_layout.tsx` files define navigation structure

### Styling Constraints

- Footer should match wireframe design exactly
- Tab colors from `constants/colors.ts`
- Use React Native StyleSheet (no CSS)
- Icons from FontAwesome

### No External Navigation Libraries
- Do not manually use React Navigation functions
- expo-router handles routing declaratively
- Stick to expo-router conventions throughout

---

## Acceptance Criteria

- [ ] Root `app/_layout.tsx` created and controls Auth vs. App flow
- [ ] Tab Navigator in `app/(tabs)/_layout.tsx` displays two visible tabs
- [ ] Footer component implemented with Restaurants and Order History tabs
- [ ] Restaurant Stack Navigator in `app/(restaurant)/_layout.tsx` working
- [ ] Dynamic restaurant ID parameter passed and accessible in detail screen
- [ ] Back button navigates correctly through all three levels
- [ ] No console errors in navigation
- [ ] Navigation persists across hot reloads
- [ ] Auth state changes immediately switch between Auth and App stacks
- [ ] All routes match the file structure defined above
- [ ] Tab switching updates active state visually
- [ ] Navigation matches wireframe layout exactly
- [ ] Works on iOS simulator
- [ ] Works on Android simulator

---

## Notes for the AI

### Important Implementation Notes

1. **Expo Router is File-Based**
   - Routes are automatically generated from the file structure
   - Do not create manual route names or configurations
   - Folder names in parentheses `(name)` create layout groups without adding to URL

2. **Three-Level Nesting**
   - Level 1 (Root): Auth vs. App decision in `app/_layout.tsx`
   - Level 2 (Tabs): Bottom navigation in `app/(tabs)/_layout.tsx`
   - Level 3 (Stack): Restaurant details in `app/(restaurant)/_layout.tsx`

3. **Auth Flow**
   - Root layout should check `authToken` from AsyncStorage or Context
   - Show `(auth)` layout if no token
   - Show `(tabs)` layout if token exists
   - This is **control flow**, not a separate screen

4. **Footer Always Visible**
   - Footer defined in `app/(tabs)/_layout.tsx` (Tab Navigator layout)
   - Should NOT appear on login screen (different root layout)
   - Should appear on all three tabs automatically

5. **Restaurant Stack Within Tab**
   - Restaurant list is in `(tabs)/index.tsx`
   - Restaurant detail is in `(restaurant)/[id].tsx`
   - When tapping a restaurant, navigate to `(restaurant)/[id]` with `id` parameter
   - Use `router.push()` or Link component with route parameter

6. **Common Mistakes to Avoid**
   - ❌ Do not manually create React Navigation setup
   - ❌ Do not forget parentheses in folder names for layout grouping
   - ❌ Do not hardcode route names — use file paths
   - ❌ Do not forget `_layout.tsx` files — they define navigation structure
   - ❌ Do not put authentication logic in every screen — put it in Root `_layout.tsx`

### Step-by-Step Implementation Path

1. Create `app/_layout.tsx` — Root Stack, conditionally show Auth or Tabs
2. Create `app/(auth)/_layout.tsx` — Auth Stack (Login comes later)
3. Create `app/(tabs)/_layout.tsx` — Tab Navigator with footer
4. Create `app/(tabs)/index.tsx` — Restaurants tab screen
5. Create `app/(tabs)/history.tsx` — Order History tab screen
6. Create `app/(tabs)/profile.tsx` — Profile tab screen
7. Create `app/(restaurant)/_layout.tsx` — Stack Navigator within tabs
8. Create `app/(restaurant)/[id].tsx` — Restaurant detail screen (dynamic route)
9. Test navigation between all levels
10. Verify auth state controls visibility

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Architecture, Tech Stack)
- **Expo Router Docs:** https://docs.expo.dev/routing/introduction/
- **Nested Navigation Example:** Three-level nesting required by project
- **Wireframe:** `support_materials_13/Design/` (footer layout reference)

---

**This feature is foundational. All other features depend on this navigation structure being properly implemented.**
