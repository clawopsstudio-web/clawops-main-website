'use client';

/**
 * Projects Page
 * Manage projects and workspaces
 */
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FolderOpen, Plus, MoreVertical, Calendar, FileText } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  task_count: number;
  updated_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', color: '#6366f1' });

  const supabase = createClient();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // TODO: Load from database
      // For demo, show sample data
      setProjects([
        {
          id: '1',
          name: 'Website Redesign',
          description: 'Complete overhaul of the company website',
          color: '#6366f1',
          task_count: 12,
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Sales Pipeline',
          description: 'Set up automated sales outreach',
          color: '#22c55e',
          task_count: 8,
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Content Calendar',
          description: 'Q2 content planning and execution',
          color: '#f59e0b',
          task_count: 24,
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProject.name.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      color: newProject.color,
      task_count: 0,
      updated_at: new Date().toISOString(),
    };

    setProjects([...projects, project]);
    setNewProject({ name: '', description: '', color: '#6366f1' });
    setShowNewForm(false);
  };

  const COLORS = [
    '#6366f1', // Indigo
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
  ];

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Organize your work into projects</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* New Project Form */}
      {showNewForm && (
        <div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Project Name</label>
              <input
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., Q2 Marketing Campaign"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief description of the project..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Color</label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewProject({ ...newProject, color })}
                    className={`w-8 h-8 rounded-full ${newProject.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={createProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
          <p className="text-gray-400 mb-4">Create your first project to get started</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <FolderOpen size={20} style={{ color: project.color }} />
                </div>
                <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-800 rounded">
                  <MoreVertical size={16} className="text-gray-500" />
                </button>
              </div>
              <h3 className="text-white font-semibold mb-1">{project.name}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <FileText size={12} />
                  <span>{project.task_count} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
