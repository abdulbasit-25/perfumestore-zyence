import { describe, expect, it } from "vitest";
import { shipmentOrderStatus } from "@/lib/shipment-server";

describe("shipment and order status consistency", () => {
  it("maps the fulfillment lifecycle to order statuses", () => {
    expect(shipmentOrderStatus.Pending).toBe("Pending");
    expect(shipmentOrderStatus.Confirmed).toBe("Confirmed");
    expect(shipmentOrderStatus.Packed).toBe("Confirmed");
    expect(shipmentOrderStatus.Shipped).toBe("Shipped");
    expect(shipmentOrderStatus.OutForDelivery).toBe("Shipped");
    expect(shipmentOrderStatus.Delivered).toBe("Delivered");
  });

  it("maps delivery failures and returns to the appropriate order state", () => {
    expect(shipmentOrderStatus.Failed).toBe("Shipped");
    expect(shipmentOrderStatus.RTO).toBe("Cancelled");
  });
});
