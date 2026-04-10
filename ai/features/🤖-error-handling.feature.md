# 🤖 AI_FEATURE_Error Handling & UX

> This feature defines the consistent error handling patterns, loading states, and empty states used across the entire RocketApp.
> It ensures every async operation provides clear feedback and every failure has a recovery path.

---

## Feature Identity

- **Feature Name:** Error Handling & UX
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** High (Affects every screen)
- **Dependencies:** All other features (cross-cutting concern)

---

## Feature Goal

Establish consistent UX patterns that:
1. **Show loading feedback** during every async operation
2. **Display clear error messages** when API calls fail
3. **Provide retry options** for recoverable failures
4. **Handle empty states gracefully** (no restaurants, no orders)
5. **Handle 401 Unauthorized** by clearing the session and redirecting to login
6. **Never leave users stuck** with a blank screen or no action path

Error handling is a **cross-cutting concern** — these patterns apply to every screen that makes API calls.

---

## Feature Scope

### In Scope (Included)

- **Loading State Pattern** — ActivityIndicator while fetch is in progress
- **Error State Pattern** — Error message + Retry button on fetch failure
- **Empty State Pattern** — Friendly message when list returns 0 items
- **Network Error Handling** — Specific message for no-connection errors
- **401 Handling** — Automatic logout and redirect to login
- **Button Disabled States** — Buttons disabled during loading/processing

### Out of Scope (Excluded)

- Global error boundary (React class component — optional advanced pattern)
- Crash reporting / Sentry integration (not required)
- Offline mode / local cache (not in scope)
- Toast notifications (inline messages preferred)
- Retry with exponential backoff (user-triggered retry only)

---

## Sub-Requirements (Feature Breakdown)

### 1. Loading State Pattern

Every screen that fetches data must:
- Initialize `loading` state as `true`
- Show `<ActivityIndicator size="large" />` while `loading === true`
- Hide the data list while loading
- Set `loading = false` in the `finally` block

```typescript
const [loading, setLoading] = useState(true);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (err) {
    handleError(err);
  } finally {
    setLoading(false); // Always runs, even on error
  }
};
```

---

### 2. Error State Pattern

Every screen that fetches data must:
- Initialize `error` state as `null`
- Set `error` with a user-friendly message on catch
- Display the error message on screen (not just in console)
- Show a **Retry** button that re-calls the fetch function

```typescript
const [error, setError] = useState<string | null>(null);

// In catch block:
catch (err: any) {
  if (err.response?.status === 401) {
    await signOut(); // Auth context handles redirect
    return;
  }
  const msg = err.response?.data?.error
    || err.response?.data?.message
    || 'Something went wrong. Please try again.';
  setError(msg);
}
```

**Error display component:**
```tsx
{error && (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{error}</Text>
    <TouchableOpacity onPress={retryFunction} style={styles.retryButton}>
      <Text style={styles.retryText}>Retry</Text>
    </TouchableOpacity>
  </View>
)}
```

---

### 3. Network Error Detection

Distinguish between server errors and no-connection errors:

```typescript
catch (err: any) {
  if (err.response) {
    // Server responded with error status
    const msg = err.response.data?.error || 'Request failed';
    setError(msg);
  } else if (err.request) {
    // Request was made but no response received
    setError('Network error. Please check your connection and try again.');
  } else {
    // Something else went wrong
    setError('An unexpected error occurred. Please try again.');
  }
}
```

---

### 4. 401 Unauthorized — Auto Logout

If any API call returns HTTP 401, the session has expired:
1. Call `signOut()` from `useAuth()`
2. Root layout detects `isSignedIn = false`
3. Automatically redirects to login screen

```typescript
import { useAuth } from '@/services/authContext';

const { signOut } = useAuth();

catch (err: any) {
  if (err.response?.status === 401) {
    await signOut(); // Clears token, root layout redirects
    return;
  }
  // Handle other errors normally
}
```

---

### 5. Empty State Pattern

When an API call succeeds but returns an empty list:

```tsx
if (!loading && !error && data.length === 0) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No items yet</Text>
      <Text style={styles.emptySubtext}>Context-specific helpful message.</Text>
    </View>
  );
}
```

**Per-screen empty state messages:**

| Screen | Message |
|--------|---------|
| Restaurant List | "No restaurants available right now." |
| Restaurant List (filtered) | "No restaurants match your filters. Try adjusting them." |
| Order History | "No orders yet. Start by ordering from a restaurant!" |

