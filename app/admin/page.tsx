import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminLogin from "@/components/admin/AdminLogin";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) return <AdminLogin unauthorized={Boolean(user)} />;
  return <AdminDashboard />;
}
