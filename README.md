# RocketFood Delivery

A full-stack food delivery mobile application built with React Native (Expo) and a Java Spring Boot REST API. Customers can browse restaurants, place orders, and view their order history.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Client | React Native, Expo (SDK 52), TypeScript |
| Navigation | Expo Router (file-based) |
| State / Storage | React Context API, AsyncStorage |
| HTTP Client | Axios |
| Backend API | Java 21, Spring Boot 3, Spring Security |
| Authentication | JWT (JSON Web Tokens) |
| Database | MySQL 8 |
| Build Tool | Maven (mvnw wrapper) |

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
│   └── features/                  # 8 feature spec files
│
├── PostmanCollection.json         # Postman collection (all API endpoints)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+
- **Java** 21
- **MySQL** 8
- **Expo Go** app on your mobile device (iOS or Android)
- **ngrok** (optional — for remote device access)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd RocketApp
```

### 2. Set up the database

Create a MySQL database named `rdelivery`:

```sql
CREATE DATABASE rdelivery;
```

### 3. Configure the server

Open `server/serverJAVA/src/main/resources/application.properties` and update the database credentials:

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

### 5. Configure the client

```bash
cd client
cp .env.example .env
```

Edit `client/.env` and set your machine's local IP address:

```env
EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:8080
```

To find your IP:
- **macOS / Linux:** `ipconfig getifaddr en0` or `ip addr show`
- **Windows:** `ipconfig` — look for the Wi-Fi IPv4 address

### 6. Install client dependencies

```bash
cd client
npm install
```

### 7. Start the Expo dev server

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone. Make sure your phone and computer are on the same Wi-Fi network.

---

## Ngrok Tunnel Setup

Use ngrok when your phone and computer are on different networks, or when the local IP approach is not working.

### Install ngrok

Download from [https://ngrok.com/download](https://ngrok.com/download) or install via snap:

```bash
snap install ngrok
```

### Start a tunnel for the API server

```bash
ngrok http 8080
```

ngrok will output a forwarding URL like:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:8080
```

### Update the client environment

Edit `client/.env` with the ngrok URL:

```env
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app
```

### Start Expo with tunnel mode

```bash
cd client
npx expo start --tunnel
```

Scan the new QR code — the app will connect through the ngrok tunnel.

> **Note:** Free-tier ngrok URLs change every time you restart ngrok. Update `.env` each session.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the Spring Boot API | `http://192.168.1.5:8080` |

All environment variables are prefixed with `EXPO_PUBLIC_` so they are accessible in the React Native bundle. See `client/.env.example` for the template.

> **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## API Documentation

The full Postman collection is available at `PostmanCollection.json` in the project root. Import it into Postman to run all endpoints with pre-configured variables.

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
| POST | `/api/v1/auth/login` | Authenticate and receive JWT token |

#### Restaurants
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/restaurants` | Get all restaurants (optional `?rating=&price_range=`) |
| GET | `/api/v1/restaurants/:id` | Get restaurant by ID |
| GET | `/api/v1/restaurants/:id/menu` | Get menu items for a restaurant |
| POST | `/api/v1/restaurants` | Create a restaurant |
| PUT | `/api/v1/restaurants/:id` | Update a restaurant |
| DELETE | `/api/v1/restaurants/:id` | Delete a restaurant |

#### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/products` | Get all products |
| GET | `/api/v1/products/:id` | Get product by ID |
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
