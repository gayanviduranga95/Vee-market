# 🌾 Vee Market

## Digital Paddy & Rice Marketplace

Vee Market is a digital marketplace designed to connect **paddy farmers, small rice mills, and buyers** through a transparent and trusted agricultural supply chain.

The platform allows farmers to create paddy lots, provide paddy quality information such as moisture readings, receive competitive bids from rice mills, and select the best offer.

Rice mills can browse available paddy lots, view lot information, and submit bids based on their requirements.

---

## 🎯 Project Goal

Vee Market aims to improve the traditional paddy supply chain by providing a digital platform for:

- Transparent paddy trading
- Competitive pricing
- Direct farmer-to-mill connections
- Paddy quality verification
- Secure transactions
- Better supply-chain management

### Main Supply Chain

```text
Farmer
   │
   ▼
Paddy Lot
   │
   ▼
Rice Mill
   │
   ▼
Rice
   │
   ▼
Shop / Hotel
```

---

# ✨ Features

## 👨‍🌾 Farmer

Farmers can:

- Register an account
- Login securely
- Create farms
- Manage their farms
- Create paddy lots
- Specify paddy quantity
- Specify asking price
- Specify availability date
- Add moisture readings
- View moisture readings
- View bids from rice mills
- Compare bids
- Accept bids
- Reject bids

## 🏭 Rice Mill

Rice mills can:

- Register a mill profile
- Provide mill registration information
- Specify milling capacity
- Browse available paddy lots
- View paddy lot details
- Submit bids
- View submitted bids
- View individual bids
- Withdraw pending bids

---

# 💰 Bidding System

The bidding system allows multiple rice mills to compete for a farmer's paddy lot.

```text
Farmer creates Paddy Lot
        │
        ▼
    1500 kg Nadu
        │
        ▼
 ┌──────────────────────┐
 │ Available to Mills   │
 └──────────┬───────────┘
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
   Mill 1  Mill 2  Mill 3
   185/kg  183/kg  181/kg
     │      │      │
     └──────┼──────┘
            ▼
     Farmer compares bids
            │
            ▼
       Accept Bid
            │
            ▼
      Selected Bid
       ACCEPTED
            │
            ▼
 Other Pending Bids
       REJECTED
```

### Bidding Rules

- A mill can submit only one bid for a particular paddy lot.
- A farmer can view all bids for their paddy lot.
- A farmer can accept a bid.
- A farmer can reject a bid.
- When one bid is accepted, other pending bids are automatically rejected.
- A mill can withdraw its pending bid.

---

# 💧 Moisture Readings

Paddy moisture is an important quality factor.

Vee Market allows moisture readings to be associated with individual paddy lots.

Each reading contains:

```text
Moisture Reading
├── Paddy Lot
├── Device Number
├── Moisture Percentage
└── Measurement Time
```

This provides the foundation for future quality verification and IoT moisture-meter integration.

---

# 🔐 Authentication & Security

The backend uses:

- Spring Security
- JWT authentication
- BCrypt password hashing
- Stateless authentication
- Role-based authorization

Supported user roles:

```text
FARMER
MILL
BUYER
ADMIN
```

JWT tokens contain:

- User ID
- Email
- Role
- Issued time
- Expiration time

Sensitive configuration such as database credentials and JWT secrets is stored using environment variables.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────┐
│             VEE MARKET              │
└──────────────────┬──────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │      Frontend       │
        │      Next.js        │
        │      React          │
        │      TypeScript     │
        │      Tailwind CSS   │
        └──────────┬──────────┘
                   │
              REST / JSON
                   │
                   ▼
        ┌─────────────────────┐
        │       Backend       │
        │    Spring Boot      │
        │       Java 21       │
        │ Spring Web           │
        │ Spring Security      │
        │ Spring Data JPA      │
        │ JWT                  │
        │ Flyway               │
        └──────────┬──────────┘
                   │
                 JPA
                   │
                   ▼
        ┌─────────────────────┐
        │      PostgreSQL     │
        └─────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- BCrypt
- Maven
- Flyway

## Database

- PostgreSQL

## Development

- Git
- GitHub
- VS Code
- WSL / Ubuntu

---

# 📁 Project Structure

```text
Vee-market/
│
├── README.md
├── vee-market-api/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
│
└── vee-market-web/
    ├── app/
    ├── components/
    ├── public/
    └── package.json
```

---

# 🗄️ Database

The current database contains the core entities for the farmer, farm, paddy lot, moisture, mill, and bidding workflows.

```text
users
 │
 ├───────────────┐
 │               │
 ▼               ▼
farmer_profiles  mill_profiles
 │
 ▼
farms
 │
 ▼
paddy_lots
 │
 ├───────────────┐
 │               │
 ▼               ▼
moisture_      bids
readings
```

### Current Tables

```text
users
farmer_profiles
farms
paddy_lots
moisture_readings
bids
mill_profiles
flyway_schema_history
```

Database migrations are managed using **Flyway**.

---

# 🔌 API Endpoints

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Farmer

