'use client';

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  // Settings page has its own internal sidebar, just wrap with same bg
  return (
    <div style={{ background: '#06060c' }} className="min-h-screen">
      {children}
    </div>
  );
}
