import { NextRequest, NextResponse } from 'next/server';
import { appendFileSync } from 'fs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const raw = req.headers.get('cookie') || 'NONE';
  appendFileSync('/tmp/vvalidate.log', `Cookie: ${raw.substring(0, 300)}\n`);
  return NextResponse.json({ raw: raw.substring(0, 200), ok: true });
}
