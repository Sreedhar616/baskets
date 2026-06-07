import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star rating (1–5). */
export function Stars({
  rating,
  className,
  size = 16,
}: {
  rating: number;
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i <= Math.round(rating) ? "fill-gold text-gold" : "text-border"
          )}
        />
      ))}
    </div>
  );
}
