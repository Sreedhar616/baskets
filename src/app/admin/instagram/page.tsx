import { getAllInstagram } from "@/lib/admin-queries";
import { InstagramManager } from "@/components/admin/instagram-manager";

export default async function AdminInstagramPage() {
  const posts = await getAllInstagram();
  return <InstagramManager posts={posts} />;
}
