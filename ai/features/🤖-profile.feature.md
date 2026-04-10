# 🤖 AI_FEATURE_User Profile

> This feature provides the user profile tab where a logged-in customer can view their account information and log out.
> The profile screen is the user's personal area for account management.

---

## Feature Identity

- **Feature Name:** User Profile
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Medium (Supporting feature)
- **Dependencies:** Navigation Structure (tab routing), Header & Footer (logout logic), Authentication (token management)

---

## Feature Goal

Provide a minimal profile interface that:
1. **Displays logged-in user account information** (name, email)
2. **Provides a logout button** for signing out
3. **Clears authentication state** on logout
4. **Redirects to login screen** after logout

The profile screen gives customers access to their account details and a clear logout path.

---

## Feature Scope

### In Scope (Included)

- **Profile Tab Screen** — `app/(tabs)/profile.tsx` (hidden from tab bar via `href: null`)
- **User Info Display** — Logged-in user's name and email
- **Logout Button** — Signs out and redirects to login
- **Token Cleanup** — Removes `authToken` and `customerId` from AsyncStorage
- **Auth Context Integration** — Uses `signOut()` from `AuthContext`

### Out of Scope (Excluded)

- Editing profile details (not in MVP)
- Changing password (not in scope)
- Profile photo upload (not required)
- Notification settings (not in scope)
- Account deletion (not in scope)
- Order statistics/history (shown on Order History tab)

---

## Sub-Requirements (Feature Breakdown)

1. **Profile Screen** — `app/(tabs)/profile.tsx`
   - Displays user account info from auth context
   - Contains logout button
   - Simple, clean layout

2. **User Info Display**
   - Show user's email address (from login response or context)
   - Optional: show customer name if available
   - Styled consistently with app theme

3. **Logout Button**
   - Label: "Log Out" or "Sign Out"
   - Calls `signOut()` from `useAuth()` context
   - After signout, root layout automatically redirects to login
   - No manual navigation needed (auth guard in root layout handles it)

4. **Auth Context Usage**
   - Import `useAuth` from `@/services/authContext`
   - Destructure `signOut`, `authToken`, `customerId`
   - Do NOT manually touch AsyncStorage — use `signOut()` which handles cleanup

---

## User Flow / Logic (High Level)

```
User on Any Tab
  ↓
User Navigates to Profile (if accessible)
  ↓
[Profile Screen Displays]
  ├─ User email shown
  └─ Log Out button visible
  ↓
User Clicks Log Out
  ↓
[signOut() Called from AuthContext]
  ├─ AsyncStorage.removeItem('authToken')
  ├─ AsyncStorage.removeItem('customerId')
  ├─ setIsSignedIn(false)
  └─ setAuthToken(null)
  ↓
[Root Layout Detects isSignedIn = false]
  ↓
[Redirect to /(auth)/login]
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Screen

```
app/(tabs)/profile.tsx
├─ User Info Section
│  ├─ Email display
│  └─ Optional: name display
└─ Log Out Button
```

### No Backend Endpoints Required
- Profile is frontend-only
- Logout only clears local AsyncStorage
- No API call needed for logout

---

## Data Used or Modified

### Data Read

| Data | Source | Used For |
|------|--------|----------|
| `authToken` | AuthContext | Confirming signed-in state |
| `customerId` | AuthContext | Optional: display account ID |

### Data Modified

| Action | What | How |
|--------|------|-----|
| Remove | `authToken` from AsyncStorage | Via `signOut()` |
| Remove | `customerId` from AsyncStorage | Via `signOut()` |
| Update | `isSignedIn` → false | Via `signOut()` |

---

## Tech Constraints (Feature-Level)

### Required Technologies
- **Language:** TypeScript
- **UI Framework:** React Native
- **Auth:** `useAuth()` hook from `@/services/authContext`
- **Navigation:** expo-router (auth guard handles redirect)

### Logout Pattern

```typescript
// CORRECT: use AuthContext signOut
const { signOut } = useAuth();
await signOut();
// Root layout handles redirect automatically — do NOT call router.replace manually

// INCORRECT: do not manually clear AsyncStorage
// await AsyncStorage.removeItem('authToken'); // ← wrong, use signOut() instead
```

---

## Acceptance Criteria

- [ ] `app/(tabs)/profile.tsx` screen exists
- [ ] User email displayed on screen
- [ ] Log Out button visible and tappable
- [ ] Clicking Log Out calls `signOut()` from AuthContext
- [ ] After logout, user is redirected to login screen
- [ ] Back navigation to authenticated screens is not possible after logout
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android simulator

---

## Notes for the AI

### Implementation Pattern

```typescript
// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/services/authContext';

export default function ProfileScreen() {
  const { signOut, authToken } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Root layout (_layout.tsx) detects isSignedIn = false
    // and automatically redirects to /(auth)/login
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Common Mistakes to Avoid

- ❌ Manually calling `AsyncStorage.removeItem()` (use `signOut()` instead)
- ❌ Manually navigating to login after logout (root layout handles it)
- ❌ Not using `useAuth()` hook (do not bypass the context)
- ❌ Leaving any token in state after signout

---

## References

- **Global Specification:** `./ai/🤖-ai-spec.md`
- **Auth Context:** `./client/services/authContext.tsx`
- **Root Layout:** `./client/app/_layout.tsx` (auth guard + redirect logic)
- **Header Feature:** `./ai/features/🤖-header-footer.feature.md` (logout also accessible from header)

---

**This feature gives customers a clear, safe path to sign out of their session.**
