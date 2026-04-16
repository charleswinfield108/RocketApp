# CONCEPTS.md — Three Challenging Concepts

---

## Concept 1: WSL2 Network Configuration for Physical Device Testing

### Purpose in the Project
To run and test the React Native app on a physical iPhone using Expo Go, the
development server running inside WSL2 needed to be reachable from the phone
over the local Wi-Fi network.

### Why It Was Challenging
WSL2 (Windows Subsystem for Linux) runs inside a virtualised network with its
own internal IP address (e.g., 192.168.86.x). When Expo starts, the QR code it
generates contains that WSL2 IP — but the phone has no route to it. The phone
can only reach the Windows host's Wi-Fi IP (e.g., 192.168.1.5).

Additionally, Expo's built-in `--tunnel` flag (which normally solves this via
ngrok) is broken with ngrok v3 due to an API format change, producing the error:
`Cannot read properties of undefined (reading 'body')`.

The solution required three steps:
1. Adding a Windows Firewall inbound rule to allow traffic on port 8081.
2. Setting up a Windows port proxy (`netsh portproxy`) to forward
   192.168.1.5:8081 → WSL2 IP:8081.
3. Starting Expo with the environment variable
   `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.5` so the QR code contains the
   correct Windows Wi-Fi IP that the phone can actually reach.

### Usage Location
- `README.md` — "Running on a Physical Device from WSL2" section
- `client/.env` — `EXPO_PUBLIC_API_URL` pointing to the server
- Terminal command: `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.5 npx expo start`

---

## Concept 2: Filtering with Human-Readable Labels vs. Numeric Data Values

### Purpose in the Project
The restaurant list screen allows users to filter restaurants by star rating
and price range using dropdown menus. The dropdowns display symbols (★★★★ 4+,
$$) while the underlying API data uses plain integers (rating: 4, price_range: 2).

### Why It Was Challenging
Two separate problems had to be solved together:

**Problem 1 — Label alignment:** The initial implementation had the star count
inverted — "★ 4+" showed one star for a four-star filter, and "★★★ 2+" showed
three stars for a two-star filter. The display symbols did not match the numeric
values they represented, which was confusing. The fix was to ensure the number
of star characters always matched the filter value (★★★★ for 4, ★★★ for 3, etc.)

**Problem 2 — Filter operator:** Rating and price use different comparison
operators for a reason. Rating uses `>=` (greater than or equal) because the
user selecting "3 stars" wants to see all restaurants rated 3 or higher — it is
a minimum threshold. Price uses `===` (strict equality) because price range is
a category — selecting "$$" should show only $$ restaurants, not $$$ as well.
Getting this logic wrong produced incorrect filter results.

### Usage Location
- `client/components/FilterBar.tsx` — lines 22–47 (ratingOptions, priceOptions,
  getRatingLabel, getPriceLabel)
- `client/app/(tabs)/(restaurant)/index.tsx` — lines 64–78 (filter useEffect,
  `r.rating >= selectedRating` vs `r.price_range === selectedPrice`)

---

## Concept 3: Expo Router File-Based Navigation with Authentication Guard

### Purpose in the Project
Expo Router handles all navigation in the app. It also serves as the security
layer — preventing unauthenticated users from accessing protected screens and
automatically redirecting to login when a session expires.

### Why It Was Challenging
Coming from no prior Expo Router experience, several concepts were new:

**File-based routing:** Each file in the `app/` folder is automatically a route.
Parenthesised folders like `(auth)` and `(tabs)` are route groups — they
organise files without appearing in the URL path.

**replace vs push:** Navigation uses `router.replace()` instead of
`router.push()`. Push adds a screen to the stack, meaning the user could press
back to return to the previous screen. Replace swaps the screen entirely,
removing the previous one from the stack. This is essential for auth flows —
after login, the user must not be able to press back to the login screen.

**The isLoading gate:** The auth guard in `_layout.tsx` uses two state values —
`isSignedIn` and `isLoading`. isLoading starts as `true` to prevent any redirect
from firing before AsyncStorage has finished reading the saved token. Without
this gate, the app would redirect to login on every launch even when a valid
session exists, because isSignedIn would still be false at the moment the
useEffect first runs.

### Usage Location
- `client/app/_layout.tsx` — lines 15–26 (isSignedIn, isLoading, router.replace,
  useEffect dependency array)
- `client/services/authContext.tsx` — signIn, signOut, isLoading initialisation
- `client/app/(auth)/login.tsx` — login flow calling signIn from context
