import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    cookies: request.cookies.getAll().map(c => ({ name: c.name, valueLength: c.value?.length })),
    cookieHeader: request.headers.get('cookie'),
    url: request.url,
    pathname: request.nextUrl.pathname,
  })
}
