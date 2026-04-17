# 🤖 AI_FEATURE_Navigation Structure

> This feature establishes the complete navigation hierarchy of the RocketApp mobile application.
> Module 14 extends the three-level customer navigation from Module 13 with role-based routing,
> an account selection screen for dual-role users, and a separate courier tab section.

---

## Feature Identity

- **Feature Name:** Navigation Structure
- **Module:** 14 (extends Module 13)
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Foundational (all other features depend on this)
- **Dependencies:** AuthContext (role + token state), Oswald font loading (root layout)
- **Spec File:** `ai/🤖-ai-spec.md` → Architecture & Navigation Architecture section

---

## Feature Goal

Extend the existing three-level customer navigation to support:

1. **Role-based routing** — after login, route to account selection (dual-role) or directly to the correct section (single-role)
2. **Account selection screen** — dual-role users choose Customer or Courier before entering the app
3. **Customer tabs updated** — three tabs: Restaurants, OrderHistory, Account
4. **Courier tab section** — two tabs: Deliveries, Account
5. **Nested restaurant stack** — unchanged from Module 13, documented here for completeness

The navigation structure is the **backbone** of the entire application. All screens, roles, and flows depend on this being correctly implemented before any other feature is built.

---

## Feature Scope

### In Scope (Included)

- Root Stack Navigator (`app/_layout.tsx`) — auth check, role detection, font loading
- Account selection screen (`app/(auth)/account-selection.tsx`) — dual-role role picker
- Customer Tab Navigator (`app/(tabs)/_layout.tsx`) — 3 tabs
- Courier Tab Navigator (`app/(courier)/_layout.tsx`) — 2 tabs
- Restaurant nested Stack Navigator (`app/(tabs)/(restaurant)/_layout.tsx`) — unchanged
- Auth Stack layout (`app/(auth)/_layout.tsx`) — login + account selection
- Header/footer visibility rules per screen

### Out of Scope (Excluded)

- Login screen UI (see `🤖-login-page.feature.md`)
- Header component implementation (see `🤖-header-footer.feature.md`)
- Courier delivery list UI (see `🤖-courier-deliveries.feature.md`)
- Account management screen UI (see `🤖-account-management.feature.md`)
- Actual data fetching (handled by screen-level features)

---

## Sub-Requirements (Feature Breakdown)

### 1. Root Layout — `app/_layout.tsx`

**Responsibilities:**
- Load Oswald fonts before rendering any screen (block on `useFonts`)
- Wrap entire app in `SafeAreaProvider` and `AuthProvider`
- Conditionally route based on auth + role state:
  - No token → `(auth)/login`
  - Token + customer only → `(tabs)`
  - Token + courier only → `(courier)`
  - Token + both roles + no role selected → `(auth)/account-selection`
  - Token + both roles + role selected → `(tabs)` or `(courier)` per chosen role

**Font loading:**
```typescript
const [fontsLoaded] = useFonts({
  Oswald_400Regular,
  Oswald_600SemiBold,
  Oswald_700Bold,
});
if (!fontsLoaded) return <ActivityIndicator />;
```

**Stack screens registered:**
```
<Stack>
  <Stack.Screen name="(tabs)"    options={{ headerShown: false }} />
  <Stack.Screen name="(courier)" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)"    options={{ headerShown: false }} />
</Stack>
```

**Current implementation note:** `app/_layout.tsx` exists with font loading and `AuthProvider`. Module 14 adds `(courier)` screen registration and role-aware routing logic.

---

### 2. Auth Stack Layout — `app/(auth)/_layout.tsx`

**Responsibilities:**
- Define the unauthenticated stack: login + account selection
- No header shown (`headerShown: false` on all screens)
- No tab bar visible

**Stack screens:**
```
<Stack>
  <Stack.Screen name="login"              options={{ headerShown: false }} />
  <Stack.Screen name="account-selection"  options={{ headerShown: false }} />
</Stack>
```

---

### 3. Account Selection Screen — `app/(auth)/account-selection.tsx`

**Responsibilities:**
- Shown only when the logged-in user has both `customer_id` and `courier_id`
- Displays the Rocket Food Delivery logo and "Select Account Type" prompt
- Two tappable cards: **Customer** (person icon) and **Courier** (taxi icon)
- Tapping a card sets the active role in `AuthContext` and navigates to the correct section
- Back navigation is **blocked** — use `router.replace()`, never `router.push()`
- Header and footer tabs are **not shown** on this screen

