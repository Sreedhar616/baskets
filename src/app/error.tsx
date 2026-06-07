"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/** Route-level error boundary for the storefront. */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl md:text-4xl">Something went wrong</h1>
      <p className="mt-3 text-ink-soft">
        We hit a snag loading this page. Please try again.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <button onClick={() => reset()} className={buttonClasses("primary", "md")}>
          Try again
        </button>
        <Link href="/" className={buttonClasses("outline", "md")}>
          Go home
        </Link>
      </div>
    </div>
  );
}
