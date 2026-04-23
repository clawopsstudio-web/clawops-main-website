'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <SignUp
        fallbackRedirectUrl="/dashboard"
        routing="hash"
      />
    </div>
  )
}
