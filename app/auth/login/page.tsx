'use client'
import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignIn
        fallbackRedirectUrl="/dashboard"
        routing="hash"
      />
    </div>
  )
}
