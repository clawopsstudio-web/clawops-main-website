/**
 * lib/telegram.ts — Telegram alerts to Pulkit
 *
 * Alerts sent at key pipeline events.
 */

function envOpt(key: string): string | undefined {
  return process.env[key]
}

async function send(html: string): Promise<void> {
  const botToken = envOpt('TELEGRAM_BOT_TOKEN')
  const chatId = envOpt('TELEGRAM_CHAT_ID')
  if (!botToken || !chatId) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — skipping alert')
    return
  }
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: 'HTML' }),
  })
}

// ─── Alert types ──────────────────────────────────────────────────────────

export async function sendPaymentAlert(params: {
  fullName: string
  plan: string
  price: string
  email: string
}): Promise<void> {
  const { fullName, plan, price, email } = params
  await send(
    `💳 <b>New payment received</b>\n\n` +
    `User: ${fullName}\n` +
    `Plan: ${plan} — ${price}/mo\n` +
    `Email: ${email}\n` +
    `Provisioning starting now...`
  )
}

export async function sendVPSLiveAlert(params: {
  fullName: string
  ipAddress: string
  subdomain: string
}): Promise<void> {
  const { fullName, ipAddress, subdomain } = params
  await send(
    `✅ <b>VPS live</b>\n\n` +
    `User: ${fullName}\n` +
    `IP: ${ipAddress}\n` +
    `Dashboard: https://${subdomain}.app.clawops.studio\n` +
    `Status: active`
  )
}

export async function sendErrorAlert(params: {
  clerkUserId: string
  step: string
  error: string
}): Promise<void> {
  const { clerkUserId, step, error } = params
  await send(
    `🚨 <b>PROVISIONING ERROR</b>\n\n` +
    `User: ${clerkUserId}\n` +
    `Step: ${step}\n` +
    `Error: ${error}\n` +
    `Action needed: check provisioning_logs`
  )
}

export async function sendAbandonedAlert(params: {
  fullName: string
  plan: string
  createdAt: string
}): Promise<void> {
  const { fullName, plan, createdAt } = params
  await send(
    `👻 <b>User abandoned checkout</b>\n\n` +
    `Name: ${fullName}\n` +
    `Plan they selected: ${plan}\n` +
    `Submitted: ${createdAt}`
  )
}

// Convenience wrapper
export async function sendAlert(message: string): Promise<void> {
  await send(message)
}
