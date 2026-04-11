'use client';

import { useEffect, useState } from 'react';
import { useOpenClaw } from '@/contexts/OpenClawContext';
import { FileText } from 'lucide-react';

const PAGE_NAME="memory"

export default function MemoryPage() {
  const { isConnected, rpc } = useOpenClaw();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isConnected) return;
    const load = async () => {
      try {
        setLoading(true);
        const result: any = await (rpc as any)(`${PAGE_NAME}.list`) || await (rpc as any)(PAGE_NAME) || {};
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isConnected, rpc]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white capitalize">{PAGE_NAME}</h1>
          <p className="text-sm mt-1 text-white/50">Manage your gateway {PAGE_NAME}</p>
        </div>
      </div>

      {loading && <div className="text-white/50 text-sm">Loading...</div>}
      {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      {!loading && !error && (
        <pre className="p-4 rounded-xl border border-white/10 bg-white/[0.02] text-xs text-white/70 overflow-auto max-h-[70vh]">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
