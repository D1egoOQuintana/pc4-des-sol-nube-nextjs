# Next.js 14 App Router project with 2FA (TOTP) support

This project is a minimal Next.js (App Router) application that demonstrates:

- User registration with bcrypt password hashing
- Login with email/password and enforced 2FA when enabled
- 2FA setup using `speakeasy` (TOTP) and QR code generation via `qrcode`
- MySQL (AWS RDS) connection using `mysql2` and environment variables
- Docker + docker-compose configuration that listens on port `3000`

NOTE: This project purposely keeps authentication simple for demonstration. It does NOT implement sessions or JWT tokens — extend as needed for production.

**Files added/important:**

- `lib/db.js` — reusable MySQL connection and helper functions
- `app/api/auth/register/route.js` — POST register
- `app/api/auth/login/route.js` — POST login
- `app/api/auth/2fa/setup/route.js` — POST setup 2FA (returns QR + otpauth)
- `app/api/auth/2fa/verify/route.js` — POST verify TOTP
- `app/register/page.js`, `app/login/page.js`, `app/2fa/setup/page.js`, `app/2fa/verify/page.js` — frontend pages
- `db/init.sql` — SQL to create database and `users` table
- `Dockerfile`, `docker-compose.yml`, `.env.example` — Docker and environment examples

---

## Quick local run (dev)

1. Copy `.env.example` to `.env` and fill the DB values (for local MySQL or RDS):

```powershell
copy .env.example .env
# then edit .env with credentials
```

2. Install deps and run dev server (on Windows PowerShell):

```powershell
npm install
npm run dev
```

The app will listen on port `3000`.

## Build & run with Docker

1. Build and run with docker-compose (reads `.env`):

```powershell
docker compose up --build -d
```

2. Visit `http://<your-ec2-ip>:3000` (ensure EC2 security group allows port 3000).

The container runs `npm start` which invokes `next start -p 3000`.

## Connect to AWS RDS (MySQL)

1. Create an RDS MySQL instance in your AWS account.
2. Configure inbound rules to allow your EC2 instance to connect (VPC/subnet/security group). If RDS is in same VPC and EC2, prefer private networking.
3. Run the SQL schema in `db/init.sql` on the RDS instance. You can run it with the MySQL client:

```powershell
mysql -h <RDS_ENDPOINT> -P 3306 -u <DB_USER> -p < db/init.sql
```

4. Set `.env` values to point to the RDS endpoint/user/password/name.

## How 2FA works (Google Authenticator)

1. Register a user at `/register`.
2. Go to `/2fa/setup` and provide the registered email.
3. The server returns a QR code and an `otpauth://` URL. Open Google Authenticator (or any TOTP app), choose to add a new account and scan the QR or paste the `otpauth://` URL.
4. After scanning, the authenticator will show codes. Use them at `/2fa/verify` to verify.

During login, if `twofa_enabled` is true for the user, the login endpoint will respond with `{ twofa: true }` and the frontend will redirect to `/2fa/verify?email=...`. After verifying the code, your app should create a session or token (not implemented here).

## Environment variables

Required env vars (see `.env.example`):

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT`

## Notes & Next steps

- This sample intentionally keeps auth/session handling minimal. For production add secure session management (HTTP-only cookies or JWT with refresh), CSRF protection, rate limiting, and proper error handling.
- If you must use `bcrypt` (native) inside Docker, the Dockerfile installs build tools. Alternatively you can swap to `bcryptjs` if you prefer a pure JS implementation.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
