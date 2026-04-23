'use client'

import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return <SignUp path="/auth/signup" routing="path" />
}
