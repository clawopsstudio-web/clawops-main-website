'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
      <SignUp fallbackRedirectUrl="/dashboard" />
    </div>
  )
}