**Navigation targets:**
```typescript
// Customer selected
router.replace('/(tabs)/(restaurant)');

// Courier selected
router.replace('/(courier)/deliveries');
```

**Layout (from wireframe):**
- Rocket Food Delivery logo centered
- "Select Account Type" label below logo
- Two side-by-side cards with icon + label
  - Left card: person icon → "Customer"
  - Right card: taxi/car icon → "Courier"

---

### 4. Customer Tab Navigator — `app/(tabs)/_layout.tsx`

**Three visible tabs (from wireframe):**

| Tab | Screen | Icon | Label |
|-----|--------|------|-------|
| 1 | `(restaurant)` | Hamburger | Restaurants |
| 2 | `history` | History/clock | OrderHistory |
| 3 | `account` | Person | Account |

**Rules:**
- Active tab highlighted with brand color
- All three tabs always visible
- No hidden tabs (remove `href: null` from profile/explore)
- `profile.tsx` from Module 13 is **renamed/replaced** by `account.tsx`
- `explore.tsx` (Expo default) is **deleted** — it was never used

**Current implementation note:** `(tabs)/_layout.tsx` exists with 2 tabs. Module 14 adds the Account tab and removes unused hidden tabs.

---

### 5. Courier Tab Navigator — `app/(courier)/_layout.tsx`

**Two visible tabs (from wireframe):**

| Tab | Screen | Icon | Label |
|-----|--------|------|-------|
| 1 | `deliveries` | History/clock | Deliveries |
| 2 | `account` | Person | Account |

**Rules:**
- Active tab highlighted with brand color
- No shared tabs with customer section — completely independent navigator
- Deliveries tab is the default (initial) screen

**New files required:**
- `app/(courier)/_layout.tsx` — Tab Navigator definition
- `app/(courier)/deliveries.tsx` — Courier home screen
- `app/(courier)/account.tsx` — Courier account management

---

### 6. Nested Restaurant Stack — `app/(tabs)/(restaurant)/_layout.tsx`

**Unchanged from Module 13.** Documented here for completeness.

Stack screens within the Restaurants tab:
```
(restaurant)/
├── index.tsx        ← Restaurant list (default screen)
├── [id].tsx         ← Restaurant menu (dynamic route)
└── modal.tsx        ← Order confirmation modal
```

- `index.tsx` is the default entry point for the Restaurants tab
- Tapping a restaurant card navigates to `[id]` with the restaurant ID as a param
- Confirmation modal overlays from `modal.tsx`

---

## User Flow / Logic (High Level)

```
App Launch
  ↓
[Root Layout]
  ├─ Fonts loading? → Show ActivityIndicator
  ├─ Auth loading?  → Show ActivityIndicator
  └─ Ready
      ├─ No token → router.replace('/(auth)/login')
      ├─ Token + isCustomer only  → router.replace('/(tabs)/(restaurant)')
      ├─ Token + isCourier only   → router.replace('/(courier)/deliveries')
      └─ Token + isDualRole
          ├─ No role selected yet → router.replace('/(auth)/account-selection')
          ├─ Role = 'customer'    → router.replace('/(tabs)/(restaurant)')
          └─ Role = 'courier'     → router.replace('/(courier)/deliveries')

Account Selection Screen
  ├─ Tap "Customer" → set role in AuthContext → router.replace('/(tabs)/(restaurant)')
  └─ Tap "Courier"  → set role in AuthContext → router.replace('/(courier)/deliveries')

Customer Section [(tabs)]
  ├─ Tab 1: Restaurants → (restaurant)/index → tap card → (restaurant)/[id]
  ├─ Tab 2: OrderHistory → history.tsx
  └─ Tab 3: Account → account.tsx

Courier Section [(courier)]
  ├─ Tab 1: Deliveries → deliveries.tsx → tap VIEW → Delivery Details Modal (overlay)
  └─ Tab 2: Account → account.tsx

Logout (from any screen)
  └─ Clear token + role + IDs → router.replace('/(auth)/login')
```

---

## Interfaces (Pages, Endpoints, Screens)

### File Structure (Complete — Module 14)

