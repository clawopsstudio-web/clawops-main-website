import DashboardShell from '@/components/dashboard/DashboardShell'
import DashboardClient from '@/components/dashboard/DashboardClient'
import { MOCK_TASKS } from '@/lib/mock-data'

interface Profile {
  full_name: string
  company: string
  avatar_url: string
}

interface Instance {
  id: string
  name: string
  status: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyTasks: any[] = MOCK_TASKS.slice(0, 10)

export default async function DashboardPage() {
  const dashboardData = {
    profile: {
      full_name: 'Pulkit',
      company: 'ClawOps Studio',
      avatar_url: '',
    } as Profile,
    tasks: anyTasks,
    tasksTotal: MOCK_TASKS.length,
    pendingTasks: MOCK_TASKS.filter((t: any) => t.status === 'TODO').length,
    completedTasks: MOCK_TASKS.filter((t: any) => t.status === 'DONE').length,
    instances: [] as Instance[],
    activeAgents: 3,
    userEmail: 'pulkit@clawops.studio',
  }

  return (
    <DashboardShell>
      <DashboardClient data={dashboardData as any} />
    </DashboardShell>
  )
}
