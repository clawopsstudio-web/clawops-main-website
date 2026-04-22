import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test Contabo auth
    const tokenRes = await fetch('https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.CONTABO_CLIENT_ID ?? '',
        client_secret: process.env.CONTABO_CLIENT_SECRET ?? '',
        username: process.env.CONTABO_API_USER ?? '',
        password: process.env.CONTABO_API_PASSWORD ?? '',
        grant_type: 'password',
      }),
    })
    const tokenData = await tokenRes.json()
    const token = tokenData.access_token ?? null

    if (!token) {
      return NextResponse.json({
        ok: false,
        step: 'auth',
        error: tokenData.error ?? 'no token',
        envCheck: {
          hasClientId: !!process.env.CONTABO_CLIENT_ID,
          hasClientSecret: !!process.env.CONTABO_CLIENT_SECRET,
          hasApiUser: !!process.env.CONTABO_API_USER,
          hasApiPassword: !!process.env.CONTABO_API_PASSWORD,
          mockPayment: process.env.MOCK_PAYMENT,
        }
      })
    }

    // Test instance creation
    const xid = crypto.randomUUID()
    const createRes = await fetch('https://api.contabo.com/v1/compute/instances', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-request-id': xid,
      },
      body: JSON.stringify({
        productId: 'V95',
        imageId: 'd64d5c6c-9dda-4e38-8174-0ee282474d8a',
        name: `test-${Date.now()}`,
        region: 'EU',
      }),
    })
    const createData = await createRes.json()

    return NextResponse.json({
      ok: !!createData.data?.[0]?.instanceId,
      step: 'create',
      status: createRes.status,
      data: createData,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message })
  }
}
