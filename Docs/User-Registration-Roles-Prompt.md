Update the existing authentication and user-management system to support **Customer, Manager, and Admin accounts**.

Do not remove or break the existing Demo and Admin accounts.

Before making changes, inspect the existing authentication, user model, admin portal, authorization/middleware, order system, and database structure. Reuse the existing architecture instead of creating a duplicate authentication system.

## 1. Customer Registration

Allow normal visitors to create their own customer accounts.

Registration form:

- Full Name
- Email
- Password
- Confirm Password
- Create Account

Any account created through the public registration page must automatically have:

```text
role = "customer"
```

Customers must NOT be able to select or modify their role.

They must never be able to register themselves as:

```text
admin
manager
```

Keep the existing Demo and Admin accounts working.

---

# 2. Admin Can Create Users

Add a **Users** section inside the Admin Portal.

Admin should be able to create users manually from inside the dashboard.

Add:

**Users → Add User**

Form:

- Name
- Email
- Password
- Confirm Password
- Role

Role options:

```text
Customer
Manager
Admin
```

Only authorized Admin users can create Manager or Admin accounts.

Validate that the email is unique.

Passwords must be securely hashed and must never be stored in plain text.

---

# 3. User Management

Create a complete user-management page in the admin portal.

Display:

- Name
- Email
- Role
- Account status
- Created date
- Last login if available
- Actions

Example:

```text
Users
────────────────────────────────────────────

Name          Email              Role       Status

John          john@email.com     Customer   Active
Ahmed         ahmed@email.com    Manager    Active
Admin         admin@email.com    Admin      Active

                              [Add User]
```

Admin should be able to manage users.

Available actions can include:

- View user
- Edit user
- Change role
- Enable/disable user
- Reset password if supported by the existing auth system
- Delete user

## IMPORTANT

Only **Admin** can delete users.

Managers must NOT be able to delete users.

Customers must not access user management.

---

# 4. Three Roles

Implement these roles:

```text
customer
manager
admin
```

## CUSTOMER

Customers have normal storefront access.

They can:

- Browse products
- Add products to cart
- Checkout
- View their own orders
- Manage their own account
- Submit product reviews
- View approved reviews
- Use all existing customer functionality

Customers must NOT access the Admin Portal.

---

# 5. MANAGER ROLE

A Manager should have **almost the same operational access as Admin**.

Manager permissions should include:

### Products

- View products
- Add products
- Edit products
- Update inventory
- Manage product information
- Manage product status

### Orders

- View orders
- View order details
- Change order status
- Process orders
- Update fulfillment status
- Approve/verify orders where applicable
- Handle order-management operations

### Reviews

- View reviews
- Approve reviews
- Reject reviews
- Manage review status
- Add reviews if Admin has that functionality

### Customers

- View customers/users
- View customer information needed for store operations
- Manage appropriate customer/account statuses

### Other Admin Operations

Manager should be able to perform normal day-to-day store-management operations available to Admin.

The goal is:

```text
Manager ≈ Admin
```

for operational tasks.

---

# 6. MANAGER RESTRICTIONS

A Manager must NOT have destructive/system-level permissions.

Manager cannot:

- Delete users
- Delete Admin accounts
- Delete Managers
- Delete customers
- Delete important system data
- Delete the store/database
- Change critical system configuration
- Modify authentication/security configuration
- Promote themselves to Admin
- Create or assign Admin privileges unless explicitly allowed by the existing system
- Bypass authorization
- Remove the last Admin account

Most importantly:

### Manager cannot delete anything.

If the system has destructive actions such as:

```text
Delete User
Delete Product
Delete Order
Delete Review
Delete Coupon
Delete Category
Delete other important records
```

carefully classify them.

The Manager should be prevented from destructive deletion operations wherever possible.

If an operation is destructive, prefer:

- Disable
- Archive
- Reject
- Mark inactive
- Change status

instead of deletion.

---

# 7. ADMIN ROLE

Admin has the highest level of access.

Admin can:

- Create users
- Create Managers
- Create Admins
- Change user roles
- Manage Customers
- Manage Managers
- Manage Admins
- Delete users
- Manage products
- Manage orders
- Change order statuses
- Manage reviews
- Approve/reject reviews
- Manage all existing admin functionality
- Perform destructive operations
- Manage system-level settings where supported

Admin remains the only role with full destructive permissions.

---

# 8. Permission System

Do NOT rely only on hiding buttons in the frontend.

Authorization must be enforced server-side.

Create/use a centralized permission system such as:

```text
ADMIN
MANAGER
CUSTOMER
```

and permission checks such as:

```text
canManageUsers
canCreateUsers
canDeleteUsers
canManageProducts
canManageOrders
canChangeOrderStatus
canManageReviews
canDeleteData
```

Example:

```text
Admin:
canDeleteUsers = true

Manager:
canDeleteUsers = false

Customer:
canDeleteUsers = false
```

A Manager attempting to call a delete API directly must receive an authorization error even if they bypass the UI.

---

# 9. Admin Portal Access

Both Admin and Manager should be able to access the admin/management portal.

Customer should be redirected away from the Admin Portal.

For example:

```text
Customer → Store / Customer Account

Manager → Admin Portal with restricted permissions

Admin → Full Admin Portal
```

The UI should automatically adapt according to the logged-in user's role.

---

# 10. Admin Portal Navigation

For Admin:

