'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BrowserHistory {
  url: string
  title: string
  timestamp: string
}

export default function BrowserPage() {
  const [url, setUrl] = useState('https://google.com')
  const [inputUrl, setInputUrl] = useState('google.com')
  const [loading, setLoading] = useState(false)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<BrowserHistory[]>([])
  const [vpsStatus, setVpsStatus] = useState<string>('checking')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    async function checkVps() {
      try {
        const res = await fetch('/api/hermes/status')
        if (res.ok) {
          setVpsStatus('online')
        } else {
          setVpsStatus('offline')
        }
      } catch {
        setVpsStatus('offline')
      }
    }
    checkVps()
  }, [])

  const navigate = (newUrl: string) => {
    let finalUrl = newUrl.trim()
    if (!finalUrl) return
    
    // Add protocol if missing
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    
    setUrl(finalUrl)
    setInputUrl(new URL(finalUrl).hostname)
    setScreenshot(null)
    setError(null)
    
    // Add to history
    setHistory(prev => [{
      url: finalUrl,
      title: new URL(finalUrl).hostname,
      timestamp: new Date().toISOString(),
    }, ...prev.slice(0, 9)])
  }

  const takeScreenshot = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/browser/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Screenshot failed')
      }
      
      const data = await res.json()
      
      if (data.imageUrl) {
        setScreenshot(data.imageUrl)
      } else {
        throw new Error('No image in response')
      }
    } catch (err: any) {
      console.error('[browser] Screenshot error:', err)
      setError(err.message || 'Failed to take screenshot')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigate(inputUrl)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-[#1a1a1a] border-b border-white/10">
        {/* URL Bar */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              ←
            </button>
            <button className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              →
            </button>
            <button 
              onClick={() => navigate(url)}
              className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              ↻
            </button>
          </div>
          
          <div className="flex-1 flex items-center gap-2 bg-[#111] border border-white/10 rounded-lg px-3 py-2">
            <span className="text-white/40 text-sm">🔒</span>
            <input
              type="text"
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL..."
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 focus:outline-none"
            />
            <button
              onClick={() => navigate(inputUrl)}
              className="text-white/40 hover:text-white transition-colors"
            >
              →
            </button>
          </div>
          
          <button
            onClick={takeScreenshot}
            disabled={loading || !url}
            className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Capturing...' : '📸 Capture'}
          </button>
        </div>
        
        {/* Quick Links */}
        <div className="flex items-center gap-2 px-4 pb-3">
          {[
            { name: 'Google', url: 'https://google.com' },
            { name: 'GitHub', url: 'https://github.com' },
            { name: 'Twitter', url: 'https://twitter.com' },
          ].map(site => (
            <button
              key={site.name}
              onClick={() => navigate(site.url)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-white/60 text-xs transition-colors"
            >
              {site.name}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-xs text-white/30">
            <div className={`w-1.5 h-1.5 rounded-full ${vpsStatus === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {vpsStatus === 'online' ? 'Screenshot ready' : 'VPS offline'}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Browser View */}
        <div className="flex-1 flex flex-col">
          {error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-white font-bold mb-2">Screenshot Failed</p>
                <p className="text-white/50 text-sm mb-4">{error}</p>
                <button
                  onClick={takeScreenshot}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : screenshot ? (
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
                <img 
                  src={screenshot} 
                  alt="Website screenshot"
                  className="w-full h-auto"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🌐</span>
                </div>
                <p className="text-white font-bold text-lg mb-2">Interactive Browser</p>
                <p className="text-white/50 text-sm mb-6 max-w-md">
                  Enter a URL above to browse. Click "Capture" to take a screenshot.
                  Your agents can also browse and you&apos;ll see their view here.
                </p>
                <div className="flex items-center gap-4 justify-center">
                  <button
                    onClick={() => navigate('https://google.com')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Try Google
                  </button>
                  <button
                    onClick={() => navigate('https://github.com')}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                  >
                    Try GitHub
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - History & Agent View */}
        <div className="w-64 bg-[#111] border-l border-white/5 p-4 overflow-y-auto">
          {/* Agent View Section */}
          <div className="mb-6">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Agent View</h3>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center">
                  <span className="text-[10px]">A</span>
                </div>
                <span className="text-white text-sm font-medium">Arjun</span>
              </div>
              <p className="text-white/30 text-xs mb-3">Last viewed:</p>
              <div className="space-y-2">
                <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                  competitor-analysis.com
                </div>
                <div className="text-xs text-white/60 bg-white/5 rounded px-2 py-1">
                  shopify.com/pricing
                </div>
              </div>
            </div>
          </div>

          {/* Your History */}
          <div>
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Your History</h3>
            {history.length === 0 ? (
              <p className="text-white/30 text-xs">No browsing history yet</p>
            ) : (
              <div className="space-y-2">
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(item.url)}
                    className="w-full text-left p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <p className="text-white text-xs truncate">{item.title}</p>
                    <p className="text-white/30 text-[10px]">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
