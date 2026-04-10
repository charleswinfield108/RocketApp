# RocketFood Delivery

## Project Description

RocketFood Delivery is a mobile app that lets customers discover local restaurants, browse their menus, and place food delivery orders — all from their phone. Once an order is placed, customers can track its status and view their full order history at any time.

The app is built for everyday users who want a fast, simple way to order food without needing to call a restaurant or navigate a complicated website. It solves the common problem of fragmented ordering experiences by bringing restaurant discovery, ordering, and history tracking into a single, easy-to-use mobile interface.

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
│   │   ├── (tabs)/
│   │   │   ├── (restaurant)/      # Restaurant list + menu screens
│   │   │   └── history.tsx        # Order history screen
│   │   └── _layout.tsx            # Root layout + auth guard
│   ├── components/                # Reusable UI components
│   ├── constants/                 # Theme + navigation constants
│   ├── services/                  # API client, auth context, service helpers
│   └── .env.example               # Environment variable template
│
├── server/
│   └── serverJAVA/                # Spring Boot REST API
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
│   ├── 🤖-ai-spec.md
│   └── features/                  # 10 feature spec files
│
├── PostmanCollection.json         # Postman collection (all API endpoints)
└── README.md
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
| POST | `/api/v1/orders` | Create a new order |
| PUT | `/api/v1/orders/:id` | Update an order |
| PUT | `/api/v1/orders/:id/courier` | Assign a courier to an order |
| PUT | `/api/v1/orders/:id/rating` | Rate an order |
| DELETE | `/api/v1/orders/:id` | Delete an order |

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

| Role | Email | Password |
|---|---|---|
| Customer | `customer@gmail.com` | `password` |
| Customer | `both@gmail.com` | `password` |

---

## Author

**Charles Winfield**
Full-Stack Development Student

- GitHub: [github.com/YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)
- LinkedIn: [linkedin.com/in/YOUR_LINKEDIN_USERNAME](https://linkedin.com/in/YOUR_LINKEDIN_USERNAME)
