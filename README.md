# RocketFood Delivery - Mobile App (Module 14)

## Project Description

RocketFood Delivery is an extended React Native mobile application built with Expo that enables both customers and couriers to interact with the food delivery platform. This project represents **Module 14: Mobile Development 2** — a direct continuation of Module 13.

**Module 13 (Customer App):** Customers can discover local restaurants, browse menus, place food delivery orders, and track order history.

**Module 14 (Extended App):** The app has been expanded with:
- **Courier Experience:** Couriers view and manage assigned deliveries with status progression (Pending → In Transit → Delivered)
- **Role-Based Navigation:** Users registered as both customers and couriers see an account selection screen after login
- **Account Management:** Both customers and couriers can view and update their contact details
- **Notification Opt-In:** Customers can opt in to SMS and/or email order confirmations
- **Brand Typography:** Fully integrated Arial and Oswald font families across all screens

The app is built for everyday users wanting a fast, simple way to order food (customers) or accept and manage deliveries (couriers) without fragmented experiences.

---

## Module 14 Features

### 1. Courier Experience
- View assigned deliveries with customer details
- Progress order status: Pending → In Transit → Delivered
- Locked status once order reaches DELIVERED
- Courier delivery history and statistics

### 2. Role-Based Access
- Account selection screen for dual-role users (customer + courier)
- Conditional navigation based on selected role
- Session-scoped role switching

### 3. Account Management
- Customer account details screen (editable contact info)
- Courier account details screen (editable contact info)
- Role-specific account management interfaces

### 4. Notification Opt-In
- SMS notification checkbox in order confirmation
- Email notification checkbox in order confirmation
- Preferences saved with order metadata

### 5. Brand Typography
- **Oswald:** Applied to headings and primary UI elements
- **Arial:** Applied to body text and secondary content
- Consistent font system across all screens

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Client | React Native, Expo (SDK 54), TypeScript |
| Navigation | Expo Router (file-based routing) |
| State / Storage | React Context API, AsyncStorage |
| HTTP Client | Axios |
| UI Fonts | Expo Google Fonts (Oswald) |
| Icons | FontAwesome (React Native) |
| Backend API | Java 21, Spring Boot 3, Spring Security |
| Authentication | JWT (JSON Web Tokens) |
| Database | MySQL 8 |
| Build Tool | Maven (mvnw wrapper) |
| API Testing | Postman |
| Remote Access | ngrok (optional tunnel) |

---

## Project Structure

```
RocketApp/
├── client/                        # React Native / Expo app
│   ├── app/
│   │   ├── (auth)/                # Login screen
│   │   ├── (account-selection)/   # Role selection screen (NEW)
│   │   ├── (tabs)/
│   │   │   ├── (restaurant)/      # Restaurant list + menu screens (Customer)
│   │   │   ├── (courier)/         # Courier deliveries + management (NEW)
│   │   │   ├── history.tsx        # Order history screen (Customer)
│   │   │   ├── profile.tsx        # Account management (Updated)
│   │   │   └── explore.tsx        # Restaurant discovery (Customer)
│   │   └── _layout.tsx            # Root layout + role-based auth guard
│   ├── components/                # Reusable UI components
│   │   ├── ConfirmationModal.tsx  # Order confirmation with notification opt-in (Updated)
│   │   ├── Header.tsx             # Brand typography (Updated)
│   │   ├── MenuItem.tsx           # Menu item display
│   │   ├── RestaurantCard.tsx     # Restaurant card
│   │   └── ...                    # Other shared components
│   ├── constants/
│   │   ├── theme.ts             # Brand colors & Oswald/Arial fonts (Updated)
│   │   └── navigation.ts         # Navigation constants
│   ├── services/                  # API client, auth context, service helpers
│   │   ├── api.ts                # API client with courier endpoints (Updated)
│   │   ├── authContext.tsx       # Auth + role management (Updated)
│   │   ├── menuService.ts        # Menu service
│   │   ├── orderHistoryService.ts # Order history service
│   │   └── courierService.ts     # Courier deliveries service (NEW)
│   └── .env.example               # Environment variable template
│
├── server/
│   └── serverJAVA/                # Spring Boot REST API (Not modified)
│       └── src/main/java/...
│           ├── controller/api/    # REST controllers
│           ├── service/           # Business logic
│           ├── models/            # JPA entities
│           ├── dtos/              # Request / response DTOs
│           ├── security/          # JWT filter + Spring Security config
│           └── resources/
│               └── application.properties
│
├── ai/                            # AI-native specifications
│   ├── 🤖-ai-spec.md             # AI specification (Updated for Module 14)
│   ├── 🤖-ui-specification.md    # UI specification
│   └── features/                  # Feature spec files
│       ├── 🤖-courier-deliveries.feature.md (NEW)
│       ├── 🤖-account-selection.feature.md (NEW)
│       ├── 🤖-courier-account-management.feature.md (NEW)
│       ├── 🤖-notification-opt-in.feature.md (NEW)
│       ├── 🤖-brand-typography.feature.md (NEW)
│       └── ... (other feature specs)
│
├── PostmanCollection.json         # Postman collection (updated with courier endpoints)
├── CONCEPTS.md                    # 3 challenging concepts
├── LeetCode/                      # LeetCode challenge solutions
├── README.md                      # This file
└── submission-summary.md          # NOT committed to GitHub
```

