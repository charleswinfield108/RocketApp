# 🤖 AI_FEATURE_Login Page

> This feature provides user authentication through email and password credentials.
> The login page is the entry point for users and handles credential validation with error feedback.

---

## Feature Identity

- **Feature Name:** Login Page
- **Related Area:** Mobile Frontend (React Native + Expo)
- **Priority:** Critical (First user interaction, authentication gateway)
- **Dependencies:** Navigation Structure (auth routing), Header & Footer (not shown on login)

---

## Feature Goal

Provide a secure, user-friendly login interface that:
1. **Accepts email and password credentials** from the user
2. **Validates credentials** against the backend REST API
3. **Provides clear error feedback** when login fails
4. **Stores JWT tokens** upon successful login
5. **Redirects to the authenticated app** after successful login
6. **Maintains consistent UI** matching the wireframe design

The login page is the **authentication gateway** that ensures only authorized users access the Rocket Food Delivery app.

---

## Feature Scope

### In Scope (Included)

- **Login Screen Component** — `app/(auth)/login.tsx`
- **Email Input Field** — Validated email format
- **Password Input Field** — Masked/hidden text input
- **Login Button** — Submit credentials to backend
- **Error Message Display** — Shows feedback above login button
- **API Integration** — POST request to backend login endpoint
- **JWT Token Storage** — Store token in AsyncStorage after successful login
- **Navigation on Success** — Redirect to Restaurants tab
- **Loading State** — Visual feedback during API request
- **Form Validation** — Client-side email/password format checks

### Out of Scope (Excluded)

- User registration (login only, no signup flow)
- Password recovery/reset (out of scope for MVP)
- Social login (email/password only)
- Multi-factor authentication (not in scope)
- Remember me / auto-login (not required)
- Biometric authentication (not in scope)
- Header display on login page (handled by navigation)

---

## Sub-Requirements (Feature Breakdown)

1. **Login Screen Layout** — `app/(auth)/login.tsx`
   - Centered form with email and password inputs
   - Login button below inputs
   - Error message area above button (initially hidden)
   - Match wireframe design exactly
   - Responsive to different screen sizes

2. **Email Input Field**
   - Text input for email address
   - Placeholder: "Enter your email"
   - Keyboard type: email-address
   - Client-side validation: valid email format
   - Clear on failed login (optional)

3. **Password Input Field**
   - Text input for password
   - Placeholder: "Enter your password"
   - secureTextEntry: true (masked input)
   - No character limit (backend validates)
   - Clear on failed login (optional)

4. **Login Button**
   - Label: "Login" or "Sign In"
   - Disabled during API request (loading state)
   - Visual feedback on press
   - Uses app theme colors

5. **Error Message Display**
   - Positioned above login button
   - Hidden when no error
   - Shows error text from API response
   - Red/error color styling
   - Readable and user-friendly
   - Clear/dismiss on retry

6. **API Integration**
   - POST request to `/api/v1/login` or `/auth/login`
   - Body: `{ email, password }`
   - Response: `{ token: "JWT_TOKEN", user: { id, email, ... } }`
   - Error response: `{ error: "Invalid credentials" }` or similar

7. **Token Storage**
   - Store JWT token in AsyncStorage
   - Key: `authToken`
   - Persist for subsequent app launches
   - Retrieve on app startup for auth check

8. **Navigation & Redirect**
   - On success: navigate to `/(tabs)/index` (Restaurants tab)
   - On failure: show error message, keep form
   - No back button after successful login

9. **Loading State**
   - Show loading indicator during API request
   - Disable button while loading
   - Optional: disable inputs while loading

10. **Form Reset**
    - Clear inputs on mounted (fresh login page)
    - Optional: clear inputs after failed attempt

---

## User Flow / Logic (High Level)

```
User Launches App
  ↓
[Root Layout Detects No AuthToken]
  ↓
[Auth Stack Shown → Login Screen]
  ↓
User Enters Email & Password
  ↓
User Clicks Login Button
  ↓
[Client-Side Validation]
├─ IF email format invalid → Show error inline (optional)
└─ IF password empty → Show error inline (optional)
  ↓
[Loading State Active]
├─ Button disabled
└─ Optional: loading spinner shown
  ↓
[POST /api/v1/login with credentials]
  ↓
[Backend Response]
  ├─ IF success (HTTP 200)
  │   ├─ Response contains JWT token
  │   ├─ Store token in AsyncStorage (key: authToken)
  │   ├─ Set auth state (React Context)
  │   ├─ Navigate to /(tabs)/index (Restaurants)
  │   └─ Header becomes visible
  │
  └─ IF failure (HTTP 401/400)
      ├─ Response contains error message
      ├─ Extract error text
      ├─ Display error above login button
      ├─ Loading state ends
      ├─ Button re-enabled
      └─ User can retry
```