```
app/
├── _layout.tsx                        # Root Stack — font loading, auth guard, role routing
│
├── (auth)/
│   ├── _layout.tsx                    # Auth Stack layout
│   ├── login.tsx                      # Login screen
│   └── account-selection.tsx          # NEW: role picker for dual-role users
│
├── (tabs)/                            # Customer section
│   ├── _layout.tsx                    # UPDATED: 3-tab navigator
│   ├── history.tsx                    # Order History screen
│   ├── account.tsx                    # NEW: Customer account management
│   └── (restaurant)/
│       ├── _layout.tsx                # Restaurant Stack (unchanged)
│       ├── index.tsx                  # Restaurant list
│       ├── [id].tsx                   # Restaurant menu
│       └── modal.tsx                  # Order confirmation modal
│
└── (courier)/                         # NEW: Courier section
    ├── _layout.tsx                    # NEW: 2-tab courier navigator
    ├── deliveries.tsx                 # NEW: Courier delivery list
    └── account.tsx                    # NEW: Courier account management
```

**Files to delete:**
- `app/(tabs)/profile.tsx` — replaced by `account.tsx`
- `app/(tabs)/explore.tsx` — Expo default, never used
- `app/modal.tsx` (root level) — confirm if still needed; delivery modal is inline

### Route Map

| Route | Screen | Auth Required | Role |
|-------|--------|---------------|------|
| `(auth)/login` | Login | No | Any |
| `(auth)/account-selection` | Role Picker | Yes (token exists) | Dual-role only |
| `(tabs)/(restaurant)` | Restaurant List | Yes | Customer |
| `(tabs)/(restaurant)/[id]` | Restaurant Menu | Yes | Customer |
| `(tabs)/history` | Order History | Yes | Customer |
| `(tabs)/account` | Customer Account | Yes | Customer |
| `(courier)/deliveries` | Delivery List | Yes | Courier |
| `(courier)/account` | Courier Account | Yes | Courier |

### No Backend Endpoints Required
Navigation is frontend-only. Data fetching is handled by screen-level features.

---

## Data Used or Modified

### AuthContext State

| State | Type | Purpose |
|-------|------|---------|
| `isSignedIn` | boolean | Controls auth vs. app routing |
| `isLoading` | boolean | Prevents premature redirect before token check |
| `customerId` | string \| null | Identifies user as customer |
| `courierId` | string \| null | Identifies user as courier (NEW) |
| `activeRole` | `'customer' \| 'courier' \| null` | Chosen role for session (NEW) |

### AsyncStorage Keys

| Key | Written By | Read By |
|-----|-----------|---------|
| `authToken` | Login screen | Root layout (auth check) |
| `customerId` | Login screen | AuthContext |
| `courierId` | Login screen | AuthContext (NEW) |

### Role is Session-Only
`activeRole` lives in React Context only — it is **not persisted** to AsyncStorage. On app restart, dual-role users go through account selection again.

---

## Tech Constraints (Feature-Level)

### Required Technologies
- **Routing:** expo-router (file-based — directory structure defines routes)
- **Navigation types:** Stack (root + auth), Tabs (customer + courier), Stack (restaurant nested)
- **State:** React Context (`AuthProvider`) for auth + role state
- **Fonts:** `@expo-google-fonts/oswald` loaded in root layout — app does NOT render until fonts are ready
- **Icons:** FontAwesome (`@fortawesome/react-native-fontawesome`)

### Structural Rules
- Parentheses in folder names `(name)` create layout groups without adding to URL path
- `_layout.tsx` files define the navigation container for that folder
- `[id].tsx` is a dynamic segment — receives the param as `useLocalSearchParams().id`
- **No manual React Navigation setup** — expo-router handles all routing declaratively
- `router.replace()` must be used for all post-login navigation (prevents back-nav to login or account selection)

### Header/Footer Visibility Rules
| Screen | Header Shown | Tab Bar Shown |
|--------|-------------|---------------|
| Login | No | No |
| Account Selection | No | No |
| All Customer tabs | Yes | Yes |
| All Courier tabs | Yes | Yes |
| Restaurant menu `[id]` | Yes | Yes (parent tab bar) |

---

## Acceptance Criteria

### Root Layout
- [ ] App does not render any screen until Oswald fonts are loaded
- [ ] `ActivityIndicator` shown during font load and auth state load
- [ ] Unauthenticated users are always redirected to `(auth)/login`
- [ ] Single-role customer is routed directly to `(tabs)/(restaurant)` after login
- [ ] Single-role courier is routed directly to `(courier)/deliveries` after login
- [ ] Dual-role user is routed to `(auth)/account-selection` after login
- [ ] Dual-role user with role selected is routed to correct section
- [ ] `(courier)` is registered as a Stack screen in root layout

### Account Selection Screen
- [ ] Screen only appears for users with both `customer_id` and `courier_id`
- [ ] Rocket Food Delivery logo visible
- [ ] "Select Account Type" label visible
- [ ] Two role cards displayed: Customer and Courier
- [ ] Tapping Customer → sets `activeRole = 'customer'` → navigates to customer tabs
- [ ] Tapping Courier → sets `activeRole = 'courier'` → navigates to courier tabs
- [ ] Back button does not navigate to login (`router.replace` used)
- [ ] No header or tab bar visible on this screen

