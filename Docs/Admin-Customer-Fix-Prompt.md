## Admin Customer Management — Replace Fake Data & Add Customer Details

I need you to fix the **Customers section in the Admin Panel**.

### 1. Remove all fake/mock customer data

The customer table currently appears to contain **hardcoded/fake customers**.

Trace the complete data flow:

- Admin Customers page/component
- Customer state/store
- API routes
- Customer model/schema
- Order model/schema
- MongoDB

Do **not** simply modify the existing mock data.

The Admin Customers page must load **real customers from MongoDB**.

If customers are derived from registered users/orders, determine the correct source from the existing project architecture and use the real persisted data.

Remove or bypass mock customer arrays/data from the production admin UI.

---

### 2. Connect Customers to real MongoDB data

Create/fix the required backend API so the admin panel can retrieve real customer information.

The customer list should preferably include:

- Customer ID
- Name
- Email
- Phone
- Number of orders
- Total orders value / lifetime spending
- Last order date
- Account/registration date
- Customer status
- Location/address if available

Use the existing database models and authentication architecture instead of introducing unnecessary duplicate systems.

Make sure the API handles:

- Loading customers
- Empty customer results
- API/database errors
- Loading states
- Invalid/missing customer records

---

### 3. Add a proper "View Details" option

Add a **View Details** action for every customer.

It should open a dedicated details page, drawer, or modal depending on the existing Admin Panel UI pattern.

The details view should show:

#### Customer Information
- Name
- Email
- Phone
- Customer ID
- Account creation date
- Status
- Address/location

#### Order Statistics
- Total number of orders
- Total amount spent
- Average order value
- Most recent order
- First order

#### Previous Orders

Display the customer's complete order history from MongoDB.

Each order should show useful information such as:

- Order ID
- Order date
- Products/items
- Quantity
- Total amount
- Payment status
- Order status
- Shipping/delivery status
- View order option

Clicking an order should allow the admin to inspect the full order details using the existing order details functionality where possible.

---

### 4. Improve the customer table

Add useful columns instead of showing only basic customer information.

Suggested columns:

| Column | Purpose |
|---|---|
| Customer | Name + avatar/initial |
| Email | Customer email |
| Phone | Contact number |
| Orders | Total number of orders |
| Total Spent | Lifetime order value |
| Last Order | Most recent order |
| Status | Active/inactive |
| Joined | Registration date |
| Actions | View Details / other actions |

Make the table responsive and consistent with the existing Admin Panel design.

---

### 5. Search, filtering and sorting

If the Admin Panel already has table utilities, extend them to support:

- Search by name
- Search by email
- Search by phone
- Filter by customer status
- Sort by total orders
- Sort by total spending
- Sort by newest/oldest customer
- Sort by latest order

Do not add unnecessary dependencies if the project already has suitable utilities.

---

### 6. Customer/order relationship

Most importantly, make sure customer data and order data are actually connected.

For example:

```text
Customer
   ↓
Customer ID / User ID
   ↓
Orders belonging to that customer
   ↓
Order history + statistics
```

Do **not** match customers using unreliable fields such as display names.

Use the existing stable user/customer identifier in the database.

If the current Order model does not properly reference the customer/user, update the schema and related order creation logic carefully so future orders are correctly associated with customers.

---

### 7. Preserve existing functionality

Before changing anything:

1. Inspect the existing customer implementation.
2. Inspect the MongoDB schemas/models.
3. Inspect the existing order API.
4. Inspect how users/customers are authenticated.
5. Inspect the existing Admin Panel design/components.
6. Reuse existing components and API patterns wherever possible.

Do not rewrite unrelated parts of the application.

Do not introduce mock/fallback customer data just to make the UI look populated.

---

### 8. Empty and loading states

The page must look professional when:

- There are no customers.
- A customer has never placed an order.
- A customer has incomplete profile information.
- MongoDB is temporarily unavailable.
- The API returns an error.

Show appropriate loading skeletons, empty states, and error messages.

---

### 9. Verify everything

After implementation:

- Create/use a real customer.
- Create/use real orders associated with that customer.
- Confirm the customer appears in the Admin Customers table.
- Confirm the order count is correct.
- Confirm lifetime spending is calculated correctly.
- Open **View Details**.
- Confirm previous orders are loaded from MongoDB.
- Refresh the page and confirm the data persists.
- Confirm no fake/mock customers are being rendered.
- Test customers with zero orders.
- Test customers with multiple orders.
- Run the production build.
- Check for TypeScript/ESLint/runtime errors.

### Important

**Do not stop at the UI.**

The goal is to replace the fake Admin Customers data with a **fully functional MongoDB-backed customer management system**, including real customer/order relationships and a useful customer details view.

Before making changes, inspect the existing architecture and use the project's current patterns rather than creating a parallel implementation.