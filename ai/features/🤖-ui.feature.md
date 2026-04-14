# 🤖 AI_FEATURE_UI

> This feature documents the global UI standards for the RocketApp Module 14 expansion:
> font families, scroll behaviour, and the tab bar configuration for both the customer
> and courier sections of the app.

---

## Feature Identity

- **Feature Name:** UI (Global UI Standards)
- **Module:** 14 (extends Module 13)
- **Related Area:** Mobile Frontend — all screens and components
- **Priority:** Foundational (applies to every screen)
- **Dependencies:**
  - Navigation Structure (`🤖-navigation-structure.feature.md`) — tab bar lives in layout files
  - Root Layout (`app/_layout.tsx`) — font loading entry point

---

## Feature Scope

### In Scope (Included)

- Font families: Arial (body) and Oswald (headings) — applied across all screens
- Oswald font loading in root layout (already partially implemented)
- Scrollable pages — `ScrollView` required wherever content may overflow
- Customer tab bar: Restaurants | OrderHistory | Account (3 tabs)
- Courier tab bar: Deliveries | Account (2 tabs)
- Tab icon and label conventions
- `constants/theme.ts` as the single source of truth for fonts and colors
- `constants/navigation.ts` updated to reflect Module 14 routes

### Out of Scope (Excluded)

