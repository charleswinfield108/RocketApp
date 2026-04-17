# 🤖 AI_FEATURE_Cross-Platform UI Consistency

> This feature ensures that every screen in RocketApp renders identically and functions
> correctly on both iOS (iPhone) and Android. Platform differences in safe areas,
> keyboard behaviour, shadows, and status bar handling must be resolved so that the
> user experience is indistinguishable across devices.

---

## Feature Identity

- **Feature Name:** Cross-Platform UI Consistency
- **Module:** 14 (applies to all screens — Module 13 and 14)
- **Related Area:** Mobile Frontend — all screens and shared components
- **Priority:** Required (grading criterion — must be verified on both platforms)
- **Dependencies:**
  - UI Standards (`🤖-ui.feature.md`) — font loading, tab bar dimensions
  - Navigation Structure (`🤖-navigation-structure.feature.md`) — root layout, SafeAreaProvider
  - All screen feature specs — each screen must be verified

---

## Feature Scope

### In Scope (Included)

- Safe area insets — iOS notch/home indicator, Android status bar
- Tab bar height and padding per platform
- Keyboard avoidance on screens with text inputs
- Shadow rendering (iOS shadow props vs Android `elevation`)
- `StatusBar` configuration
- `Platform.OS` conditional usage rules
- Touch target sizing (minimum 44×44 pt)
- Font rendering — Oswald on both platforms
- `ScrollView` behaviour on both platforms

### Out of Scope (Excluded)

- Dark mode (not in scope for this module)
- Tablet / iPad layouts
- Platform-specific animations
- Push notification permission dialogs
- App store submission requirements

---

## Client Requirements (Official)

| Sub-Requirement | Description |
|-----------------|-------------|
| **Cross-Platform UI** | UI design looks identical and is functional on both iPhone and Android, ensuring consistent UX across devices. |

---

## Sub-Requirements (Feature Breakdown)

### 1. Safe Area Handling

iOS devices have a notch (or Dynamic Island) at the top and a home indicator bar at the bottom. Android devices have a status bar at the top. Without proper safe area handling, content is obscured by these elements.

**Root layout (already implemented):**
```typescript
// app/_layout.tsx — wraps the entire app
import { SafeAreaProvider } from 'react-native-safe-area-context';

return (
  <SafeAreaProvider>
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  </SafeAreaProvider>
);
```

**Per-screen — use `SafeAreaView` on screens without a tab bar:**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Login, account selection — no tab bar, so safe area must be applied manually
export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      {/* screen content */}
    </SafeAreaView>
  );
}
```

**Screens inside the tab navigator** — the tab bar itself handles bottom safe area insets. Top insets are handled by the `Header` component or screen padding. Do not double-apply safe area on these screens.

---

### 2. Tab Bar Dimensions

The tab bar must be taller on iOS to account for the home indicator.

**Pattern (already implemented in `(tabs)/_layout.tsx` — replicate for `(courier)/_layout.tsx`):**
```typescript
import { Platform } from 'react-native';

tabBarStyle: {
  backgroundColor: '#FFFFFF',
  borderTopWidth: 1,
  borderTopColor: '#E0E0E0',
  height: Platform.OS === 'ios' ? 84 : 64,
  paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  paddingTop: 8,
  elevation: 8,            // Android shadow
  shadowColor: '#000000',  // iOS shadow
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
}
```

| Property | iOS value | Android value | Reason |
|----------|-----------|---------------|--------|
| `height` | `84` | `64` | Home indicator requires extra clearance on iOS |
| `paddingBottom` | `28` | `8` | Pushes tab labels above the home indicator |
| `elevation` | ignored | `8` | Android shadow system |
| `shadowColor/opacity` | active | ignored | iOS shadow system |

---

### 3. Keyboard Avoidance

On screens with text inputs, the software keyboard pushes up from the bottom and can cover input fields — especially on smaller devices. `KeyboardAvoidingView` corrects this.

**Required on:**
- `app/(auth)/login.tsx`
- `app/(tabs)/account.tsx` (customer account form)
- `app/(courier)/account.tsx` (courier account form)

**Pattern:**
```typescript
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

export default function AccountScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* form fields */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

**Why the behavior differs:**
- `'padding'` (iOS): adds padding below the content, pushing it upward
- `'height'` (Android): shrinks the view's height to fit above the keyboard

