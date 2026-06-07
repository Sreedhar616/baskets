import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-3xl md:text-4xl">Page not found</h1>
      <p className="mt-3 text-ink-soft">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-7 flex justify-center gap-3">
        <Link href="/" className={buttonClasses("primary", "md")}>
          Go home
        </Link>
        <Link href="/products" className={buttonClasses("outline", "md")}>
          Shop products
        </Link>
      </div>
    </div>
  );
}
