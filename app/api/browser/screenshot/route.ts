import { NextRequest, NextResponse } from 'next/server'
import puppeteer, { type Browser } from 'puppeteer'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  let url: string

  try {
    const body = await req.json()
    url = body.url
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  // Normalise URL
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url
  }

  // Validate URL format
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http and https URLs are supported' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  let browser: Browser | null = null

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,800',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
      ],
      timeout: 20_000,
    })

    const page = await browser.newPage()

    // Set realistic viewport
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 })

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    )

    // Set accept headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    })

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 15_000,
    })

    // Give the page a moment to render
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Capture screenshot as base64 PNG
    const screenshotBuffer = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false,
    })

    const imageUrl = `data:image/png;base64,${screenshotBuffer}`

    return NextResponse.json({ imageUrl, url, capturedAt: new Date().toISOString() })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[browser/screenshot] Error:', message)

    if (message.includes('net::ERR_')) {
      return NextResponse.json(
        { error: `Could not reach ${url} — the site may be blocking requests or is unreachable` },
        { status: 502 }
      )
    }
    if (message.includes('timeout') || message.includes('Timeout')) {
      return NextResponse.json(
        { error: 'Page took too long to load — try again or use a different URL' },
        { status: 504 }
      )
    }

    return NextResponse.json({ error: `Screenshot failed: ${message}` }, { status: 500 })
  } finally {
    if (browser) {
      try { await browser.close() } catch {}
    }
  }
}