---

### 6. Button Disabled States

Buttons must be disabled during any in-progress operation:

```tsx
<TouchableOpacity
  onPress={handleSubmit}
  disabled={loading}
  style={[styles.button, loading && styles.buttonDisabled]}
>
  {loading
    ? <ActivityIndicator color="#fff" />
    : <Text style={styles.buttonText}>Submit</Text>
  }
</TouchableOpacity>
```

**Disabled state visual rules:**
- Reduce opacity to 0.6 or 0.7
- Or change background to gray (`#9CA3AF`)
- Must be visually obvious to the user

---

## Consistent State Machine Pattern

Every screen follows the same state rendering order:

```typescript
// 1. Loading
if (loading) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

// 2. Error
if (error) {
  return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity onPress={retryFn} style={styles.retryButton}>
        <Text>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// 3. Empty
if (data.length === 0) {
  return (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No items found.</Text>
    </View>
  );
}

// 4. Success — render the actual content
return <DataList data={data} />;
```

---

## Interfaces (Pages, Endpoints, Screens)

### Applied On These Screens

| Screen | Loading | Error + Retry | Empty State |
|--------|---------|--------------|-------------|
| Restaurant List | ✅ | ✅ | ✅ (filtered empty) |
| Restaurant Menu | ✅ | ✅ | N/A |
| Menu Modal (Confirm) | ✅ (processing) | ✅ (retry) | N/A |
| Order History | ✅ | ✅ | ✅ |
| Order History Modal | ✅ | ✅ | N/A |

---

## Tech Constraints (Feature-Level)

### Required Technologies
- **UI:** `ActivityIndicator` from React Native
- **Auth:** `useAuth()` from `@/services/authContext`
- **Error extraction:** `err.response?.data?.error || fallback`

### Rules

- ✅ Always use a `finally` block to clear `loading`
- ✅ Always provide a Retry button when showing an error
- ✅ Always check for 401 and call `signOut()` — never leave an expired session active
- ✅ Always clear `error` state before retrying
- ❌ Never use `console.log` or `alert()` for user-facing errors
- ❌ Never swallow errors silently
- ❌ Never show raw JavaScript error objects to users

---

## Acceptance Criteria

- [ ] All API screens show `ActivityIndicator` while loading
- [ ] All API screens show user-friendly error message on failure
- [ ] All error states include a Retry button
- [ ] Retry button clears error and re-fetches
- [ ] Network errors show "Network error. Please check your connection..." message
- [ ] 401 responses trigger `signOut()` and redirect to login
- [ ] Restaurant list shows empty state when filters return 0 results
- [ ] Order history shows empty state when no orders exist
- [ ] All buttons are disabled during loading/processing
- [ ] Disabled buttons have clear visual indication (opacity/color)
- [ ] Loading state always clears (even when error occurs)
- [ ] No screen gets stuck in a permanent loading state

---

## Notes for the AI

### Centralized Error Handler (Optional Utility)

```typescript
// services/errorHandler.ts
import { useAuth } from '@/services/authContext';

export const extractErrorMessage = (err: any): string => {
  if (err.response?.status === 401) return '__AUTH_EXPIRED__'; // Caller handles
  if (err.response?.data?.error) return err.response.data.error;
  if (err.response?.data?.message) return err.response.data.message;
  if (err.request) return 'Network error. Please check your connection.';
  return 'Something went wrong. Please try again.';
};
```

### Common Mistakes to Avoid

- ❌ Putting `setLoading(false)` only in the `try` block — if an error occurs, loading never clears
- ❌ Not providing a Retry button — users get stuck on error screens
- ❌ Showing raw API error JSON to users (extract `.error` or `.message`)
- ❌ Ignoring 401 errors (session remains "active" with an invalid token)
- ❌ Using `alert()` for errors (native alerts are jarring; use inline Text components)
- ❌ Not resetting `error` state before retrying (old error stays visible during retry)

---

## References

- **Global Specification:** `./ai/🤖-ai-spec.md` (Definition of Done — UX section)
- **Auth Context:** `./client/services/authContext.tsx` (`signOut` function)
- **API Service:** `./client/services/api.ts` (Axios instance + interceptors)
- **Restaurant List:** `./ai/features/🤖-restaurant-list-page.feature.md`
- **Order History:** `./ai/features/🤖-order-history-page.feature.md`

---

**This feature is a cross-cutting standard — apply these patterns consistently on every screen that performs async operations.**
