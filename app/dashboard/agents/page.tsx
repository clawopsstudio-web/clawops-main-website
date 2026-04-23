'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ROLES = ['Sales', 'Support', 'Research', 'Marketing', 'Operations', 'Custom']
const PLANS = { personal: 3, team: 5, business: 999 }

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Sales')
  const supabase = createClient()

  useEffect(() => {
    supabase.from('agents').select('*').then(({ data }) => setAgents(data ?? []))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Agents</h1>
          <p className="text-white/30 text-xs mt-1">{agents.length} agent{agents.length !== 1 ? 's' : ''} active</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors"
        >
          + New Agent
        </button>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-3 gap-4">
        {agents.map(a => (
          <div key={a.id} className="bg-[#111] border border-white/7 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center text-white font-black text-sm">{a.name[0]}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                a.status === 'running' ? 'bg-emerald-950 text-emerald-400' :
                a.status === 'idle' ? 'bg-white/8 text-white/40' : 'bg-yellow-950 text-yellow-400'
              }`}>{a.status ?? 'idle'}</span>
            </div>
            <p className="text-white font-bold text-sm mb-0.5">{a.name}</p>
            <p className="text-white/30 text-xs">{a.role ?? 'General'}</p>
            <div className="flex gap-2 mt-4">
              <button className="text-[10px] text-white/40 hover:text-white/70">Chat →</button>
              <button className="text-[10px] text-white/40 hover:text-white/70">Config</button>
              <button className="text-[10px] text-red-400/50 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
        {/* Placeholder cards */}
        {Array.from({ length: Math.max(0, 3 - agents.length) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setShowModal(true)}
            className="bg-[#111] border border-dashed border-white/8 rounded-xl p-5 text-center hover:border-white/15 transition-colors"
          >
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-white/20 text-xl">+</div>
            <p className="text-white/30 text-xs">Add agent</p>
          </button>
        ))}
      </div>

      {/* New Agent modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-white font-bold">New Agent</h3>
            <div>
              <label className="text-white/60 text-xs block mb-1.5">Name</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ryan" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-white/60 text-xs block mb-1.5">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm focus:outline-none">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-white/50 text-sm hover:text-white/80">Cancel</button>
              <button
                onClick={async () => {
                  if (!newName.trim()) return
                  const { data } = await supabase.from('agents').insert({ name: newName.trim(), role: newRole, status: 'idle' }).select().single()
                  if (data) setAgents(prev => [...prev, data])
                  setShowModal(false); setNewName('')
                }}
                className="flex-1 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl"
              >Create Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
</parameter>
