'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Globe,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Camera,
  Trash2,
  Maximize2,
  X,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Home,
} from 'lucide-react'

interface Screenshot {
  id: string
  url: string
  imageUrl: string
  label: string
  capturedAt: string
  agentName?: string
}

const DEFAULT_HOME = 'https://example.com'

function BrowserToolbar({
  url,
  onUrlChange,
  onNavigate,
  onRefresh,
  onBack,
  onForward,
  canBack,
  canForward,
  loading,
  onCapture,
}: {
  url: string
  onUrlChange: (v: string) => void
  onNavigate: (url: string) => void
  onRefresh: () => void
  onBack: () => void
  onForward: () => void
  canBack: boolean
  canForward: boolean
  loading: boolean
  onCapture: () => void
}) {
  const [inputValue, setInputValue] = useState(url)

  useEffect(() => { setInputValue(url) }, [url])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let target = inputValue.trim()
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target
    onNavigate(target)
    onUrlChange(target)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border-b border-white/8">
      {/* Nav arrows */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onBack}
          disabled={!canBack}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          title="Back"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onForward}
          disabled={!canForward}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          title="Forward"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRefresh}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all"
          title="Refresh"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* URL bar */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <div className="flex-1 flex items-center bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-1.5 gap-2 focus-within:border-white/20 transition-colors">
          <Globe className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit(e as any)}
            className="flex-1 bg-transparent text-white/70 text-xs placeholder:text-white/20 focus:outline-none font-mono"
            placeholder="Enter URL to browse..."
            spellCheck={false}
            autoComplete="off"
          />
          {loading && <Loader2 className="w-3 h-3 text-[#e8ff47] animate-spin shrink-0" />}
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onCapture}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black text-[11px] font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Take Screenshot"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Capture</span>
        </button>
        <button
          onClick={() => window.open(url, '_blank')}
          disabled={!url}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/10 disabled:opacity-25 transition-all"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onNavigate(DEFAULT_HOME)}
          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-all"
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function BrowserContent({
  url,
  loading,
  onLoad,
  screenshotData,
  zoom,
  onZoomIn,
  onZoomOut,
}: {
  url: string
  loading: boolean
  onLoad: () => void
  screenshotData: string | null
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
}) {
  if (!url) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/20">
        <Globe className="w-12 h-12 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-medium text-white/40">No page loaded</p>
          <p className="text-xs text-white/20 mt-1">Enter a URL in the bar above and press Enter</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-auto bg-[#0a0a0a] flex items-center justify-center">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]">
          <Loader2 className="w-8 h-8 text-[#e8ff47] animate-spin" />
          <p className="text-white/40 text-xs">Loading page…</p>
        </div>
      )}

      {/* Screenshot display */}
      {screenshotData && (
        <div
          className="relative flex items-center justify-center min-w-full min-h-full p-4"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <img
            src={screenshotData}
            alt="Page screenshot"
            className="max-w-full max-h-full object-contain rounded shadow-2xl border border-white/10"
            onLoad={onLoad}
          />
          {/* Zoom controls overlay */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/70 backdrop-blur border border-white/10 rounded-lg p-1">
            <button
              onClick={onZoomOut}
              className="w-7 h-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-all"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-white/50 text-[10px] font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={onZoomIn}
              className="w-7 h-7 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-all"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* No screenshot yet — show placeholder */}
      {!screenshotData && !loading && (
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-2 text-white/20">
            <ImageIcon className="w-10 h-10 opacity-20" />
            <p className="text-xs text-white/30">Screenshot will appear here</p>
          </div>
          <button
            onClick={onLoad}
            className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black text-xs font-bold rounded-lg transition-colors"
          >
            Load Page
          </button>
        </div>
      )}
    </div>
  )
}

function Lightbox({
  src,
  label,
  onClose,
}: {
  src: string
  label: string
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <p className="text-white font-semibold text-sm">{label}</p>
          <p className="text-white/30 text-xs mt-0.5 truncate max-w-md">{src}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center p-8" onClick={e => e.stopPropagation()}>
        <img
          src={src}
          alt={label}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  )
}

