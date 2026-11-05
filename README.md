# Sip & Soul Café

A premium café website with a 3D coffee intro, online ordering for customers and an admin panel for the café.

Designed & developed by **Neirah Tech Solution (Pvt) Ltd.** · +94 76 004 1594 · info@neirahtech.com · neirahtech.com

## What's inside

| Part | Folder | Built with |
| --- | --- | --- |
| Website | `src/` | React 19, TypeScript, Tailwind CSS 4, Three.js (React Three Fiber), Vite |
| Admin panel | `src/admin/` (opens at `/#/admin`) | Same as the website, loaded only when opened |
| Server and database | `server/` | NestJS, Prisma, PostgreSQL |

### Customers can

- Create an account and sign in (name, email, phone, password with letters and numbers, at least 8 characters).
- Add drinks to the cart, change quantities, and order for pickup or delivery.
- Follow their orders (received → preparing → ready → completed) and cancel while an order is still pending.
- Update their name and phone, and change their password (this signs out their other devices).

### The admin can

- See today's orders, open orders, completed sales and customer numbers.
- Move orders through preparing → ready → completed, or cancel them.
- Add, edit and delete drinks: name, description, price, photo upload, availability and whether the drink shows on the homepage.
- Edit all website text and the contact details in the footer.
- Search customers, and block, unblock or delete their accounts.

### Validation and security

- Every form is checked in the browser as you type, and checked again on the server with the same rules. Server errors show under the matching field.
- Unknown or extra fields are rejected. Prices are always read from the database, never from the browser.
- Passwords are hashed with bcrypt. Sessions live in an http-only cookie that browser scripts can't read.
- Requests that change data must come from the site's own address (CSRF protection). Sign-in, sign-up and ordering are rate-limited.
- Admin pages and API routes need an admin account. Blocked customers are signed out at once.
- Photo uploads must be real JPG, PNG or WebP files of 3 MB or less. Photos are stored in the database, so they survive redeploys.
- Security headers (helmet), including a content security policy.

## Run it on your computer

You need Node.js 22 or newer and PostgreSQL (for example [Postgres.app](https://postgresapp.com) on a Mac).

```bash
# 1. Website packages
npm install

# 2. Server: settings, packages and database
cd server
cp .env.example .env          # then edit DATABASE_URL and JWT_SECRET (openssl rand -hex 32)
npm install
npx prisma migrate deploy     # creates the tables
npm run db:seed               # adds the four starter drinks
npm run admin:create          # asks for the admin email and password
npm run start:dev             # API on http://127.0.0.1:3001

# 3. In a second terminal, from the project folder
npm run dev                   # website on http://127.0.0.1:5180, admin at /#/admin
```

## Host it on Railway

The server also serves the built website, so the whole site runs as one Railway service with one Postgres database.

1. In Railway, click **New Project → Deploy from GitHub repo** and choose this repository.
2. In the same project, click **New → Database → PostgreSQL**.
3. Open the web service, go to **Variables** and add:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference to the database) |
   | `JWT_SECRET` | a long random value, e.g. the output of `openssl rand -hex 32` |
   | `NODE_ENV` | `production` |
   | `ADMIN_EMAIL` | the café admin's email |
   | `ADMIN_PASSWORD` | a strong password, 12 or more characters with letters and numbers |

4. Under **Settings → Networking**, click **Generate Domain**.
5. Deploy. `railway.json` builds the website and server, runs the database migrations, adds the starter drinks and creates the admin account.
6. After the first successful deploy, remove `ADMIN_PASSWORD` (and `ADMIN_EMAIL`) from the variables. Otherwise the admin password is reset on every deploy.

The GitHub Pages copy (`deploy.sh`) is a static preview only. It shows the site but cannot sign in or take orders.
