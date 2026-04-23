import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/auth/login')

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', padding: '40px' }}>
      <h1>Dashboard</h1>
      <p>Welcome! You are logged in. userId: {userId}</p>
    </div>
  )
}
