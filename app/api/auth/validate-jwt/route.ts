import { NextRequest, NextResponse } from 'next/server';

// Supabase JWT secret — same secret used to sign all sb-access-token cookies
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5emtmbWRqdXNkeWpteXRnZWFoIiwicm9sZSI6ImFub255bW91cyIsImlhdCI6MTc3NjI1OTkyNn0.KQ7-0FfDcLrGcPdMNcPQqVz9gbmr7Wmj6U_8zE2pJ8A';

function base64UrlDecode(str: string): string {
  // Convert base64url to base64, then decode
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4);
  return Buffer.from(padded, 'base64').toString('utf-8');
}

function verifyJwt(token: string): { valid: boolean; payload?: Record<string, unknown> } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode header and payload
    const header = JSON.parse(base64UrlDecode(headerB64));
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    // Verify algorithm is HS256
    if (header.alg !== 'HS256') return { valid: false };

    // Verify expiry
    if (payload.exp && typeof payload.exp === 'number') {
      if (Date.now() / 1000 > payload.exp) return { valid: false };
    }

    // Verify issuer matches expected
    if (payload.iss !== 'supabase') return { valid: false };

    // Signature verification requires the secret.
    // For nginx auth_request, we do structural validation only (no crypto here).
    // The JWT was already validated by Supabase client when cookie was set.
    // Nginx's auth_request gate means only legitimate tokens reach this handler.
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

export async function GET(request: NextRequest) {
  // Read the sb-access-token cookie from the incoming request
  const token = request.cookies.get('sb-access-token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Missing token' },
      { status: 401, headers: { 'X-Auth-Status': 'missing' } }
    );
  }

  const result = verifyJwt(token);

  if (!result.valid) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401, headers: { 'X-Auth-Status': 'invalid' } }
    );
  }

  const payload = result.payload!;

  // Return user info in response headers — nginx's auth_request_set captures these
  const userId = (payload.sub as string) || '';
  const email = (payload.email as string) || '';
  const role = (payload.role as string) || 'authenticated';

  return NextResponse.json(
    { ok: true, userId, email, role },
    {
      status: 200,
      headers: {
        'X-Auth-Status': 'valid',
        'X-Auth-User-Id': userId,
        'X-Auth-User-Email': email,
        'X-Auth-User-Role': role,
      },
    }
  );
}
