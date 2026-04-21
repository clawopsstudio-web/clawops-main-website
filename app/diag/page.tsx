import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function DiagPage() {
  const cookieStore = await cookies();
  const sbToken = cookieStore.get('sb-access-token');
  const sbRefresh = cookieStore.get('sb-refresh-token');
  const sbUserId = cookieStore.get('sb-user-id');

  let tokenPayload = null;
  let tokenValid = false;
  if (sbToken?.value) {
    try {
      const parts = sbToken.value.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      tokenPayload = payload;
      tokenValid = payload.exp > Math.floor(Date.now() / 1000);
    } catch (e) {
      tokenValid = false;
    }
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', color: '#0f0', minHeight: '100vh', margin: 0 }}>
      <h1 style={{ color: '#00D4FF' }}>🔍 Cookie Diagnostic</h1>
      
      <table style={{ borderCollapse: 'collapse', marginBottom: '30px' }}>
        <tr><td style={{ padding: '8px', border: '1px solid #333' }}><b>Cookie</b></td><td style={{ padding: '8px', border: '1px solid #333' }}><b>Value</b></td></tr>
        <tr><td style={{ padding: '8px', border: '1px solid #333' }}>sb-access-token</td><td style={{ padding: '8px', border: '1px solid #333', color: sbToken ? '#0f0' : '#f55' }}>{sbToken ? (sbToken.value.substring(0, 40) + '...') : '❌ NOT FOUND'}</td></tr>
        <tr><td style={{ padding: '8px', border: '1px solid #333' }}>sb-refresh-token</td><td style={{ padding: '8px', border: '1px solid #333', color: sbRefresh ? '#0f0' : '#f55' }}>{sbRefresh ? (sbRefresh.value.substring(0, 40) + '...') : '❌ NOT FOUND'}</td></tr>
        <tr><td style={{ padding: '8px', border: '1px solid #333' }}>sb-user-id</td><td style={{ padding: '8px', border: '1px solid #333', color: sbUserId ? '#0f0' : '#f55' }}>{sbUserId ? sbUserId.value : '❌ NOT FOUND'}</td></tr>
      </table>

      {tokenPayload && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#00D4FF' }}>JWT Payload</h2>
          <table style={{ borderCollapse: 'collapse' }}>
            <tr><td style={{ padding: '6px', border: '1px solid #333' }}>sub (userId)</td><td style={{ padding: '6px', border: '1px solid #333' }}>{tokenPayload.sub}</td></tr>
            <tr><td style={{ padding: '6px', border: '1px solid #333' }}>email</td><td style={{ padding: '6px', border: '1px solid #333' }}>{tokenPayload.email}</td></tr>
            <tr><td style={{ padding: '6px', border: '1px solid #333' }}>iss</td><td style={{ padding: '6px', border: '1px solid #333' }}>{tokenPayload.iss}</td></tr>
            <tr><td style={{ padding: '6px', border: '1px solid #333' }}>ref</td><td style={{ padding: '6px', border: '1px solid #333' }}>{tokenPayload.ref}</td></tr>
            <tr><td style={{ padding: '6px', border: '1px solid #333' }}>exp</td><td style={{ padding: '6px', border: '1px solid #333' }}>{new Date(tokenPayload.exp * 1000).toISOString()}</td></tr>
            <tr><td style={{ padding: '6px', border: '1px solid #333' }}>expired?</td><td style={{ padding: '6px', border: '1px solid #333', color: tokenValid ? '#0f0' : '#f55' }}>{tokenValid ? '✅ Valid' : '❌ Expired'}</td></tr>
          </table>
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#00D4FF' }}>Test Links</h2>
        <p>Status: <b style={{ color: sbToken && tokenValid ? '#0f0' : '#f55' }}>
          {sbToken && tokenValid ? '✅ JWT Valid — service links should work' : '❌ JWT Missing or Expired — fix login first'}
        </b></p>
        <br />
        <a href="#" style={{ color: '#00D4FF', marginRight: '20px' }}>Automation ↗</a>
        <a href="/chrome" style={{ color: '#00D4FF', marginRight: '20px' }}>Chrome ↗</a>
        <a href="/gateway" style={{ color: '#00D4FF', marginRight: '20px' }}>Gateway ↗</a>
        <br /><br />
        <a href="/dashboard" style={{ color: '#00D4FF' }}>← Dashboard</a>
      </div>
    </div>
  );
}