`keyboardShouldPersistTaps="handled"` ensures that tapping outside an input dismisses the keyboard correctly on both platforms.

---

### 4. Shadow Rendering

React Native shadow props (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) only work on **iOS**. Android uses the `elevation` prop instead.

**Rule:** Any component that needs a drop shadow must set **both**:

```typescript
// ✅ Cross-platform shadow — works on both iOS and Android
const cardShadow = {
  // iOS
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
  // Android
  elevation: 3,
};
```

**Used on:** `RestaurantCard`, tab bar, `Header`, modals, `ConfirmationModal`, `OrderHistoryDetailModal`.

---

### 5. StatusBar Configuration

The status bar (time, battery, signal icons) sits at the top of the screen. Its style and background must be set explicitly so it doesn't conflict with screen backgrounds.

**Current root layout (maintain this):**
```typescript
import { StatusBar } from 'expo-status-bar';

// Inside RootLayoutNav return:
<StatusBar style="dark" backgroundColor="transparent" translucent />
```

- `style="dark"` — dark icons (for light backgrounds)
- `backgroundColor="transparent"` — no opaque bar overlay
- `translucent` — content renders under the status bar (safe area insets compensate)

**Do not override `StatusBar` inside individual screens** — the root layout setting applies globally. Only override if a specific screen requires a different style (e.g., a dark-background screen needing `style="light"`).

---

### 6. Touch Target Sizing

Per Apple HIG and Android Material Design guidelines, all tappable elements must be at least **44×44 points** in size. Smaller targets are frequently missed on touchscreens.

**Rule:** Any `TouchableOpacity` or `Pressable` must meet this minimum:

```typescript
// ✅ Ensure minimum hit area
<TouchableOpacity
  style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
  onPress={handlePress}
>
  <FontAwesomeIcon icon={faUser} size={20} />
</TouchableOpacity>
```

**Most at risk:** icon-only buttons, close (×) buttons on modals, checkbox touch areas, stepper +/− buttons.

---

### 7. Font Rendering

Oswald is loaded via `@expo-google-fonts/oswald` and renders correctly on both platforms. No platform-specific font configuration is needed.

**Verify:**
- Oswald displays at all three weights (Regular 400, SemiBold 600, Bold 700) on both platforms
- System font (Arial on iOS / Roboto on Android) renders correctly for body text — no explicit `fontFamily` needed

**Do not** set `fontFamily` on body text, form inputs, or helper text. The system default is correct on both platforms and will differ between iOS and Android by design.

---

### 8. ScrollView Behaviour

`ScrollView` behaves slightly differently across platforms. These settings produce consistent behaviour:

```typescript
<ScrollView
  contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
>
```

| Prop | Purpose |
|------|---------|
| `flexGrow: 1` | Short content still fills the screen on both platforms |
| `paddingBottom: 24` | Prevents last item from being obscured by the tab bar |
| `showsVerticalScrollIndicator={false}` | Hides scrollbar (iOS shows it by default; Android does not) |
| `keyboardShouldPersistTaps="handled"` | Tapping a non-input area dismisses keyboard consistently |

---

## Platform.OS Usage Rules

Use `Platform.OS` only for **genuine platform differences** in layout or behaviour. Do not use it for styling preferences.

```typescript
// ✅ Correct — layout differs between platforms
behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
height: Platform.OS === 'ios' ? 84 : 64

// ✅ Correct — platform-specific shadow system
elevation: Platform.OS === 'android' ? 4 : 0

// ❌ Wrong — aesthetic preference, not a platform requirement
color: Platform.OS === 'ios' ? '#DA583B' : '#DA583B'
```

---

## Files Affected

| File | Cross-Platform Concern |
|------|------------------------|
| `app/_layout.tsx` | `SafeAreaProvider`, `StatusBar`, font loading gate |
| `app/(auth)/login.tsx` | `SafeAreaView`, `KeyboardAvoidingView` |
| `app/(auth)/account-selection.tsx` | `SafeAreaView` |
| `app/(tabs)/_layout.tsx` | `Platform.OS` tab bar height |
| `app/(courier)/_layout.tsx` | `Platform.OS` tab bar height (must match customer) |
| `app/(tabs)/account.tsx` | `KeyboardAvoidingView` |
| `app/(courier)/account.tsx` | `KeyboardAvoidingView` |
| `components/AccountForm.tsx` | `KeyboardAvoidingView` (if form logic lives here) |
| `components/Header.tsx` | Safe area top inset, shadow |
| `components/RestaurantCard.tsx` | Cross-platform shadow |
| `components/ConfirmationModal.tsx` | Cross-platform shadow, `ScrollView` |
| `components/OrderHistoryDetailModal.tsx` | Cross-platform shadow, `ScrollView` |

