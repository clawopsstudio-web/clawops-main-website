import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // never cache — auth validation must always be fresh

// GET /api/auth/validate
// Nginx auth_request subrequest — validates Supabase JWT cookie.
// Returns 200 if valid session, 401 if not.
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(_cookies) {
            // read-only for auth validation — no need to set
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return headers for Nginx auth_request to pick up.
    // Do NOT redirect — auth_request must get a 2xx status code directly.
    return NextResponse.json(
      { userId: user.id, email: user.email },
      {
        status: 200,
        headers: {
          'X-Auth-User-Id': user.id,
          'X-Auth-User-Email': (user.email || '').replace(/@/g, '%40'),
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
