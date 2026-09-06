# Build a User Profile / Account Page

The e-commerce store is **already working** and user **login/authentication is already implemented and functional**.

I do **not** want you to rebuild, replace, or modify the existing authentication system.

Your task is to add a **User Profile / My Account page that users can access after logging in**.

## First — Understand the Existing Project

Before coding, inspect the existing codebase and understand:

- Current authentication implementation
- How the logged-in user is stored/accessed
- Existing user data/model
- Existing routing
- Existing TanStack components and patterns
- Existing UI components
- Existing styling/theme
- Existing MongoDB/server functions
- Existing order data/model

**Reuse what already exists.**

Do not create duplicate authentication, user systems, API systems, or UI components when an existing implementation can be reused.

---

# Main Goal

Create a polished **User Profile / My Account page** for authenticated users.

Suggested route:

```text
/account
```

Use the project's existing routing conventions if a different route structure is already established.

The page should only be accessible to a logged-in user.

---

# 1. Account Layout

Create a modern account dashboard layout.

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│                       My Account                             │
├───────────────────┬──────────────────────────────────────────┤
│                   │                                          │
│ Profile           │        Main Account Content              │
│ Overview          │                                          │
│ Orders            │                                          │
│ Addresses         │                                          │
│ Security          │                                          │
│                   │                                          │
│ Logout            │                                          │
│                   │                                          │
└───────────────────┴──────────────────────────────────────────┘
```

On mobile, make the navigation responsive and easy to use.

Use reusable UI components rather than putting everything into one huge component.

---

# 2. Profile Overview

The main account page should show the user's basic information.

Include:

### Profile Header

- Profile picture/avatar
- User's name
- Email
- Phone number if available
- Edit Profile button

If there is no profile picture, show a clean initials-based avatar.

Example:

```text
        ┌─────────┐
        │   AB    │
        └─────────┘

        Abdul Basit
        user@example.com
        +92 XXX XXXXXXX

        [ Edit Profile ]
```

Do not hardcode the user information.

Use the currently authenticated user's existing data.

---

# 3. Personal Information

Create a profile editing section.

Allow the user to manage information such as:

- First name
- Last name
- Email
- Phone
- Profile picture

Only include fields that make sense with the existing user model.

Use the existing backend/server functionality if it already supports these fields.

If something is genuinely missing and cannot be reused, implement the **smallest necessary addition**.

Do not unnecessarily redesign the backend.

---

# 4. Profile Picture

Allow the user to:

- View their current avatar
- Upload/change their profile picture
- Remove the profile picture if supported
- Preview the selected image
- Fall back to initials when no image exists

Before implementing a new upload system, inspect the project for an existing image/storage solution.

**Reuse an existing image-upload/storage system if one exists.**

Only create new functionality if there is no existing way to handle profile images.

---

# 5. Order History

Since this is an e-commerce store, the account page should include an **Orders** section.

Reuse the existing order data/model.

Show the logged-in user's orders only.

Each order should display:

- Order ID
- Date
- Number of items
- Total
- Payment status
- Order status
- View Order button

Example:

```text
Recent Orders

┌────────────────────────────────────────────────────────────┐
│ #ORD-10291                         Delivered                │
│ Aug 18, 2026                                                │
│ 3 items                              $129.99               │
│                                                            │
│                              [ View Order ]                │
└────────────────────────────────────────────────────────────┘
```

Do not create fake/static order data.

If the existing order system is not yet complete, build the UI so it gracefully handles:

- No orders
- Loading
- Errors
- Existing orders

Example empty state:

```text
You haven't placed any orders yet.

[ Start Shopping ]
```

---

# 6. Order Details

If the existing order system supports order details, allow the user to open an order.

Show:

- Order ID
- Date
- Products
- Product images
- Quantity
- Individual prices
- Subtotal
- Shipping
- Tax if applicable
- Total
- Payment status
- Order status
- Shipping information if available

Reuse existing order-detail components if they exist.

Do not duplicate existing order UI unnecessarily.

---

# 7. Addresses

Add an Addresses section if the existing application already has address/shipping data.

Users should be able to:

- View saved addresses
- Add an address
- Edit an address
- Delete an address
- Set a default address

Example:

```text
Saved Addresses

