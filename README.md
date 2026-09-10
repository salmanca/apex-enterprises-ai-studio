# Apex Enterprises — Web Application & Management Console

A full-stack appliance spare parts catalogue and store locator platform with administrative management console.

---

## 📋 System Prerequisites

Before running the application on your computer, ensure you have:

- **Node.js**: Version **18.0.0** or higher (Recommended: Node.js 20 or 22 LTS from [https://nodejs.org](https://nodejs.org))
- **npm**: Version **9.0.0** or higher (automatically installed with Node.js)
  - Alternatively, you can use `yarn`, `pnpm`, or `bun`
- **Modern Web Browser**: Chrome, Edge, Safari, Firefox, or Brave

---

## 🚀 Quick Start (Local Setup)

### 1. Open Terminal in Project Directory
Navigate into the project folder on your computer:
```bash
cd path/to/project
```

### 2. Install Dependencies
Install all packages defined in `package.json`:
```bash
npm install
```

### 3. (Optional) Set Up Environment Variables
Copy the example environment configuration:
```bash
# On macOS / Linux:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env
```
*(The application works out of the box with built-in default values even without a custom `.env` file.)*

### 4. Start the Local Server
Run the unified Express + Vite development server:
```bash
npm run dev
```

The server will boot and display:
```
Apex Enterprises server listening on http://0.0.0.0:3000
```

### 5. Open in Your Browser
Open:
```
http://localhost:3000
```

---

## 🔐 Administrative Management Console

The application includes a secure admin management portal for updating products, categories, brands, store locations, and site settings.

- **Admin Login Link**: Located at the bottom of every page in the website footer ("Admin Login") or directly at `http://localhost:3000/#admin`
- **Default Email**: `admin@apexenterprises.com`
- **Default Password**: `admin123`

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the server in development mode with live code reloading on port 3000 |
| `npm run build` | Builds the client static assets with Vite and bundles `server.ts` with esbuild |
| `npm start` | Runs the compiled production server from `dist/server.cjs` |
| `npm run lint` | Runs TypeScript type-checking to verify code validity |
| `npm run clean` | Cleans up the `dist` build directory |

---

## 📦 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Lucide React, Leaflet Maps, Motion
- **Backend**: Node.js, Express, Multer (image uploads), bcryptjs, jsonwebtoken (JWT authentication)
- **Database**: Local JSON file persistence in `/data/db.json` (no external database installation needed)
