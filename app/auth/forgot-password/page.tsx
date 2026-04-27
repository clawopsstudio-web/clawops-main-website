'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/update-password` })
    if (error) alert(error.message)
    else alert('Check your email for the password reset link.')
    setLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
      <form onSubmit={handleReset} className="w-full max-w-md space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full rounded bg-gray-800 p-2 border border-gray-700" />
        <button disabled={loading} className="w-full rounded bg-cyan-600 p-2 font-bold hover:bg-cyan-500">Send Reset Link</button>
      </form>
    </motion.div>
  )
}
