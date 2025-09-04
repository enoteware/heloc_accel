import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";
import AdminSidebar from "./_components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await stackServerApp.getUser();

  // Check if user is authenticated
  if (!user) {
    redirect("/handler/sign-in");
  }

  // Check for admin role - in production, you would check for admin role here
  const isAdmin = user.primaryEmail === "admin@helocaccelerator.com";

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