---

## Interfaces (Pages, Endpoints, Screens)

### Frontend Screen

```
app/(auth)/login.tsx
├─ Email Input
├─ Password Input
├─ Error Message Container (conditional)
├─ Login Button
└─ Optional: Loading Indicator
```

### Component Structure

```typescript
// app/(auth)/login.tsx
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    // Validation
    // API call
    // Token storage
    // Navigation
  };

  return (
    <View style={styles.container}>
      {/* Error message */}
      {error && <Text style={styles.error}>{error}</Text>}
      {/* Input fields */}
      {/* Login button */}
    </View>
  );
}
```

### Backend API Endpoint

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/v1/auth/login` or `/api/v1/users/login` | Authenticate user and return JWT token |

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (HTTP 200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (HTTP 401/400):**
```json
{
  "error": "Invalid email or password",
  "message": "Authentication failed"
}
```

---

## Data Used or Modified

### Form State (Local)

| State | Type | Initial | Updated On |
|-------|------|---------|------------|
| `email` | string | `""` | User type in email field |
| `password` | string | `""` | User type in password field |
| `error` | string \| null | `null` | API error response |
| `loading` | boolean | `false` | During API request |

### Storage (Persistent)

| Key | Type | Action | Value |
|-----|------|--------|-------|
| `authToken` | string | **Write** on success | JWT token from API |
| `authToken` | string | **Read** on app startup | Check if user logged in |
| `authToken` | string | **Delete** on logout | Clear on user logout |

### API Request/Response

| Direction | Data | Validation |
|-----------|------|-----------|
| **Request** | { email, password } | Email format, password not empty |
| **Response** | { token, user } | Token is valid JWT, user object complete |

### Auth State (Context/Global)

| State | Type | Updated By | Used By |
|-------|------|-----------|---------|
| `isAuthenticated` | boolean | After successful login | Root layout (nav control) |
| `user` | object | Login response | Profile screen (optional) |

---

## Tech Constraints (Feature-Level)

### Required Technologies

- **Language:** TypeScript
- **UI Framework:** React Native
- **HTTP Client:** Axios (configured with interceptors)
- **Storage:** AsyncStorage (for JWT token)
- **Form State:** React useState (or React Hook Form)
- **Navigation:** expo-router

### Validation Rules

**Email:**
- Required field
- Valid email format (regex or library)
- No leading/trailing whitespace

**Password:**
- Required field
- Minimum length: 6 characters (or per API spec)
- No validation on frontend (backend rules)

**Error Messages:**
- Display backend error text when provided
- Fallback message if no error text: "Login failed. Please try again."
- Do not expose sensitive error details

### API Integration Rules

- Base URL from `.env` (configurable)
- Use bearer token for subsequent requests (not for login)
- Timeout: 30 seconds (or per axios config)
- Retry logic: Not needed for login (user can retry manually)

### Styling Constraints

- Use StyleSheet API (React Native, no CSS)
- Colors from `constants/colors.ts`
- Font: Arial (default) or Oswald (headings)
- Match wireframe design exactly
- Responsive layout (no hardcoded dimensions)

### Security Rules

- ✅ Password field masked (secureTextEntry: true)
- ✅ No password logging
- ✅ Token stored securely (AsyncStorage, best practice)
- ✅ No hardcoded credentials
- ✅ HTTPS required for API calls

---

## Acceptance Criteria

- [ ] `app/(auth)/login.tsx` screen created
- [ ] Email input field renders and accepts input
- [ ] Password input field renders and masks text
- [ ] Login button submits form data
- [ ] Client-side validation works (email format check)
- [ ] API POST request sent to correct endpoint
- [ ] JWT token received on successful login
- [ ] Token stored in AsyncStorage under key `authToken`
- [ ] Error message displays when credentials incorrect
- [ ] Error message positioned above login button
- [ ] Error message clears on retry or new input
- [ ] Loading state visible during API request
- [ ] Button disabled during API request
- [ ] User redirected to Restaurants tab on success
- [ ] No header/footer visible on login screen
- [ ] Form styling matches wireframe design
- [ ] Responsive on iPhone screens
- [ ] Responsive on Android screens
- [ ] No console errors
- [ ] Token authentication works for subsequent API calls

---

## Notes for the AI

### Important Implementation Details

1. **Error Message Display**
   - Error should be shown above login button
   - Extract message from API response (`response.data.error` or `response.data.message`)
   - If no error text provided by API, use fallback: "Login failed. Please try again."
   - Display in red (use error color from constants)
   - Use Text component (not alert dialog)

2. **Token Storage & Auth Check**
   - After successful login, store token: `await AsyncStorage.setItem('authToken', token)`
   - On app startup, check token: `const token = await AsyncStorage.getItem('authToken')`
   - If token exists, root layout should show app stack instead of auth stack
   - This is handled by root layout, not this feature (reference: navigation-structure feature)

3. **API Integration**
   - Use centralized axios instance from `services/api.ts`
   - Set base URL in `.env` file
   - Example: `BASE_API_URL=http://localhost:8080/api/v1`
   - Login endpoint: `/auth/login` (or `/users/login` depending on backend)
   - **Verify correct endpoint** with backend documentation

