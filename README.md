# LinkUp Backend Engineer

The scalable, production-ready RESTful API core for the LinkUp mobile ecosystem and web app ecosystem which help user to post any type of service that he/she needs help on.

## 🏗️ Core Architecture & Features

### 🔐 1. Authentication & User Access Module
* **Secure JWT Authorization Protocol**: Handles user session states via cryptographically signed JSON Web Tokens passed cleanly through standard HTTP Bearer headers.
* **Role-Based Access Control (RBAC)**: Supports discrete permission tiers (`user`, `admin`) embedded directly into the User schema to protect operational and administrative actions.
* **Brute-Force Security Walls**: Integrates a hyper-strict Redis-backed rate limiting barrier restricting login and account creation paths to a maximum of 5 attempts per minute per IP address.

### 📝 2. Advanced Post & Feed Engine Module
* **High-Speed Feed Management**: Implements performant **Cursor Pagination** mechanics (`take`, `cursor`, `skip`) for infinite scrolling feeds, completely avoiding redundant database row scans.
* **Offset Pagination Support**: Standardized page-skipping math configuration (`skip`, `take`) tailored explicitly for rendering numbered pagination components or layout tables.
* **Smart Lexical Tokenizer Search**: Single text-input parser that cleanly breaks raw phrases into individual word blocks, scanning multiple fields (`title`, `description`) concurrently.
* **Type-Safe Enum & JSON Filters**: Features safe conditional logic routing that executes case-insensitive string lookups, exact Enum keys matching, and `Json` array evaluations (`array_contains` for tags) simultaneously without crashing Prisma.
* **Composite Query Indexing**: Model structures optimized with localized database composite indexes (`@@index([isClosed, helpType, category, createdAt(sort: Desc)])`) to keep complex queries executing under 5 milliseconds.

### 💬 3. Messaging & Soft-Deletion Module
* **WhatsApp-Style Active Conversations**: A specialized tracking query that automatically compiles the active chat rooms list, mapping real-time unread alerts, message previews, and precise chat-partner properties.
* **Safe Global Soft-Deletions**: Executes a secure backend database transaction that validates sender authentication ownership before soft-deleting a row.
* **Home Screen Preview Synchronization**: Smart timestamp matching logic (`lastMessageAt.getTime() === message.createdAt.getTime()`) that updates the active conversation home screen preview string *only* if the deleted item was explicitly the newest message sent in the thread, completely preventing history synchronization side-effects.

### 🛡️ 4. System Stability, Security & Telemetry
* **Express 5 Async Safety Nets**: Harnesses Express 5's native asynchronous promise tracking to catch unhandled async/await rejections automatically without requiring bloated external wrapper packages.
* **Unified Telemetry Logging**: Merges a custom Winston file streaming logger (configured with automated `sanitizeSecrets` object masking to redact passwords and tokens) with a **Sentry Cloud Reporting Transport Pipeline**.
* **Intelligent Error Filtering**: Distinguishes operational client mistakes (`4xx` status codes) from critical system crashes (`500+` server bugs). Expected input validation errors bypass Sentry automatically to keep tracking metrics clean, while internal server failures instantly trigger telemetry alerts directly to your Sentry dashboard and Gmail inbox.
* **Enterprise Security Shields**: Restricts network exposures via **Helmet** header strippers and enforces explicit **CORS origin filter functions** that permit undefined native mobile app connections (React Native) while rejecting cross-site malicious web scrapers.

---

## 📋 Local Installation Requirements
Ensure your machine has the following background processes active before launching the server:
* **Node.js** (v18+)
* **PostgreSQL** running on port `5432`
* **Redis Server** active on port `6379` 

---

