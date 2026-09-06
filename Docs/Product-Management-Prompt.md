Implement Production-Ready Product Management with MongoDB + Cloudinary

You are working on the Sorrel E-Commerce Store built with TanStack Start + React + TypeScript + MongoDB.

The current project is a high-fidelity prototype. Products are still backed by src/lib/mock-data.ts, Zustand, localStorage, and /assets/ images.

Your task is to convert the entire product system into a real production-backed implementation using MongoDB and Cloudinary.

NON-NEGOTIABLE REQUIREMENT

There must be ZERO mock product data in the runtime product flow.

Do not use:

seedProducts as a runtime fallback
src/lib/mock-data.ts for products
Zustand/localStorage as the product source of truth
hardcoded product arrays
/assets/ placeholder product images
fake API responses
fallback products when MongoDB fails
frontend-only product CRUD

Every product displayed by the application must come from MongoDB, and every uploaded product image must be stored in Cloudinary with its Cloudinary public_id persisted in MongoDB.

If MongoDB or Cloudinary fails, show an appropriate error. Do not fall back to mock data.

1. Inspect the Existing Project First

Before modifying code:

Inspect the repository structure.
Inspect:
src/lib/mock-data.ts
src/lib/store.ts
src/lib/mongodb.ts
src/lib/auth.ts
src/lib/auth-server.ts
src/routes/shop.tsx
src/routes/product.$slug.tsx
src/routes/admin.products.tsx
existing TanStack Start server functions/API patterns
existing environment configuration
package.json
Identify every place where products/categories/product images are currently read or mutated.
Identify all existing mock product dependencies.
Preserve the existing UI/design unless changes are required for the real backend integration.

Do not rewrite unrelated features.

2. Create a Real MongoDB Products Collection

Create a production-ready products collection.

Use the existing MongoDB connection infrastructure.

Recommended product structure:

{
_id: ObjectId,
name: string,
slug: string,
description: string,
price: number,
sku: string,
stock: number,

categoryId: ObjectId,

images: [
{
url: string,
publicId: string,
alt: string
}
],

rating: number,
reviewCount: number,

createdAt: Date,
updatedAt: Date
}

Use appropriate TypeScript types.

Do not introduce Mongoose unless the existing project already uses it. Prefer the existing MongoDB driver if that is what the project currently uses.

3. Add Database Validation

All product mutations must be validated on the server.

Use Zod or the project's existing validation approach.

Validate at minimum:

name
description
price
SKU
stock
category
slug
image metadata

Rules should include:

price cannot be negative
stock cannot be negative
SKU must be unique
slug must be unique
required fields cannot be empty
invalid ObjectIds must be rejected
image references must have valid URLs/public IDs

Never trust frontend validation alone.

4. Add MongoDB Indexes

Create appropriate indexes.

At minimum:

products.slug → unique
products.sku → unique
products.categoryId → index
products.createdAt → index

If appropriate for the existing search implementation, add indexes for product search.

Do not create duplicate indexes on every request. Make index creation safe/idempotent.

5. Implement Product Server Functions

Create a clean server-side product service/module.

Implement:

getProducts()
getProductById(id)
getProductBySlug(slug)
createProduct()
updateProduct()
deleteProduct()
searchProducts()
updateProductStock()

The exact names can follow existing project conventions.

All database operations must happen server-side.

Never expose MongoDB credentials or database access to the browser.

6. Implement Server-Side Admin Authorization

Every product mutation must verify authentication on the server.

For:

createProduct
updateProduct
deleteProduct
updateProductStock

perform:

JWT validation
↓
current user lookup/validation
↓
verify role === "admin"
↓
allow operation

Unauthorized users must receive an appropriate 401/403 response.

Do NOT rely on:

user.role === "admin"

in the React frontend as the security mechanism.

The frontend check can remain for UX, but it is NOT authorization.

7. Integrate Cloudinary

Add Cloudinary as the product media storage system.

Use environment variables such as:

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Never expose CLOUDINARY_API_SECRET to the client.

Use a sensible product folder structure, for example:

sorrel/products/{product-id}/

or another clean equivalent.

8. Product Image Upload

Implement real product image uploads.

Flow:

Admin Product Form
↓
Server/API
↓
Validate authenticated admin
↓
Upload image to Cloudinary
↓
Receive secure_url + public_id
↓
Save references in MongoDB

MongoDB should store:

{
url: "https://...",
publicId: "sorrel/products/...",
alt: "..."
}

Do not store raw image files in MongoDB.

Do not use /assets/ for newly created products.

9. Handle Image Replacement Correctly

When editing a product:

If an image is replaced:

Identify the old Cloudinary publicId.
Upload the new image.
Update MongoDB.
Delete the old Cloudinary asset only after the new asset has been successfully uploaded and the database update can succeed.

Avoid leaving orphaned Cloudinary assets.

If the database update fails after an upload, handle cleanup appropriately.

Do not delete the old asset before the replacement is safely stored.

10. Handle Product Deletion Correctly

When deleting a product:

Authenticate the admin.
Fetch the product from MongoDB.
Read all associated Cloudinary publicIds.
Delete associated Cloudinary assets.
Delete the MongoDB product record.

Handle partial failures safely.

Do not silently delete the database record while leaving unmanaged Cloudinary assets.

If the architecture requires a different ordering for consistency, implement the safest approach and document it.

11. Replace Shop Mock Data

Update:

src/routes/shop.tsx

so products are loaded exclusively from the backend.

Remove runtime dependency on:

seedProducts

The shop page must display real MongoDB products.

Filtering/searching should operate on the real backend product dataset.

Do not implement:

try {
fetchProducts()
} catch {
return seedProducts
}

That is explicitly forbidden.

12. Replace Product Detail Mock Data

Update:

src/routes/product.$slug.tsx

to use:

getProductBySlug(slug)

from MongoDB.

Related products must also come from MongoDB.

Remove all runtime dependency on hardcoded product objects.

If the product does not exist:

return a proper not-found state/page
do not display a mock product 13. Replace Admin Product CRUD

Update:

src/routes/admin.products.tsx

so:

Create
Form
↓
server validation
↓
Cloudinary upload
↓
MongoDB insert
↓
refresh product list

Update
Form
↓
server validation
↓
Cloudinary changes if needed
↓
MongoDB update
↓
refresh product list

Delete
Admin authorization
↓
Cloudinary cleanup
↓
MongoDB deletion
↓
refresh product list

The admin page must no longer mutate useCatalog as the source of truth.

14. Remove Product Persistence from Zustand/localStorage

useCatalog must no longer be responsible for persistent product data.

You may keep a temporary UI/query state if necessary, but:

MongoDB must remain the source of truth.

Do not store the complete product catalog in localStorage.

Do not hydrate products from localStorage.

Do not save product CRUD changes to localStorage.

15. Categories

The current categories are also mock data.

Create a real categories collection if the architecture requires category management.

Recommended:

{
_id: ObjectId,
name: string,
slug: string,
description: string,
createdAt: Date,
updatedAt: Date
}

Add:

categories.slug → unique

Products should reference categories using:

categoryId: ObjectId

Update the admin category page to use the backend instead of in-memory state.

Deleting a category must safely handle products currently assigned to that category.

Do not leave orphaned product references.

16. Product Search and Filtering

Move product retrieval toward a real backend query.

Support, as appropriate:

category
search text
minimum price
maximum price
stock availability
sorting
pagination

Do not fetch fake/mock products and filter them in the browser.

The backend should query MongoDB.

If full-text search is not yet necessary, implement a safe MongoDB-compatible search strategy while keeping the architecture extensible.

17. Inventory

Stock must be server-authoritative.

The browser must never be trusted to determine the final available stock.

For product stock:

MongoDB stock
↓
backend validation
↓
order creation / inventory mutation

Prevent negative stock.

Prepare the implementation so checkout cannot purchase more inventory than is available.

18. Product Creation Timestamps

Every created product must have:

createdAt
updatedAt

Use server-generated timestamps.

Do not trust timestamps supplied by the browser.

Updates should modify:

updatedAt

without overwriting the original createdAt.

19. API Response Handling

Create consistent success/error responses.

Handle:

validation errors
authentication errors
authorization errors
duplicate SKU
duplicate slug
product not found
category not found
Cloudinary upload errors
Cloudinary deletion errors
MongoDB errors
invalid ObjectIds

Do not expose sensitive database or Cloudinary credentials/errors to users.

Log useful server-side diagnostic information.

20. Environment Configuration

Add/update .env.example with:

MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

Do not put real credentials in the repository.

Also remove unsafe JWT defaults.

If JWT_SECRET is missing in production, the server must fail rather than use:

your-secret-key-change-in-production

21. Remove Mock Product Runtime Dependencies