```text
Dashboard
Orders
Products
Reviews
Users
Customers
Coupons
Categories
Settings
...
```

For Manager:

Show the operational sections they are allowed to use, but hide destructive/system-only functionality.

For example:

```text
Dashboard
Orders
Products
Reviews
Customers
...
```

Do not rely on hiding the menu as the security mechanism. Server-side authorization is mandatory.

---

# 11. User Role Editing

Admin should be able to change a user's role.

For example:

```text
Customer → Manager
Manager → Customer
Manager → Admin
Admin → Manager
```

However, protect the system from dangerous situations.

Rules:

- Manager cannot change their own role to Admin.
- Manager cannot grant Admin privileges.
- Manager cannot modify Admin permissions.
- Only Admin can assign the Admin role.
- Prevent deletion or demotion of the final remaining Admin if that would lock the system.
- Do not allow a user to elevate their own privileges.

---

# 12. User Status

Support user account status where appropriate:

```text
active
disabled
```

Admin can enable/disable users.

Managers may be allowed to manage operational customer status if the existing application needs it, but they must not be able to disable/remove Admin users.

Disabled users should not be able to authenticate normally.

---

# 13. Order Management

Managers must have full operational order-management access.

They can:

- View orders
- Open order details
- Verify orders
- Approve orders where applicable
- Change order status
- Update fulfillment status
- Process orders
- Manage shipping/order workflow

For example:

```text
Pending
↓
Confirmed
↓
Processing
↓
Shipped
↓
Delivered
```

Manager can perform these status changes just like Admin.

Any existing order-status rules should continue to be respected.

---

# 14. Review Management

Managers should have access to the review-management system.

They can:

- View pending reviews
- Approve reviews
- Reject reviews
- View approved reviews
- Manage review status
- Add reviews if permitted by the existing admin review functionality

Customers can submit reviews, but approval must remain an administrative/managerial operation.

---

# 15. Security Requirements

This is extremely important.

Never trust:

```text
role
userId
permissions
isAdmin
isManager
```

values coming from the client.

Always get the authenticated user from the server-side session/authentication system.

Determine their role server-side.

Never allow a client request such as:

```text
role=admin
```

to grant privileges.

Never allow:

```text
isAdmin=true
```

from the browser to bypass authorization.

All sensitive operations must verify permissions server-side.

---

# 16. Existing Demo/Admin Accounts

Keep the existing test accounts.

The existing Demo account should remain a normal customer/demo account.

The existing Admin account should remain an Admin.

Do not break their existing login credentials or permissions.

After implementation, it should be possible to create additional accounts such as:

```text
Demo Customer
Admin
John Customer
Ahmed Manager
Store Admin
```

from the system.

---

# 17. Reviews + New Customers

Make sure the new customer accounts work correctly with the review system.

A registered customer should be able to:

1. Create an account.
2. Sign in.
3. Purchase a product.
4. Receive the order.
5. Be prompted to review the product.
6. Submit a review.
7. Have the review marked pending.
8. Admin/Manager approves it.
9. Review becomes visible on the storefront.

---

# 18. Testing

Add tests for role-based authorization.

At minimum test:

### Customer

- Can register
- Can login
- Can access storefront
- Cannot access admin portal
- Cannot manage orders
- Cannot approve reviews
- Cannot manage users
- Cannot delete anything

### Manager

- Can access admin portal
- Can manage products
- Can manage orders
- Can change order status
- Can approve/reject reviews
- Can view customers/users as permitted
- Can perform normal operational management
- Cannot delete users
- Cannot delete Admins
- Cannot promote themselves to Admin
- Cannot grant themselves additional permissions
- Cannot perform restricted system operations

### Admin

- Can access everything
- Can create users
- Can create Managers
- Can create Admins
- Can change roles
- Can delete users
- Can perform destructive operations
- Can manage all existing admin functionality

### Registration

- Public registration always creates Customer
- User cannot select Manager/Admin during registration
- Duplicate email rejected
- Password validation works
- Password is securely stored
- New customer can login

---

# 19. Final Verification

After implementation:

1. Run type checking.
2. Run linting.
3. Run all existing tests.
4. Run the new authentication/authorization tests.
5. Verify Demo login.
6. Verify Admin login.
7. Register a new Customer.
8. Create a Manager from the Admin Portal.
9. Login as Manager.
10. Verify Manager can manage orders.
11. Verify Manager can change order statuses.
12. Verify Manager can approve reviews.
13. Verify Manager cannot delete users.
14. Verify Manager cannot promote themselves to Admin.
15. Login as Admin.
16. Verify Admin can create users.
17. Verify Admin can change roles.
18. Verify Admin can delete users.
19. Verify Customers cannot access the Admin Portal.
20. Verify all sensitive permissions are enforced server-side.

## Important implementation rule

Do not simply add/hide buttons based on roles.

Implement **real server-side role-based authorization**.

Do not rewrite the entire authentication system if the current system already works.

Inspect the current code first and integrate this functionality into the existing architecture.

The final result should be a production-ready authentication and role-management system with:

```text
CUSTOMER
   ↓
Normal storefront customer

MANAGER
   ↓
Full operational management
   ↓
Cannot delete/destructively manage users/system

ADMIN
   ↓
Full access
   ↓
Can create/manage/delete users
   ↓
Can manage Managers and Admins
```

Actually implement the feature in the existing codebase. Do not just describe the changes.