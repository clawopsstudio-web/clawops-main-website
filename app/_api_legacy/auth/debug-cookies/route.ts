import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const cookies = req.cookies.getAll();
  return NextResponse.json({
    received: true,
    numCookies: cookies.length,
    cookieNames: cookies.map(c => c.name),
    host: req.headers.get('host'),
    cookieHeader: req.headers.get('cookie'),
  });
}
