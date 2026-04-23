'use client'
import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
          },
        }}
      />
    </main>
  )
}
