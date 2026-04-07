# 🤖🛠️ RocketApp AI Specification Document

**Version:** 1.0 (DRAFT)  
**Last Updated:** April 7, 2026  
**Status:** IN PROGRESS - Awaiting full requirements

---

## 📋 Table of Contents

1. [User Interface Requirements](#user-interface-requirements)
2. [Project Identity & Scope](#project-identity--scope)
3. [Architecture & Repository Structure](#architecture--repository-structure)
4. [Allowed Technologies & Constraints](#allowed-technologies--constraints)
5. [Coding Standards & Conventions](#coding-standards--conventions)
6. [Definition of Done (Global)](#definition-of-done-global)
7. [Cross-Feature Rules](#cross-feature-rules)

---

## 📱 User Interface Requirements

### General Requirements
- **Header and Footer Navigation:** Should always be visible, except on login page
- **Fonts:** 
  - Primary: Arial (React Native default)
  - Secondary: Oswald
- **Scrolling:** Overflow contents should be scrollable
- **Styling:** Follow provided wireframe template as closely as possible

**Wireframe Reference:** Located in `support_materials_13/Design/`

---

## 🎯 Project Identity & Scope

### Project Name
**RocketApp** - Rocket Food Delivery Customer Mobile Application

### Project Vision
Build a cross-platform mobile application (iOS & Android) using React Native and Expo that allows customers to log in, browse restaurants, place orders, and review order history. The app connects seamlessly to the existing Java Spring Boot REST API with token-based authentication.

### Module Context
- **Program:** Full-Stack Development Program
- **Module:** 13 - Mobile Development 1
- **Role:** Junior Developer at Genesis Solutions
- **Prerequisite:** Module 12 (REST API) is complete and deployed
- **Status:** Back-end API is finalized; no server modifications required

### Customer Journey
```
Login 
  ↓ (JWT token stored)
Browse Restaurants 
  ↓ (optional: filter by rating/price)
Select Restaurant 
  ↓
View Menu 
  ↓
Adjust Quantities (stepper buttons) 
  ↓
Create Order 
  ↓
Confirmation Modal 
  ↓
Success/Failure Feedback 
  ↓
View Order History 
  ↓
Inspect Order Details
```

### In Scope ✅
- **Authentication:** Login screen with JWT token storage in AsyncStorage
- **Restaurant Browsing:** Grid layout with filtering (rating, price range)
- **Restaurant Menu:** Display items with quantity selection via stepper buttons
- **Order Placement:** Complete order creation flow with confirmation modal
- **Order History:** Display past orders with expandable detail view
- **Brand Consistency:** Match wireframe template and color scheme precisely
- **Cross-Platform:** Full iOS and Android compatibility via Expo

### Out of Scope ❌
- Back-end API modifications (API from Module 12 is used as-is)
- Payment gateway integration (order placement only)
- Real-time order tracking updates
- Push notifications (unless Twilio/Notify.EU extra mile)
- User registration (login only)
- Admin dashboard features

### Critical Success Criteria
- ✅ App runs on both iOS and Android simulators/devices
- ✅ All screens match wireframe layout and color scheme exactly
- ✅ Item quantities can ONLY be adjusted via stepper buttons (no negative values)
- ✅ JWT authentication tokens properly stored and sent with all API requests
- ✅ API calls use bearer token authentication
- ✅ Complete customer journey functional end-to-end
- ✅ All deliverables completed and submitted by deadline

---

## 🏗️ Architecture & Repository Structure

### Repository Layout

```
RocketApp/
├── client/                          # React Native Expo frontend
│   ├── app/                         # expo-router app directory (file-based routing)
│   │   ├── (auth)/                 # Auth stack - Login screens
│   │   │   ├── _layout.tsx
│   │   │   └── login.tsx
│   │   ├── (tabs)/                 # Customer tabs navigation
│   │   │   ├── _layout.tsx         # Tab layout with footer
│   │   │   ├── index.tsx           # Restaurants tab (home)
│   │   │   ├── history.tsx         # Order History tab
│   │   │   └── profile.tsx         # Profile/Settings tab
│   │   ├── (restaurant)/           # Restaurant detail stack
│   │   │   ├── _layout.tsx
│   │   │   ├── [id].tsx            # Restaurant menu screen
│   │   │   └── order-detail/
│   │   ├── _layout.tsx             # Root layout
│   │   └── modal.tsx               # Confirmation/detail modals
│   ├── components/                  # Reusable UI components
│   │   ├── RestaurantCard.tsx       # Grid restaurant item
│   │   ├── MenuItem.tsx             # Menu item with stepper
│   │   ├── OrderCard.tsx            # Order history item
│   │   ├── FilterBar.tsx            # Restaurant filters (rating/price)
│   │   ├── Stepper.tsx              # Quantity stepper (no negative)
│   │   ├── ConfirmationModal.tsx    # Order confirmation flow
│   │   └── index.ts                 # Exports
│   ├── services/                    # API & business logic
│   │   ├── api.ts                   # Axios instance + base URL
│   │   ├── authService.ts           # Login, token management
│   │   ├── restaurantService.ts     # Restaurant API calls
│   │   ├── orderService.ts          # Order API calls
│   │   └── index.ts                 # Exports
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # Auth state + token
│   │   ├── useRestaurants.ts        # Restaurant data + filters
│   │   └── index.ts                 # Exports
│   ├── constants/                   # App constants
│   │   ├── colors.ts                # Color scheme from wireframe
│   │   ├── api.ts                   # API endpoints & config
│   │   └── index.ts                 # Exports
│   ├── assets/                      # Images & media
│   │   ├── images/
│   │   │   ├── RestaurantMenu.jpg   # Static menu image (all restaurants)
│   │   │   └── logo.png
│   │   └── fonts/
│   │       └── Oswald/              # Oswald font files
│   ├── .env.example                 # Environment template
│   ├── app.json                     # Expo configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── eslint.config.js
│   └── node_modules/
│
├── server/                          # Backend (from Module 12)
│   ├── serverJAVA/                 # Java Spring Boot API
│   │   ├── src/main/java/
│   │   │   └── com/rocketFoodDelivery/
│   │   │       ├── auth/            # JWT & authentication
│   │   │       ├── user/            # User endpoints
│   │   │       ├── restaurant/      # Restaurant endpoints
│   │   │       ├── menu/            # Menu & items
│   │   │       ├── order/           # Order endpoints
│   │   │       └── config/          # Security & CORS config
│   │   ├── pom.xml
│   │   └── target/
│   └── db_schema_12_v2/            # Database schema & migrations
│
├── ai/                              # AI specification & guidelines
│   ├── ai-spec.md                  # This file
│   └── features/                    # Feature specifications
│       ├── login.feature.md
│       ├── restaurant-browsing.feature.md
│       ├── restaurant-search.feature.md
│       ├── menu-view.feature.md
│       ├── order-creation.feature.md
│       ├── order-history.feature.md
│       ├── profile.feature.md
│       └── error-handling.feature.md
│
├── support_materials_13/            # Design references
│   ├── Design/                      # Wireframe template & color scheme
│   ├── Images/                      # Reference screenshots
│   └── Restaurants/                 # Restaurant data samples
│
├── postman/                         # Postman collection
│   └── PostmanCollection.json       # All module endpoints
│
├── README.md                        # Project setup & overview
├── CONCEPTS.md                      # 3 challenging concepts
├── LeetCode-Challenges/             # Challenge solutions + screenshots
│   ├── challenge-1.png
│   ├── challenge-2.png
│   └── challenge-3.png
│
└── .gitignore
```

### Navigation Architecture (3-Level Nested)

#### Level 1: Root Stack
- **Root Layout** (`app/_layout.tsx`)
- Conditional rendering: AuthStack vs AppStack based on token

#### Level 2: Customer Tabs (Authenticated)
- **Tab Layout** (`app/(tabs)/_layout.tsx`)
- Footer navigation always visible
- Three tabs: Restaurants, Order History, Profile

#### Level 3: Restaurant Stack (Nested)
- **Restaurant Screen** (`app/(restaurant)/[id].tsx`)
- **Order Detail Modal** (`app/modal.tsx`)
- Accessed when restaurant selected from tab

```
Root Layout
├─ (auth) - AuthStack
│   └─ login
│
└─ (tabs) - AppStack (when authenticated)
    ├─ index (Restaurants list)
    ├─ history (Order history)
    ├─ profile (User profile)
    └─ (restaurant) - Nested
        ├─ [id] (Restaurant menu)
        └─ order-detail/ (Detail modal)
```

### Component Structure

**Key Principles:**
- Separation of concerns (UI, API, State)
- Unidirectional data flow (UI → State → API)
- Reusable components (no prop drilling)
- Error boundaries for resilience
- Loading skeletons for UX

**API Integration:**
- API calls via AsyncStorage token retrieval
- Centralized Axios instance with interceptors
- Error handling with user-friendly messages
- Request/response logging

---

## 🛠️ Allowed Technologies & Constraints

### Frontend (Client - React Native + Expo)

**Required Stack:**
- Runtime: Node.js 18+ LTS
- Language: TypeScript 5.0+
- Framework: React Native (via Expo SDK ~55)
- Build Tool: Expo CLI
- Package Manager: npm 9+

**Required/Approved Libraries:**
- **Navigation:** expo-router (Expo's file-based routing)
- **Storage:** AsyncStorage (token + session management)
- **UI Components:** React Bootstrap (component library)
- **Icons:** FontAwesome (@fortawesome/react-native-fontawesome)
- **Animations:** react-native-reanimated
- **Environment:** react-native-dotenv
- **Networking:** Ngrok (@expo/ngrok) for local API tunnel

**Fonts:**
- Primary: Arial (React Native default)
- Secondary: Oswald

**API Authentication:**
- Type: Bearer Token (JWT)
- Storage: AsyncStorage (secure token persistence)
- Header: `Authorization: Bearer <JWT_TOKEN>`
- All API requests must include valid token

**Styling:**
- Framework: React Native StyleSheet API
- No CSS files
- Inline or component-scoped constants
- Follow wireframe color scheme precisely

**Images:**
- All restaurant menus use the same static image: `RestaurantMenu.jpg`
- Location: `client/assets/images/RestaurantMenu.jpg`

**Prohibited:**
- ❌ jQuery or DOM manipulation
- ❌ Unmaintained packages
- ❌ Custom payment integration (not in scope)
- ❌ Direct HTTP (must use HTTPS in production)

### Backend (Java Spring Boot - From Module 12)

**Stack:**
- Runtime: Java 17+ LTS
- Framework: Spring Boot 3.0+
- Build Tool: Maven
- Database: PostgreSQL 14+

**No Modifications Required:**
- API is complete from Module 12
- Mobile app consumes REST API as-is
- Endpoints already support JWT authentication

### Development & Testing

**Compatibility:**
- ✅ iOS (via Expo simulator or physical device)
- ✅ Android (via Expo simulator or physical device)
- ✅ Physical devices require Ngrok tunnel to expose local API

**Testing Environment:**
- Local testing: `localhost:8080` (or Ngrok tunnel for physical devices)
- API Base URL configurable via `.env`

### Constraints

**Technology Constraints:**
- No experimental React features
- No multiple navigation solutions (expo-router only)
- No unauthorized third-party APIs
- No hardcoded URLs or secrets

**Compliance:**
- HTTPS required for all production API calls
- Bearer token headers mandatory
- No token exposure in logs or console output

---

## � Feature Requirements

### Feature 1: Login Screen
**File:** `ai/features/login.feature.md`
- Email/password input fields
- Sign in button (authenticates via API)
- JWT token received and stored in AsyncStorage
- Error feedback for invalid credentials
- Navigate to Restaurants tab on successful login
- Must match wireframe design exactly

### Feature 2: Restaurant Browsing & List
**File:** `ai/features/restaurant-browsing.feature.md`
- Grid layout displaying all available restaurants
- Navigation always visible (header + footer)
- Each card shows: restaurant name, rating, price range, image
- Tappable cards navigate to restaurant menu
- Must match wireframe design exactly

### Feature 3: Restaurant Search & Filtering
**File:** `ai/features/restaurant-search.feature.md`
- Filter toolbar on restaurant list
- Filter by: Rating (range), Price Range (low/medium/high)
- Real-time filtering (no separate "apply" button)
- Clear filters option
- Results update dynamically

### Feature 4: Restaurant Menu View
**File:** `ai/features/menu-view.feature.md`
- Display restaurant name, image (RestaurantMenu.jpg), and menu items
- Each item shows: name, description, price
- Quantity stepper (buttons only, no text input)
- Stepper minimum: 1, no negative values
- "Add to Order" button to include item
- Must match wireframe design exactly

### Feature 5: Order Creation
**File:** `ai/features/order-creation.feature.md`
- Summary of selected items with quantities and prices
- Total order price calculation
- "Place Order" confirmation button
- Modal confirmation with order details
- API call to create order with JWT token

### Feature 6: Order History
**File:** `ai/features/order-history.feature.md`
- Display past orders in a list
- Each order card shows: order ID, date, total, status
- Tappable to expand order details (modal)
- Details include: items, quantities, total, timestamp

### Feature 7: User Profile (Basic)
**File:** `ai/features/profile.feature.md`
- Display logged-in user info
- Logout button
- Clears token from AsyncStorage
- Navigates back to login screen

### Feature 8: Error Handling & UX
**File:** `ai/features/error-handling.feature.md`
- Network error alerts with retry option
- API error messages displayed to user
- Loading states on all async operations
- Empty state messages (no restaurants, no orders)
- Graceful token expiry handling

---

## 📦 Expected Deliverables

### Code & Repository
- [ ] **`RocketApp/` directory** - Complete React Native + Expo project
- [ ] **Git branching** - feature branches merged to dev, then dev to main
- [ ] **Main branch only** - Grading evaluates main branch exclusively

### Documentation
- [ ] **`README.md`** - Project overview, setup instructions, Ngrok tunnel guide
- [ ] **`ai/ai-spec.md`** - This global specification (complete)
- [ ] **`ai/features/*.feature.md`** - Eight feature specifications (one per feature)
- [ ] **`CONCEPTS.md`** - 3 challenging concepts with explanation
- [ ] **`.env.example`** - Environment variables template for API URL, Ngrok tunnel
- [ ] **Postman Collection** - `PostmanCollection.json` (all module endpoints exported)

### Media & Evidence
- [ ] **Video: CONCEPTS.md** - Recorded demonstration of 3 challenging concepts
- [ ] **Video: LeetCode Solutions** - Recorded explanation of reasoning
- [ ] **LeetCode Screenshots** - Solutions saved to `./LeetCode-Challenges/<name>.png`
- [ ] **Video: Technical Demonstration** - Full project demo + code overview

### Extra Miles (Optional)
- [ ] **Cross-Platform UI Consistency** - Verified identical on iPhone & Android
- [ ] **Twilio Account** - Screenshot proof + README.md integration instructions
- [ ] **Notify.EU Account** - Screenshot proof + README.md integration instructions

### NOT Submitted to GitHub
- ❌ **Submission Summary Document** - Submitted separately through platform

---

## ✅ Definition of Done (Module-Specific)

All features must meet **ALL** criteria before merge:

### Functionality ✓
- [ ] Feature implements all requirements from specification
- [ ] API calls use correct endpoints with JWT bearer token
- [ ] AsyncStorage properly stores/retrieves JWT token
- [ ] No hardcoded API URLs or secrets in code
- [ ] Stepper buttons prevent negative quantities
- [ ] No text input for quantities (buttons only)
- [ ] All screens match wireframe layout exactly

### User Experience ✓
- [ ] Navigation always visible except on login
- [ ] All modals/alerts provide clear feedback
- [ ] Loading states visible during API calls
- [ ] Error messages are user-friendly
- [ ] Back button works as expected
- [ ] No console.log() statements in production code

### Code Quality ✓
- [ ] TypeScript types for all props & states
- [ ] No `any` types used
- [ ] ESLint passes without warnings
- [ ] Code follows naming conventions (./ai-spec.md)
- [ ] Reusable components properly abstracted
- [ ] No dead code or unused imports

### Testing ✓
- [ ] Feature tested on iOS simulator
- [ ] Feature tested on Android simulator
- [ ] Physical device testing (if available via Ngrok)
- [ ] All user journeys work end-to-end
- [ ] Edge cases handled (empty lists, network errors)

### Security ✓
- [ ] JWT token never exposed in logs
- [ ] No secrets committed to repository
- [ ] HTTPS enforced for API calls (production)
- [ ] Token cleared on logout

### Documentation ✓
- [ ] Feature specification complete (./ai/features/)
- [ ] Comments explain complex logic
- [ ] API integration documented

---

## 🔗 Cross-Feature Rules

### Token Authentication
- Token obtained from login API endpoint
- Token stored in AsyncStorage under key: `authToken`
- All subsequent API requests include: `Authorization: Bearer <token>`
- Token cleared on logout or expiry
- If token expires: prompt re-login (graceful error handling)

### API Integration
- Base URL configured via `.env` (use `axios` interceptor)
- All endpoints use JWT bearer token
- Endpoints from Module 12 API (no modifications)
- Error responses handled with user-friendly messages
- Network errors show retry option

### UI Consistency
- All screens follow wireframe template exactly
- Color scheme: use colors from `constants/colors.ts`
- Fonts: Arial (default) + Oswald (headings)
- Navigation: expo-router file-based routing
- Modals overlay with confirmation buttons

### State Management
- Use React Context for global auth state (token, user)
- Use useState for component-local state
- AsyncStorage for persistent token storage
- No Redux (Context sufficient for this scope)

### Error Handling Pattern
```typescript
try {
  const data = await apiCall();
  // success
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - clear storage, navigate to login
  } else {
    // Show user-friendly error alert
  }
}
```

### Stepper Constraints
- Minimum value: 1 (cannot be 0 or negative)
- No text input allowed (buttons only: -/+)
- Decrement button disabled when value === 1
- Display current quantity clearly

---

## 📋 Grading & Deadlines

### Evaluation Categories
1. **Project Setup** - Expo config, navigation structure, environment
2. **Technical Implementation** - All features complete and functional
3. **AI-Native Specifications** - ai-spec.md + 8 feature docs
4. **Technical Interview** - Concepts video + LeetCode videos
5. **Deadline Compliance** - Submitted by Friday 11:59 PM
6. **Extra Miles** - Additional features (cross-platform, Twilio, Notify.EU)
7. **Professional Skills** - Communication, progress updates, code reviews

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
- ✅ Attend to detail (wireframe fidelity, naming conventions)
- ✅ Commit regularly with meaningful commit messages
- ✅ Ask for help proactively if blocked

### Code Review
- Code must be reviewed before merge
- Address review feedback thoroughly
- Test reviewed code before approving

---

## 📚 Knowledge Base References

- **Wireframe Template:** `support_materials_13/Design/`
- **Color Scheme:** Provided in wireframe
- **Platform Slides:** Teaching guidance + setup
- **Business Document:** Client brief (this module context)
- **Requirement Checklist:** Grading source of truth
- **REST API:** Module 12 documentation (serverJAVA/)

---
