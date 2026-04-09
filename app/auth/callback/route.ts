import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') || 'pro'
  const next = searchParams.get('next') || '/auth/payment'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const redirectUrl = new URL(`${origin}${next}?plan=${plan}`)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
}
