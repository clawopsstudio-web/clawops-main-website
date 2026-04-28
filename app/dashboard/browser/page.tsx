'use client'
import { useState, useEffect } from 'react'

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

  const takeScreenshot = async () => {
    setLoading(true)
    setError(null)
    setScreenshot(null)
    
    try {
      // Normalize URL
      let finalUrl = url.trim()
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl
      }

      const res = await fetch('/api/browser/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Screenshot failed')
      }
      
      const data = await res.json()
      
      if (data.imageUrl) {
        setScreenshot(data.imageUrl)
        setHistory(prev => [{
          url: finalUrl,
          title: new URL(finalUrl).hostname,
          timestamp: new Date().toISOString(),
        }, ...prev.slice(0, 9)])
      } else if (data.screenshot) {
        // Base64 screenshot
        setScreenshot(`data:image/png;base64,${data.screenshot}`)
        setHistory(prev => [{
          url: finalUrl,
          title: new URL(finalUrl).hostname,
          timestamp: new Date().toISOString(),
        }, ...prev.slice(0, 9)])
      } else {
        throw new Error('No screenshot in response')
      }
    } catch (err: any) {
      console.error('[browser] Error:', err)
      setError(err.message || 'Failed to take screenshot')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = () => {
    let finalUrl = inputUrl.trim()
    if (!finalUrl) return
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl
    }
    setUrl(finalUrl)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate()
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar - History */}
      <div className="w-64 bg-[#111] border-r border-white/10 p-4 overflow-y-auto">
        <h2 className="text-white/40 text-xs font-semibold uppercase mb-4">History</h2>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-white/30 text-sm">No history yet</p>
          ) : (
            history.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setUrl(item.url)
                  setInputUrl(new URL(item.url).hostname)
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <p className="text-white/70 text-xs truncate">{item.title}</p>
                <p className="text-white/30 text-[10px]">{new Date(item.timestamp).toLocaleTimeString()}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Browser Area */}
      <div className="flex-1 flex flex-col">
        {/* URL Bar */}
        <div className="bg-[#1a1a1a] border-b border-white/10 p-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-lg px-3">
              <span className="text-white/30 text-sm mr-2">🔒</span>
              <input
                type="text"
                value={inputUrl}
                onChange={e => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter URL..."
                className="flex-1 bg-transparent text-white text-sm py-2 focus:outline-none"
              />
            </div>
            <button
              onClick={handleNavigate}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
            >
              Go
            </button>
            <button
              onClick={takeScreenshot}
              disabled={loading}
              className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : '📸'}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white/5 flex items-center justify-center overflow-auto p-6">
          {loading && (
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-white/20 border-t-[#e8ff47] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/50 text-sm">Taking screenshot...</p>
            </div>
          )}

          {error && (
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-white font-semibold mb-2">Screenshot Failed</h3>
              <p className="text-white/40 text-sm mb-4">{error}</p>
              <button
                onClick={takeScreenshot}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {screenshot && !loading && (
            <div className="w-full">
              <img
                src={screenshot}
                alt="Screenshot"
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
          )}

          {!screenshot && !loading && !error && (
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-white font-semibold mb-2">Browser</h3>
              <p className="text-white/40 text-sm mb-4">Enter a URL and click 📸 to take a screenshot</p>
              <button
                onClick={takeScreenshot}
                className="px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
              >
                Take Screenshot of Google
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
