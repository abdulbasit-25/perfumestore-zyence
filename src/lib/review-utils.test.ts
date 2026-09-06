import { describe, expect, it } from "vitest";
import {
  calculateReviewSummary,
  normalizeReviewStatus,
  validateReviewContent,
} from "@/lib/review-utils";

describe("review rules", () => {
  it("normalizes legacy and current statuses", () => {
    expect(normalizeReviewStatus("Published")).toBe("approved");
    expect(normalizeReviewStatus("approved")).toBe("approved");
    expect(normalizeReviewStatus("Rejected")).toBe("rejected");
    expect(normalizeReviewStatus("Pending")).toBe("pending");
  });

  it("validates rating and comment boundaries", () => {
    expect(validateReviewContent(0, "A sufficiently long comment")).toContain("rating");
    expect(validateReviewContent(6, "A sufficiently long comment")).toContain("rating");
    expect(validateReviewContent(5, "short")).toContain("between");
    expect(validateReviewContent(5, "A sufficiently long comment")).toBeNull();
  });

  it("calculates only valid approved-rating inputs", () => {
    expect(calculateReviewSummary([5, 5, 4, 3, 0, 6])).toEqual({
      averageRating: 4.3,
      totalReviews: 4,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2 },
    });
  });
});
