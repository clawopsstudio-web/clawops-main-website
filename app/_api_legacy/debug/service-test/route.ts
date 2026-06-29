import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies: Record<string, string> = {};
  
  cookieStore.getAll().forEach(c => {
    if (c.name.startsWith('sb-') || c.name === '__session') {
      allCookies[c.name] = c.value.substring(0, 50) + '...';
    }
  });

  return NextResponse.json({
    receivedCookies: allCookies,
    hasAccessToken: cookieStore.has('sb-access-token'),
    hasRefreshToken: cookieStore.has('sb-refresh-token'),
    hasUserId: cookieStore.has('sb-user-id'),
  });
}
