# 🤖 AI_FEATURE_Code Quality

> This document defines the code quality standards for the RocketApp Module 14 codebase:
> component reuse, comment conventions, and folder/file organization.
> These rules apply to every file touched or created during Module 14 development.

---

## Feature Identity

- **Feature Name:** Code Quality
- **Module:** 14 (applies retroactively to all Module 13 + 14 code)
- **Related Area:** Entire client codebase (`client/`)
- **Priority:** Required (grading criteria — violations block merge)
- **Dependencies:** None — this spec governs all other features

---

## Feature Scope

### In Scope (Included)

- Component reuse rules — which components must be shared, which must not be duplicated
- Dead file removal — Expo-default files that were never part of the project
- Comment standards — when to comment, what format, what to avoid
- No dead/commented-out code policy
- Folder and file naming conventions
- Required project structure for Module 14

### Out of Scope (Excluded)

- Test file conventions (no tests required for this module)
- CI/CD pipeline configuration
- Git commit message conventions (covered by professional expectations)
- Backend (Java) code quality — not modified in Module 14

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Code Reusability** | Components are reused across the project (no unnecessary duplication). |
| **Code Cleanliness** | Code includes meaningful comments and contains no unused, dead, or commented-out code. |
| **Folder Organization** | Files and folders follow a clean, logical, professional structure. |

---

## Sub-Requirements (Feature Breakdown)

### 1. Code Reusability

#### Mandatory Shared Components (Module 14)

These components **must** be created as shared and used in all places listed. Creating separate implementations per screen is a grading violation.

| Component | File | Used By |
|-----------|------|---------|
| `AccountForm` | `components/AccountForm.tsx` | `(tabs)/account.tsx` and `(courier)/account.tsx` |
| `StatusBadge` | `components/StatusBadge.tsx` | `(courier)/deliveries.tsx` and `(tabs)/history.tsx` |

#### Existing Shared Components (Module 13 — must remain shared)

| Component | File | Used By |
|-----------|------|---------|
| `Header` | `components/Header.tsx` | All authenticated screens |
| `RestaurantCard` | `components/RestaurantCard.tsx` | Restaurant list |
| `MenuItem` | `components/MenuItem.tsx` | Restaurant menu screen |
| `Stepper` | `components/Stepper.tsx` | Menu item quantity control |
| `FilterBar` | `components/FilterBar.tsx` | Restaurant list filters |
| `ConfirmationModal` | `components/ConfirmationModal.tsx` | Order confirmation flow |
| `OrderHistoryDetailModal` | `components/OrderHistoryDetailModal.tsx` | Order history detail |

#### Reuse Rules

- **Check before creating.** Before writing a new component, search `components/` for an existing one that covers the need. Extend with props before duplicating.
- **Two-screen rule.** Any UI element rendered identically (or near-identically) on two or more screens must be extracted into a shared component.
- **Props over copy-paste.** Differences between usages must be handled via props (`role`, `variant`, `onPress`, etc.) — not by copying the component and changing a label.
- **No inline re-implementations.** Do not re-implement the logic of an existing component inline in a screen file. Import and use the component.

#### Reuse Anti-Patterns to Avoid

```typescript
// ❌ Wrong — duplicate form logic in two screen files
// (tabs)/account.tsx
function CustomerAccountScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // ... 60 lines of form logic
}

// (courier)/account.tsx
function CourierAccountScreen() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // ... same 60 lines of form logic
}

// ✅ Correct — one shared component
// components/AccountForm.tsx handles all state and logic
// (tabs)/account.tsx
export default function CustomerAccountScreen() {
  const { userId } = useAuth();
  return <AccountForm role="customer" userId={userId!} />;
}
```

---

### 2. Code Cleanliness

#### Comment Standards

Comments explain **why**, not **what**. The code itself describes what it does — comments add context that the code cannot express.

