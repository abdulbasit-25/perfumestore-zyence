# Mock Data Usage

Short audit of mock or static data currently used by the application.

| Location               | Mock data / behavior                         | Actually used in               | Status                |
| ---------------------- | -------------------------------------------- | ------------------------------ | --------------------- |
| `src/routes/index.tsx` | `faqEntries` from `src/lib/mock-data.ts`     | Homepage FAQ section           | Active static content |
| `src/routes/index.tsx` | `instagramPosts` from `src/lib/mock-data.ts` | Homepage Instagram/social feed | Active static content |

## Removed Business Fixtures

The former `products`, `customers`, generated `orders`, `salesByMonth`, and `bestSellers` exports were removed from `src/lib/mock-data.ts`. Product, customer, order, and dashboard data comes from MongoDB server functions. `scripts/seed-products.ts` contains setup fixtures only.

## Summary

- Active mock/static areas: 2 data entries
- Active business fixture exports: none found in runtime imports
- Authentication now uses an HttpOnly cookie and server session loader.
