import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Star,
  Settings,
  Home,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { InstagramIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/instagram", label: "Instagram", icon: InstagramIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl">Admin needs Supabase</h1>
        <p className="mt-2 text-ink-soft">
          Connect Supabase (see setup.md) and make yourself an admin to manage
          products and orders.
        </p>
        <Link href="/" className="mt-6 inline-block text-clay hover:underline">← Back to site</Link>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-3xl">Not authorised</h1>
        <p className="mt-2 text-ink-soft">
          Your account doesn&apos;t have admin access. Set
          <code className="mx-1 rounded bg-sand px-1.5 py-0.5 text-sm">profiles.is_admin = true</code>
          for your user in Supabase (see setup.md).
        </p>
        <Link href="/" className="mt-6 inline-block text-clay hover:underline">← Back to site</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand">
      <div className="container-page grid gap-6 py-6 md:gap-8 md:py-8 md:grid-cols-[200px_1fr]">
        {/* Mobile & Desktop sidebar: vertical */}
        <aside className="md:sticky md:top-24 md:h-fit">
          <p className="eyebrow">Admin</p>
          <nav className="mt-4 flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm hover:bg-sand transition-colors"
              >
                <Icon size={18} /> <span className="truncate">{label}</span>
              </Link>
            ))}
            <Link
              href="/"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-ink-soft hover:bg-sand transition-colors"
            >
              <Home size={18} /> <span className="truncate">View site</span>
            </Link>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