**Write a comment when:**
- The logic is non-obvious or has a known edge case
- A business rule is being enforced (e.g. status lock, role detection)
- A workaround exists for a platform-specific issue
- An API field has a non-obvious behaviour (e.g. `total_cost` in cents)

**Do not write a comment when:**
- The code is self-explanatory (`// set loading to true` above `setLoading(true)`)
- The function name already describes the behaviour
- You are restating the variable name (`// the user's email` above `const email`)

**Format:**
```typescript
// ✅ Meaningful — explains a non-obvious business rule
// Status IDs are seeded in order: 1=pending, 2=in progress, 3=delivered
// DELIVERED (3) is terminal — do not include it in NEXT_STATUS_ID
const NEXT_STATUS_ID: Record<string, number> = {
  'pending':     2,
  'in progress': 3,
};

// ✅ Meaningful — explains a unit conversion
// API returns total_cost in cents — divide by 100 before display
const totalDollars = order.total_cost / 100;

// ❌ Useless — restates the code
// Navigate to history
router.replace('/(tabs)/history');

// ❌ Useless — restates the variable name
// The error message
const errorMessage = err.response?.data?.error;
```

#### No Dead Code

**Dead code** is any code that exists in the file but is never executed or referenced. It must not be present in any committed file.

Dead code includes:
- Unused `import` statements
- Variables declared but never used
- Functions defined but never called
- `console.log()` statements (development debugging artifacts)
- Components imported but not rendered
- `TODO` comments with no corresponding ticket or follow-up

**ESLint enforces this automatically.** Run `npx eslint .` before every commit. Zero warnings is the target.

#### No Commented-Out Code

Commented-out code is code that was once active and has been disabled by wrapping it in `//` or `/* */`. This is not the same as a comment explaining logic.

```typescript
// ❌ Commented-out code — must be deleted, not commented
// const handleOldLogin = async () => {
//   const response = await axios.post('/old/endpoint', { email, password });
// };

// ❌ Commented-out JSX — must be deleted
// {/* <OldButton title="Legacy" onPress={handleOldLogin} /> */}

// ✅ If the code might be needed later — use git. Delete it now, recover from history.
```

**Rule:** If you are unsure whether to delete code, delete it. Git history is the recovery mechanism — not comments.

---

### 3. Folder Organization

#### Required Project Structure (Module 14 Final State)

```
client/
├── app/                          # expo-router screens (file = route)
│   ├── _layout.tsx               # Root stack — font loading, auth guard
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── account-selection.tsx  # NEW
│   ├── (tabs)/                   # Customer section
│   │   ├── _layout.tsx           # 3-tab navigator
│   │   ├── index.tsx             # Redirects to (restaurant)
│   │   ├── history.tsx
│   │   ├── account.tsx           # NEW (replaces profile.tsx)
│   │   └── (restaurant)/
│   │       ├── _layout.tsx
│   │       ├── index.tsx         # Restaurant list
│   │       ├── [id].tsx          # Restaurant menu
│   │       └── modal.tsx         # Order confirmation
│   └── (courier)/                # NEW — Courier section
│       ├── _layout.tsx           # 2-tab navigator
│       ├── deliveries.tsx        # Delivery list + detail modal
│       └── account.tsx           # Courier account management
│
├── components/                   # Shared, reusable UI components
│   ├── AccountForm.tsx           # NEW — shared by both account screens
│   ├── ConfirmationModal.tsx     # Order confirmation modal
│   ├── FilterBar.tsx             # Restaurant rating/price filter
│   ├── Header.tsx                # App header (logo + logout)
│   ├── MenuItem.tsx              # Restaurant menu item row
│   ├── OrderHistoryDetailModal.tsx
│   ├── RestaurantCard.tsx        # Restaurant grid card
│   ├── StatusBadge.tsx           # NEW — shared order/delivery status badge
│   └── Stepper.tsx               # Quantity stepper (+/-)
│
├── constants/
│   ├── navigation.ts             # Route names + tab config (UPDATED)
│   └── theme.ts                  # Colors + OswaldFonts
│
├── hooks/
│   ├── use-color-scheme.ts
│   └── use-color-scheme.web.ts
│
├── services/
│   ├── accountService.ts         # NEW — GET/PUT /api/v1/account
│   ├── api.ts                    # Axios instance + endpoint functions
│   ├── authContext.tsx           # Auth provider + useAuth hook
│   ├── courierService.ts         # NEW — delivery list + status update
│   ├── menuService.ts            # Restaurant menu API
│   └── orderHistoryService.ts    # Order history API
│
├── assets/
│   └── images/
│       ├── AppLogoV2.png
│       └── RestaurantMenu.jpg
│
├── .env.example
├── app.json
├── package.json
└── tsconfig.json
```

