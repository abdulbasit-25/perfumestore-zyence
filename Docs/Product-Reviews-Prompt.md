Implement a complete **Product Reviews & Ratings System** in my existing e-commerce application.

IMPORTANT:
- First inspect the existing project structure, database models, authentication, product pages, order system, customer account pages, and admin dashboard.
- Reuse the existing architecture, components, styling, authentication, database utilities, and coding conventions.
- Do NOT create duplicate models, routes, utilities, or authentication systems.
- Do NOT break any existing functionality.
- Make the implementation production-ready.
- Since this application uses MongoDB, keep all database operations and sensitive review/order verification logic on the server side. Do not import MongoDB or Node-only modules into client/browser code.

## 1. Review Database Model

Create/reuse a Review model/collection with fields similar to:

- _id
- productId
- customerId (optional for admin-created reviews)
- orderId (optional for admin-created reviews)
- rating: number from 1 to 5
- comment
- status: "pending" | "approved" | "rejected"
- isVerifiedPurchase: boolean
- createdBy: "customer" | "admin"
- createdAt
- updatedAt

Use the project's existing MongoDB/model conventions.

Add appropriate indexes where useful, especially for:
- productId
- status
- customerId
- orderId

## 2. Customer Review Submission

Allow customers to submit reviews for products they purchased.

Review form should contain:

- 1–5 star rating selector
- Review/comment textarea
- Submit Review button

Validation:
- Rating must be between 1 and 5.
- Comment should have a reasonable minimum/maximum length.
- User must be authenticated.
- Customer must have purchased the product.
- Ideally, only allow reviewing a product after the relevant order has been delivered/completed.
- Prevent duplicate reviews for the same product/order unless the existing project has a reason to allow multiple reviews.

New customer reviews should initially have:

status = "pending"

createdBy = "customer"

isVerifiedPurchase = true

Show a success message such as:

"Thank you! Your review has been submitted and is waiting for approval."

Do not immediately display pending reviews publicly.

## 3. Ask Customer for Review After Delivery

When an order changes to a delivered/completed status, show the customer an option to review the purchased products.

Example:

"Your order has been delivered! How was your experience?"

Show:

[Write a Review]

For each eligible product in the delivered order, allow the customer to submit a review.

Do not repeatedly show the review request after the customer has already submitted a review.

If the existing application has an order confirmation/account/order-history page, integrate the review prompt there instead of creating an unnecessary separate workflow.

## 4. Product Frontend Reviews

Add a Reviews section to the product detail page.

Only display reviews where:

status = "approved"

Do NOT display pending or rejected reviews.

Display:

- Average rating
- Total number of reviews
- Star rating
- Rating distribution (5-star, 4-star, etc.)
- Reviewer's name
- Review date
- Review comment
- "Verified Purchase" badge for verified customer reviews

Example:

Customer Reviews

★★★★★ 4.8 / 5
Based on 24 reviews

5 ★★★★★  18
4 ★★★★☆   4
3 ★★★☆☆   1
2 ★★☆☆☆   1
1 ★☆☆☆☆   0

────────────────────

Ali
★★★★★
Verified Purchase

"Excellent product. Very good quality."

Do not show private customer information.

If there are no approved reviews, show a clean empty state:

"No reviews yet. Be the first to review this product."

## 5. Admin Reviews Management

Add a dedicated "Reviews" section to the admin dashboard.

Admin should be able to see:

- All Reviews
- Pending Reviews
- Approved Reviews
- Rejected Reviews

Each review should show:

- Product
- Customer
- Rating
- Comment
- Status
- Verified Purchase
- Created date

Admin actions:

- View
- Approve
- Reject
- Delete

When admin approves a review:

status = "approved"

It should then become visible on the product frontend.

When admin rejects a review:

status = "rejected"

It should not appear on the frontend.

Add appropriate confirmation dialogs for destructive actions such as delete.

