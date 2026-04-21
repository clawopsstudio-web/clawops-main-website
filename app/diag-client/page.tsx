'use client';
import { useEffect, useState } from 'react';

export default function DiagClient() {
  const [result, setResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  function getCookies() {
    const cookies = document.cookie.split(';').map(c => c.trim()).filter(c => c);
    return cookies.length === 0 ? [] : cookies;
  }

  useEffect(() => {
    const cookies = getCookies();
    const sbToken = cookies.find(c => c.startsWith('sb-access-token='));
    const sbRefresh = cookies.find(c => c.startsWith('sb-refresh-token='));
    const sbUserId = cookies.find(c => c.startsWith('sb-user-id='));

    let html = '<h2>Client-Side Cookies (document.cookie)</h2>';
    html += '<p>Note: document.cookie only shows non-httpOnly cookies. It shows ALL cookies for this origin.</p>';
    html += '<ul>';
    html += `<li><b>sb-access-token:</b> ${sbToken ? '✅ Found (' + sbToken.substring(0, 50) + '...)' : '❌ NOT FOUND'}</li>`;
    html += `<li><b>sb-refresh-token:</b> ${sbRefresh ? '✅ Found' : '❌ NOT FOUND'}</li>`;
    html += `<li><b>sb-user-id:</b> ${sbUserId ? '✅ Found (' + sbUserId.split('=')[1] + ')' : '❌ NOT FOUND'}</li>`;
    html += '</ul>';

    html += '<h2>All Cookies</h2><ul>';
    if (cookies.length === 0) {
      html += '<li>No cookies found!</li>';
    } else {
      cookies.forEach(c => {
        const name = c.split('=')[0];
        html += `<li>${name}: ${c.includes('sb-') ? c.substring(0, 60) + '...' : '(other)'}</li>`;
      });
    }
    html += '</ul>';

    html += '<h2>Location Info</h2>';
    html += `<ul>`;
    html += `<li>href: ${window.location.href}</li>`;
    html += `<li>origin: ${window.location.origin}</li>`;
    html += `<li>pathname: ${window.location.pathname}</li>`;
    html += `<li>protocol: ${window.location.protocol}</li>`;
    html += `</ul>`;

    setResult(html);
  }, []);

  async function testServices() {
    setTesting(true);
    const results: string[] = [];
    for (const svc of ['automation', 'chrome', 'gateway']) {
      try {
        const r = await fetch(`/${svc}`, { cache: 'no-store' });
        results.push(`${svc}: ${r.status} ${r.headers.get('location') || ''}`);
      } catch (e: any) {
        results.push(`${svc}: ERROR ${e.message}`);
      }
    }
    setResult(prev => prev + '<h2>Service Test Results</h2><ul>' + results.map(r => `<li>${r}</li>`).join('') + '</ul>');
    setTesting(false);
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#00D4FF' }}>🔍 Client-Side Diagnostic</h1>
      <div dangerouslySetInnerHTML={{ __html: result }} />
      <button onClick={testServices} disabled={testing}
        style={{ padding: '12px 24px', background: '#00D4FF', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', marginTop: '20px' }}>
        {testing ? 'Testing...' : 'Test Service Access'}
      </button>
      <br /><br />
      <a href="/dashboard" style={{ color: '#00D4FF' }}>← Dashboard</a>
    </div>
  );
}
