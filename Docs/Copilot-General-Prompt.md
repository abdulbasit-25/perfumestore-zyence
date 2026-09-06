# Prompt for GitHub Copilot

Analyze this entire project/repository carefully.

I want you to create a new Markdown file named:

`PROJECT_STATUS_CHECKLIST.md`

The purpose of this file is to give me a **complete, honest implementation/status audit** of the project.

Do NOT assume that something works just because the UI exists. Inspect the actual code, API routes, database logic, authentication, frontend integration, backend integration, environment variables, services, and configuration.

## 1. First: Understand the Project

Before creating the checklist, inspect:

- Frontend
- Backend
- API routes
- Database models/schemas
- Database queries
- Authentication/authorization
- File/image uploads
- External services
- Environment variables
- Admin functionality
- User functionality
- Forms
- Validation
- Error handling
- Loading states
- Empty states
- Responsive UI
- Routing
- Deployment configuration
- Seed/demo data
- TODO/FIXME comments
- Mock/dummy data
- Hardcoded values
- Placeholder functionality

Trace important features from:

`UI → Frontend logic → API → Backend → Database/External service → Response → UI`

Do not mark a feature as "working" merely because a button or page exists.

---

# 2. Create PROJECT_STATUS_CHECKLIST.md

Organize the file into the following sections.

## 🟢 WORKING

List everything that is actually implemented and appears functional.

For every feature include:

- Feature name
- Location/files involved
- Current status
- How it works
- Dependencies
- Any limitations

Use checkboxes:

- [x] Feature

Only mark something `[x]` if you can verify that it is implemented in code.

---

## 🟡 PARTIALLY WORKING

List features that exist but are incomplete, unreliable, or only work in some situations.

For each:

- Feature
- What works
- What doesn't
- Relevant files
- What needs to be fixed

Example:

- [ ] Authentication
  - Login UI exists
  - API exists
  - Token handling exists
  - Password reset is missing
  - Error handling needs improvement

---

## 🔴 DUMMY / MOCK / PLACEHOLDER

Find anything that is currently:

- Dummy
- Mocked
- Hardcoded
- Fake
- Static
- Placeholder
- Simulated
- Frontend-only
- Using fake API responses
- Using local arrays instead of database data
- Using sample users/products/orders/etc.
- Using temporary logic

For every item explain:

1. Where it is
2. What it currently does
3. What the real implementation should do
4. What is required to replace it

Do not confuse seed data with dummy functionality. Clearly distinguish:

- Legitimate seed/demo data
- Temporary mock data
- Production functionality

---

# 3. 🔵 BACKEND CHECKLIST

Audit the backend separately.

Check:

- [ ] Server configuration
- [ ] Database connection
- [ ] Database models
- [ ] CRUD operations
- [ ] API routes
- [ ] Controllers/services
- [ ] Authentication
- [ ] Authorization/RBAC
- [ ] Input validation
- [ ] Error handling
- [ ] Security
- [ ] Rate limiting
- [ ] Logging
- [ ] File uploads
- [ ] External APIs
- [ ] Environment variables
- [ ] Production configuration

For each item state:

`WORKING / PARTIAL / DUMMY / MISSING / NEEDS IMPROVEMENT`

---

# 4. 🟣 FRONTEND CHECKLIST

Audit:

- [ ] Pages
- [ ] Components
- [ ] Routing
- [ ] Forms
- [ ] API integration
- [ ] Authentication state
- [ ] Authorization
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Validation
- [ ] Notifications
- [ ] Responsive design
- [ ] Accessibility
- [ ] Performance
- [ ] Navigation
- [ ] Search/filter/sort functionality

Identify UI elements that look functional but don't actually perform a real operation.

---

# 5. 🟠 DATABASE CHECKLIST

Inspect the database implementation.

Check:

- [ ] Database connection
- [ ] Collections/tables
- [ ] Schemas/models
- [ ] Relationships/references
- [ ] Indexes
- [ ] CRUD operations
- [ ] Validation
- [ ] Data consistency
- [ ] Duplicate handling
- [ ] Seed scripts
- [ ] Production data handling

Identify anything currently using local/static data instead of the database.

---

# 6. 🔐 AUTHENTICATION & SECURITY

Perform a security-oriented audit.

Check:

- [ ] Registration
- [ ] Login
- [ ] Logout
- [ ] Session/token handling
- [ ] Password hashing
- [ ] Password reset
- [ ] Protected routes
- [ ] Role-based access
- [ ] Admin access
- [ ] Authorization on backend
- [ ] JWT/session security
- [ ] CORS
- [ ] Environment secrets
- [ ] Input sanitization
- [ ] API security
- [ ] Sensitive information exposure

Flag anything that is unsafe or only protected on the frontend.

---