export default function BrowserPage() {
  const supabase = createClient()
  const [userId, setUserId] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [url, setUrl] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [screenshotData, setScreenshotData] = useState<string | null>(null)
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [lightbox, setLightbox] = useState<Screenshot | null>(null)
  const [zoom, setZoom] = useState(1)
  const [agentName, setAgentName] = useState('Agent')
  const [captureFlash, setCaptureFlash] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const captureTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? '')
      setIsLoaded(true)
    })
    // Load saved screenshots from localStorage
    try {
      const saved = localStorage.getItem('hermes_screenshots')
      if (saved) setScreenshots(JSON.parse(saved))
    } catch {}
  }, [])

  const navigateTo = useCallback((targetUrl: string) => {
    setErrorMsg(null)
    setLoading(true)
    setScreenshotData(null)

    // Add to history
    setHistory((prev: string[]) => {
      const newHist = prev.slice(0, historyIndex + 1)
      newHist.push(targetUrl)
      return newHist
    })
    setHistoryIndex(h => h + 1)

    // Call screenshot API
    fetch('/api/browser/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl }),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Request failed' }))
          throw new Error(err.error || 'Screenshot failed')
        }
        const data = await res.json()
        setScreenshotData(data.imageUrl)
      })
      .catch(err => {
        console.error('Screenshot error:', err)
        setErrorMsg(err.message || 'Failed to load page')
        setScreenshotData(null)
      })
      .finally(() => setLoading(false))
  }, [historyIndex])

  const handleBack = () => {
    if (historyIndex <= 0) return
    const newIdx = historyIndex - 1
    setHistoryIndex(newIdx)
    const prev = history[newIdx]
    setUrl(prev)
    triggerCapture(prev)
  }

  const handleForward = () => {
    if (historyIndex >= history.length - 1) return
    const newIdx = historyIndex + 1
    setHistoryIndex(newIdx)
    const next = history[newIdx]
    setUrl(next)
    triggerCapture(next)
  }

  const handleRefresh = () => {
    if (!url) return
    setScreenshotData(null)
    triggerCapture(url)
  }

  const triggerCapture = (targetUrl: string) => {
    setLoading(true)
    setErrorMsg(null)
    fetch('/api/browser/screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl }),
    })
      .then(async res => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Screenshot failed')
        }
        return res.json()
      })
      .then(data => setScreenshotData(data.imageUrl))
      .catch(err => { console.error(err); setErrorMsg(err.message); setScreenshotData(null) })
      .finally(() => setLoading(false))
  }

  const handleCapture = async () => {
    if (!url || loading) return
    // Flash effect
    setCaptureFlash(true)
    setTimeout(() => setCaptureFlash(false), 600)

    // Trigger a fresh capture
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/browser/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Screenshot failed')
      }
      const data = await res.json()
      setScreenshotData(data.imageUrl)

      // Save to gallery
      const newShot: Screenshot = {
        id: `shot-${Date.now()}`,
        url,
        imageUrl: data.imageUrl,
        label: new URL(url).hostname,
        capturedAt: new Date().toISOString(),
        agentName,
      }
      const updated = [newShot, ...screenshots]
      setScreenshots(updated)
      try { localStorage.setItem('hermes_screenshots', JSON.stringify(updated)) } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || 'Capture failed')
    } finally {
      setLoading(false)
    }
  }

  const deleteShot = (id: string) => {
    const updated = screenshots.filter(s => s.id !== id)
    setScreenshots(updated)
    try { localStorage.setItem('hermes_screenshots', JSON.stringify(updated)) } catch {}
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const ZOOM_STEP = 0.25
  const zoomIn = () => setZoom(z => Math.min(z + ZOOM_STEP, 3))
  const zoomOut = () => setZoom(z => Math.max(z - ZOOM_STEP, 0.25))

  if (!isLoaded) return <div className="p-8 text-white/40 text-sm">Loading...</div>

  return (
    <div className="flex flex-col h-[calc(100vh-44px)]">

      {/* Flash overlay */}
      {captureFlash && (
        <div className="fixed inset-0 z-[250] bg-white pointer-events-none animate-[fadeOut_0.6s_ease-out_forwards]" />
      )}

      {/* Browser chrome */}
      <div className="flex flex-col border-b border-white/5" style={{ minHeight: '420px' }}>
        {/* Tab bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border-b border-white/5">
          <div className="flex items-center gap-2 flex-1 bg-[#1a1a1a] border border-white/10 rounded-t-lg px-4 py-1.5">
            <Globe className="w-3.5 h-3.5 text-[#e8ff47] shrink-0" />
            <span className="text-white/60 text-xs font-mono truncate flex-1">{url || 'New Tab'}</span>
            {loading && <Loader2 className="w-3 h-3 text-[#e8ff47] animate-spin shrink-0" />}
          </div>
        </div>

        {/* Toolbar */}
        <BrowserToolbar
          url={url}
          onUrlChange={setUrl}
          onNavigate={navigateTo}
          onRefresh={handleRefresh}
          onBack={handleBack}
          onForward={handleForward}
          canBack={historyIndex > 0}
          canForward={historyIndex < history.length - 1}
          loading={loading}
          onCapture={handleCapture}
        />

        {/* Error banner */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-950/40 border-b border-red-500/30 px-4 py-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <p className="text-red-400/80 text-xs flex-1">{errorMsg}</p>
            <button onClick={() => setErrorMsg(null)} className="text-red-400/40 hover:text-red-400 text-sm">×</button>
          </div>
        )}

        {/* Content */}
        <BrowserContent
          url={url}
          loading={loading}
          onLoad={() => {}}
          screenshotData={screenshotData}
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
        />
      </div>

      {/* Screenshot gallery */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-white/40" />
            <h2 className="text-white font-semibold text-sm">Screenshots</h2>
            <span className="text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-full">{screenshots.length}</span>
          </div>
          {screenshots.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all screenshots?')) {
                  setScreenshots([])
                  try { localStorage.removeItem('hermes_screenshots') } catch {}
                }
              }}
              className="text-white/30 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        {screenshots.length === 0 ? (
          <div className="text-center py-10 text-white/20">
            <Camera className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No screenshots yet</p>
            <p className="text-[10px] text-white/15 mt-1">Browse a page and click "Capture" to save screenshots</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {screenshots.map(shot => (
              <div
                key={shot.id}
                className="group relative bg-[#111] border border-white/8 rounded-xl overflow-hidden hover:border-white/20 transition-all cursor-pointer"
                onClick={() => setLightbox(shot)}
              >
                <div className="aspect-video bg-[#0a0a0a]">
                  <img
                    src={shot.imageUrl}
                    alt={shot.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-white/70 text-[11px] font-medium truncate">{shot.label}</p>
                  <p className="text-white/25 text-[10px] mt-0.5">{formatTime(shot.capturedAt)}</p>
                  {shot.agentName && shot.agentName !== 'Agent' && (
                    <p className="text-[#e8ff47]/60 text-[10px] mt-1">by {shot.agentName}</p>
                  )}
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center text-white transition-all">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteShot(shot.id) }}
                    className="w-8 h-8 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 rounded-lg flex items-center justify-center text-red-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          src={lightbox.url}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}