## ⚙️ Environment Variables (`.env`)
Create a file named `.env` in your root folder. *Note: Never push this file to GitHub! Add it to your `.gitignore`.*

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:Amgreat27!@localhost:5432/linkup_db?schema=public"
JWT_SECRET="your_secure_32_character_token_encryption_secret"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SENTRY_DSN="https://sentry.io"
```

## 🏗️ The Ecosystem Tech Stack (What We Installed & Why)

Every library in this codebase was selected to fulfill an enterprise production requirement for security, performance optimization, or real-time system monitoring.

### 🔐 Security & Infrastructure Shields
* **`helmet`**: Secures your HTTP headers. It strips away vulnerable software footprints (like `X-Powered-By: Express`) so hackers can't fingerprint your server infrastructure, while actively blocking cross-site clickjacking attacks.
* **`cors`**: Manages cross-origin resource permissions. It is uniquely configured via a dynamic JavaScript filter function to allow safe incoming requests from your native **React Native** mobile app (which sends no browser origin headers) while blocking malicious third-party scraping sites.
* **`express-rate-limit` & `rate-limit-redis`**: Protects your endpoints from brute-force and DDoS spam attacks. It enforces strict request quotas (e.g., maximum 5 login attempts per minute) by managing fast counter tokens inside an active Redis layer.
* **`cookie-parser`**: Parses incoming request cookies safely. It extracts and decrypts secure, server-side HTTP-only cookies to handle authentication keys or persistent tokens seamlessly.

### 💾 Data Management & Search Acceleration
* **`prisma` & `@prisma/client`**: Our Type-Safe ORM. It translates JavaScript commands into high-speed raw SQL, enforces strict database integrity relations, and compiles our custom multi-column composite index strategies.
* **`ioredis`**: A lightning-fast, in-memory key-value database client. It connects your Node process to a Redis server to manage global rate-limiting tokens and facilitate immediate instance-to-instance websocket communication updates.

### 📂 File Uploading & Cloud Media Management
* **`multer`**: Handles multi-part form data uploads. It intercepts raw binary stream buffers coming out of mobile devices and registers them in memory for safe routing processing.
* **`cloudinary`**: External cloud media repository. It completely offloads image storage away from your application server, instantly compressing, converting, and hosting user profile graphics or post images on a high-availability global CDN network.

### 🧠 Logic Validation, Telemetry & Logging
* **`express-validator`**: Middleware-based request data validation. It acts as an inline safety barrier inside your route chains, running sequential validation checks (e.g., checking for valid email formats, matching strong password lengths, or rejecting negative budget values) and sanitizing body inputs before they ever touch your controllers or Prisma engine.
* **`dotenv`**: Configures server environmental values. It securely maps private credentials, encryption blocks, and database string links out of hidden local text parameters directly into the server's runtime memory (`process.env`).
* **`winston`**: Structured local logging engine. It pipes server execution history cleanly into automated, local `.log` tracking text sheets while utilizing custom data-redaction masks to scrub sensitive user input data like passwords or tokens.
* **`@sentry/node`**: Production telemetry crash analytics. It hooks natively into Express 5's async error pipelines to capture deep server bugs and uncaught rejections, immediately firing a rich stack trace diagnostic alert straight to your Gmail inbox.

---

## 🚀 Getting Started

### 1. Install Core Global Utilities (First Time Only)
Install the global execution engines needed to run hot-reloading file synchronization and handle schema compilations:
```bash
npm install -g nodemon prisma
```

### 2. Manual Installation of the Production Libraries Array
If you are initializing this project ecosystem from a blank repository, run this exact installation script block to download and register every architectural tier:
```bash
npm install express@5.2.1 prisma @prisma/client helmet cors express-rate-limit rate-limit-redis cookie-parser ioredis multer cloudinary zod dotenv winston @sentry/node winston-transport --legacy-peer-deps
```
*(Alternatively, if your repository already contains the final `package.json` file, simply run a single `npm install` to download them all instantly).*

### 3. Run Database Migrations & Performance Indexes
Generate your type-safe Prisma client layouts and push your database composite index configurations directly to your live tables using the native execution runner:
```bash
npx prisma generate
npx prisma db push
```

### 4. Launch the Development Server
Start your local application instance with hot-reloading background process watching enabled:
```bash
npm run dev
```

---

## 📡 API Endpoint Payload Documentation
To inspect the complete blueprint directory detailing exactly how your frontend mobile app should send headers, parse parameters, query cursor feeds, or process JSON response payloads, please review our comprehensive guide:
👉 **[View the API Endpoints Blueprint Guide](./linkup/docs/endpoints.md)**