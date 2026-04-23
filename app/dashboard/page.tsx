import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/auth/login')
  const user = await currentUser()
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to ClawOps Dashboard</h1>
        <p className="mt-2 text-gray-400">{user?.emailAddresses[0]?.emailAddress}</p>
      </div>
    </div>
  )
}
