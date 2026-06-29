'use client';

/**
 * Browser Automation Page
 * Uses Hermes browser tool for web automation
 */
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BrowserTab {
  id: string;
  url: string;
  title: string;
  screenshot?: string;
}

export default function BrowserPage() {
  const [url, setUrl] = useState('https://google.com');
  const [loading, setLoading] = useState(false);
  const [tabs, setTabs] = useState<BrowserTab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const supabase = createClient();

  // Load browser tabs
  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    // TODO: Load from Hermes browser tool
    // For now, show a placeholder
    setTabs([
      { id: '1', url: 'https://google.com', title: 'Google' },
    ]);
    setActiveTab('1');
  };

  const openUrl = async (url: string) => {
    setLoading(true);
    try {
      // TODO: Call Hermes browser tool API
      // For demo, just add to tabs
      const newTab: BrowserTab = {
        id: Date.now().toString(),
        url,
        title: url.replace(/^https?:\/\//, '').split('/')[0],
      };
      setTabs([...tabs, newTab]);
      setActiveTab(newTab.id);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
    setLoading(false);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[0]?.id || null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800 bg-gray-900">
        <button
          onClick={() => openUrl(url)}
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Go'}
        </button>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && openUrl(url)}
          placeholder="Enter URL..."
          className="flex-1 px-4 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => openUrl('https://google.com')}
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
          title="New tab"
        >
          +
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-900 border-b border-gray-800 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-t-lg text-sm cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gray-800 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="truncate max-w-[120px]">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="text-gray-500 hover:text-white text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Browser View */}
      <div className="flex-1 bg-white relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : activeTab ? (
          <iframe
            ref={iframeRef}
            src={tabs.find(t => t.id === activeTab)?.url}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>Enter a URL to start browsing</p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-t border-gray-800 text-xs text-gray-500">
        <span>{tabs.length} tab{tabs.length !== 1 ? 's' : ''}</span>
        <span>Browser powered by Hermes</span>
      </div>
    </div>
  );
}
