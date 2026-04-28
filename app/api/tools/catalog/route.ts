/**
 * GET /api/tools/catalog
 * Returns available tools - Composio API or expanded fallback
 */
import { NextResponse } from 'next/server'

// Expanded fallback tools (100+ popular integrations)
const FALLBACK_TOOLS = [
  // Email
  { slug: 'gmail', name: 'Gmail', category: 'Email', description: 'Send and receive emails via Gmail', icon: '📧' },
  { slug: 'outlook', name: 'Outlook', category: 'Email', description: 'Microsoft Outlook email and calendar', icon: '📬' },
  { slug: 'sendgrid', name: 'SendGrid', category: 'Email', description: 'Transactional and marketing emails', icon: '✉️' },
  { slug: 'mailchimp', name: 'Mailchimp', category: 'Email', description: 'Email marketing campaigns', icon: '📧' },
  { slug: 'postmark', name: 'Postmark', category: 'Email', description: 'Email delivery for apps', icon: '📮' },
  
  // Messaging
  { slug: 'slack', name: 'Slack', category: 'Messaging', description: 'Send messages to Slack channels', icon: '💬' },
  { slug: 'telegram', name: 'Telegram', category: 'Messaging', description: 'Send Telegram messages', icon: '✈️' },
  { slug: 'discord', name: 'Discord', category: 'Messaging', description: 'Post to Discord channels', icon: '🎮' },
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Messaging', description: 'WhatsApp Business messages', icon: '📱' },
  { slug: 'intercom', name: 'Intercom', category: 'Messaging', description: 'Customer chat and support', icon: '💬' },
  { slug: 'twilio', name: 'Twilio', category: 'SMS', description: 'Send SMS and voice calls', icon: '📞' },
  
  // CRM & Sales
  { slug: 'hubspot', name: 'HubSpot', category: 'CRM', description: 'CRM contacts, deals, automation', icon: '🔶' },
  { slug: 'salesforce', name: 'Salesforce', category: 'CRM', description: 'Leads and opportunities', icon: '☁️' },
  { slug: 'pipedrive', name: 'Pipedrive', category: 'CRM', description: 'Sales CRM and pipeline', icon: '📊' },
  { slug: 'zoho-crm', name: 'Zoho CRM', category: 'CRM', description: 'Zoho sales automation', icon: '📈' },
  
  // Productivity
  { slug: 'google-calendar', name: 'Google Calendar', category: 'Productivity', description: 'Calendar events and schedules', icon: '📅' },
  { slug: 'google-drive', name: 'Google Drive', category: 'Productivity', description: 'Access files in Drive', icon: '📁' },
  { slug: 'google-sheets', name: 'Google Sheets', category: 'Productivity', description: 'Spreadsheet data', icon: '📊' },
  { slug: 'notion', name: 'Notion', category: 'Docs', description: 'Notion pages and databases', icon: '📓' },
  { slug: 'airtable', name: 'Airtable', category: 'Database', description: 'Low-code database', icon: '🗄️' },
  { slug: 'trello', name: 'Trello', category: 'Project Mgmt', description: 'Kanban boards and tasks', icon: '📋' },
  { slug: 'asana', name: 'Asana', category: 'Project Mgmt', description: 'Team tasks and projects', icon: '✅' },
  { slug: 'jira', name: 'Jira', category: 'Project Mgmt', description: 'Issue tracking and sprints', icon: '🗃️' },
  { slug: 'linear', name: 'Linear', category: 'Project Mgmt', description: 'Streamlined issue tracking', icon: '📐' },
  { slug: 'monday', name: 'Monday.com', category: 'Project Mgmt', description: 'Work management', icon: '📅' },
  { slug: 'clickup', name: 'ClickUp', category: 'Project Mgmt', description: 'All-in-one productivity', icon: '🎯' },
  
  // Development
  { slug: 'github', name: 'GitHub', category: 'Dev', description: 'Repos, issues, PRs', icon: '🐙' },
  { slug: 'gitlab', name: 'GitLab', category: 'Dev', description: 'CI/CD and repo management', icon: '🦊' },
  { slug: 'jira-software', name: 'Jira Software', category: 'Dev', description: 'Agile development tracking', icon: '🐛' },
  { slug: 'bitbucket', name: 'Bitbucket', category: 'Dev', description: 'Git repos and pipelines', icon: '🪣' },
  { slug: 'vercel', name: 'Vercel', category: 'Dev', description: 'Deploy and manage apps', icon: '▲' },
  { slug: 'netlify', name: 'Netlify', category: 'Dev', description: 'Web hosting and CI/CD', icon: '🌐' },
  
  // Payments
  { slug: 'stripe', name: 'Stripe', category: 'Payments', description: 'Payment processing', icon: '💳' },
  { slug: 'paypal', name: 'PayPal', category: 'Payments', description: 'PayPal payments', icon: '🅿️' },
  { slug: 'square', name: 'Square', category: 'Payments', description: 'Point of sale and payments', icon: '◼️' },
  { slug: 'braintree', name: 'Braintree', category: 'Payments', description: 'Online payments', icon: '💰' },
  
  // E-Commerce
  { slug: 'shopify', name: 'Shopify', category: 'E-Commerce', description: 'Orders, products, customers', icon: '🛒' },
  { slug: 'woocommerce', name: 'WooCommerce', category: 'E-Commerce', description: 'WordPress e-commerce', icon: '🛍️' },
  { slug: 'bigcommerce', name: 'BigCommerce', category: 'E-Commerce', description: 'Enterprise e-commerce', icon: '🏪' },
  
  // Social Media
  { slug: 'twitter', name: 'Twitter/X', category: 'Social', description: 'Post tweets', icon: '𝕏' },
  { slug: 'linkedin', name: 'LinkedIn', category: 'Social', description: 'Professional networking', icon: '💼' },
  { slug: 'instagram', name: 'Instagram', category: 'Social', description: 'Photo sharing', icon: '📷' },
  { slug: 'facebook', name: 'Facebook', category: 'Social', description: 'Social media platform', icon: '👥' },
  { slug: 'youtube', name: 'YouTube', category: 'Social', description: 'Video management', icon: '▶️' },
  { slug: 'tiktok', name: 'TikTok', category: 'Social', description: 'Short video platform', icon: '🎵' },
  { slug: 'pinterest', name: 'Pinterest', category: 'Social', description: 'Visual discovery', icon: '📌' },
  
  // Support
  { slug: 'zendesk', name: 'Zendesk', category: 'Support', description: 'Ticket management', icon: '🎧' },
  { slug: 'freshdesk', name: 'Freshdesk', category: 'Support', description: 'Customer support', icon: '🆕' },
  { slug: 'intercom-support', name: 'Intercom', category: 'Support', description: 'Customer messaging', icon: '💬' },
  
  // Cloud & Infrastructure
  { slug: 'aws', name: 'AWS', category: 'Cloud', description: 'EC2, S3, Lambda', icon: '☁️' },
  { slug: 'google-cloud', name: 'Google Cloud', category: 'Cloud', description: 'GCP services', icon: '🌩️' },
  { slug: 'azure', name: 'Azure', category: 'Cloud', description: 'Microsoft cloud', icon: '⚡' },
  { slug: 'digitalocean', name: 'DigitalOcean', category: 'Cloud', description: 'Cloud infrastructure', icon: '🌊' },
  { slug: 'firebase', name: 'Firebase', category: 'Dev', description: 'Auth, Firestore, functions', icon: '🔥' },
  { slug: 'supabase', name: 'Supabase', category: 'Database', description: 'PostgreSQL and auth', icon: '🐘' },
  
  // Analytics
  { slug: 'google-analytics', name: 'Google Analytics', category: 'Analytics', description: 'Web analytics', icon: '📊' },
  { slug: 'mixpanel', name: 'Mixpanel', category: 'Analytics', description: 'Product analytics', icon: '📈' },
  { slug: 'amplitude', name: 'Amplitude', category: 'Analytics', description: 'User analytics', icon: '📉' },
  { slug: 'segment', name: 'Segment', category: 'Analytics', description: 'Customer data platform', icon: '🔗' },
  
  // Communication
  { slug: 'zoom', name: 'Zoom', category: 'Video', description: 'Video conferencing', icon: '📹' },
  { slug: 'teams', name: 'Microsoft Teams', category: 'Video', description: 'Collaboration platform', icon: '👥' },
  { slug: 'meet', name: 'Google Meet', category: 'Video', description: 'Video calls', icon: '📹' },
  
  // Database
  { slug: 'postgres', name: 'PostgreSQL', category: 'Database', description: 'SQL database', icon: '🐘' },
  { slug: 'mysql', name: 'MySQL', category: 'Database', description: 'Open source database', icon: '🐬' },
  { slug: 'mongodb', name: 'MongoDB', category: 'Database', description: 'NoSQL database', icon: '🍃' },
  { slug: 'redis', name: 'Redis', category: 'Database', description: 'In-memory database', icon: '🔴' },
  
  // File Storage
  { slug: 'dropbox', name: 'Dropbox', category: 'Storage', description: 'File storage', icon: '📦' },
  { slug: 's3', name: 'AWS S3', category: 'Storage', description: 'Object storage', icon: '🪣' },
  { slug: 'box', name: 'Box', category: 'Storage', description: 'Content management', icon: '📁' },
  
  // HR & Recruiting
  { slug: 'greenhouse', name: 'Greenhouse', category: 'HR', description: 'Recruiting platform', icon: '🌱' },
  { slug: 'lever', name: 'Lever', category: 'HR', description: 'Talent acquisition', icon: '🎚️' },
  { slug: 'workday', name: 'Workday', category: 'HR', description: 'HR management', icon: '📅' },
  
  // Finance
  { slug: 'quickbooks', name: 'QuickBooks', category: 'Finance', description: 'Accounting software', icon: '📒' },
  { slug: 'xero', name: 'Xero', category: 'Finance', description: 'Cloud accounting', icon: '📊' },
  { slug: 'freshbooks', name: 'FreshBooks', category: 'Finance', description: 'Simple accounting', icon: '📝' },
  
  // Marketing
  { slug: 'mailchimp-marketing', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing', icon: '📧' },
  { slug: 'klaviyo', name: 'Klaviyo', category: 'Marketing', description: 'E-commerce marketing', icon: '📧' },
  { slug: 'hubspot-marketing', name: 'HubSpot Marketing', category: 'Marketing', description: 'Marketing automation', icon: '📣' },
  { slug: 'activecampaign', name: 'ActiveCampaign', category: 'Marketing', description: 'Marketing automation', icon: '🎯' },
  { slug: 'convertkit', name: 'ConvertKit', category: 'Marketing', description: 'Creator marketing', icon: '📧' },
  
  // SEO
  { slug: 'semrush', name: 'SEMrush', category: 'SEO', description: 'SEO and content', icon: '🔍' },
  { slug: 'ahrefs', name: 'Ahrefs', category: 'SEO', description: 'Backlink analysis', icon: '🔗' },
  { slug: 'moz', name: 'Moz', category: 'SEO', description: 'SEO optimization', icon: '🦊' },
  
  // Other
  { slug: 'typeform', name: 'Typeform', category: 'Forms', description: 'Online forms', icon: '📝' },
  { slug: 'calendly', name: 'Calendly', category: 'Scheduling', description: 'Meeting scheduling', icon: '📅' },
  { slug: 'figma', name: 'Figma', category: 'Design', description: 'Design and prototypes', icon: '🎨' },
  { slug: 'canva', name: 'Canva', category: 'Design', description: 'Visual design', icon: '🖼️' },
  { slug: 'zapier', name: 'Zapier', category: 'Automation', description: 'Connect apps', icon: '⚡' },
  { slug: 'make', name: 'Make (Integromat)', category: 'Automation', description: 'Workflow automation', icon: '🔧' },
  { slug: 'n8n', name: 'n8n', category: 'Automation', description: 'Workflow automation', icon: '🔗' },
]

export async function GET() {
  const apiKey = process.env.COMPOSIO_API_KEY
  
  // Try Composio API
  if (apiKey) {
    try {
      const res = await fetch('https://api.composio.dev/v2/tools/apps?limit=100', {
        headers: { 'x-api-key': apiKey },
        next: { revalidate: 300 },
      })
      
      if (res.ok) {
        const data = await res.json()
        const items = data.items ?? data.apps ?? []
        
        if (items.length > 0) {
          const tools = items.map((item: any) => {
            const name = item.name ?? item.appName ?? 'Unknown'
            const slug = (item.key ?? item.slug ?? name).toLowerCase().replace(/[^a-z0-9]/g, '')
            return {
              id: slug,
              slug,
              name,
              category: item.categories?.[0] ?? 'Integration',
              description: item.description ?? `Connect ${name}`,
              icon: '🔗',
              isFeatured: ['gmail', 'github', 'hubspot', 'notion', 'slack', 'stripe'].includes(slug),
            }
          })
          
          return NextResponse.json({ tools, source: 'composio', count: tools.length })
        }
      }
    } catch (err) {
      console.error('[tools/catalog] Composio error:', err)
    }
  }
  
  // Fallback to built-in tools
  const tools = FALLBACK_TOOLS.map((t, i) => ({
    id: t.slug,
    ...t,
    isFeatured: i < 8,
  }))
  
  return NextResponse.json({ tools, source: 'fallback', count: tools.length })
}
