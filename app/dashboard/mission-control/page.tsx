'use client';

import { useState } from 'react';
import { ExternalLink, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function MissionControlOverview() {
  const [iframeKey, setIframeKey] = useState(0);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h1 className="text-xl font-bold text-white">Mission Control</h1>
          <p className="text-sm text-white/50 mt-0.5">OpenClaw Control UI — embedded</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/gateway/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
            style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)' }}
          >
            <ExternalLink className="w-4 h-4" />
            Open in new tab ↗
          </a>
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all"
            title="Reload"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded Control UI */}
      <div className="flex-1 relative">
        <iframe
          key={iframeKey}
          src="/gateway/"
          className="w-full h-full border-0"
          title="OpenClaw Control UI"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      </div>
    </div>
  );
}
