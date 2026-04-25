# Composio Audit — 2026-04-25

## Status: IN PROGRESS — VERIFY IN VERCEL

## API Key

| Environment | Variable | Value | Verified |
|------------|----------|-------|----------|
| `.env.local` | `COMPOSIO_API_KEY` | `ak_4NXr8...` | ✅ local |
| Vercel | `COMPOSIO_API_KEY` | ? | ❌ **MUST CHECK** |

**Action:** Pulkit to verify in Vercel Dashboard → Project Settings → Environment Variables.

## Composio npm Packages

| Package | Version | Status |
|---------|---------|--------|
| `@composio/core` | 0.6.10 | ✅ installed |
| `composio-core` | 0.5.39 | ✅ installed |
| `composio` | latest | ✅ installed |

## Composio API Routes

| Route | File | Auth | Status |
|-------|------|------|--------|
| `GET /api/composio/status` | `app/api/composio/status/route.ts` | Supabase session | ✅ exists |
| `POST /api/composio/connect` | `app/api/composio/connect/route.ts` | Supabase session | ✅ exists |
| `GET /api/composio/oauth/callback` | `app/api/composio/oauth/callback/route.ts` | ? | ✅ exists |
| `POST /api/composio/disconnect` | `app/api/composio/disconnect/route.ts` | ? | ✅ exists |

## Composio lib

File: `lib/composio.ts`

| Function | Status |
|----------|--------|
| `getServerComposioClient(userId)` | ✅ exists |
| `getComposioClient(clerkUserId)` | ✅ exists |
| `getUserConnections(clerkUserId)` | ✅ exists |
| `getComposioConnection(clerkUserId, appName)` | ✅ exists |
| `initiateConnection(clerkUserId, appName)` | ✅ exists |
| `executeAction(clerkUserId, appName, action, params)` | ✅ exists |

**Note:** Uses `clerk_user_id` column — works with Supabase UID via Supabase Auth.

## Supabase Tables

### `user_connections` (active table)

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `clerk_user_id` | UUID | Matches Supabase Auth UID |
| `app_name` | TEXT | Composio app name (GMAIL, GITHUB, etc.) |
| `connected` | BOOLEAN | Connection status |
| `connected_account_id` | TEXT | Token/account reference |
| `connected_at` | TIMESTAMPTZ | When connected |
| `updated_at` | TIMESTAMPTZ | Last update |

**RLS:** Enabled. Anon key cannot read/write. Use service role via API routes.

**Existing data:**
- TELEGRAM: connected for admin user (from 2026-04-25 session)

### `tool_connections`

**Does NOT exist.** Using `user_connections` instead.

## Tool Integration Status

| Tool | Composio Route | DB Saves | UI Wired | OAuth Flow |
|------|---------------|----------|----------|------------|
| Gmail | ✅ | ✅ `user_connections` | ✅ | ✅ Composio OAuth |
| GitHub | ✅ | ✅ `user_connections` | ✅ | ✅ Composio OAuth |
| HubSpot | ✅ | ✅ `user_connections` | ✅ | ✅ Composio OAuth |
| Notion | ✅ | ✅ `user_connections` | ✅ | ✅ Composio OAuth |
| Telegram | ✅ `/api/tools/telegram` | ✅ `user_connections` | ✅ | 🔧 Token-based |
| WhatsApp | ✅ `/api/tools/telegram` | ✅ `user_connections` | ✅ | 🔧 Token-based |
| Slack | ✅ `/api/tools/telegram` | ✅ `user_connections` | ✅ | 🔧 Token-based |
| Discord | ✅ `/api/tools/telegram` | ✅ `user_connections` | ✅ | 🔧 Token-based |

## API Routes for Tool Connections

| Route | Method | Auth | Bypasses RLS | Status |
|-------|--------|------|--------------|--------|
| `/api/tools/connections` | GET | Supabase session | ✅ Service role | ✅ wired |
| `/api/tools/connections` | POST | Supabase session | ✅ Service role | ✅ wired |
| `/api/tools/telegram` | POST | Supabase session | ✅ Service role | ✅ wired |

## Issues Found

1. **Vercel env vars not verified** — `COMPOSIO_API_KEY` may not be in Vercel
2. **`tool_connections` doesn't exist** — using `user_connections` (acceptable workaround)
3. **`lib/composio.ts` references `clerkUserId`** — still works, cosmetic only
4. **OAuth callback URL** — `https://connect.clawops.studio/oauth/callback` needs production verification

## Next Steps

- [ ] Verify `COMPOSIO_API_KEY` in Vercel Dashboard
- [ ] Test Gmail OAuth flow end-to-end
- [ ] Test GitHub OAuth flow end-to-end
- [ ] Add `tool_connections` table via Supabase SQL Editor (optional)
- [ ] Verify OAuth callback URL resolves correctly
