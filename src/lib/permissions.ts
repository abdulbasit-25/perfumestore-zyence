export type UserRole = "customer" | "manager" | "admin";

export type Permission =
  | "manageUsers"
  | "createUsers"
  | "deleteUsers"
  | "manageProducts"
  | "manageOrders"
  | "manageReviews"
  | "manageCustomers"
  | "manageInventory"
  | "manageShipments"
  | "manageCoupons"
  | "manageCategories"
  | "manageContacts"
  | "deleteData";

const managerPermissions = new Set<Permission>([
  "manageProducts",
  "manageOrders",
  "manageReviews",
  "manageCustomers",
  "manageInventory",
  "manageShipments",
  "manageCoupons",
  "manageCategories",
  "manageContacts",
]);

export function hasPermission(role: UserRole, permission: Permission): boolean {
  if (role === "admin") return true;
  return role === "manager" && managerPermissions.has(permission);
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "admin" || role === "manager";
}

export function canAssignRole(actor: UserRole, target: UserRole): boolean {
  return actor === "admin" || (actor === "manager" && target === "customer");
}

export function canDeleteUser(actor: UserRole, target: UserRole, isSelf: boolean): boolean {
  return (
    actor === "admin" &&
    !isSelf &&
    (target === "customer" || target === "manager" || target === "admin")
  );
}
