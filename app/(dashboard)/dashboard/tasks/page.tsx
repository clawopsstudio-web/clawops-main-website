'use client';

// ============================================================================
// ClawOps Studio — Tasks Page
// Phase 1 MVP
// ============================================================================

import { useState } from 'react';
import { useTasksStore } from '@/lib/store';
import {
  formatRelativeTime,
  getStatusColor,
  generateId,
  getStatusBgColor,
} from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import Card, { EmptyState, SectionHeader } from '@/components/dashboard/Card';
import StatusBadge, { PriorityBadge } from '@/components/dashboard/StatusBadge';
import type { Task, TaskStatus, TaskPriority } from '@/types';

const STATUS_COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'border-yellow-400/20' },
  { status: 'DOING', label: 'In Progress', color: 'border-blue-400/20' },
  { status: 'BLOCKED', label: 'Blocked', color: 'border-red-400/20' },
  { status: 'DONE', label: 'Done', color: 'border-green-400/20' },
  { status: 'DEFERRED', label: 'Deferred', color: 'border-gray-500/20' },
];

function TaskCard({ task, onUpdate }: { task: Task; onUpdate: (id: string, updates: Partial<Task>) => void }) {
  return (
    <div className="group rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] p-3 space-y-2 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} size="sm" />
        </div>
        <button
          onClick={() => {
            const next = task.status === 'TODO' ? 'DOING' : task.status === 'DOING' ? 'DONE' : task.status === 'DONE' ? 'TODO' : task.status;
            onUpdate(task.id, { status: next as TaskStatus });
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white/50"
          title="Toggle status"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
      <h4 className="text-sm font-medium text-white/80 leading-snug">{task.title}</h4>
      {task.description && (
        <p className="text-[11px] text-white/30 line-clamp-2">{task.description}</p>
      )}
      {task.owner && (
        <div className="flex items-center gap-1.5 pt-1">
          <div className="w-4 h-4 rounded-full bg-[#00D4FF]/15 text-[6px] flex items-center justify-center text-[#00D4FF] font-bold">
            {task.owner[0]}
          </div>
          <span className="text-[10px] text-white/30">{task.owner}</span>
        </div>
      )}
      <p className="text-[10px] text-white/20 font-mono">{formatRelativeTime(task.updatedAt)}</p>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask } = useTasksStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'P2' as TaskPriority });

  const handleCreate = () => {
    if (!newTask.title.trim()) return;
    addTask({
      id: generateId('tsk'),
      userId: 'usr_1a2b3c4d5e6f',
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'TODO',
      definitionOfDone: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewTask({ title: '', description: '', priority: 'P2' });
    setShowCreate(false);
  };

  const grouped = STATUS_COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.status),
  }));

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Tasks"
        description="Track and manage your work"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-sm py-2 px-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        }
      />

      {/* Create Task Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-[#0a0a14] border border-white/[0.1] p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">New Task</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Optional details..."
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Priority</label>
                <div className="flex gap-2">
                  {(['P0', 'P1', 'P2', 'P3'] as TaskPriority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        newTask.priority === p
                          ? p === 'P0' ? 'bg-red-400/15 border-red-400/30 text-red-400'
                          : p === 'P1' ? 'bg-orange-400/15 border-orange-400/30 text-orange-400'
                          : p === 'P2' ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400'
                          : 'bg-gray-400/15 border-gray-400/30 text-gray-400'
                          : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:border-white/[0.15]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCreate} className="btn btn-primary flex-1 text-sm py-2">
                Create Task
              </button>
              <button onClick={() => setShowCreate(false)} className="btn btn-ghost text-sm py-2 px-4">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            }
            title="No tasks yet"
            description="Create your first task to start tracking work"
            action={
              <button onClick={() => setShowCreate(true)} className="btn btn-primary text-sm py-2 px-4">
                Create Task
              </button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-5 gap-3 overflow-x-auto pb-4">
          {grouped.map((col) => (
            <div key={col.status} className={`rounded-xl border-t-2 ${col.color} bg-white/[0.01]`}>
              <div className="px-3 py-3 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusBgColor(col.status).split(' ')[0].replace('/10', '')}`} />
                  <span className="text-xs font-semibold text-white/60">{col.label}</span>
                  <span className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {col.tasks.length}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[200px]">
                {col.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} onUpdate={updateTask} />
                ))}
                {col.tasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-[11px] text-white/20">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
