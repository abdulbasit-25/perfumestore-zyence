Update the existing authentication system to support **real customer account creation/registration**.

### Current situation

The application currently has only two accounts for testing:

- Demo account
- Admin account

There is currently a page/message saying:

"Account creation is coming soon."

This needs to be fixed.

### Goal

Implement a complete **customer registration system** so new users can create their own accounts and then sign in normally.

Do NOT remove or break the existing Demo and Admin accounts.

---

## 1. Create Account / Registration Page

Replace the current "Account creation is coming soon" page with a real registration form.

Create a user-friendly registration page with:

- Full Name
- Email
- Password
- Confirm Password
- Create Account button

If the existing authentication system already has additional appropriate fields, reuse them where necessary.

The page should have:

**Already have an account? Sign In**

---

## 2. Registration Validation

Validate registration on both the client and server.

Requirements:

- Name is required.
- Email is required.
- Email must have a valid format.
- Password is required.
- Password must meet the application's minimum security requirements.
- Confirm password must match password.
- Email must be unique.

Show clear validation messages.

Examples:

- "Please enter your name."
- "Please enter a valid email address."
- "Passwords do not match."
- "An account with this email already exists."

Do not expose sensitive database/authentication errors directly to the user.

---

## 3. Create Customer User

When registration succeeds:

Create a new user in the existing users/authentication database.

The newly created account should have the normal customer/user role.

For example:

```text
role: "customer"
```

Do NOT allow users to choose their role during registration.

A customer must never be able to register themselves as:

```text
admin
```

The admin role must remain restricted to the existing admin account/system.

---

## 4. Password Security

Never store plain-text passwords.

Use the authentication system/library already used by the project.

If passwords are manually handled by the existing system, use a secure password hashing mechanism.

Do not expose:

- Password hashes
- Authentication secrets
- Database credentials
- Server environment variables

to client-side code.

---

## 5. Existing Demo and Admin Accounts

Keep the existing accounts working exactly as they do now.

There should still be:

```text
Demo account → customer/demo user
Admin account → administrator
```

Do not delete, overwrite, or convert the existing admin account.

Do not allow registration to interfere with the existing demo/admin login flow.

---

## 6. Login After Registration

After successful registration, provide a clean flow.

Preferred behavior:

1. User submits registration.
2. Account is created.
3. Show success message.
4. Either automatically sign the user in OR redirect them to the sign-in page, depending on how the existing authentication system works.

Example:

"Your account has been created successfully. You can now sign in."

Then:

**Sign In**

Use the existing authentication/session system instead of creating a second authentication mechanism.

---

## 7. Customer Account

After registration and login, the new customer should be treated exactly like a normal customer.

They should be able to use the existing customer functionality, including where applicable:

- Account/profile
- Orders
- Order history
- Cart
- Checkout
- Reviews
- Other existing customer features

Make sure the newly registered user receives the correct customer permissions.

---

## 8. Reviews Integration

This registration system must work with the new review functionality.

A newly registered customer should be able to:

- Purchase products
- See their orders
- Review products they purchased
- See their submitted reviews
- Receive the review prompt after delivery

The review system must identify the customer using the authenticated user/session rather than relying on a customer ID submitted from the browser.

---

## 9. Admin Users

Make sure admin authorization remains secure.

Registration must NEVER allow:

```text
role=admin
```

from the frontend.

If the project has an existing admin-management mechanism, follow it.

Do not change the existing admin account unless absolutely necessary.

---

## 10. Database

Inspect the existing user/authentication model first.

If a user model already exists, extend/reuse it instead of creating a duplicate users collection.

Make sure the user model supports at least:

```text
_id
name
email
password/authentication credentials
role
createdAt
updatedAt
```

Use the project's existing schema conventions.

Ensure email uniqueness is enforced appropriately.

---

## 11. UI

Follow the existing application's design system.

The registration page should match the existing:

- Sign-in page
- Buttons
- Inputs
- Cards
- Typography
- Colors
- Spacing
- Responsive layout

It should work properly on:

- Desktop
- Tablet
- Mobile

Include:

- Loading state while creating account
- Disabled button while submitting
- Success message
- Error message
- Field validation
- Password visibility toggle if the existing login UI supports it

---

## 12. Authentication Security

IMPORTANT:

Inspect the current authentication implementation before making changes.

Do not create a parallel authentication system.

Reuse the existing:

- sessions
- cookies
- authentication utilities
- password hashing
- user model
- middleware
- authorization logic

Make sure authentication/database code remains server-side.

Do NOT import MongoDB, Node-only modules, or server-only authentication utilities into React client components.

This is especially important because the project previously had a browser-side MongoDB/Vite issue.

---

## 13. Tests

Add/update tests for:

- Successful registration
- Missing name
- Invalid email
- Missing password
- Weak password
- Password mismatch
- Duplicate email
- Successful customer creation
- Correct default customer role
- User cannot register as admin
- Existing demo account still works
- Existing admin account still works
- Login with newly created account
- Authentication/session after registration

Run the existing test suite after implementation.

---

## 14. Final Verification

After implementing:

1. Run type checking.
2. Run linting.
3. Run tests.
4. Fix all errors.
5. Test existing Demo login.
6. Test existing Admin login.
7. Create a brand-new customer account.
8. Log in using the new account.
9. Verify the new user appears in the database.
10. Verify the new user has customer permissions.
11. Verify the new user cannot access admin functionality.
12. Verify the new customer can use checkout/orders.
13. Verify the new customer can later submit product reviews.
14. Verify no MongoDB/server-only code is bundled into the browser.

### Important

Do not simply change the text from:

"Account creation is coming soon."

to something else.

**Actually implement the complete registration/account-creation functionality in the existing application.**

Before coding, inspect the existing authentication and user models and adapt the implementation to the project's current architecture. Do not unnecessarily rewrite working authentication code.
