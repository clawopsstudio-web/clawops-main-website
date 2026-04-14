import CallbackClient from './CallbackClient'

// Prevent this page from being cached by anything (Cloudflare, Vercel, browsers)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CallbackPage() {
  return <CallbackClient />
}