```http
GET  /api/farmer/me
POST /api/farmer/farms
GET  /api/farmer/farms
POST /api/farmer/lots
GET  /api/farmer/lots
POST /api/farmer/lots/{lotId}/moisture
GET  /api/farmer/lots/{lotId}/moisture
GET  /api/farmer/lots/{lotId}/moisture/latest
GET  /api/farmer/lots/{lotId}/bids
POST /api/farmer/bids/{bidId}/accept
POST /api/farmer/bids/{bidId}/reject
```

## Mill

```http
POST /api/mill/profile
GET  /api/mill/profile
GET  /api/mill/lots
GET  /api/mill/lots/{lotId}
POST /api/mill/lots/{lotId}/bids
GET  /api/mill/bids
GET  /api/mill/bids/{bidId}
POST /api/mill/bids/{bidId}/withdraw
```

## Health

```http
GET /api/health
```

---

# ⚙️ Installation

## Requirements

- Java 21
- PostgreSQL
- Node.js
- npm
- Git

## Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE vee_market;
```

## Backend Setup

```bash
cd vee-market-api
```

Create a local `.env` file:

```env
DB_URL=jdbc:postgresql://localhost:5432/vee_market
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
JWT_SECRET=your_secure_jwt_secret
```

> Do not commit `.env` to GitHub.

Load the environment variables:

```bash
set -a
source .env
set +a
```

Start the backend:

```bash
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

Test:

```bash
curl http://localhost:8080/api/health
```

## Frontend Setup

```bash
cd vee-market-web
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 🔑 Development Test Accounts

### Farmer

```text
Email: farmer@test.com
Password: password123
Role: FARMER
```

### Mill

```text
Email: mill@test.com
Password: password123
Role: MILL
```

> These accounts are for development/testing only.

---

# 🧪 Testing

Health check:

```bash
curl http://localhost:8080/api/health
```

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"farmer@test.com","password":"password123"}'
```

Protected requests use:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 🔄 Example Bidding Workflow

A farmer creates:

```text
Paddy Type: Nadu
Quantity: 1500 kg
Asking Price: Rs. 180/kg
```

Mills submit:

```text
Mill 1 → Rs. 185/kg
Mill 2 → Rs. 183/kg
Mill 3 → Rs. 181/kg
```

The farmer accepts one bid:

```text
Mill 1 → ACCEPTED
Mill 2 → REJECTED
Mill 3 → REJECTED
```

Only one mill can win the paddy lot.

---

# 🛣️ Roadmap

## Completed

- [x] Project structure
- [x] PostgreSQL database
- [x] Flyway migrations
- [x] User registration
- [x] User login
- [x] JWT authentication
- [x] Farmer profiles
- [x] Farm management
- [x] Paddy lot management
- [x] Moisture readings
- [x] Mill profiles
- [x] Paddy lot browsing
- [x] Mill bidding
- [x] Farmer bid management
- [x] Accept bid
- [x] Reject bid
- [x] Withdraw bid
- [x] Automatic rejection of competing bids

## In Progress

- [ ] Farmer bidding dashboard
- [ ] Improved mill dashboard
- [ ] Deal management
- [ ] Payment workflow
- [ ] Delivery management
- [ ] Ratings
- [ ] Dispute management
- [ ] Notifications
- [ ] Admin dashboard

## Future

- [ ] IoT moisture meter integration
- [ ] Location-based marketplace
- [ ] Price reference system
- [ ] Rice marketplace
- [ ] Shop and hotel ordering
- [ ] Recurring supply agreements
- [ ] Offline synchronization
- [ ] Advanced analytics

---

# 🔒 Security

Never commit sensitive information to GitHub.

Do not commit:

```text
.env
.env.local
database passwords
JWT secrets
API keys
private credentials
```

Environment variables should be used for sensitive configuration.

---

# 🤝 Development Workflow

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "feat: describe your change"
```

Push:

```bash
git push -u origin feature/your-feature
```

---

# 📌 Repository Structure

The frontend and backend are maintained in the same GitHub repository:

```text
Vee-market/
├── vee-market-api/
├── vee-market-web/
└── README.md
```

### Backend

`vee-market-api` is the Spring Boot REST API responsible for authentication, users, farmers, farms, paddy lots, moisture readings, mills, bids, and database access.

### Frontend

`vee-market-web` is the Next.js application responsible for the user interface, dashboards, authentication UI, marketplace interface, and API communication.

---

# 🌱 Future Vision

Vee Market is planned to evolve into a complete digital agricultural supply-chain platform.

```text
                 FARMER
                    │
                    ▼
              Paddy Marketplace
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      Rice Mills         Other Buyers
          │                   │
          └─────────┬─────────┘
                    ▼
                   RICE
                    │
                    ▼
              Shops / Hotels
                    │
                    ▼
                Consumers
```

The long-term vision is to improve:

- Transparency
- Trust
- Fair pricing
- Paddy quality verification
- Farmer access to buyers
- Mill access to suppliers
- Supply-chain efficiency

---

# 👥 Project

**Vee Market**

A software engineering project focused on developing a digital marketplace for the paddy and rice supply chain.

---

# 📄 License

This project is currently developed for educational and project purposes.

---

## 🌾 Vee Market

**Connecting Farmers. Empowering Mills. Building a Better Supply Chain.**

```text
Farmer → Vee Market → Rice Mill → Buyer
```
