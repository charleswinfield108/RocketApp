# 🤖 AI_FEATURE_Header & Footer

> This feature establishes the persistent header navigation visible across the authenticated app.
> The header provides branding (logo) and user action (logout) for consistent UX.

---

## Feature Identity

- **Feature Name:** Header & Footer
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** High (Provides persistent UX and logout access)
- **Dependencies:** Navigation Structure (feature), Authentication (token management)

---

## Feature Goal

Provide a persistent, branded header component that:
1. **Displays the Rocket Food Delivery logo** for brand consistency
2. **Provides logout functionality** for user account management
3. **Appears on all app screens except login** to guide navigation
4. **Maintains consistent styling** across all pages following the wireframe design

The header serves as both a **branding element** and a **user control point** for logging out and returning to authentication.

---

## Feature Scope

### In Scope (Included)

- **Header Component** — Reusable UI component for app header
- **Logo Display** — Rocket Food Delivery logo image/text
- **Logout Button** — Button to trigger logout action
- **Conditional Visibility** — Show/hide based on current route
- **Token Cleanup** — Clear authentication token from AsyncStorage on logout
- **Navigation to Login** — Redirect to login screen after logout
- **Styling** — Match wireframe design and color scheme
- **Props Interface** — Accept navigation callback or route context

### Out of Scope (Excluded)

- Login page header (login has different layout)
- User profile details in header (separate feature)
- Navigation tabs (handled by footer/tab navigation feature)
- Authentication logic (separate feature, header only uses existing token)
- Notifications or badges (not required for MVP)
- Settings or menu dropdowns (out of scope)

---

## Sub-Requirements (Feature Breakdown)

1. **Header Component Structure** — `components/Header.tsx`
   - Functional React component accepting optional props
   - Renders consistently across all pages
   - Uses React Native View, Text, and TouchableOpacity
   - TypeScript interfaces for props

2. **Logo Display**
   - Logo image or text branding
   - Positioned on left side of header
   - Responsive sizing
   - Matches wireframe layout

3. **Logout Button**
   - Positioned on right side of header
   - Clear "Log Out" label or icon
   - Tappable with clear visual feedback
   - Uses FontAwesome icon preferred

4. **Conditional Visibility Logic**
   - Header visible on: Restaurants, Order History, Profile, Restaurant Details
   - Header hidden on: Login screen
   - Logic implemented in screens or root layout
   - Use route name to determine visibility

5. **Logout Action Handler**
   - Remove `authToken` from AsyncStorage
   - Clear authentication state (React Context or similar)
   - Navigate to login screen
   - Prevent back navigation to authenticated screens

6. **Styling & Theme**
   - Use colors from `constants/colors.ts`
   - Apply consistent padding/margins
   - Font: Arial for text
   - Height: proportional to wireframe design
   - Background color matches app theme

---

## User Flow / Logic (High Level)

