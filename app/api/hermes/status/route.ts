import { NextResponse } from 'next/server'

// GET /api/hermes/status
// Returns Hermes/VPS heartbeat status for the authenticated user's workspace.
// For unprovisioned users, returns { live: false }.
export async function GET() {
  // No auth check needed — dashboard layout polls this every 30s.
  // The layout gracefully handles { live: false } by showing "Hermes offline".
  // In Phase 3, this will check the actual VPS heartbeat.
  return NextResponse.json({ live: false, message: 'Provisioning not yet complete' })
}
