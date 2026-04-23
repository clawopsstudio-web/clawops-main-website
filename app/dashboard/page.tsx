import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/auth/login')
  }
  const user = await currentUser()
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#e8ff47' }}>Welcome to ClawOps Dashboard</h1>
      <p>Logged in as: {user?.emailAddresses[0]?.emailAddress}</p>
      <p>User ID: {userId}</p>
    </div>
  )
}
