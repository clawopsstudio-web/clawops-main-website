import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function decodeJWT(token: string): { sub: string; exp: number; ref: string; iss: string; email?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64urlDecode(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

const SERVICE_URL = 'http://127.0.0.1:5678/';

export default async function N8nServicePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    redirect('/auth/login?redirect=/n8n');
  }

  const payload = decodeJWT(accessToken);
  const valid =
    payload !== null &&
    (!payload.exp || Date.now() < payload.exp * 1000) &&
    payload.ref === 'dyzkfmdjusdyjmytgeah' &&
    !!payload.iss?.includes('.supabase.co/auth/v1');

  if (!valid) {
    redirect('/auth/login?redirect=/n8n');
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>n8n — ClawOps</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #04040c;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 48px;
            text-align: center;
            max-width: 480px;
            width: 100%;
            margin: 16px;
          }
          .icon {
            width: 72px;
            height: 72px;
            border-radius: 16px;
            background: rgba(234,75,113,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin: 0 auto 24px;
          }
          h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
          p { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 32px; }
          .spinner {
            width: 24px; height: 24px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: #EA4B71;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          .btn {
            display: inline-block;
            padding: 12px 28px;
            background: linear-gradient(135deg, #EA4B71, #ff6b8a);
            color: white;
            border-radius: 10px;
            font-weight: 600;
            font-size: 14px;
            text-decoration: none;
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .btn:hover {
            transform: scale(1.03);
            box-shadow: 0 0 24px rgba(234,75,113,0.35);
          }
          .note { font-size: 12px; color: rgba(255,255,255,0.25); margin-top: 24px; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">⚙️</div>
          <h1>n8n Workflows</h1>
          <p>Opening n8n in a new tab with your authenticated session...</p>
          <div className="spinner"></div>
          <a
            href={SERVICE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            Open n8n ↗
          </a>
          <p className="note">
            Opens in a new tab · Authenticated via your ClawOps session
          </p>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          window.onload = function() {
            var w = window.open('${SERVICE_URL}', '_blank');
            if (!w) {
              document.querySelector('.btn').style.display = 'inline-block';
              document.querySelector('.spinner').style.display = 'none';
            }
          };
        `}} />
      </body>
    </html>
  );
}