Home
Abdul Basit
Islamabad, Pakistan
+92 XXX XXXXXXX

[Default]

[Edit] [Delete]
```

If the existing checkout/address system already has reusable address components or schemas, **reuse them**.

---

# 8. Security

Add a simple Security section if the existing authentication system supports it.

For example:

```text
Password
••••••••••••

[ Change Password ]
```

Do not rebuild authentication.

If password-changing functionality already exists, connect the UI to it.

If it does not exist, don't introduce a completely new authentication architecture just for this page. Create the UI in a way that can integrate with the existing auth system later.

---

# 9. Reusable UI Components

This is important.

The project uses **TanStack**, so follow the existing TanStack architecture and patterns.

Before creating new UI primitives:

**Search the project for existing reusable components.**

Reuse existing:

- Buttons
- Inputs
- Cards
- Dialogs
- Modals
- Tabs
- Dropdowns
- Avatars
- Tables
- Toasts
- Forms
- Loading states
- Empty states
- Error states

If an appropriate component does not exist, create a **new reusable component** rather than creating a one-off implementation.

For example, components could be structured around:

```text
ProfileHeader
ProfileInformation
ProfileForm
AvatarUploader
AccountSidebar
AccountNav
OrderCard
OrderList
OrderStatusBadge
AddressCard
AddressForm
EmptyState
```

Do not create these exact components blindly. Use your judgment based on the existing project architecture.

Keep components reasonably small and maintainable.

---

# 10. UI Quality

The profile page should look like it belongs to the **existing e-commerce store**.

Do not introduce a completely different visual language.

Follow the existing:

- Colors
- Typography
- Spacing
- Border radius
- Shadows
- Icons
- Buttons
- Cards
- Dark/light theme behavior
- Responsive breakpoints

The result should feel like a natural extension of the existing store.

Make it polished and production-quality.

Avoid:

- Generic dashboard templates
- Excessive gradients
- Random colors
- Huge unnecessary cards
- Excessive animations
- Over-designed UI
- Placeholder content

Use subtle interactions and transitions where appropriate.

---

# 11. Responsive Design

The account page must work properly on:

- Desktop
- Laptop
- Tablet
- Mobile

On mobile, the sidebar should transform into an appropriate navigation pattern rather than squeezing the desktop layout.

Forms should be comfortable to use on mobile.

Order cards should adapt cleanly to smaller screens.

---

# 12. Loading / Empty / Error States

Every data-driven section should have proper states.

### Loading

Use the project's existing loading/skeleton components.

### Empty

For example:

```text
No orders yet
Your order history will appear here after your first purchase.
```

### Error

Show a clear message and retry option where appropriate.

Do not leave blank screens when data is unavailable.

---

# 13. Important Constraints

### DO:

- Reuse existing authentication
- Reuse existing user data
- Reuse existing order system
- Reuse existing server functions/API
- Reuse existing TanStack patterns
- Reuse existing UI components
- Create reusable components when something doesn't already exist
- Follow the existing project architecture
- Keep the implementation modular
- Keep the page responsive
- Handle loading/error/empty states

### DO NOT:

- Rebuild authentication
- Replace the current login system
- Create a second user model
- Create duplicate order models
- Create duplicate UI primitives
- Introduce unnecessary dependencies
- Rewrite unrelated parts of the application
- Break existing routes
- Break the existing checkout/cart/product functionality
- Hardcode user information
- Hardcode fake orders in the production UI

---

# Final Implementation Goal

After login, the user should be able to navigate to:

```text
My Account
```

and have a polished account experience where they can manage:

```text
Profile
├── Personal Information
├── Profile Picture
├── Contact Information
│
├── Orders
│   ├── Order History
│   └── Order Details
│
├── Addresses
│
└── Security
```

Keep the implementation focused.

**The existing store is already working. This task is ONLY about adding the user account/profile experience on top of the existing system.**

Before finishing, verify that the existing login, cart, products, checkout, and other existing functionality remain unaffected.
