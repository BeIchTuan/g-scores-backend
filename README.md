# G-scores Backend

This is the backend service for the G-scores project, built using **Node.js**, **Express.js**, and **TypeScript**. The application uses **MongoDB** for data storage and **Redis** for caching to enhance performance. The codebase follows **Clean Architecture** principles for maintainability and scalability.

## Technology Overview

- **Node.js & TypeScript**: JavaScript runtime with strong typing for robust and scalable code.
- **MongoDB**: NoSQL database for storing application data.
- **Redis**: In-memory data store for caching to reduce database load.
- **Clean Architecture**: Organized into domains (`application`, `domain`, `infrastructure`, `presentation`) for clear separation of concerns.
- **.env Configuration**: Environment variables for flexible configuration.

---

## Project Structure

```
backend/
│
├── dataset/              # Datasets and related files
├── dist/                 # Compiled code
├── node_modules/         # Node.js dependencies
├── src/                  # Source code
│   ├── application/      # Business logic and use cases
│   ├── config/           # Configuration files
│   ├── dataset/          # Dataset-related logic
│   ├── domain/           # Domain models and interfaces
│   ├── infrastructure/   # Database and external service integrations
│   ├── presentation/     # API routes and controllers
│   └── scripts/          # Utility scripts
│
├── server.ts             # Main application entry point
│
├── .env                  # Environment variables
├── .gitignore
├── package.json
├── package-lock.json
├── README.md             # This guide
├── tsconfig.json
```

---

## Prerequisites

Before running the application, ensure the following are installed:

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance, e.g., MongoDB Atlas)
- **Redis** (local or cloud instance, e.g., Upstash)
- **npm** (Node package manager)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/BeIchTuan/g-scores-backend
cd .\g-scores-backend\
```

### 2. Install Dependencies

Install the required Node.js dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following configuration:

```env
MONGODB_URI=mongodb+srv://admin1:PdXE3BgCQhkMRhX7@ecommerce.ko8pa.mongodb.net/g-scores?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
REDIS_URL=rediss://default:AZdkAAIjcDEwMDVjYWY2M2U3NWY0MmY4YmQyMDdiZWIyZmFlMzQyZXAxMA@enjoyed-termite-38756.upstash.io:6379
```

Ensure the `MONGODB_URI` and `REDIS_URL` are valid and accessible. The provided values use a MongoDB Atlas cluster and an Upstash Redis instance.

### 4. Run the Application

#### Compile TypeScript

Compile the TypeScript code to JavaScript:

```bash
npx tsc
```

#### Start the Application

Run the compiled application:

```bash
npm start
```

Alternatively, for development:

```bash
npm run dev
```

### 5. Access the API

The API will be available at:

```
http://localhost:5000
```

### 6. Deployment Link
https://g-scores-backend-eq9j.onrender.com