- Individual screen content and layout (covered by each screen's feature spec)
- Dark mode (not in scope for this module)
- Custom animations or transitions
- Push notification UI
- Splash screen design

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Fonts Used** | The mobile app uses Arial and Oswald font families. |
| **Scrollable Pages** | Any page with overflowing content must support scrolling. |
| **Customer Tabs** | Customer app footer must include: Restaurants, Order History, Account. |
| **Courier Tabs** | Courier app footer must include: Order Delivery, Account. |

> **Tab Label Note:** The requirement lists the courier tab as "Order Delivery". The wireframe
> labels it **"Deliveries"**. The wireframe takes precedence — implement the tab label as
> **"Deliveries"**, consistent with the `MY DELIVERIES` screen heading.

---

## Sub-Requirements (Feature Breakdown)

### 1. Font Families

#### Arial — Body Text
- React Native's default system font renders as Arial on iOS and Roboto on Android
- **No explicit `fontFamily` declaration required** for body text — omitting `fontFamily` uses the system default
- Use Arial (system default) for: body copy, input fields, helper text, labels, button text

#### Oswald — Headings and Labels
- Loaded via `@expo-google-fonts/oswald` in `app/_layout.tsx`
- Three weights available (defined in `constants/theme.ts` as `OswaldFonts`):

```typescript
// constants/theme.ts (already implemented)
export const OswaldFonts = {
  regular: 'Oswald_400Regular',
  semiBold: 'Oswald_600SemiBold',
  bold: 'Oswald_700Bold',
};
```

**Usage rules:**

| Element | Font | Weight |
|---------|------|--------|
| Page headings (e.g. MY ACCOUNT, MY DELIVERIES, NEARBY RESTAURANTS) | Oswald | Bold (`Oswald_700Bold`) |
| Section labels (e.g. Order Summary, RESTAURANTS, column headers) | Oswald | SemiBold (`Oswald_600SemiBold`) |
| Sub-labels (e.g. "Logged In As: Customer") | Oswald | Regular (`Oswald_400Regular`) |
| Body text, helper text, descriptions | Arial (system default) | — |
| Input field text | Arial (system default) | — |
| Button labels | Oswald | Bold (`Oswald_700Bold`) |
| Tab bar labels | Oswald | Regular (`Oswald_400Regular`) |
| Status badges | Oswald | Bold (`Oswald_700Bold`) |

**Apply Oswald via `OswaldFonts` constant — never hardcode the font family string:**
```typescript
// ✅ Correct
import { OswaldFonts } from '@/constants/theme';
style={{ fontFamily: OswaldFonts.bold, fontSize: 20 }}

// ❌ Wrong
style={{ fontFamily: 'Oswald_700Bold', fontSize: 20 }}
```

#### Font Loading — Root Layout
The root layout already loads Oswald. The app must **not render any screen** until fonts are loaded.

```typescript
// app/_layout.tsx (already implemented — do not change)
const [fontsLoaded] = useFonts({
  Oswald_400Regular,
  Oswald_600SemiBold,
  Oswald_700Bold,
});
if (!fontsLoaded) return <ActivityIndicator />;
```

---

### 2. Scrollable Pages

**Rule:** Any screen whose content may exceed the device viewport height must use `ScrollView`.

**Required on all of the following:**
- Restaurant list (grid of cards)
- Restaurant menu (list of items)
- Order history (list of past orders)
- Customer account screen (form fields)
- Courier account screen (form fields)
- Courier delivery list (table rows)
- Order confirmation modal (item list)
- Order history detail modal (item list + details)
- Delivery details modal (item list + details)

**Implementation pattern:**
```typescript
import { ScrollView } from 'react-native';

// Wrap screen content:
<ScrollView
  contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
  showsVerticalScrollIndicator={false}
>
  {/* screen content */}
</ScrollView>
```

**Rules:**
- `flexGrow: 1` ensures short content still fills the screen
- `paddingBottom` prevents content from being obscured by the tab bar
- `showsVerticalScrollIndicator={false}` matches the wireframe (no visible scrollbar)
- Use `KeyboardAvoidingView` wrapping `ScrollView` on screens with text inputs (account forms, login)

---

### 3. Customer Tab Bar

**File:** `app/(tabs)/_layout.tsx`

**Three tabs (from wireframe):**

| Order | Tab Name | Screen File | Icon | Label |
|-------|----------|-------------|------|-------|
| 1 | Restaurants | `(restaurant)/index.tsx` | Hamburger / utensils | Restaurants |
| 2 | OrderHistory | `history.tsx` | History / clock | OrderHistory |
| 3 | Account | `account.tsx` | Person / user | Account |

**Active tab color:** `#DA583B` (brand orange — defined in `Colors.light.tabIconSelected`)  
**Inactive tab color:** `#999999` (defined in `Colors.light.tabIconDefault`)

**Tab bar styling (current — maintain for Module 14):**
```typescript
tabBarStyle: {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E0E0E0',
  height: Platform.OS === 'ios' ? 84 : 64,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
}
```

**Module 14 changes to `(tabs)/_layout.tsx`:**
1. Add `account` tab (`name="account"`, title="Account", person icon)
2. Remove hidden tab entries: `profile`, `explore`, `index` (these files will be deleted)

**Updated `constants/navigation.ts` for Module 14:**
```typescript
export const CUSTOMER_TAB_ROUTES = [
  { name: '(restaurant)', title: 'Restaurants', icon: 'utensils' },
  { name: 'history',      title: 'OrderHistory', icon: 'history' },
  { name: 'account',      title: 'Account',      icon: 'user' },
] as const;
```

---

### 4. Courier Tab Bar

**File:** `app/(courier)/_layout.tsx` *(new file — does not exist yet)*

**Two tabs (from wireframe):**

| Order | Tab Name | Screen File | Icon | Label |
|-------|----------|-------------|------|-------|
| 1 | Deliveries | `deliveries.tsx` | History / clock | Deliveries |
| 2 | Account | `account.tsx` | Person / user | Account |

> **Requirement said "Order Delivery" — wireframe shows "Deliveries".** Implement as **"Deliveries"**.

**Active/inactive colors:** Same as customer tab bar (`#DA583B` / `#999999`)

**Tab bar styling:** Same as customer tab bar (same `tabBarStyle` object)

**New courier tab layout:**
```typescript
// app/(courier)/_layout.tsx
import { Tabs } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHistory, faUser } from '@fortawesome/free-solid-svg-icons';
import { Colors } from '@/constants/theme';

export default function CourierTabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.light.tint, ... }}>
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faHistory} color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <FontAwesomeIcon icon={faUser} color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
```

**Add to `constants/navigation.ts`:**
```typescript
export const COURIER_TAB_ROUTES = [
  { name: 'deliveries', title: 'Deliveries', icon: 'history' },
  { name: 'account',    title: 'Account',    icon: 'user' },
] as const;
```

---

## Color Reference (from `constants/theme.ts`)

| Token | Hex | Used For |
|-------|-----|---------|
| `Colors.light.tint` | `#DA583B` | Active tab icon, primary buttons, badges, headings |
| `Colors.light.text` | `#222126` | Primary body text |
| `Colors.light.background` | `#FFFFFF` | Screen backgrounds, cards |
| `Colors.light.tabIconDefault` | `#999999` | Inactive tab icons |
| `Colors.light.tabIconSelected` | `#DA583B` | Active tab icons |

**All screens must reference `constants/theme.ts` for colors — no hardcoded hex values in components.**

---

## Files Modified

| File | Change |
|------|--------|
| `app/(tabs)/_layout.tsx` | Add Account tab; remove `profile`, `explore`, `index` hidden entries |
| `constants/navigation.ts` | Add `CUSTOMER_TAB_ROUTES` with 3 tabs; add `COURIER_TAB_ROUTES` with 2 tabs |

## Files Created

| File | Purpose |
|------|---------|
| `app/(courier)/_layout.tsx` | Courier 2-tab navigator (Deliveries + Account) |

## Files Deleted

| File | Reason |
|------|--------|
| `app/(tabs)/profile.tsx` | Replaced by `account.tsx` |
| `app/(tabs)/explore.tsx` | Expo default — never used in this project |

---

## Acceptance Criteria

### Fonts
- [ ] All page headings use `Oswald_700Bold` (`OswaldFonts.bold`)
- [ ] All section labels use `Oswald_600SemiBold` (`OswaldFonts.semiBold`)
- [ ] All body text uses system default (Arial/Roboto — no explicit `fontFamily`)
- [ ] All button labels use `OswaldFonts.bold`
- [ ] All tab bar labels use `OswaldFonts.regular`
- [ ] All status badges use `OswaldFonts.bold`
- [ ] Font strings always reference `OswaldFonts` constant, never hardcoded
- [ ] App does not render until `fontsLoaded` is true (root layout gate)

### Scrollable Pages
- [ ] Restaurant list scrolls when more cards than viewport height
- [ ] Restaurant menu scrolls when more items than viewport height
- [ ] Order history list scrolls
- [ ] Customer account screen scrolls on small devices
- [ ] Courier account screen scrolls on small devices
- [ ] Courier delivery list scrolls
- [ ] Order confirmation modal content scrolls
- [ ] No content is cut off or inaccessible on any screen
- [ ] `KeyboardAvoidingView` used on login and account form screens

### Customer Tab Bar
- [ ] Three tabs visible: Restaurants, OrderHistory, Account
- [ ] Correct icons: hamburger, clock/history, person
- [ ] Active tab highlighted in `#DA583B`
- [ ] Inactive tabs in `#999999`
- [ ] Tab bar always visible on all customer screens
- [ ] Tab bar not visible on login or account selection screens
- [ ] No hidden or dead tabs (`profile`, `explore` removed)

### Courier Tab Bar
- [ ] Two tabs visible: Deliveries, Account
- [ ] Correct icons: clock/history, person
- [ ] Active tab highlighted in `#DA583B`
- [ ] Inactive tabs in `#999999`
- [ ] Tab bar always visible on all courier screens
- [ ] Deliveries tab is the default tab (shown first on entry)
- [ ] Courier tab bar is completely independent from customer tab bar

### Cross-Platform
- [ ] Tab bar height correct on iOS (`84px` with safe area padding)
- [ ] Tab bar height correct on Android (`64px`)
- [ ] Oswald fonts render correctly on both platforms
- [ ] Scroll behaviour works on both platforms

---

## Notes for the AI

### Font Application Checklist per Screen

Every screen that renders text must be verified against this list:

| Screen | Heading (Oswald Bold) | Labels (Oswald SemiBold) | Body (system) |
|--------|-----------------------|--------------------------|---------------|
| Login | "Welcome Back" | "Email", "Password" | Input text, error |
| Account Selection | "Select Account Type" | — | Card labels |
| Restaurant List | "NEARBY RESTAURANTS" | "RESTAURANTS", "Rating", "Price" | — |
| Restaurant Menu | "RESTAURANT MENU" | Restaurant name | Item descriptions |
| Order Confirmation | "Order Confirmation" | "Order Summary" | Item names, prices |
| Order History | "MY ORDER HISTORY" | Column headers | Order data |
| Customer Account | "MY ACCOUNT" | Field labels | Input text, helper text |
| Courier Deliveries | "MY DELIVERIES" | Column headers | Address, order data |
| Courier Account | "MY ACCOUNT" | Field labels | Input text, helper text |

### Common Mistakes to Avoid

- ❌ Using `fontFamily: 'Oswald_700Bold'` directly — always use `OswaldFonts.bold`
- ❌ Applying Oswald to body text and form inputs — use system default there
- ❌ Forgetting `ScrollView` on account form screens — inputs + keyboard = overflow risk
- ❌ Using `FlatList` without `scrollEnabled={true}` (it's true by default, but confirm)
- ❌ Leaving `profile.tsx` in `(tabs)/` — it will be registered as a live route by expo-router
- ❌ Hardcoding tab bar colors — always use `Colors.light.tint` from `constants/theme.ts`
- ❌ Making the courier tab bar a copy of the customer tab bar — they are independent navigators

### Tab Bar Icon Reference

```typescript
// Recommended FontAwesome icons for tabs
import {
  faHamburger,  // or faUtensils  → Restaurants tab
  faHistory,    // or faClock     → OrderHistory + Deliveries tab
  faUser,       //                → Account tab (both roles)
} from '@fortawesome/free-solid-svg-icons';
```

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — UI Requirements, font loading pattern, tab structures
- **Navigation Structure:** `ai/features/🤖-navigation-structure.feature.md` — layout files, tab counts
- **Theme Constants (existing):** `client/constants/theme.ts`
- **Navigation Constants (existing):** `client/constants/navigation.ts`
- **Root Layout (existing):** `client/app/_layout.tsx` — font loading
- **Customer Tab Layout (existing):** `client/app/(tabs)/_layout.tsx`
- **Wireframe:** `support_materials_14/Design/` — tab bar screenshots, font usage

---

**`OswaldFonts` and `Colors` in `constants/theme.ts` are the single source of truth. Every screen imports from there — no inline strings, no hardcoded hex values.**
