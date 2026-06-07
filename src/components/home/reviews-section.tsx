import { getReviews } from "@/lib/queries";
import { Stars } from "@/components/ui/stars";

export async function ReviewsSection() {
  const reviews = await getReviews();
  if (!reviews.length) return null;

  const avg =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section id="reviews" className="container-page scroll-mt-24 py-16 md:py-24">
      <div className="flex flex-col items-center text-center">
        <p className="eyebrow">Loved by customers</p>
        <h2 className="mt-2 text-3xl md:text-4xl">What our customers say</h2>
        <div className="mt-3 flex items-center gap-2">
          <Stars rating={avg} />
          <span className="text-sm text-ink-soft">
            {avg.toFixed(1)} · {reviews.length} reviews
          </span>
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="flex flex-col rounded-2xl border border-border bg-cream p-6"
          >
            <Stars rating={r.rating} />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
              “{r.body}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-medium">
              {r.authorName}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
