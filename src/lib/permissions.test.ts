import { describe, expect, it } from "vitest";
import { canAccessAdmin, canAssignRole, canDeleteUser, hasPermission } from "@/lib/permissions";

describe("role permissions", () => {
  it("keeps customers out of operations and gives managers operational access", () => {
    expect(canAccessAdmin("customer")).toBe(false);
    expect(canAccessAdmin("manager")).toBe(true);
    expect(hasPermission("manager", "manageOrders")).toBe(true);
    expect(hasPermission("manager", "manageReviews")).toBe(true);
    expect(hasPermission("manager", "deleteData")).toBe(false);
    expect(hasPermission("customer", "manageOrders")).toBe(false);
  });

  it("allows only admins to assign elevated roles", () => {
    expect(canAssignRole("admin", "manager")).toBe(true);
    expect(canAssignRole("admin", "admin")).toBe(true);
    expect(canAssignRole("manager", "customer")).toBe(true);
    expect(canAssignRole("manager", "manager")).toBe(false);
    expect(canAssignRole("manager", "admin")).toBe(false);
  });

  it("restricts deletion to admins and protects self deletion", () => {
    expect(canDeleteUser("admin", "customer", false)).toBe(true);
    expect(canDeleteUser("admin", "manager", false)).toBe(true);
    expect(canDeleteUser("admin", "admin", false)).toBe(true);
    expect(canDeleteUser("admin", "customer", true)).toBe(false);
    expect(canDeleteUser("manager", "customer", false)).toBe(false);
  });

  it("rejects customer, invalid, and unauthenticated-style roles for protected actions", () => {
    const invalidRole = "admin-from-client" as never;
    expect(hasPermission("customer", "manageProducts")).toBe(false);
    expect(hasPermission("customer", "manageUsers")).toBe(false);
    expect(hasPermission(invalidRole, "manageOrders")).toBe(false);
    expect(canAccessAdmin("customer")).toBe(false);
  });

  it("keeps management permissions scoped to their resources", () => {
    expect(hasPermission("manager", "manageProducts")).toBe(true);
    expect(hasPermission("manager", "manageOrders")).toBe(true);
    expect(hasPermission("manager", "manageUsers")).toBe(false);
    expect(hasPermission("manager", "deleteData")).toBe(false);
  });
});
