# 🤖🛠️ RocketApp AI Specification Document

**Version:** 2.0 (DRAFT)  
**Last Updated:** April 14, 2026  
**Status:** IN PROGRESS - Module 14 Extension

---

## 📋 Table of Contents

1. [User Interface Requirements](#user-interface-requirements)
2. [Project Identity & Scope](#project-identity--scope)
3. [Architecture & Repository Structure](#architecture--repository-structure)
4. [Allowed Technologies & Constraints](#allowed-technologies--constraints)
5. [Feature Requirements](#feature-requirements)
6. [Coding Standards & Conventions](#coding-standards--conventions)
7. [Definition of Done (Global)](#definition-of-done-global)
8. [Cross-Feature Rules](#cross-feature-rules)

---

## 📱 User Interface Requirements

### General Requirements
- **Header and Footer Navigation:** Should always be visible, **except on the login page and the account selection screen**
  - This applies to both the customer and courier sections of the app
  - The account selection screen shows only the Rocket Food Delivery logo — no header/footer tabs
- **Fonts:**
  - Primary: Arial (React Native default — no explicit font family needed for body text)
  - Secondary: Oswald (headings, labels — loaded via `@expo-google-fonts/oswald`)
- **Scrolling:** Overflow contents should be scrollable
- **Styling:** Follow provided wireframe templates as closely as possible
- **Role Isolation:** Customer and courier UI sections must not bleed into each other

**Wireframe References:**
- Module 13 screens: `support_materials_13/Design/`
- Module 14 screens: `support_materials_14/Design/`

---

## 🎯 Project Identity & Scope

### Project Name
**RocketApp** - Rocket Food Delivery Mobile Application (Customer + Courier)

### Project Vision
Extend the existing cross-platform mobile application (iOS & Android) built in Module 13 to support couriers, role-based access, account management, notification opt-in, and brand typography. The app continues to connect to the existing Java Spring Boot REST API — no server modifications are made.

### Module Context
- **Program:** Full-Stack Development Program
- **Module:** 14 - Mobile Development 2
- **Role:** Junior Developer at Genesis Solutions
- **Prerequisite:** Module 13 (Customer mobile app) is complete
- **Continuation:** Same repository, same Expo codebase — no new repo created
- **Backend:** API from Module 12 is unchanged; no server modifications required

### Customer Journey (Unchanged from Module 13)
```
Login
  ↓ (JWT token stored)
[IF dual-role user → Account Selection Screen]
  ↓ (role chosen: Customer)
Browse Restaurants
  ↓ (optional: filter by rating/price)
Select Restaurant → View Menu → Adjust Quantities
  ↓
Create Order → Confirmation Modal (+ SMS/Email opt-in)
  ↓
Success/Failure Feedback
  ↓
View Order History → Inspect Order Details
  ↓
Account Management (view/edit contact details)
```

### Courier Journey (New in Module 14)
```
Login
  ↓ (JWT token stored)
[IF dual-role user → Account Selection Screen]
  ↓ (role chosen: Courier)
Courier Delivery List (pending + active deliveries)
  ↓
Tap Delivery → View Order Details
  ↓
Advance Order Status (pending → in progress → delivered)
  ↓ (DELIVERED status is locked — no further transitions)
Courier Account Management (view/edit contact details)
```

### In Scope ✅ (Module 14 Additions)
- **Courier Section:** Delivery list, order detail, status progression
- **Role-Based Navigation:** Account selection screen for dual-role users
- **Account Management:** View and edit contact details for both customers and couriers
- **Notification Opt-In:** SMS and email opt-in checkboxes on order confirmation modal
- **Brand Typography:** Oswald font loaded and applied across all screens and components

### In Scope ✅ (Inherited from Module 13)
- **Authentication:** Login screen with JWT token storage in AsyncStorage
- **Restaurant Browsing:** Grid layout with filtering (rating, price range)
- **Restaurant Menu:** Items with quantity selection via stepper buttons
- **Order Placement:** Complete order creation flow with confirmation modal
- **Order History:** Past orders with expandable detail view
- **Cross-Platform:** Full iOS and Android compatibility via Expo

### Out of Scope ❌
- Back-end API modifications (API from Module 12 used as-is)
- Payment gateway integration
- Real-time order tracking updates
- Push notifications (unless Twilio/Notify.EU extra mile)
- User registration (login only)
- Admin dashboard features
- Courier assignment (assignment is handled server-side)

### Critical Success Criteria
- ✅ App runs on both iOS and Android simulators/devices
- ✅ All screens match wireframe layout and color scheme exactly
- ✅ Dual-role users see account selection screen after login
- ✅ Couriers can advance order status up to DELIVERED (locked after that)
- ✅ Both roles can view and edit their account details
- ✅ Order confirmation modal includes SMS and email opt-in checkboxes
- ✅ Oswald font applied consistently across all screens
- ✅ No dead or commented-out code
- ✅ Components reused across screens — no duplication
- ✅ JWT authentication tokens properly stored and sent with all API requests
- ✅ Complete customer and courier journeys functional end-to-end
- ✅ All deliverables completed and submitted by deadline

---

## 🏗️ Architecture & Repository Structure

### Repository Layout

```
RocketApp/
├── client/                          # React Native Expo frontend
│   ├── app/                         # expo-router app directory (file-based routing)
│   │   ├── (auth)/                  # Auth stack - unauthenticated screens
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   └── account-selection.tsx  # NEW: role picker for dual-role users
│   │   ├── (tabs)/                  # Customer tabs navigation
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx            # Restaurants tab (home)
│   │   │   ├── history.tsx          # Order History tab
│   │   │   └── profile.tsx          # Customer Account Management  (UPDATED)
│   │   │   └── (restaurant)/        # Restaurant detail stack
│   │   │       ├── _layout.tsx
│   │   │       └── [id].tsx
│   │   ├── (courier)/               # NEW: Courier tabs navigation
│   │   │   ├── _layout.tsx          # Courier tab layout with footer
│   │   │   ├── deliveries.tsx       # Courier delivery list (active orders)
│   │   │   └── profile.tsx          # Courier Account Management
│   │   ├── _layout.tsx              # Root layout — auth + role routing
│   │   └── modal.tsx                # Shared modals
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── RestaurantCard.tsx
│   │   ├── MenuItem.tsx
│   │   ├── OrderCard.tsx
│   │   ├── DeliveryCard.tsx         # NEW: courier delivery list item
│   │   ├── FilterBar.tsx
│   │   ├── Stepper.tsx
│   │   ├── ConfirmationModal.tsx    # UPDATED: includes notification opt-in
│   │   ├── AccountForm.tsx          # NEW: shared account edit form (both roles)
│   │   ├── StatusBadge.tsx          # NEW: order/delivery status badge
│   │   └── index.ts
│   │
│   ├── services/                    # API & business logic
│   │   ├── api.ts
│   │   ├── authService.ts           # UPDATED: role detection on login
│   │   ├── restaurantService.ts
│   │   ├── orderService.ts
│   │   ├── courierService.ts        # NEW: courier delivery API calls
│   │   ├── accountService.ts        # NEW: account management API calls
│   │   └── index.ts
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # UPDATED: includes role state
│   │   ├── useRestaurants.ts
│   │   ├── useDeliveries.ts         # NEW: courier delivery list hook
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   │   ├── RestaurantMenu.jpg
│   │   │   └── logo.png
│   │   └── fonts/
│   │       └── Oswald/              # Oswald font files
│   │
│   ├── .env.example
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.js
│   └── node_modules/
│
├── server/                          # Backend (from Module 12 — unchanged)
│   ├── serverJAVA/
│   │   └── src/main/java/com/rocketFoodDelivery/
│   │       ├── auth/
│   │       ├── user/
│   │       ├── restaurant/
│   │       ├── menu/
│   │       ├── order/
│   │       └── config/
│   └── db_schema_12_v2/
│
├── ai/                              # AI specification & guidelines
│   ├── 🤖-ai-spec.md               # This file (Module 14)
│   └── features/                   # Feature specifications
│       ├── 🤖-navigation-structure.feature.md
│       ├── 🤖-login-page.feature.md
│       ├── 🤖-header-footer.feature.md
│       ├── 🤖-restaurant-list-page.feature.md
│       ├── 🤖-restaurant-menu-page.feature.md
│       ├── 🤖-menu-modal-confirmation.feature.md
│       ├── 🤖-order-history-page.feature.md
│       ├── 🤖-order-history-modal.feature.md
│       ├── 🤖-profile.feature.md
│       ├── 🤖-error-handling.feature.md
│       ├── 🤖-courier-deliveries.feature.md       # NEW
│       ├── 🤖-account-selection.feature.md        # NEW
│       ├── 🤖-account-management.feature.md       # NEW
│       ├── 🤖-notification-opt-in.feature.md      # NEW
│       └── 🤖-typography.feature.md               # NEW
│
├── support_materials_13/            # Module 13 design references
├── support_materials_14/            # Module 14 design references (NEW)
│
├── postman/
│   └── PostmanCollection.json
│
├── README.md
├── CONCEPTS.md
├── LeetCode-Challenges/
└── .gitignore
```

### Navigation Architecture (Role-Based, 4-Level)

#### Level 1: Root Stack
- **Root Layout** (`app/_layout.tsx`)
- Conditional rendering based on: no token → Auth stack, token + single role → role stack, token + dual role → Account Selection

#### Level 2a: Auth Stack (Unauthenticated)
- Login screen
- Account Selection screen (dual-role users only, post-login)

#### Level 2b: Customer Tabs (Authenticated, role = customer)
- **Tab Layout** (`app/(tabs)/_layout.tsx`)
- Footer navigation: **3 tabs** — Restaurants | OrderHistory | Account

#### Level 2c: Courier Tabs (Authenticated, role = courier)
- **Tab Layout** (`app/(courier)/_layout.tsx`)
- Footer navigation: **2 tabs** — Deliveries | Account

#### Level 3: Nested Stacks (within tabs)
- Restaurant stack (`app/(tabs)/(restaurant)/`)
- Order detail modal

```
Root Layout
├─ (auth) — Unauthenticated
│   ├─ login
│   └─ account-selection  ← dual-role users land here after login
│
├─ (tabs) — Customer area (role = customer)
│   ├─ index          [Restaurants]     ← tab 1
│   │   └─ (restaurant)/[id]
│   ├─ history        [OrderHistory]    ← tab 2
│   │   └─ [id] (Order detail modal)
│   └─ account        [Account]         ← tab 3 (NEW)
│
└─ (courier) — Courier area (role = courier)
    ├─ deliveries     [Deliveries]      ← tab 1
    │   └─ Delivery Details Modal (overlay, not a separate route)
    └─ account        [Account]         ← tab 2
```

### Role Detection Logic

```typescript
// After successful login:
const { accessToken, customer_id, courier_id } = response.data;

const isCustomer = customer_id !== null;
const isCourier  = courier_id  !== null;
const isDualRole = isCustomer && isCourier;

if (isDualRole) {
  // Store both IDs, navigate to account-selection
  router.replace('/(auth)/account-selection');
} else if (isCustomer) {
  router.replace('/(tabs)');
} else if (isCourier) {
  router.replace('/(courier)');
}
```

### Component Structure

**Key Principles (unchanged from Module 13):**
- Separation of concerns (UI, API, State)
- Unidirectional data flow
- Reusable components — **no duplication across customer and courier screens**
- Error boundaries for resilience
- Loading skeletons for UX

---

## 🛠️ Allowed Technologies & Constraints

### Frontend (Client — React Native + Expo)

**Required Stack:**
- Runtime: Node.js 18+ LTS
- Language: TypeScript 5.0+
- Framework: React Native (via Expo SDK 54)
- Build Tool: Expo CLI
- Package Manager: npm 9+

**Required/Approved Libraries:**
- **Navigation:** expo-router (file-based routing)
- **Storage:** AsyncStorage (token + role session management)
- **Icons:** FontAwesome (`@fortawesome/react-native-fontawesome`)
- **Fonts:** `@expo-google-fonts/oswald` (Oswald font family)
- **Animations:** react-native-reanimated
- **Environment:** react-native-dotenv
- **Networking:** Ngrok (`@expo/ngrok`) for local API tunnel
- **HTTP Client:** Axios

**Fonts:**
- Primary: Arial (React Native system default — no import needed)
- Secondary: Oswald (via `@expo-google-fonts/oswald` — loaded in root layout)
- All screens must use Oswald for headings/labels per brand spec

**API Authentication:**
- Type: Bearer Token (JWT)
- Storage: AsyncStorage
- Header: `Authorization: Bearer <JWT_TOKEN>`
- All API requests must include valid token

**Styling:**
- Framework: React Native StyleSheet API
- No CSS files
- Colors from `constants/colors.ts`
- Follow wireframe color schemes precisely

**Prohibited:**
- ❌ jQuery or DOM manipulation
- ❌ Unmaintained packages
- ❌ Custom payment integration
- ❌ Direct HTTP in production

### Backend (Java Spring Boot — From Module 12, Unchanged)

- Runtime: Java 21 LTS
- Framework: Spring Boot 3.0+
- Build Tool: Maven
- Database: MySQL 8
- **No modifications required or allowed**

### Development & Testing

- ✅ iOS (via Expo simulator or physical device)
- ✅ Android (via Expo simulator or physical device)
- ✅ Physical devices: Ngrok tunnel required to expose local API
- ✅ Local: `localhost:8080` (or Ngrok tunnel)

---

## 📦 Feature Requirements

### Module 13 Features (Inherited — must remain functional)

| # | Feature | Spec File |
|---|---------|-----------|
| 1 | Navigation Structure | `🤖-navigation-structure.feature.md` |
| 2 | Login Page | `🤖-login-page.feature.md` |
| 3 | Header & Footer | `🤖-header-footer.feature.md` |
| 4 | Restaurant List Page | `🤖-restaurant-list-page.feature.md` |
| 5 | Restaurant Menu Page | `🤖-restaurant-menu-page.feature.md` |
| 6 | Menu Modal Confirmation | `🤖-menu-modal-confirmation.feature.md` |
| 7 | Order History Page | `🤖-order-history-page.feature.md` |
| 8 | Order History Modal | `🤖-order-history-modal.feature.md` |
| 9 | User Profile | `🤖-profile.feature.md` |
| 10 | Error Handling & UX | `🤖-error-handling.feature.md` |

---

### Module 14 Features (New)

#### Feature 11: Courier Deliveries Section
**File:** `ai/features/🤖-courier-deliveries.feature.md`

Couriers must be able to view and manage their active and historical deliveries.

- **Delivery List Screen** (`app/(courier)/deliveries.tsx`)
  - Heading: **MY DELIVERIES**
  - Table layout with four columns: **ORDER ID | ADDRESS | STATUS | VIEW**
  - Each row shows: order ID number, delivery address, color-coded status badge, magnifying glass VIEW icon
  - Tapping the VIEW icon opens the **Delivery Details Modal** (overlay — not a route change)
  - Fetch with `useFocusEffect` to refresh on every tab visit

- **Delivery Details Modal** — rendered as an overlay on top of the deliveries list (not a separate screen or route)
  - Heading: **DELIVERY DETAILS** (in brand red/orange)
  - Sub-label: *"Status: [CURRENT_STATUS]"*
  - Displays:
    - Delivery Address
    - Restaurant name
    - Order Date (formatted YYYY/MM/DD)
    - Order Details section: item name | quantity | price per line
    - **TOTAL:** formatted as `$ XX.XX`
  - Close button (×) dismisses the modal
  - The **STATUS badge itself is the advance button** — tapping it advances the order to the next status and calls `PUT /api/v1/orders/{id}`
  - DELIVERED status is locked — the badge becomes non-interactive
  - Uses data already loaded in the delivery list — no separate API call needed to open the modal

#### Feature 12: Account Selection Screen
**File:** `ai/features/🤖-account-selection.feature.md`

Dual-role users (both customer and courier) must choose their role after login.

- **Account Selection Screen** (`app/(auth)/account-selection.tsx`)
  - Shown only when login response contains both `customer_id` and `courier_id`
  - Two clearly labelled options: "Continue as Customer" and "Continue as Courier"
  - Selecting a role sets the active role in context and navigates to the correct tab stack
  - Single-role users skip this screen entirely (direct navigation after login)
- **Role stored in:** React Context (session only — not persisted to AsyncStorage)
- Back navigation from account selection is **not allowed** (use `router.replace`)

#### Feature 13: Account Management
**File:** `ai/features/🤖-account-management.feature.md`

Both customers and couriers must be able to view and update their contact details.

- **Customer Account Screen** (`app/(tabs)/account.tsx`)
  - Heading: **MY ACCOUNT**
  - Sub-label: *"Logged In As: Customer"*
  - Three fields displayed:
    1. **Primary Email** — read-only, helper text: *"Email used to login to the application."*
    2. **Customer Email** — editable text input, helper text: *"Email used for your Customer account."*
    3. **Customer Phone** — editable text input, helper text: *"Phone number for your Customer account."*
  - Single **UPDATE ACCOUNT** button — submits changed fields to the API
  - Footer: Restaurants | OrderHistory | Account (Account tab highlighted)

- **Courier Account Screen** (`app/(courier)/account.tsx`)
  - Heading: **MY ACCOUNT**
  - Sub-label: *"Logged In As: Courier"*
  - Three fields displayed:
    1. **Primary Email** — read-only, helper text: *"Email used to login to the application."*
    2. **Courier Email** — editable text input, helper text: *"Email used for your Courier account."*
    3. **Courier Phone** — editable text input, helper text: *"Phone number for your Courier account."*
  - Single **UPDATE ACCOUNT** button
  - Footer: Deliveries | Account (Account tab highlighted)

- **Shared Component:** `components/AccountForm.tsx`
  - Accepts `role: 'customer' | 'courier'`, `userId`, `primaryEmail` props
  - Renders the three-field layout with correct labels per role
  - Handles field state and submit logic
  - Used by both customer and courier account screens — no duplication allowed

#### Feature 14: Notification Opt-In
**File:** `ai/features/🤖-notification-opt-in.feature.md`

When placing an order, customers can opt in to receive SMS and/or email confirmation.

- Modifies **ConfirmationModal** (`components/ConfirmationModal.tsx`)
- Prompt text shown in modal: *"Would you like to receive your order confirmation by email and/or text?"*
- Two checkboxes added below the order total:
  - "By Email"
  - "By Phone"
- Both unchecked by default
- Checkbox state included in the order POST body:
  ```json
  {
    "customer_id": 2,
    "restaurant_id": 5,
    "products": [...],
    "notify_by_email": true,
    "notify_by_phone": false
  }
  ```
- **Backend Note:** The API fields for notification flags must be confirmed against the Module 12 API schema. If not supported, the fields are sent but silently ignored by the server — the UI still implements the opt-in UI.
- Checkboxes must use React Native `CheckBox` or equivalent (no custom toggle)

#### Feature 15: Brand Typography
**File:** `ai/features/🤖-typography.feature.md`

All screens and components must use the Rocket Food Delivery brand fonts.

- **Arial:** React Native system default — no explicit font family needed unless overriding
- **Oswald:** Loaded via `@expo-google-fonts/oswald` in the root layout using `useFonts`
  ```typescript
  import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
  ```
- App must **not render** until fonts are loaded (use `SplashScreen.preventAutoHideAsync()`)
- **Usage rules:**
  - All screen headings: `fontFamily: 'Oswald_700Bold'`
  - All section labels/subheadings: `fontFamily: 'Oswald_400Regular'`
  - Body text and inputs: Arial (system default)
- Applied to **all** screens: customer and courier, existing and new
- No screen or component may use system default for headings

---

## 📏 Coding Standards & Conventions

### Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Files (screens) | kebab-case | `account-selection.tsx` |
| Files (components) | PascalCase | `AccountForm.tsx` |
| Files (services) | camelCase | `courierService.ts` |
| React components | PascalCase | `DeliveryCard` |
| Functions | camelCase | `handleAdvanceStatus` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `CourierDelivery` |
| CSS classes / styles | camelCase | `styles.deliveryCard` |

### TypeScript Rules
- All props and state must have explicit types
- No `any` types
- Interfaces preferred over `type` for object shapes
- Enums for order/delivery status values

### Component Rules
- **Reuse first:** Before creating a new component, check if an existing one can be extended
- `AccountForm` must be shared between customer and courier profile screens
- `StatusBadge` must be shared between order history and courier delivery views
- No dead code, no commented-out code
- No console.log statements in production code

---

## ✅ Definition of Done (Global)

All features must meet **ALL** criteria before merge:

### Functionality ✓
- [ ] Feature implements all requirements from its specification document
- [ ] API calls use correct endpoints with JWT bearer token
- [ ] Role detection works correctly for single-role and dual-role users
- [ ] DELIVERED status is locked — no further transitions possible
- [ ] Account management read and edit modes both functional
- [ ] Notification opt-in checkboxes included in order payload
- [ ] Oswald font applied to all headings on all screens
- [ ] Components reused — no duplicate implementations

### User Experience ✓
- [ ] Navigation always visible except on the login page and account selection screen
- [ ] All modals/alerts provide clear feedback
- [ ] Loading states visible during all async operations
- [ ] Error messages are user-friendly
- [ ] Back navigation works as expected (blocked on account selection)
- [ ] No console.log() statements in production code

### Code Quality ✓
- [ ] TypeScript types for all props & states
- [ ] No `any` types used
- [ ] ESLint passes without warnings
- [ ] Code follows naming conventions (this document)
- [ ] Reusable components properly abstracted
- [ ] No dead code or unused imports

### Testing ✓
- [ ] Feature tested on iOS simulator
- [ ] Feature tested on Android simulator
- [ ] Physical device testing (if available via Ngrok)
- [ ] All user journeys (customer + courier) work end-to-end
- [ ] Edge cases handled (empty lists, network errors, locked status)

### Security ✓
- [ ] JWT token never exposed in logs
- [ ] No secrets committed to repository
- [ ] HTTPS enforced for API calls (production)
- [ ] Token and role cleared on logout

### Documentation ✓
- [ ] Feature specification complete (`./ai/features/`)
- [ ] Comments explain complex logic only
- [ ] API integration documented in feature spec

---

## 🔗 Cross-Feature Rules

### Token Authentication (Unchanged)
- Token stored in AsyncStorage under key: `authToken`
- All API requests include: `Authorization: Bearer <token>`
- Token cleared on logout
- `customer_id` stored under: `customerId`
- `courier_id` stored under: `courierId` (NEW)

### Role State Management
- Active role stored in React Context (not AsyncStorage — session only)
- Context provides: `role: 'customer' | 'courier' | null`
- Root layout reads role from context to render correct tab stack
- Logout clears token, role, and both IDs from AsyncStorage and context

### Order Status Transitions
```
PENDING → IN_PROGRESS → DELIVERED (locked)
```
- Only couriers can advance status
- DELIVERED is a terminal state — no further status changes allowed
- UI must enforce this: hide or disable advance control when status === 'DELIVERED'

### Status Badge Colors (from wireframe)
Used by both `StatusBadge` component and any inline status indicators:

| Status | Background Color | Text |
|--------|-----------------|------|
| `PENDING` | Dark red / brand red (`#C1392B` or similar) | White |
| `IN_PROGRESS` | Orange-red (lighter than PENDING) | White |
| `DELIVERED` | Teal / green (`#4CAF85` or similar) | White |

- Exact hex values should be confirmed against `constants/colors.ts` and the wireframe
- `StatusBadge` component accepts `status` prop and applies the correct color automatically

### Order Confirmation Email Template
When a customer opts in to email confirmation, the email sent by the backend follows this layout:
- **Rocket Food Delivery logo** at top center
- Greeting: *"Thank you, [Customer Name]!"* — in brand orange
- Body: *"We have received your Order (ID: #[ID]) for the Restaurant: [Restaurant Name] and with a total cost of $[XX.XX]. We are currently processing your order and will soon be on our way to deliver to you."*
- Sign-off: *"Sincerely, Rocket Food Delivery"*
- **Note:** The email is sent by the backend. The mobile app only passes the `notify_by_email: true` flag in the order request. No email rendering logic lives in the mobile app.

### UI Consistency
- All screens follow wireframe templates exactly
- Color scheme: `constants/colors.ts`
- Fonts: Arial (body) + Oswald (headings) — applied globally
- Navigation: expo-router file-based routing
- Modals overlay with confirmation buttons

### Component Reuse Rules
- `AccountForm` — shared between `(tabs)/profile.tsx` and `(courier)/profile.tsx`
- `StatusBadge` — shared between order history and courier delivery views
- `DeliveryCard` / `OrderCard` — may share base layout; extend rather than duplicate
- Any component used in 2+ places must be extracted to `components/`

### Error Handling Pattern (Unchanged)
```typescript
try {
  const data = await apiCall();
  // success
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired — clear storage, navigate to login
  } else {
    // Show user-friendly error alert
  }
}
```

### Font Loading Pattern (New — Module 14)
```typescript
// app/_layout.tsx
import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Oswald_400Regular, Oswald_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  // ... rest of layout
}
```

---

## 📦 Expected Deliverables

### Code & Repository
- [ ] **`RocketApp/` directory** — Extended React Native + Expo project
- [ ] **Git branching** — feature branches merged to dev, then dev to main
- [ ] **Main branch only** — Grading evaluates main branch exclusively

### Documentation
- [ ] **`README.md`** — Project overview, setup instructions, new courier section, Ngrok guide
- [ ] **`ai/🤖-ai-spec.md`** — This global specification (Module 14, complete)
- [ ] **`ai/features/🤖-*.feature.md`** — Fifteen feature specifications (10 inherited + 5 new)
- [ ] **`CONCEPTS.md`** — 3 challenging concepts with explanation
- [ ] **`.env.example`** — Environment variables template
- [ ] **`PostmanCollection.json`** — All module endpoints exported

### Media & Evidence
- [ ] **Video: CONCEPTS.md** — Recorded demonstration of 3 challenging concepts
- [ ] **Video: LeetCode Solutions** — Recorded explanation of reasoning
- [ ] **LeetCode Screenshots** — Saved to `./LeetCode-Challenges/<name>.png`
- [ ] **Video: Technical Demonstration** — Full project demo + code overview (both roles)

### Extra Miles (Optional)
- [ ] **Cross-Platform UI Consistency** — Verified identical on iPhone & Android
- [ ] **Twilio Integration** — Screenshot proof + README instructions
- [ ] **Notify.EU Integration** — Screenshot proof + README instructions

### NOT Submitted to GitHub
- ❌ **Submission Summary Document** — Submitted separately through platform

---

## 📋 Grading & Deadlines

### Evaluation Categories
1. **Project Setup** — Expo config, navigation structure, environment
2. **Technical Implementation** — All 5 new features complete and functional
3. **AI-Native Specifications** — ai-spec.md + 15 feature docs (10 + 5 new)
4. **Technical Interview** — Concepts video + LeetCode videos
5. **Deadline Compliance** — Submitted by Friday 11:59 PM
6. **Extra Miles** — Additional features (cross-platform, Twilio, Notify.EU)
7. **Professional Skills** — Communication, progress updates, code reviews

### Requirement Checklist
- The Requirement Checklist is the **source of truth** for grading
- If conflict between this document and checklist, **checklist takes precedence**

### Deadline
- **Submission:** Friday 11:59 PM (assigned deadline week)
- **Platform:** Submit through platform (with Submission Summary, not GitHub)
- **Branch:** Only `main` branch evaluated

### Branching Model
```
main (graded)
 ↑
dev (integration)
 ↑
feature/* (development)
```
- Create feature branches from `dev`
- Merge back to `dev` via pull request
- Merge `dev` to `main` when ready for submission
- No direct commits to `main`

---

## 👥 Professional Expectations

### Communication
- ✅ Respond to coaches within 24 hours
- ✅ Provide at least 2 progress updates per week
- ✅ Schedule at least 1 project review before Friday each week
- ❌ Failure to meet communication = module failure

### Professionalism
- ✅ Demonstrate autonomy and initiative
- ✅ Attend to detail (wireframe fidelity, naming conventions, no dead code)
- ✅ Commit regularly with meaningful commit messages
- ✅ Ask for help proactively if blocked

### Code Review
- Code must be reviewed before merge to dev
- Address review feedback thoroughly
- Test reviewed code before approving

---

## 📚 Knowledge Base References

- **Module 13 Wireframes:** `support_materials_13/Design/`
- **Module 14 Wireframes:** `support_materials_14/Design/`
- **Color Scheme:** Provided in wireframe
- **REST API:** Module 12 documentation (`serverJAVA/`)
- **Oswald Font Docs:** `@expo-google-fonts/oswald` npm package
- **Expo Router Docs:** https://docs.expo.dev/routing/introduction/
- **Requirement Checklist:** Grading source of truth

---
