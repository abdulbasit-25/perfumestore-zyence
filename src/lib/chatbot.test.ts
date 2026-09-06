import { describe, expect, it } from "vitest";
import {
  buildChatbotReply,
  findProductMatches,
  normalizeInput,
  validateOrderNumber,
} from "@/lib/chatbot";

describe("chatbot logic", () => {
  it("normalizes common order and shipping variations", () => {
    expect(normalizeInput("Where Is My Order?")).toBe("where is my order");
    expect(normalizeInput("where's my order")).toBe("wheres my order");
    expect(normalizeInput("WHERE IS MY ORDER???")).toBe("where is my order");
    expect(normalizeInput("track my package")).toBe("track my package");
  });

  it("detects shipping and support intents", () => {
    const shippingReply = buildChatbotReply("When will my order arrive?");
    expect(shippingReply.text).toContain("3-7 business days");
    expect(shippingReply.quickReplies).toContain("Track Order");

    const returnReply = buildChatbotReply("I need a refund");
    expect(returnReply.text).toMatch(/return policy|Terms & Conditions/i);
  });

  it("validates order numbers without fixture orders", () => {
    expect(validateOrderNumber("SRL-2401")).toBe("SRL-2401");
    expect(validateOrderNumber("invalid")).toBeNull();
  });

  it("finds relevant products by query and price", () => {
    const testProducts = [
      {
        id: "test-shirt",
        name: "Test Linen Shirt",
        slug: "test-linen-shirt",
        description: "A test shirt for chatbot matching",
        price: 80,
        sku: "TEST-001",
        stock: 4,
        categoryId: "test-category",
        categorySlug: "apparel",
        images: [
          { url: "https://example.com/test-shirt.jpg", publicId: "test-shirt", alt: "Test shirt" },
        ],
        image: "https://example.com/test-shirt.jpg",
        isActive: true,
        rating: 4,
        reviewCount: 0,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ];
    const shirtMatches = findProductMatches("show me shirts", 3, testProducts);
    expect(shirtMatches.some((product) => product.name.toLowerCase().includes("shirt"))).toBe(true);

    const cheapMatches = findProductMatches("products under 100", 3, testProducts);
    expect(cheapMatches.length).toBeGreaterThan(0);
  });

  it("handles unknown inputs gracefully", () => {
    const reply = buildChatbotReply("asdfghjkl");
    expect(reply.text).toContain("didn't quite understand");
    expect(reply.quickReplies).toContain("Browse Products");
  });

  it("asks for order number when tracking is requested", () => {
    const reply = buildChatbotReply("track my order");
    expect(reply.awaitOrderNumber).toBe(true);
    expect(reply.text).toContain("Please enter your order number");
  });
});
