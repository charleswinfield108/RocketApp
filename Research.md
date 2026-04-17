# Research Notes

---

## Native vs Cross-Platform Mobile Applications

### Native Applications

A native mobile application is built specifically for one platform using the tools and programming languages that platform officially supports. iOS native apps are written in Swift or Objective-C using Apple's Xcode IDE, while Android native apps are written in Kotlin or Java using Android Studio. Because native apps are compiled directly for the target platform, they have full access to all device hardware and APIs — camera, GPS, Bluetooth, biometrics, push notifications — and deliver the best possible performance and UI fidelity.

The main trade-off is cost and effort. Building a native iOS app and a native Android app means maintaining two separate codebases, two sets of developers, and two release pipelines. Any new feature must be built twice.

### Cross-Platform Applications

A cross-platform application is built once using a shared codebase that runs on multiple platforms. Frameworks like React Native, Flutter, and Xamarin allow developers to write shared logic and UI components that are then compiled or interpreted into platform-specific output. This significantly reduces development time and cost, since one team can target both iOS and Android simultaneously.

The trade-off is that cross-platform apps may not achieve the exact same performance or native feel as a fully native app, and access to cutting-edge platform APIs is sometimes delayed until the framework adds support.

### Key Differences

| | Native | Cross-Platform |
|---|---|---|
| Language | Swift / Kotlin | JavaScript, Dart, C# |
| Codebase | One per platform | Single shared codebase |
| Performance | Best possible | Near-native |
| Device API access | Full, immediate | Framework-dependent |
| Development cost | Higher | Lower |
| Examples | Apple Maps, Google Maps | React Native, Flutter |

### Which is Used in RocketFood?

RocketFood uses **React Native** — a cross-platform framework. The same TypeScript codebase runs on both iOS and Android, delivering a consistent experience across devices while keeping the project maintainable by a single development team.

---

## React vs React Native

### React

React is a JavaScript library for building user interfaces on the **web**. Created by Meta (Facebook), it uses a virtual DOM (Document Object Model) to efficiently update and render HTML elements in a browser. React components return JSX — a syntax that looks like HTML — which gets compiled into actual DOM nodes rendered by the browser.

React is concerned entirely with the browser environment. Styling is done with CSS, layout follows the HTML/CSS box model, and navigation is handled by browser history and URLs.

### React Native

React Native is a framework that uses the same React component model and JavaScript syntax, but instead of rendering HTML to a browser, it renders **native UI components** on mobile devices. A `<View>` in React Native becomes a `UIView` on iOS and an `android.view.View` on Android. A `<Text>` component becomes a `UILabel` on iOS and a `TextView` on Android.

This means React Native apps look and feel like real native apps — because under the hood, they are using real native components — while still being written in JavaScript/TypeScript.

### Key Differences

| | React | React Native |
|---|---|---|
| Target platform | Web browsers | iOS and Android |
| Renders | HTML DOM elements | Native UI components |
| Styling | CSS stylesheets | JavaScript `StyleSheet` API |
| Layout | CSS Flexbox + Box Model | Flexbox (subset) |
| Navigation | Browser history / URLs | Stack, Tab, Drawer navigators |
| Component examples | `<div>`, `<p>`, `<img>` | `<View>`, `<Text>`, `<Image>` |
| Runs in | Browser | Native mobile runtime (JSI/Hermes) |

### What They Share

Both React and React Native share the same core concepts: components, props, state, hooks (`useState`, `useEffect`), and the virtual DOM reconciliation model. A developer who knows React can learn React Native quickly — the mental model is the same, only the rendering target changes.

---

## Twilio SMS Integration in a Java Spring Boot Backend

### Overview

Twilio is a cloud communications platform that provides APIs for sending SMS messages, making voice calls, and more. In RocketFood, Twilio is used to send an SMS confirmation to the customer when an order is placed.

**Proof of account:** See [screenshots/twilio-account.png](screenshots/twilio-account.png)

---

### Step 1 — Create a Twilio Account

