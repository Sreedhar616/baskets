import { getAllReviews } from "@/lib/admin-queries";
import { ReviewsManager } from "@/components/admin/reviews-manager";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return <ReviewsManager reviews={reviews} />;
}
