import DashboardClient from '@/components/dashboard/DashboardClient'

// Test data to display the dashboard without auth
const testData = {
  profile: {
    name: 'Pulkit Rawal',
    email: 'pulkit@clawops.studio',
    company: 'ClawOps Studio',
    role: 'Founder'
  },
  tasks: [
    { id: '1', title: 'Complete onboarding form', status: 'completed', created_at: new Date().toISOString() },
    { id: '2', title: 'Set up first VPS instance', status: 'pending', created_at: new Date().toISOString() },
    { id: '3', title: 'Configure AI agents', status: 'pending', created_at: new Date().toISOString() },
    { id: '4', title: 'Integrate with Slack', status: 'pending', created_at: new Date().toISOString() },
    { id: '5', title: 'Run first automation', status: 'pending', created_at: new Date().toISOString() },
  ],
  tasksTotal: 5,
  pendingTasks: 4,
  completedTasks: 1,
  instances: [
    {
      id: 'inst_001',
      name: 'Production VPS',
      ip: '149.154.166.110',
      status: 'active',
      region: 'US East',
      ram: '8GB',
      cpu: '4 vCPU'
    }
  ],
  activeAgents: 3,
  userEmail: 'pulkit@clawops.studio',
}

export default function TestDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Test Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Preview of the customer dashboard UI</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
            🔧 Test Mode - No Auth Required
          </div>
        </div>
        
        <DashboardClient data={testData} />
      </div>
    </div>
  )
}
