import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center px-6">
      <SignIn />
    </div>
  )
}