After implementation, search the entire repository for:

seedProducts
mock-data
useCatalog
/assets/
hardcoded product names

Remove product-related runtime dependencies.

mock-data.ts may remain temporarily for tests or migration tooling only, but it must NOT be imported by production product pages/components.

If possible, remove product mocks entirely after migrating the existing UI.

22. Existing Products / Migration

Do not simply delete the current seven products without consideration.

If the existing mock products are intended to become initial catalog products:

Create a one-time migration/seed script that:

Reads the existing product definitions.
Uploads their images to Cloudinary.
Creates MongoDB product records.
Stores Cloudinary publicIds.
Avoids duplicate SKU/slug records.
Can be run safely more than once or detects already-migrated products.

This script is for initial data setup only.

The application must never depend on the mock file at runtime.

Clearly distinguish:

seed/migration scripts = allowed
runtime mock data = forbidden

23. Cloudinary Backup / Data Integrity

Make the relationship between MongoDB and Cloudinary explicit.

For every product image:

MongoDB
└── publicId
└── Cloudinary asset

There must be no production product image that exists only in the browser or local filesystem.

Document the recovery relationship so that restoring MongoDB preserves the Cloudinary asset references.

Production Cloudinary assets and MongoDB data must be treated as persistent production data, not temporary files.

24. Testing

Add tests for:

Product service
get products
get product by slug
create product
update product
delete product
duplicate SKU rejection
duplicate slug rejection
invalid product rejection
Authorization
unauthenticated user cannot create products
customer cannot create products
customer cannot update products
customer cannot delete products
admin can perform product CRUD
Cloudinary

Mock Cloudinary only inside tests.

Test:

successful upload
upload failure
replacement
deletion
cleanup behavior
Frontend

Test:

shop loads backend products
product detail loads backend product
admin create product
admin edit product
admin delete product
error states
empty product state

Do NOT use mock products in production runtime just to make tests pass.

25. Loading and Error States

Because the product data is now real backend data, implement proper states:

Loading
Empty
Error
Success

For example:

Loading products...

and:

Unable to load products. Please try again.

Never display fake products during loading/error states.

26. Performance

Implement sensible:

pagination
MongoDB indexes
image transformations through Cloudinary
appropriately sized product images
lazy loading where appropriate
query limits

Do not download massive original images to the storefront if Cloudinary transformations can provide optimized versions.

27. Final Verification

Before considering the task complete, verify:

[ ] MongoDB products collection works
[ ] MongoDB categories collection works
[ ] Product CRUD works
[ ] Category CRUD works
[ ] Product images upload to Cloudinary
[ ] Cloudinary publicId saved in MongoDB
[ ] Image replacement works
[ ] Image deletion works
[ ] Product deletion cleans Cloudinary
[ ] Shop uses MongoDB
[ ] Product detail uses MongoDB
[ ] Related products use MongoDB
[ ] Admin products uses MongoDB
[ ] No product CRUD uses localStorage
[ ] No runtime product data comes from mock-data.ts
[ ] No fallback to mock products
[ ] Search uses real data
[ ] Filtering uses real data
[ ] Inventory is server-authoritative
[ ] Admin authorization enforced server-side
[ ] JWT_SECRET has no unsafe default
[ ] Cloudinary credentials are server-only
[ ] Environment variables documented
[ ] Tests pass
[ ] TypeScript passes
[ ] Production build passes

IMPORTANT IMPLEMENTATION RULES
Do not rewrite the UI unnecessarily.
Do not introduce mock/fake fallback behavior.
Do not expose MongoDB or Cloudinary secrets to the browser.
Do not trust frontend authorization.
Do not use Zustand/localStorage as the product database.
Do not leave /assets/ images as production product storage.
Do not silently swallow database or Cloudinary failures.
Do not claim something is database-backed unless it actually persists to MongoDB.
Do not mark the task complete until the complete flow has been verified end-to-end.
Keep the existing Sorrel design and UX intact wherever possible.
Final Deliverable

At the end, provide a concise implementation report containing:

files created
files modified
files removed/deprecated
MongoDB collections created
indexes created
Cloudinary integration details
API/server functions added
authentication/authorization changes
migration/seed instructions
environment variables required
tests added
verification results
any remaining limitations

Most importantly, explicitly confirm:

All runtime product data now comes from MongoDB, all product media is backed by Cloudinary, and there is no mock-data fallback in the production product flow.