## 6. Admin Can Add Reviews Manually

Add an "Add Review" button in the admin Reviews section.

Admin should be able to manually create a review.

Form:

- Select product
- Customer name/customer (optional)
- Rating
- Review/comment
- Status
- Verified Purchase toggle

Admin-created reviews should support:

createdBy = "admin"

Allow admin to choose whether the review is:

- Pending
- Approved
- Rejected

If approved, it should immediately appear on the product page.

Do not require an orderId for manually created admin reviews.

Clearly distinguish admin-created reviews internally from customer reviews.

## 7. Review API / Server Actions

Implement secure server-side operations for:

- Create customer review
- Create admin review
- Get approved reviews for product
- Get product rating summary
- Get customer's eligible products for review
- Check whether customer purchased product
- Approve review
- Reject review
- Delete review
- Get admin reviews
- Get pending reviews

All operations must enforce authentication and authorization.

Only admins can:
- Add manual reviews
- Approve reviews
- Reject reviews
- Delete reviews
- Access admin review management

Customers must not be able to modify the review status.

## 8. Product Rating Calculation

For each product calculate:

- Average rating
- Total reviews
- Count of 5-star reviews
- Count of 4-star reviews
- Count of 3-star reviews
- Count of 2-star reviews
- Count of 1-star reviews

Only approved reviews should be included in the public rating calculation.

Use efficient MongoDB queries/aggregation where appropriate rather than loading every review unnecessarily.

## 9. Customer Account / Order History

If the existing application has an order history page, add review status/actions there.

For delivered orders:

If the customer has not reviewed a product:

[Write Review]

If the customer already reviewed it:

"Review Submitted"

If the review is pending:

"Review Pending"

If approved:

"Review Approved"

Do not allow duplicate reviews.

## 10. UI/UX

Follow the existing application's design system.

Do not introduce a completely different UI.

Make the review system responsive for:

- Desktop
- Tablet
- Mobile

Use the existing buttons, cards, dialogs, forms, typography, spacing, and notification components where available.

Star rating should have a polished interactive UI.

Handle:
- Loading states
- Empty states
- Error states
- Success states
- Form validation
- Disabled submit state
- Admin confirmation dialogs

## 11. Security

IMPORTANT:

Never trust productId, customerId, orderId, or isVerifiedPurchase values sent by the client.

For customer reviews:

- Get the authenticated customer from the server session.
- Verify that the customer actually purchased the product.
- Verify the order belongs to that customer.
- Verify the order is delivered/completed according to the existing order statuses.
- Determine verified-purchase status server-side.
- Prevent customers from submitting reviews for products they did not purchase.
- Prevent customers from changing approval status.

Never expose MongoDB credentials or server-only environment variables to the browser.

## 12. Testing

Add tests for the review functionality using the project's existing test framework.

Test at minimum:

- Valid customer review submission
- Invalid rating
- Empty/invalid comment
- Unauthenticated user
- Customer who did not purchase product
- Customer whose order isn't delivered
- Duplicate review prevention
- Pending review isn't shown publicly
- Approved review is shown publicly
- Rejected review isn't shown publicly
- Admin can approve review
- Admin can reject review
- Non-admin cannot approve/reject
- Admin can create review
- Rating calculations only include approved reviews

## 13. Final Verification

After implementation:

1. Run the project's type checker.
2. Run linting if configured.
3. Run all tests.
4. Fix all errors.
5. Check that the existing product pages still work.
6. Check that the existing order flow still works.
7. Check that the admin dashboard still works.
8. Check that MongoDB is only imported/used server-side.
9. Check that no client component imports server-only modules.
10. Check responsive UI.

Finally, provide a concise summary of:

- Files changed
- Database/model changes
- New customer functionality
- New admin functionality
- New routes/server actions
- Tests added
- Any migration/setup required

Do not stop at explaining what needs to be done. **Actually implement the complete feature in the existing codebase.**