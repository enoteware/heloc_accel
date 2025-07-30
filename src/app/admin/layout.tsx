import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import AdminSidebar from './_components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  // Check if user is authenticated
  if (!session?.user) {
    redirect('/login')
  }

  // In demo mode, allow any authenticated user to be admin
  // In production, you would check for admin role here
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const isAdmin = isDemoMode || session.user.email === 'admin@helocaccelerator.com'

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}