4. **Form State Management**
   - Simple: Use React useState for email, password, error, loading
   - Advanced: Use React Hook Form for larger forms
   - For MVP, useState is sufficient
   - Clear inputs after navigation (optional, for security)

5. **Loading Indicator**
   - Show activity indicator during API call
   - Disable button while loading
   - Optional: Disable inputs while loading
   - Use `ActivityIndicator` from React Native

6. **Client-Side Validation**
   - Email: Check format before sending (optional, backend validates)
   - Password: Only check non-empty (optional)
   - If invalid, show inline error or prevent button click
   - Backend always validates, frontend is just UX improvement

### Example Implementation Pattern

```typescript
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token } = response.data;

      // Store token
      await AsyncStorage.setItem('authToken', token);

      // Navigate to app
      router.replace('/(tabs)/index');
    } catch (err: any) {
      // Extract error message
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo or title */}
      
      {/* Error message */}
      {error && <Text style={styles.error}>{error}</Text>}

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
      />

      {/* Password input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      {/* Login button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
```

### Common Mistakes to Avoid

- ❌ Storing password instead of token (store token, never password)
- ❌ Not masking password input (use secureTextEntry: true)
- ❌ Hardcoding API endpoint (use .env)
- ❌ Showing generic "Invalid credentials" without context
- ❌ Not clearing error on retry
- ❌ Not disabling button during loading (causes duplicate requests)
- ❌ Logging token or password (security risk)
- ❌ No timeout for API request (set in axios config)
- ❌ Case-sensitive email (backend should handle, but consider lowercasing)

### Testing Checklist

1. **UI Rendering**
   - [ ] Email input visible
   - [ ] Password input visible
   - [ ] Login button visible
   - [ ] Styling matches wireframe

2. **Functionality**
   - [ ] Can type in email field
   - [ ] Can type in password field
   - [ ] Password field shows masked dots/asterisks
   - [ ] Login button is tappable

3. **API Integration**
   - [ ] Correct endpoint called (verify in network logs)
   - [ ] Correct request body sent
   - [ ] Token received and stored in AsyncStorage
   - [ ] Headers updated for subsequent requests

4. **Error Handling**
   - [ ] Wrong email shows error
   - [ ] Wrong password shows error
   - [ ] Network error shows error message
   - [ ] Error message displays above button
   - [ ] Error clears on new login attempt

5. **Success Flow**
   - [ ] Correct credentials → Token stored
   - [ ] User redirected to Restaurants tab
   - [ ] Header becomes visible
   - [ ] No way to navigate back to login

6. **Cross-Platform**
   - [ ] Works on iOS simulator
   - [ ] Works on Android simulator
   - [ ] Responsive on different screen sizes

---

## References

- **Global Specification:** `./ai/ai-spec.md` (API auth, tech stack, security)
- **Navigation Feature:** `./ai/features/navigation-structure.feature.md` (Auth routing)
- **Header Feature:** `./ai/features/header-footer.feature.md` (Not shown on login)
- **API Service:** `./client/services/api.ts` (Axios setup)
- **Backend API Docs:** From Module 12 (API endpoints reference)
- **Wireframe Design:** `support_materials_13/Design/` (Login screen layout)
- **Environment Config:** `.env` file (API base URL)

---

**This feature is the authentication entry point. Successful login enables all other features.**
