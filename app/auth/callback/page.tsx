import { SignIn } from '@clerk/nextjs'

// Clerk handles OAuth callbacks automatically at /auth-callback
// This page is a fallback for any manual navigation
export default function CallbackPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white/60">Completing sign in...</div>
    </div>
  )
}
