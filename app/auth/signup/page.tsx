import { SignUp } from '@clerk/nextjs'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center px-6">
      <SignUp />
    </div>
  )
}
