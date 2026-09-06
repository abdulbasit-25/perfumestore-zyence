# Seed Commands

Run these from the project folder:

```powershell
npm install
npm run seed:users
npm run seed:products
```

## Required `.env`

Set these values before seeding:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## What They Do

- `npm run seed:users` creates the demo admin and customer users.
- `npm run seed:products` creates categories, uploads product images to Cloudinary, and saves products in MongoDB.

Product seeding is safe to run again. Existing migrated products are skipped.

There is currently no `npm run seed` command. Use the specific commands above.
