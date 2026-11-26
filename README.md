# BookEasy ET

Marketplace for barbershops, beauty salons and restaurants. Customers discover approved businesses, book appointments and place takeaway or table orders. Businesses manage those requests in a workspace. Platform admins approve businesses and activate subscriptions.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. In `backend`: `npm install` then `npm run dev`.
3. In `frontend`: `npm install` then `npm run dev`.
4. Open `http://localhost:5173`.

Optional: `npm run seed:platform` in `backend` creates the Starter, Professional and Premium plans. If `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are set, it also creates a super admin.

Sample businesses, services and menus still come from the existing seed scripts in `backend/src/scripts`.

## What a pilot can do

- Customers register, manage their profile, recover a password, browse by category and area, book, order takeaway, and review a completed visit.
- An owner submits a business. It stays off the public list until an admin approves it.
- The workspace covers profile and hours, services, staff, bookings, menu, orders, table QR codes, team invites, reviews and the subscription record.
- A table QR opens `/t/:token`. The customer must be online to send a dine-in order. Nothing is stored as confirmed while offline.
- Prices are calculated on the server. Booking times are locked per staff member so two people cannot take the same slot.

Plans start as a 30-day Starter trial. An admin activates a paid month from Platform → Plans. Payment collection is manual for the pilot.

## Email

Set `SMTP_HOST` and the related variables to send password and invite emails. Without them, the API still succeeds and, in development, prints the message in the server log. An invite response also includes the one-time link for the owner to share.

## Images

Uploads are stored in `backend/uploads` and served at `/uploads`. Use managed storage before a public launch. Do not commit customer images.

## Backup

From a machine that can reach the database:

```bash
mongodump --uri="$MONGODB_URI" --out=./backup
mongorestore --uri="$MONGODB_URI" --drop ./backup
```

Test a restore against a separate database before relying on it. Keep production secrets out of git.

## Tests

`npm test` in `backend` checks permissions, order and booking status rules, price snapshots and staff time off. It does not need MongoDB.
