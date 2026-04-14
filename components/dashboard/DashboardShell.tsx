'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Zap,
  Server,
  ChevronRight,
  Settings,
  Gauge,
  Puzzle,
  BookOpen,
  Zap as ZapIcon,
  ExternalLink,
  Globe,
  Workflow,
  Bot,
} from 'lucide-react';

// Extract userId from URL like /dashboard/{userId}/...
function extractUserId(pathname: string): string | null {
  const match = pathname.match(/^\/dashboard\/([0-9a-f-]{36})/);
  return match ? match[1] : null;
}

const STATIC_NAV_ITEMS = [
  { href: '/dashboard/mission-control', label: 'Mission Control', icon: Gauge, badge: 'NEW', section: 'main' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, section: 'main' },
  { href: '/dashboard/skills-library', label: 'Skills & Plugins', icon: Puzzle, section: 'tools' },
  { href: '/dashboard/mcp-library', label: 'MCP Servers', icon: Server, section: 'tools' },
  { href: '/guides', label: 'Guides', icon: BookOpen, external: true, section: 'tools' },
  { href: '/quick-start', label: 'Quick Start', icon: ZapIcon, external: true, section: 'tools' },
];

const SERVICE_LABELS: Record<string, { label: string; icon: React.ElementType }> = {
  n8n: { label: 'n8n Workflows', icon: Workflow },
  chrome: { label: 'Chrome Browser', icon: Globe },
  metaclaw: { label: 'MetaClaw', icon: Bot },
};

interface NavItemDef {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  external?: boolean;
  badge?: string;
  section?: string;
  serviceKey?: string;
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const userId = extractUserId(pathname);

  // Build full nav list — inject userId into service links
  const overviewItem: NavItemDef = {
    href: userId ? `/dashboard/${userId}` : '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    exact: true,
    section: 'main',
  }

  const allItems: NavItemDef[] = [
    overviewItem,
    ...STATIC_NAV_ITEMS,
    // Service links only when userId is known
    ...(userId
      ? Object.entries(SERVICE_LABELS).map(([key, info]) => ({
          href: `/dashboard/${userId}/${key}`,
          label: info.label,
          icon: info.icon,
          section: 'services',
          serviceKey: key,
        }))
      : []),
  ];

  const mainItems = allItems.filter((i) => i.section === 'main');
  const toolsItems = allItems.filter((i) => i.section === 'tools');
  const serviceItems = allItems.filter((i) => i.section === 'services');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 border-r flex flex-col h-full"
        style={{ background: '#0a0a0f', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white block">ClawOps</span>
              <span className="text-[10px] text-cyan-400">Studio</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {mainItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                <div className="flex items-center gap-1">
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-medium">
                      {item.badge}
                    </span>
                  )}
                  {!item.badge && isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                </div>
              </Link>
            );
          })}

          {/* Service Links */}
          {serviceItems.length > 0 && (
            <>
              <div className="my-3 mx-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <p className="px-3 text-[10px] font-semibold text-white/20 uppercase tracking-wider mb-1">
                Apps
              </p>
              {serviceItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                  </Link>
                );
              })}
            </>
          )}

          {/* Tools section */}
          {toolsItems.length > 0 && (
            <>
              <div className="my-3 mx-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
              <p className="px-3 text-[10px] font-semibold text-white/20 uppercase tracking-wider mb-1">
                Tools
              </p>
              {toolsItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm mb-0.5 transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <div className="flex items-center gap-1">
                      {item.external && <ExternalLink className="w-3 h-3 opacity-30" />}
                      {!item.external && isActive && <ChevronRight className="w-3 h-3 opacity-50" />}
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/50 hover:bg-white/5 transition-all"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#06060c' }}>
        {children}
      </main>
    </div>
  );
}