1. Go to [https://www.twilio.com](https://www.twilio.com) and sign up for a free trial account.
2. Verify your email address and a personal phone number (Twilio requires this for trial accounts).
3. Once logged in, your **Account Dashboard** displays your credentials.

---

### Step 2 — Locate Your Credentials

From the Twilio Console ([https://console.twilio.com](https://console.twilio.com)):

- **Account SID** — Found on the Account Dashboard under "Account Info". Starts with `AC`.
- **Auth Token** — Found directly below the Account SID. Click the eye icon to reveal it. Treat this like a password — never commit it to version control.

---

### Step 3 — Get a Twilio Phone Number

1. In the Twilio Console, go to **Phone Numbers → Manage → Buy a Number**.
2. Filter by SMS capability and select a number.
3. On a free trial, you can only send SMS to **verified** phone numbers. To verify a number, go to **Verified Caller IDs** in the console.

---

### Step 4 — Add the Twilio Dependency to Your Java Project

In `pom.xml`, add the Twilio SDK:

```xml
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>10.1.5</version>
</dependency>
```

---

### Step 5 — Configure Credentials in `application.properties`

**Never hardcode credentials.** Store them in `application.properties` and reference them via `@Value`:

```properties
# Twilio SMS
twilio.account-sid=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
twilio.auth-token=your_auth_token_here
twilio.from-number=+15551234567
```

Add `application.properties` to `.gitignore` or use environment variables in production:

```properties
twilio.account-sid=${TWILIO_ACCOUNT_SID}
twilio.auth-token=${TWILIO_AUTH_TOKEN}
twilio.from-number=${TWILIO_FROM_NUMBER}
```

---

### Step 6 — Initialize Twilio and Send SMS in Java

Inject the credentials using `@Value` and initialize the Twilio client with `@PostConstruct`:

```java
@Service
public class NotificationService {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    public void sendSms(String toPhone, String messageBody) {
        Message.creator(
            new PhoneNumber(toPhone),
            new PhoneNumber(fromNumber),
            messageBody
        ).create();
    }
}
```

> `@PostConstruct` runs once after Spring injects all `@Value` fields, ensuring Twilio is initialized before any method calls it.

---

### How It Works in RocketFood

In this project, `NotificationService.sendSms()` is called when a new order is created with `send_sms: true` in the request body. The service:

1. Reads the customer's phone number from the database
2. Prepends `+1` if no country code is present
3. Sends a confirmation message: `"Your RocketFood order #<id> has been received!"`

The integration is guarded — if the Twilio credentials are blank in `application.properties`, the `@PostConstruct` skips initialization and the SMS is silently skipped rather than crashing the server.

---

### Security Notes

- **Never commit your Auth Token** to version control. Use `.gitignore` or environment variables.
- The `.env.example` file in this project documents required variables without exposing real values.
- On a Twilio trial account, SMS can only be sent to verified phone numbers. Upgrade to a paid account to send to any number.

---

## APIs Used in RocketApp

### 1. Rocket Food Delivery REST API

**Type:** Custom — Java Spring Boot  
**Location:** `server/serverJAVA/`  
**Base URL (dev):** Configured via `EXPO_PUBLIC_API_URL` environment variable

The project's own backend API, built in Module 12. It handles all core application data: authentication, restaurant listings, menus, order management, account management, and delivery tracking.

**Key endpoints used by the mobile client:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/login` | Authenticate user; returns JWT token, `customer_id`, `courier_id`, and `user_id` |
| `GET` | `/api/v1/restaurants` | Fetch all restaurants for the restaurant list screen |
| `GET` | `/api/v1/restaurants/{id}/products` | Fetch menu items for a specific restaurant |
| `POST` | `/api/v1/orders` | Place a new order (includes `send_email` and `send_sms` notification flags) |
| `GET` | `/api/v1/orders/customer/{customerId}` | Fetch order history for a customer |
| `GET` | `/api/v1/orders/courier/{courierId}` | Fetch active deliveries assigned to a courier |
| `PUT` | `/api/v1/orders/{id}` | Update an order's status (used by courier to advance delivery status) |
| `GET` | `/api/v1/account/{userId}` | Fetch account details (name, login email, customer/courier sub-profiles) |
| `PUT` | `/api/v1/account/{userId}?type={customer\|courier}` | Update contact email and phone number for a role |

All authenticated endpoints require a `Bearer {token}` header. The token is obtained at login and stored locally on the device.

---

### 2. Twilio API

**Type:** Third-party — SMS messaging  
**Used by:** Server only (`NotificationService.java`)  
**Documentation:** [twilio.com/docs](https://www.twilio.com/docs)

Twilio sends SMS order confirmation messages to customers who opt in by checking "By Phone" on the order confirmation screen. The mobile app does not call Twilio directly — it passes `send_sms: true` in the order POST body, and the server handles the Twilio API call internally.

**Credentials required (server-side `application.properties`):**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

---

### 3. Notify.EU API

**Type:** Third-party — Email delivery  
**Used by:** Server only (`NotificationService.java`)  
**Documentation:** [notify.eu](https://notify.eu)

Notify.EU sends email order confirmation messages to customers who opt in by checking "By Email" on the order confirmation screen. Like Twilio, the mobile app only passes `send_email: true` in the POST body — the server handles the Notify.EU API call.

**Credentials required (server-side `application.properties`):**
- `NOTIFY_API_KEY`

---

### 4. Expo Google Fonts — Oswald

**Type:** Third-party library — Font loading  
**Package:** `@expo-google-fonts/oswald`  
**Used by:** Client — `app/_layout.tsx`

This library loads the Oswald font family (weights: 400 Regular, 600 SemiBold, 700 Bold) from Google Fonts into the Expo app at startup. Oswald is used for all headings, labels, buttons, tab bar labels, and status badges throughout the app. The loaded font names are referenced via the `OswaldFonts` constant in `constants/theme.ts`.

The app does not render any screen until the fonts are fully loaded, guarded by `useFonts()` in the root layout.

---

### 5. AsyncStorage

**Type:** React Native local storage API  
**Package:** `@react-native-async-storage/async-storage`  
**Used by:** Client — `services/authContext.tsx`

AsyncStorage is React Native's key-value storage system, analogous to `localStorage` in the browser. It persists the user's authentication state across app restarts — specifically the JWT token, `customer_id`, `courier_id`, and `user_id` returned at login. On app launch, `authContext.tsx` reads these values to restore the session without requiring the user to log in again.

The active role (`customer` or `courier`) is **not** persisted — it is session-only state held in React context. The user selects their role on each login if they hold both roles.

---

### 6. Ngrok

**Type:** Development tool — Reverse tunnel / public URL proxy  
**Used by:** Development environment only  
**Documentation:** [ngrok.com/docs](https://ngrok.com/docs)

Ngrok creates a publicly accessible HTTPS tunnel to the local Spring Boot server running on `localhost:8080`. This is required during development when testing on a physical iOS or Android device, because the device cannot reach `localhost` on the developer's machine directly.

The tunnel URL is set as the `EXPO_PUBLIC_API_URL` environment variable in `client/.env`. On WSL2, additional Windows Firewall inbound rules and `netsh interface portproxy` forwarding rules are also required to expose the port from WSL2 to the Windows host.

Ngrok is not used in production — the app points at the real backend URL via the environment variable.
