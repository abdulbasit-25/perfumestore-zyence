import { describe, expect, it } from "vitest";
import { calculateCouponDiscount } from "@/lib/coupon-server";

describe("coupon discount calculation", () => {
  it("calculates percentage discounts", () => {
    expect(calculateCouponDiscount({ discountType: "percentage", value: 20 }, 100, 12)).toBe(20);
  });

  it("calculates fixed discounts without exceeding the order total", () => {
    expect(calculateCouponDiscount({ discountType: "fixed", value: 40 }, 100, 12)).toBe(40);
    expect(calculateCouponDiscount({ discountType: "fixed", value: 200 }, 100, 12)).toBe(112);
  });

  it("makes shipping free without discounting the subtotal", () => {
    expect(calculateCouponDiscount({ discountType: "free_shipping", value: 0 }, 100, 12)).toBe(12);
  });

  it("never returns a negative or excessive discount", () => {
    expect(calculateCouponDiscount({ discountType: "percentage", value: 150 }, 100, 12)).toBe(112);
    expect(calculateCouponDiscount({ discountType: "fixed", value: -10 }, 100, 12)).toBe(0);
  });
});