# 7. 🔌 API INTEGRATION

For every API endpoint identify:

| Endpoint | Method | Frontend Connected? | Backend Implemented? | Database Connected? | Status |
|---|---|---|---|---|---|

Check for:

- Missing endpoints
- Unused endpoints
- Frontend calls to nonexistent endpoints
- Endpoints returning dummy data
- Incorrect request/response structures
- Missing validation
- Missing authentication
- Error handling problems

---

# 8. 🧪 TESTING STATUS

Determine what testing currently exists.

Check:

- [ ] Unit tests
- [ ] Integration tests
- [ ] API tests
- [ ] Authentication tests
- [ ] Database tests
- [ ] Frontend tests
- [ ] End-to-end tests
- [ ] Error-case testing

List existing tests and identify important missing tests.

---

# 9. 🚀 DEPLOYMENT READINESS

Determine whether this project is actually ready for production.

Check:

- [ ] Production environment variables
- [ ] Build succeeds
- [ ] Production start command
- [ ] Frontend deployment
- [ ] Backend deployment
- [ ] Database production connection
- [ ] CORS configuration
- [ ] File storage
- [ ] External services
- [ ] Error logging
- [ ] Security configuration
- [ ] Secrets management
- [ ] Domain configuration
- [ ] HTTPS
- [ ] Database backups
- [ ] Production data handling

---

# 10. ❌ MISSING FEATURES

List features that appear to be expected from the project's purpose but are completely missing.

For every missing feature explain:

- Why it appears necessary
- What needs to be implemented
- Which part of the project it belongs to
- Priority

Use priorities:

🔴 Critical  
🟠 High  
🟡 Medium  
🟢 Low

---

# 11. 🛠️ NEEDS IMPROVEMENT

List existing features that work but should be improved.

Separate into:

### Functionality
### UI/UX
### Security
### Performance
### Code quality
### Architecture
### Error handling
### Accessibility
### Scalability

Do not recommend unnecessary rewrites. Prefer practical improvements based on the existing architecture.

---

# 12. 📋 APPROVAL CHECKLIST

Create a final checklist for things that need to be approved before calling the project complete.

Example:

### Product Approval

- [ ] All required features implemented
- [ ] No dummy functionality
- [ ] No placeholder buttons
- [ ] All forms functional
- [ ] All API integrations verified
- [ ] Database integration verified

### Technical Approval

- [ ] Build passes
- [ ] No critical console errors
- [ ] No critical backend errors
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Environment variables verified
- [ ] Production deployment verified

### Security Approval

- [ ] Secrets not exposed
- [ ] Passwords securely hashed
- [ ] Protected APIs verified
- [ ] RBAC verified
- [ ] Input validation verified
- [ ] CORS verified

### QA Approval

- [ ] Main user flows tested
- [ ] Error states tested
- [ ] Empty states tested
- [ ] Mobile/responsive tested
- [ ] Different user roles tested

---

# 13. 🏁 FINAL PROJECT STATUS

At the very bottom, provide a concise summary:

## Overall Status

Choose one:

🟢 READY  
🟡 NEARLY READY  
🟠 NEEDS WORK  
🔴 NOT READY

Then provide:

### Completion Estimate

`XX%`

But calculate this based on actual implemented functionality, NOT number of files or UI pages.

### Working
`X features`

### Partial
`X features`

### Dummy/Mock
`X features`

### Missing
`X features`

### Critical Issues
`X`

### High Priority Issues
`X`

---

# IMPORTANT RULES

1. **Do not modify existing application code.**
2. Only create/update `PROJECT_STATUS_CHECKLIST.md`.
3. Do not claim something works without tracing the implementation.
4. Do not mark UI-only functionality as working.
5. Clearly distinguish real functionality from mock/dummy functionality.
6. If you cannot verify something, mark it as:
   `⚪ UNVERIFIED`
7. Mention the exact file/path whenever possible.
8. Do not hide problems just to make the project look complete.
9. Do not invent missing requirements.
10. Do not rewrite the project.
11. Do not install unnecessary packages.
12. Do not change configuration.
13. Inspect the entire repository before producing the final checklist.
14. Look for TODO, FIXME, mock, dummy, placeholder, hardcoded, fake, sample, test, and temporary implementations.
15. Check both frontend AND backend.
16. Follow feature flows across the entire stack.
17. If a feature depends on an external service, verify that the integration actually exists rather than assuming it works.
18. Clearly identify anything that requires manual testing because it cannot be verified through code inspection.

## FINAL REQUIREMENT

After creating `PROJECT_STATUS_CHECKLIST.md`, give me a very short summary containing only:

- Overall status
- Estimated completion %
- Working features
- Dummy/Mock features
- Missing features
- Critical issues
- Top 5 things I should fix next

Do not modify anything else in the project.