#### Files to Delete Before Final Submission

These files are Expo default scaffolding that were never used in this project. Their presence adds noise and will be penalised as dead code.

| File | Reason to Delete |
|------|-----------------|
| `app/(tabs)/explore.tsx` | Expo "Explore" tab — not part of this project |
| `app/(tabs)/profile.tsx` | Replaced by `account.tsx` |
| `app/modal.tsx` (root-level) | Root-level modal stub — not used; modal lives in `(restaurant)/` |
| `components/hello-wave.tsx` | Expo welcome animation — never used |
| `components/parallax-scroll-view.tsx` | Expo default component — not used in this project |
| `components/external-link.tsx` | Expo default — not used in this project |
| `components/themed-text.tsx` | Expo default — replaced by direct `Text` + `OswaldFonts` |
| `components/themed-view.tsx` | Expo default — not used in this project |
| `components/ui/collapsible.tsx` | Expo accordion component — not used |

> **Before deleting:** grep each filename across the codebase to confirm it is not imported
> anywhere. If it is imported, update the importing file to remove the dependency first.

#### Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| Screen files | kebab-case | `account-selection.tsx` |
| Component files | PascalCase | `AccountForm.tsx`, `StatusBadge.tsx` |
| Service files | camelCase | `courierService.ts`, `accountService.ts` |
| Hook files | kebab-case with `use-` prefix | `use-color-scheme.ts` |
| Constant files | camelCase | `theme.ts`, `navigation.ts` |
| TypeScript interfaces | PascalCase | `CourierDelivery`, `AccountFormProps` |
| React components | PascalCase | `AccountForm`, `StatusBadge` |
| Functions / handlers | camelCase | `handleAdvanceStatus`, `fetchDeliveries` |
| Constants (values) | UPPER_SNAKE_CASE | `NEXT_STATUS_ID`, `ORDER_STATUS` |
| StyleSheet keys | camelCase | `styles.deliveryRow`, `styles.statusBadge` |

#### Import Order Convention

Within each file, order imports as follows:
1. React and React Native core (`react`, `react-native`)
2. Expo libraries (`expo-router`, `expo-status-bar`)
3. Third-party libraries (`axios`, `@fortawesome/...`)
4. Internal services (`@/services/...`)
5. Internal components (`@/components/...`)
6. Internal constants and hooks (`@/constants/...`, `@/hooks/...`)

```typescript
// ✅ Correct import order
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useAuth } from '@/services/authContext';
import { courierService } from '@/services/courierService';
import { StatusBadge } from '@/components/StatusBadge';
import { OswaldFonts, Colors } from '@/constants/theme';
```

---

## Interfaces (Files Affected)

### Files to Create (New)

| File | Reason |
|------|--------|
| `components/AccountForm.tsx` | Shared account form — reuse requirement |
| `components/StatusBadge.tsx` | Shared status badge — reuse requirement |
| `services/accountService.ts` | Account API calls |
| `services/courierService.ts` | Courier delivery API calls |
| `app/(courier)/_layout.tsx` | Courier tab navigator |
| `app/(courier)/deliveries.tsx` | Courier delivery list |
| `app/(courier)/account.tsx` | Courier account screen |
| `app/(tabs)/account.tsx` | Customer account screen |
| `app/(auth)/account-selection.tsx` | Role picker screen |