```
User on Any Authenticated Screen
  ↓
[Header Displayed]
├─ Logo on left (brand identity)
└─ Logout button on right (user action)
  ↓
User Clicks Logout Button
  ↓
[Logout Handler Triggered]
├─ Remove authToken from AsyncStorage
├─ Clear auth state (Context/Redux)
└─ Navigate("/login") or similar
  ↓
[Root Layout Detects No Token]
  ↓
[App Stack Hidden, Auth Stack Shown]
  ↓
[Login Screen Displayed]
  ↓
[Header NOT Visible on Login]
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Components

```
components/
├── Header.tsx                    # Main header component
├── index.ts                      # Export Header
└── Header.styles.ts             # Styling (optional)
```

### Header Component Props

```typescript
interface HeaderProps {
  // Navigation callback or router instance
  onLogout?: () => void;
  // Optional: route context for conditional rendering
  currentRoute?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, currentRoute }) => {
  // Implementation
};
```

### Usage / Integration Points

| Screen | Header Shown | Notes |
|--------|------|-------|
| Login | ❌ No | Different layout |
| Restaurants List | ✅ Yes | Default view |
| Restaurant Menu | ✅ Yes | Detail view |
| Order History | ✅ Yes | Tab view |
| Profile | ✅ Yes | Tab view |
| Order Details Modal | ✅ Yes | Modal overlay |

### No Backend Endpoints Required
- Header is frontend-only
- Logout only clears local storage
- No API call needed for logout

---

## Data Used or Modified

### Data Read (Not Modified)

| Data | Type | Source | Used For |
|------|------|--------|----------|
| `authToken` | string | AsyncStorage | Determines logout necessity |
| `currentRoute` | string | React Navigation | Determines header visibility |

### Data Modified

| Data | Type | Action | Trigger |
|------|------|--------|---------|
| `authToken` | string | **Deleted** from AsyncStorage | Logout button clicked |
| Auth State | object | **Cleared** | After token deleted |

### No Create/Update Operations
- Header does not create or update user data
- Header only **reads** current auth state and **deletes** token on logout

---

## Tech Constraints (Feature-Level)

### Required Technologies
- **Language:** TypeScript
- **UI Framework:** React Native
- **Icons:** FontAwesome (@fortawesome/react-native-fontawesome)
- **Storage:** AsyncStorage (for token removal)
- **Navigation:** expo-router or React Navigation callback

### Styling Rules
- **CSS:** React Native StyleSheet API (no CSS files)
- **Colors:** Use constants from `constants/colors.ts`
- **Fonts:** Arial (default) or Oswald for headings
- **Spacing:** Follow wireframe proportions
- **Icons:** FontAwesome icons only

### Code Constraints
- TypeScript: All props typed with interfaces
- No hardcoded strings (use constants for labels)
- No console.log in production code
- Conditional visibility: Use route name or prop

### No External Libraries
- Do not use third-party header components
- Build from scratch or minimal base
- Use existing design patterns from project

---

## Acceptance Criteria

- [ ] `Header.tsx` component created in `components/`
- [ ] Logo displayed on left side of header
- [ ] "Log Out" button displayed on right side
- [ ] Header visible on all authenticated screens
- [ ] Header NOT visible on login screen
- [ ] Clicking logout removes `authToken` from AsyncStorage
- [ ] Clicking logout clears auth state (if using Context)
- [ ] User redirected to login after logout
- [ ] No back button available to return to authenticated screens
- [ ] Header styling matches wireframe design
- [ ] Header uses colors from `constants/colors.ts`
- [ ] Logo displays correctly (not stretched/distorted)
- [ ] Logout button is tappable with visual feedback
- [ ] No console errors
- [ ] Works on iOS simulator
- [ ] Works on Android simulator

---

## Notes for the AI

### Important Implementation Details

1. **Header Visibility Logic**
   - Header should be hidden on login screen (different root layout)
   - All authenticated screens (Restaurants, History, Profile) should show header
   - Use route detection or conditional rendering in screen components
   - **Option A:** Implement in each screen (imperative)
   - **Option B:** Implement in root layout (declarative, preferred)

2. **Logout Handler**
   - Must execute in correct order:
     1. Remove token from AsyncStorage
     2. Clear auth state (React Context or local state)
     3. Navigate to login screen
   - Do NOT navigate first (auth check might redirect before cleanup)

3. **Component Reusability**
   - Create Header as a standalone, reusable component
   - Pass navigation callbacks as props (not hardcoded)
   - Avoid tight coupling to specific screens

4. **Logo Handling**
   - Logo can be: image file, Expo Image component, or text with icon
   - Store in `assets/images/` if image file
   - Size responsively (use Dimensions API if needed)
   - Do not hardcode dimensions

5. **Button Styling**
   - TouchableOpacity for tap feedback
   - Visual feedback (opacity change on press)
   - Adequate padding for touch target
   - Clear label or icon

### Example Implementation Pattern

```typescript
// components/Header.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export const Header: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('customerId');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Rocket Food Delivery</Text>
      <TouchableOpacity onPress={handleLogout}>
        <FontAwesomeIcon icon={faSignOutAlt} size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};
```

### Common Mistakes to Avoid

- ❌ Hardcoding colors (use constants/colors.ts)
- ❌ Navigating before clearing token (clear first, then navigate)
- ❌ No TypeScript types on props
- ❌ Using console.log in production code
- ❌ Header visible on login screen (should be hidden)
- ❌ Not providing visual feedback on logout button
- ❌ Logo distorted due to fixed dimensions (use flexible sizing)

### Testing Checklist

1. **Visual Testing**
   - [ ] Logo displays correctly
   - [ ] Button is centered and tappable
   - [ ] Colors match wireframe
   - [ ] Spacing looks balanced

2. **Functional Testing**
   - [ ] Logout button is tappable
   - [ ] Token removed from AsyncStorage
   - [ ] User redirected to login
   - [ ] Cannot navigate back to authenticated screens

3. **Cross-Platform Testing**
   - [ ] Displays correctly on iPhone
   - [ ] Displays correctly on Android
   - [ ] Responsive on different screen sizes

---

## References

- **Global Specification:** `./ai/ai-spec.md` (Tech Stack, Coding Standards)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Route structure)
- **Color Constants:** `./constants/colors.ts` (Design theme)
- **Wireframe Template:** `support_materials_13/Design/` (Layout reference)
- **Authentication:** Handled by separate Login feature

---

**This feature provides the persistent UX for user navigation and account management.**
