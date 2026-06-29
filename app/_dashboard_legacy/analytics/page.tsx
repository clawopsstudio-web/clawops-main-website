'use client'
import { useState } from 'react'

const PERIODS = ['7D', '30D', '90D'] as const
type Period = typeof PERIODS[number]

const DEMO_KPIS = {
  '7D': { tasksCompleted: 47, avgResponseTime: '2.3s', toolsUsed: 128, activeHours: 142 },
  '30D': { tasksCompleted: 234, avgResponseTime: '1.9s', toolsUsed: 612, activeHours: 680 },
  '90D': { tasksCompleted: 892, avgResponseTime: '2.1s', toolsUsed: 2341, activeHours: 2840 },
}

const DEMO_CHART = [
  { day: 'Mon', ryan: 12, arjun: 8, helena: 5 },
  { day: 'Tue', ryan: 15, arjun: 11, helena: 9 },
  { day: 'Wed', ryan: 8, arjun: 14, helena: 7 },
  { day: 'Thu', ryan: 18, arjun: 9, helena: 12 },
  { day: 'Fri', ryan: 14, arjun: 12, helena: 8 },
  { day: 'Sat', ryan: 6, arjun: 5, helena: 3 },
  { day: 'Sun', ryan: 4, arjun: 3, helena: 2 },
]

const TOOL_USAGE = [
  { name: 'Gmail', calls: 520, color: '#EA4335' },
  { name: 'GitHub', calls: 380, color: '#ffffff' },
  { name: 'Telegram', calls: 290, color: '#26A5E4' },
  { name: 'HubSpot', calls: 215, color: '#FF7A59' },
  { name: 'Notion', calls: 145, color: '#ffffff' },
  { name: 'Slack', calls: 98, color: '#4A154B' },
]

const AGENT_PERF = [
  { name: 'Ryan', color: '#22c55e', tasks: 45, missions: 3, tools: 'Gmail×20, GitHub×15', avgTime: '2.3 min' },
  { name: 'Arjun', color: '#f59e0b', tasks: 32, missions: 2, tools: 'GitHub×18, Notion×12', avgTime: '4.1 min' },
  { name: 'Helena', color: '#3b82f6', tasks: 28, missions: 1, tools: 'Gmail×22, Slack×8', avgTime: '1.8 min' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('7D')
  const kpis = DEMO_KPIS[period]
  const maxTool = Math.max(...TOOL_USAGE.map(t => t.calls))
  const maxChart = Math.max(...DEMO_CHART.map(d => d.ryan + d.arjun + d.helena))

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Analytics</h1>
          <p className="text-white/30 text-xs mt-1">Agent performance across your workspace</p>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Tasks Completed', value: kpis.tasksCompleted, delta: '+12%', color: '#22c55e' },
          { label: 'Avg Response Time', value: kpis.avgResponseTime, delta: '-0.4s', color: '#3b82f6' },
          { label: 'Tools Used', value: kpis.toolsUsed, delta: '+8%', color: '#a855f7' },
          { label: 'Active Hours', value: `${kpis.activeHours}h`, delta: '+5%', color: '#f59e0b' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-[#111] border border-white/7 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/30 text-xs">{kpi.label}</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: kpi.color }} />
            </div>
            <p className="text-white font-black text-2xl mb-1">{kpi.value}</p>
            <span className="text-emerald-400 text-[10px]">{kpi.delta} vs last period</span>
          </div>
        ))}
      </div>

      {/* Task Activity chart */}
      <div className="bg-[#111] border border-white/7 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Task Activity</h3>
        <div className="flex items-end gap-2 h-40">
          {DEMO_CHART.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-0.5 items-end" style={{ height: `${((d.ryan + d.arjun + d.helena) / maxChart) * 100}%` }}>
                <div className="flex-1 rounded-t-sm bg-[#22c55e]/60" style={{ height: `${(d.ryan / maxChart) * 100}%` }} />
                <div className="flex-1 rounded-t-sm bg-[#f59e0b]/60" style={{ height: `${(d.arjun / maxChart) * 100}%` }} />
                <div className="flex-1 rounded-t-sm bg-[#3b82f6]/60" style={{ height: `${(d.helena / maxChart) * 100}%` }} />
              </div>
              <span className="text-white/30 text-[10px] mt-1">{d.day}</span>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
          {[
            { label: 'Ryan', color: '#22c55e' },
            { label: 'Arjun', color: '#f59e0b' },
            { label: 'Helena', color: '#3b82f6' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-white/40 text-[10px]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tool usage + Agent Performance */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tool Usage */}
        <div className="bg-[#111] border border-white/7 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Tool Usage</h3>
          <div className="space-y-3">
            {TOOL_USAGE.map(tool => (
              <div key={tool.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">{tool.name}</span>
                  <span className="text-white/40 text-[10px]">{tool.calls} calls</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(tool.calls / maxTool) * 100}%`, backgroundColor: tool.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-[#111] border border-white/7 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Agent Performance</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left">
                {['Agent', 'Tasks', 'Missions', 'Top Tools', 'Avg Time'].map(h => (
                  <th key={h} className="pb-2 text-white/30 text-[10px] font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENT_PERF.map(a => (
                <tr key={a.name} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black" style={{ backgroundColor: a.color }}>{a.name[0]}</div>
                      <span className="text-white/70 text-xs font-medium">{a.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-white/60 text-xs">{a.tasks}</td>
                  <td className="py-2.5 text-white/60 text-xs">{a.missions}</td>
                  <td className="py-2.5 text-white/60 text-[10px]">{a.tools}</td>
                  <td className="py-2.5 text-white/60 text-xs">{a.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