### Files to Delete (Dead Code)

See "Files to Delete Before Final Submission" table above.

### Files to Update

| File | Change |
|------|--------|
| `app/(tabs)/_layout.tsx` | Add Account tab; remove hidden profile/explore/index entries |
| `app/_layout.tsx` | Register `(courier)` stack; add role-aware routing |
| `app/(auth)/_layout.tsx` | Register `account-selection` screen |
| `app/(auth)/login.tsx` | Extract `user_id` + `courier_id`; add role routing |
| `services/authContext.tsx` | Add `userId`, `courierId`, `activeRole`, `setActiveRole` |
| `constants/navigation.ts` | Replace `profile` with `account`; add courier routes |

---

## Acceptance Criteria

### Code Reusability
- [ ] `AccountForm` component exists in `components/` and is used by both account screens
- [ ] `StatusBadge` component exists in `components/` and is used by both delivery list and order history
- [ ] No form logic is duplicated between `(tabs)/account.tsx` and `(courier)/account.tsx`
- [ ] No status badge rendering is duplicated between screens
- [ ] All existing Module 13 components remain shared (not copied per-screen)

### Code Cleanliness
- [ ] Zero `console.log()` calls in any committed file
- [ ] Zero unused `import` statements in any file
- [ ] Zero commented-out code blocks in any file
- [ ] Zero `TODO` comments without a corresponding tracked task
- [ ] All comments explain non-obvious logic — no comments restating the code
- [ ] ESLint passes with zero warnings: `npx eslint .`
- [ ] No `any` TypeScript type used anywhere

### Folder Organization
- [ ] `components/` contains only reusable UI components (no screen logic)
- [ ] `services/` contains all API calls and auth logic (no UI)
- [ ] `constants/` contains only static values (no logic)
- [ ] `hooks/` contains only custom React hooks
- [ ] `app/` contains only screen and layout files
- [ ] All Expo-default dead files deleted (see deletion table)
- [ ] `profile.tsx` deleted; replaced by `account.tsx`
- [ ] `explore.tsx` deleted
- [ ] File names match conventions: screens=kebab-case, components=PascalCase, services=camelCase
- [ ] No screen logic lives inside `components/` files
- [ ] No API calls live directly inside screen files — all go through service files

---

## Notes for the AI

### Pre-Commit Checklist

Before committing any file, verify:

```
□ No console.log() in the file
□ No unused imports
□ No commented-out code
□ ESLint passes on this file
□ All new components are in components/ with PascalCase names
□ All new API calls are in services/ not inline in screens
□ Any component used in 2+ places is extracted to components/
```

### Checking for Dead Expo Files

Before deleting a file, confirm it is not imported:
```bash
# Example: confirm hello-wave.tsx is unused
grep -r "hello-wave\|HelloWave" client/app client/components client/services
# If no results → safe to delete
```

### ESLint Command
```bash
cd client && npx eslint . --ext .ts,.tsx
```
Fix all reported issues before committing. The target is zero warnings and zero errors.

### TypeScript Strictness
- No `any` types — use specific interfaces or `unknown` with type guards
- All component props must have explicit interface definitions
- All service function return types must be declared

---

## References

- **Global Specification:** `ai/🤖-ai-spec.md` — Coding Standards & Conventions section
- **Navigation Structure:** `ai/features/🤖-navigation-structure.feature.md` — files to create/delete
- **Account Management:** `ai/features/🤖-account-details.feature.md` — `AccountForm` usage
- **Courier Deliveries:** `ai/features/🤖-courier-deliveries.feature.md` — `StatusBadge` usage
- **Existing components:** `client/components/` — reference before creating new ones
- **ESLint config:** `client/eslint.config.js`

---

**Every file in the final submission must be intentional. If it exists, it is used. If it is not used, it must not exist.**
