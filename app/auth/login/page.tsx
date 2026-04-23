'use client'

import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#ffffff' }}>
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  )
}
