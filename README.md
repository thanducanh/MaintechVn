# MAINTECH VIETNAM - ENTERPRISE CONTROL CENTER

Enterprise monitoring and operational dashboard for Maintech Vietnam. Features real-time sockets, Firebase FCM notifications, PWA, and comprehensive monitoring capabilities.

## Getting Started

Follow these instructions to set up the project locally.

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example` and fill in the required values.

### 3. Setup Database (Prisma)

Generate Prisma client and push the schema to the database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run the Development Server

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
