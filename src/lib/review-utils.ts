export type ReviewStatusValue = "pending" | "approved" | "rejected";

export type ReviewSummaryValue = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export function normalizeReviewStatus(value: unknown): ReviewStatusValue {
  const status = String(value ?? "pending").toLowerCase();
  if (status === "published" || status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}

export function validateReviewContent(rating: number, comment: string) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return "Choose a rating from 1 to 5.";
  }
  const length = comment.trim().length;
  if (length < 10 || length > 2000) {
    return "Your review must be between 10 and 2,000 characters.";
  }
  return null;
}

export function calculateReviewSummary(ratings: number[]): ReviewSummaryValue {
  const distribution: ReviewSummaryValue["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const validRatings = ratings.filter(
    (rating): rating is 1 | 2 | 3 | 4 | 5 => Number.isInteger(rating) && rating >= 1 && rating <= 5,
  );
  for (const rating of validRatings) distribution[rating] += 1;
  const totalReviews = validRatings.length;
  return {
    averageRating: totalReviews
      ? Math.round((validRatings.reduce((sum, rating) => sum + rating, 0) / totalReviews) * 10) / 10
      : 0,
    totalReviews,
    distribution,
  };
}