---

## Prerequisites

Before setting up the project, make sure you have the following installed:

- **Node.js** 18 or higher — [nodejs.org](https://nodejs.org)
- **Java** 21 — [adoptium.net](https://adoptium.net)
- **MySQL** 8 — [mysql.com](https://www.mysql.com)
- **Expo Go** app on your iOS or Android phone — available on the App Store / Google Play
- **ngrok** (optional) — only needed if your phone and computer are on different networks

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd RocketApp
```

### 2. Set up the database

Open MySQL and create a database named `rdelivery`:

```sql
CREATE DATABASE rdelivery;
```

### 3. Configure the server

Open `server/serverJAVA/src/main/resources/application.properties` and update your MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rdelivery
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 4. Start the Java server

```bash
cd server/serverJAVA
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`. On first run, the database schema is created automatically and seeded with sample data.

### 5. Install client dependencies

```bash
cd client
npm install
```

### 6. Configure the client environment

```bash
cp .env.example .env
```

Edit `client/.env` and set your machine's local IP address:

```env
EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:8080
```

To find your IP address:
- **macOS / Linux:** run `ipconfig getifaddr en0` or `ip addr show`
- **Windows:** run `ipconfig` and look for the Wi-Fi IPv4 address

### 7. Start the Expo dev server

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone. Make sure your phone and computer are connected to the same Wi-Fi network.

---

## Running on a Physical Device from WSL2 (Windows)

> **This section is specifically for developers running this project inside WSL2 on Windows.** If you are on macOS or Linux, plain `npx expo start` with a QR code scan will work out of the box.

### Why the default QR code doesn't work on WSL2

When you run `npx expo start` inside WSL2, the QR code it generates contains the WSL2 internal IP address (e.g., `192.168.86.x`). This IP only exists inside the virtual network between Windows and WSL2 — your phone has no way to reach it. The phone needs the actual Windows Wi-Fi IP address (e.g., `192.168.1.5`) to connect.

### Step 1 — Find your Windows Wi-Fi IP

Run this from your WSL2 terminal:

```bash
cmd.exe /c "ipconfig"
```

Look for the **Wi-Fi** section and note the **IPv4 Address** (e.g., `192.168.1.5`). This is the address your phone can reach.

### Step 2 — Add a Windows Firewall rule (one-time setup)

Your phone's connection to port 8081 is blocked by the Windows Firewall by default. Open **PowerShell as Administrator** on Windows and run:

```powershell
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
```

This only needs to be done once. The rule persists across reboots.

### Step 3 — Set up a port proxy from Windows to WSL2 (one-time setup, refresh each session)

Windows needs to forward incoming connections on port 8081 to WSL2. In the same Admin PowerShell, run:

```powershell
netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=0.0.0.0
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=<WSL2_IP>
```

Replace `<WSL2_IP>` with your WSL2 IP (find it by running `ip addr show eth0` in WSL2). The WSL2 IP can change when you restart your computer, so you may need to re-run this each session.

### Step 4 — Start Expo with the correct host

Back in WSL2, start Expo using your Windows Wi-Fi IP as the packager hostname:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.5 npx expo start
```

Replace `192.168.1.5` with your actual Windows Wi-Fi IP from Step 1. The QR code will now contain the correct IP that your phone can reach.

### Step 5 — Scan the QR code

Open your iPhone **Camera app**, point it at the QR code, and tap the Expo Go prompt. The app will load.

---

## Why `npx expo start --tunnel` Does Not Work

Expo's built-in `--tunnel` flag uses an internal package called `@expo/ngrok` to create a public URL for your Metro bundler. This package was written for **ngrok v2**, but the current ngrok CLI is **v3**, which changed its API response format. As a result, `@expo/ngrok` crashes with:

```
CommandError: TypeError: Cannot read properties of undefined (reading 'body')
```

The ngrok CLI itself works fine — the problem is Expo's wrapper around it. The WSL2 host fix above (Steps 1–5) is the recommended alternative and does not require ngrok at all.

If you still want to use ngrok for the **Java API** (e.g., to expose port 8080 publicly), you can run the ngrok CLI directly:

```bash
ngrok http 8080
```

Copy the forwarding URL (e.g., `https://abc123.ngrok-free.app`) and update `client/.env`:

```env
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

> **Note:** Free-tier ngrok URLs change every time you restart ngrok. Update `.env` each session.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the Spring Boot API server | `http://192.168.1.5:8080` |

All variables are prefixed with `EXPO_PUBLIC_` so they are bundled into the React Native app at build time. See `client/.env.example` for the template.

> **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## API Documentation

The full Postman collection is available at `PostmanCollection.json` in the project root. Import it into Postman to explore and test all endpoints with pre-configured variables and automatic token handling.

### Base URL

```
http://localhost:8080
```

### Authentication

All endpoints except `POST /api/v1/auth/login` require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The token is returned by the login endpoint and is automatically saved by the Postman collection.

### Endpoints

#### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | Authenticate and receive a JWT token |

#### Restaurants
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/restaurants` | Get all restaurants (optional `?rating=&price_range=` filters) |
| GET | `/api/v1/restaurants/:id` | Get a restaurant by ID |
| GET | `/api/v1/restaurants/:id/menu` | Get menu items for a restaurant |
| POST | `/api/v1/restaurants` | Create a restaurant |
| PUT | `/api/v1/restaurants/:id` | Update a restaurant |
| DELETE | `/api/v1/restaurants/:id` | Delete a restaurant |

#### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | Get all products |
| GET | `/api/v1/products/:id` | Get a product by ID |
| POST | `/api/v1/products` | Create a product |
| PUT | `/api/v1/products/:id` | Update a product |
| DELETE | `/api/v1/products/:id` | Delete a product |

#### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/orders?type=customer&id=` | Get orders by customer, courier, or restaurant |
| GET | `/api/v1/orders/pending` | Get all pending orders |
| POST | `/api/v1/orders` | Create a new order (with notification preferences) |
| PUT | `/api/v1/orders/:id` | Update an order |
| PUT | `/api/v1/orders/:id/courier` | Assign a courier to an order |
| PUT | `/api/v1/orders/:id/rating` | Rate an order |
| DELETE | `/api/v1/orders/:id` | Delete an order |

#### Couriers (Module 14 - NEW)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/couriers/:id` | Get courier profile |
| PUT | `/api/v1/couriers/:id` | Update courier contact details |
| GET | `/api/v1/couriers/:id/deliveries` | Get courier's assigned deliveries |
| GET | `/api/v1/deliveries/:deliveryId` | Get delivery details |
| PUT | `/api/v1/deliveries/:deliveryId/status` | Update delivery status (Pending → In Transit → Delivered) |

#### Customers (Module 14 - ENHANCED)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/customers/:id` | Get customer profile |
| PUT | `/api/v1/customers/:id` | Update customer contact details |

### Sample Login Request

```json
POST /api/v1/auth/login
{
  "email": "customer@gmail.com",
  "password": "password"
}
```

---

## Test Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| Customer | `customer@gmail.com` | `password` | Customer-only account |
| Customer + Courier | `both@gmail.com` | `password` | Dual-role account (sees account selection screen) |
| Courier | `courier@gmail.com` | `password` | Courier-only account |

---

## Branching Strategy

This project follows a feature branch workflow:

1. **Feature branches** are created from `dev`: `git checkout -b feature/<feature-name>`
2. **Features are merged back to `dev`** via pull request
3. **`dev` is merged to `main`** for final submission
4. **No direct commits to `main`**
5. **Only the `main` branch is evaluated for grading**

```bash
# Example workflow
git checkout dev
git pull origin dev
git checkout -b feature/courier-deliveries
# ... make changes ...
git add .
git commit -m "feat: add courier delivery management"
git push origin feature/courier-deliveries
# Create PR on GitHub, merge to dev after review
# Later, dev → main for submission
```

---

## Deliverables Checklist

- [x] Extended mobile app with:
  - [x] Courier section (deliveries, status management)
  - [x] Role-based navigation (account selection screen)
  - [x] Account management (customer and courier profiles)
  - [x] Notification opt-in (SMS and email)
  - [x] Brand typography (Arial and Oswald fonts)
- [x] README.md (this file)
- [ ] AI Specification document (`ai/🤖-ai-spec.md`)
- [ ] Feature specification documents (`ai/features/🤖-*.feature.md`)
- [ ] Postman collection (`PostmanCollection.json`)
- [ ] CONCEPTS.md (3 challenging concepts with recorded video)
- [ ] LeetCode solutions (with recorded video and screenshots)
- [ ] Technical Demonstration video (Code Overview)
- [ ] Submission Summary (submitted separately, NOT committed to GitHub)

---

## Project Constraints

- **No new repository:** Expansion happens within the same Module 13 codebase
- **Backend not modified:** Java REST API is not changed; only existing endpoints are consumed
- **Platform compatibility:** App runs on both iOS and Android via Expo
- **Real-device testing:** Requires a working Ngrok tunnel to local Spring Boot API
- **Code quality:** No dead or commented-out code
- **Component reuse:** Components must be reused across screens
- **Status lock:** Once an order reaches DELIVERED, no further transitions allowed
- **Deadline:** Must be submitted through the platform by assigned deadline (Friday 11:59 PM)

---

## Extra Miles (Optional Enhancements)

Once all core requirements are completed and coach-reviewed:

- [ ] **README APIs Used:** Document each API endpoint and its purpose within this README
- [ ] **Cross-Platform UI Consistency:** Ensure UI is visually identical on both iOS and Android
- [ ] **SMS Notifications (Twilio):** Integrate Twilio to send real SMS order confirmations
- [ ] **Email Notifications (Notify.EU):** Integrate Notify.EU to send templated confirmation emails

---

## Professional Requirements

This program evaluates both technical and professional skills:

- **Communication:** Respond to coaches within 24 hours when contacted
- **Progress Updates:** Provide at least 2 progress updates per week
- **Project Reviews:** Schedule at least 1 project review per week before Friday
- **Professionalism:** Demonstrate autonomy, initiative, professionalism, and attention to detail
- **Submission:** Submit Submission Summary separately through the platform (NOT in GitHub)

> **Note:** Failure to meet communication and progress requirements may result in a failed module.

---

## Challenging Concepts (See CONCEPTS.md)

1. **Role-based Conditional Navigation:** Managing application state and navigation based on user role selection
2. **Delivery Status State Machine:** Implementing locked status transitions (Pending → In Transit → Delivered)
3. **Notification Preference Persistence:** Storing and retrieving user notification preferences with order data

---

## Resources

- **Wireframe Templates:** Provided in platform support materials for courier screens and account selection
- **Platform Slides:** Teaching guidance, concepts, and setup instructions
- **Business Document:** Client project brief and requirements
- **Requirement Checklist:** Precise grading criteria across 7 categories

---

## Module Information

**Module:** 14 - Mobile Development 2  
**Program:** Full-Stack Development Program  
**Company:** Genesis Solutions  
**Continuation of:** Module 13 - Mobile Development (Customer App)  
**Date Started:** April 14, 2026

---

## Author

**Charles Winfield**  
Junior Developer at Genesis Solutions  
Full-Stack Development Program Student

- GitHub: [github.com/charleswinfield108](https://github.com/charleswinfield108)
- LinkedIn: [linkedin.com/in/YOUR_LINKEDIN_USERNAME](https://linkedin.com/in/YOUR_LINKEDIN_USERNAME)

---

**Last Updated:** April 14, 2026  
**Status:** Module 14 In Progress