### Customer Tab Navigator
- [ ] Three tabs visible: Restaurants, OrderHistory, Account
- [ ] Active tab highlighted with brand color
- [ ] `profile.tsx` removed; replaced by `account.tsx`
- [ ] `explore.tsx` removed
- [ ] Tab bar matches wireframe layout

### Courier Tab Navigator
- [ ] Two tabs visible: Deliveries, Account
- [ ] Active tab highlighted with brand color
- [ ] Deliveries is the default/initial tab
- [ ] Courier section is completely independent from customer section

### Restaurant Nested Stack
- [ ] Restaurants tab opens `(restaurant)/index.tsx` by default
- [ ] Tapping a restaurant card navigates to `(restaurant)/[id]` with correct ID param
- [ ] Back button from `[id]` returns to restaurant list
- [ ] Order confirmation modal accessible from `[id]` screen

### Cross-Platform
- [ ] All navigation works on iOS simulator
- [ ] All navigation works on Android simulator
- [ ] No console errors in navigation

---

## Notes for the AI

### Key Changes from Module 13

1. **Root layout** (`app/_layout.tsx`) already exists with font loading and `AuthProvider`. Extend it to:
   - Register `(courier)` as a Stack screen
   - Add `courierId` and `activeRole` to auth state check
   - Add routing logic for dual-role → account selection

2. **Account selection** is a new file: `app/(auth)/account-selection.tsx`. Add it to the auth `_layout.tsx` stack.

3. **Tabs layout** (`app/(tabs)/_layout.tsx`) already has 2 tabs. Add the Account tab and delete hidden tabs:
   - Remove `<Tabs.Screen name="profile" options={{ href: null }} />`
   - Remove `<Tabs.Screen name="explore" options={{ href: null }} />`
   - Remove `<Tabs.Screen name="index" options={{ href: null }} />`
   - Add `<Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: ... }} />`

4. **Courier layout** is an entirely new folder and file: `app/(courier)/_layout.tsx`.

### Common Mistakes to Avoid

- ❌ Using `router.push()` for post-login redirects — always use `router.replace()`
- ❌ Persisting `activeRole` to AsyncStorage — it is session-only (Context only)
- ❌ Sharing tab navigators between customer and courier sections
- ❌ Rendering the app before fonts are loaded (causes layout flash)
- ❌ Forgetting to register `(courier)` in the root Stack — it will 404
- ❌ Leaving `explore.tsx` or `profile.tsx` in `(tabs)/` — they must be deleted or expo-router will register them as routes

### Implementation Order

1. Update `AuthContext` to include `courierId` and `activeRole` state
2. Update `app/_layout.tsx` — register `(courier)`, add role-aware routing
3. Update `app/(auth)/_layout.tsx` — add `account-selection` screen
4. Create `app/(auth)/account-selection.tsx`
5. Update `app/(tabs)/_layout.tsx` — add Account tab, remove dead screens
6. Create `app/(tabs)/account.tsx` (stub — full UI in account-management feature)
7. Delete `app/(tabs)/profile.tsx` and `app/(tabs)/explore.tsx`
8. Create `app/(courier)/_layout.tsx`
9. Create `app/(courier)/deliveries.tsx` (stub — full UI in courier-deliveries feature)
10. Create `app/(courier)/account.tsx` (stub — full UI in account-management feature)
11. Test all routing paths: no token, customer only, courier only, dual-role

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — Navigation Architecture, Role Detection Logic
- **Auth Context:** `client/services/authContext.tsx` — token, role, isLoading state
- **Root Layout (existing):** `client/app/_layout.tsx`
- **Tabs Layout (existing):** `client/app/(tabs)/_layout.tsx`
- **Login Feature:** `ai/features/🤖-login-page.feature.md`
- **Account Selection Feature:** `ai/features/🤖-account-selection.feature.md`
- **Courier Deliveries Feature:** `ai/features/🤖-courier-deliveries.feature.md`
- **Account Management Feature:** `ai/features/🤖-account-management.feature.md`
- **Expo Router Docs:** https://docs.expo.dev/routing/introduction/
- **Wireframe:** `support_materials_14/Design/` — tab bar layouts, account selection screen

---

**This feature is foundational. All other Module 14 features depend on the navigation structure being correctly implemented first.**