---

## Acceptance Criteria

### Safe Area
- [ ] No content obscured by iOS notch or Dynamic Island on any screen
- [ ] No content obscured by Android status bar on any screen
- [ ] Home indicator area is clear on iPhone (tab bar padding applied)
- [ ] `SafeAreaProvider` wraps the entire app in root layout

### Tab Bar
- [ ] Tab bar height is `84px` on iOS, `64px` on Android
- [ ] Tab bar labels and icons are fully visible on both platforms
- [ ] Tab bar shadow renders on both platforms (elevation + shadow props)

### Keyboard
- [ ] Login form fields remain visible when keyboard opens on both platforms
- [ ] Customer account form fields remain visible when keyboard opens
- [ ] Courier account form fields remain visible when keyboard opens
- [ ] Tapping outside an input dismisses the keyboard on both platforms

### Shadows
- [ ] Cards (`RestaurantCard`) have visible shadow on both platforms
- [ ] Modals have visible shadow/elevation on both platforms
- [ ] Header has visible separator/shadow on both platforms

### StatusBar
- [ ] Status bar icons are dark (readable) on all light-background screens
- [ ] No opaque status bar overlay covers screen content

### Touch Targets
- [ ] All icon buttons are at least 44×44 pt
- [ ] Modal close (×) button is at least 44×44 pt
- [ ] Stepper +/− buttons are at least 44×44 pt
- [ ] Checkbox touch areas are at least 44×44 pt

### Fonts
- [ ] Oswald renders at all three weights on iOS
- [ ] Oswald renders at all three weights on Android
- [ ] Body text uses system default on both platforms (no explicit fontFamily)

### Scroll
- [ ] All scrollable screens scroll on both platforms
- [ ] No content cut off on small-screen devices (iPhone SE, budget Android)
- [ ] No scrollbar visible on any screen

---

## Notes for the AI

### Cross-Platform Verification Checklist

Before marking any screen complete, verify the following apply on **both** iOS and Android:

```
□ Safe area insets respected (no clipping at top or bottom)
□ KeyboardAvoidingView applied if screen has any TextInput
□ ScrollView has flexGrow: 1 + paddingBottom: 24
□ Any shadow uses both shadowColor/shadowOpacity AND elevation
□ Touch targets are ≥ 44×44 pt
□ Oswald font renders at the correct weight
□ StatusBar style not overridden from the root layout default
```

### Common Mistakes to Avoid

- ❌ Using `SafeAreaView` from `react-native` — use `react-native-safe-area-context` instead (more reliable)
- ❌ Setting `behavior="padding"` on Android with `KeyboardAvoidingView` — use `'height'` on Android
- ❌ Applying only iOS shadow props without `elevation` — cards will be flat on Android
- ❌ Applying only `elevation` without iOS shadow props — cards will be flat on iOS
- ❌ Forgetting `keyboardShouldPersistTaps="handled"` on forms — keyboard dismiss is unreliable without it
- ❌ Hardcoding `paddingTop: 44` for the notch — insets vary by device; always use `SafeAreaView` or `useSafeAreaInsets()`
- ❌ Double-applying safe area on tab screens — the tab navigator handles bottom insets; adding `SafeAreaView` again creates extra whitespace

---

## References

- **UI Standards:** `ai/features/🤖-ui.feature.md` — tab bar dimensions, font rules, ScrollView pattern
- **Navigation Structure:** `ai/features/🤖-navigation-structure.feature.md` — root layout, SafeAreaProvider
- **Global Spec:** `ai/🤖-ai-spec.md` — cross-platform requirements section
- **Root Layout (existing):** `client/app/_layout.tsx` — SafeAreaProvider, StatusBar, font gate
- **Customer Tab Layout (existing):** `client/app/(tabs)/_layout.tsx` — Platform.OS tab bar pattern
- **React Native Docs:** Platform-specific code, SafeAreaView, KeyboardAvoidingView
- **Expo Docs:** `expo-status-bar`, `react-native-safe-area-context`

---

**Every screen ships on two platforms. A feature is not complete until it has been verified on both iOS and Android.**
