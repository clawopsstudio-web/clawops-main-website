/**
 * GET /api/tools/catalog
 * Returns available tools - Composio API or expanded fallback
 */
import { NextResponse } from 'next/server'

// Expanded fallback tools (100+ popular integrations)
const FALLBACK_TOOLS = [
  // Email
  { slug: 'gmail', name: 'Gmail', category: 'Email', description: 'Send and receive emails', icon: '📧' },
  { slug: 'outlook', name: 'Outlook', category: 'Email', description: 'Microsoft email and calendar', icon: '📬' },
  { slug: 'sendgrid', name: 'SendGrid', category: 'Email', description: 'Transactional emails', icon: '✉️' },
  { slug: 'mailchimp', name: 'Mailchimp', category: 'Email', description: 'Email marketing', icon: '📧' },
  { slug: 'postmark', name: 'Postmark', category: 'Email', description: 'Email delivery', icon: '📮' },
  { slug: 'resend', name: 'Resend', category: 'Email', description: 'Modern email API', icon: '📨' },
  { slug: 'brevo', name: 'Brevo', category: 'Email', description: 'Email and SMS marketing', icon: '📤' },
  
  // Messaging
  { slug: 'slack', name: 'Slack', category: 'Messaging', description: 'Team messaging', icon: '💬' },
  { slug: 'telegram', name: 'Telegram', category: 'Messaging', description: 'Send messages', icon: '✈️' },
  { slug: 'discord', name: 'Discord', category: 'Messaging', description: 'Server messaging', icon: '🎮' },
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Messaging', description: 'Business messages', icon: '📱' },
  { slug: 'intercom', name: 'Intercom', category: 'Messaging', description: 'Customer chat', icon: '💬' },
  { slug: 'twilio', name: 'Twilio', category: 'SMS', description: 'SMS and voice', icon: '📞' },
  { slug: 'messenger', name: 'Messenger', category: 'Messaging', description: 'Facebook Messenger', icon: '💭' },
  
  // CRM & Sales
  { slug: 'hubspot', name: 'HubSpot', category: 'CRM', description: 'CRM and automation', icon: '🔶' },
  { slug: 'salesforce', name: 'Salesforce', category: 'CRM', description: 'Enterprise CRM', icon: '☁️' },
  { slug: 'pipedrive', name: 'Pipedrive', category: 'CRM', description: 'Sales CRM', icon: '📊' },
  { slug: 'zoho-crm', name: 'Zoho CRM', category: 'CRM', description: 'Sales automation', icon: '📈' },
  { slug: 'apollo', name: 'Apollo', category: 'CRM', description: 'Lead intelligence', icon: '🗺️' },
  { slug: 'close', name: 'Close', category: 'CRM', description: 'Sales platform', icon: '🎯' },
  
  // Productivity
  { slug: 'google-calendar', name: 'Google Calendar', category: 'Productivity', description: 'Calendar events', icon: '📅' },
  { slug: 'google-drive', name: 'Google Drive', category: 'Productivity', description: 'File storage', icon: '📁' },
  { slug: 'google-sheets', name: 'Google Sheets', category: 'Productivity', description: 'Spreadsheets', icon: '📊' },
  { slug: 'notion', name: 'Notion', category: 'Docs', description: 'Notes and wikis', icon: '📓' },
  { slug: 'airtable', name: 'Airtable', category: 'Database', description: 'Low-code database', icon: '🗄️' },
  { slug: 'trello', name: 'Trello', category: 'Project', description: 'Kanban boards', icon: '📋' },
  { slug: 'asana', name: 'Asana', category: 'Project', description: 'Task management', icon: '✅' },
  { slug: 'jira', name: 'Jira', category: 'Project', description: 'Issue tracking', icon: '🗃️' },
  { slug: 'linear', name: 'Linear', category: 'Project', description: 'Streamlined issues', icon: '📐' },
  { slug: 'monday', name: 'Monday.com', category: 'Project', description: 'Work management', icon: '📅' },
  { slug: 'clickup', name: 'ClickUp', category: 'Project', description: 'All-in-one', icon: '🎯' },
  { slug: 'todoist', name: 'Todoist', category: 'Productivity', description: 'Task lists', icon: '☑️' },
  { slug: 'notion', name: 'Notion', category: 'Productivity', description: 'Notes and docs', icon: '📝' },
  
  // Development
  { slug: 'github', name: 'GitHub', category: 'DevOps', description: 'Code hosting', icon: '🐙' },
  { slug: 'gitlab', name: 'GitLab', category: 'DevOps', description: 'CI/CD and repos', icon: '🦊' },
  { slug: 'bitbucket', name: 'Bitbucket', category: 'DevOps', description: 'Git repos', icon: '🪣' },
  { slug: 'vercel', name: 'Vercel', category: 'DevOps', description: 'Deploy apps', icon: '▲' },
  { slug: 'netlify', name: 'Netlify', category: 'DevOps', description: 'Web hosting', icon: '🌐' },
  { slug: 'aws', name: 'AWS', category: 'Cloud', description: 'Cloud services', icon: '☁️' },
  { slug: 'firebase', name: 'Firebase', category: 'Cloud', description: 'Google cloud', icon: '🔥' },
  { slug: 'docker', name: 'Docker', category: 'DevOps', description: 'Containers', icon: '🐳' },
  { slug: 'jenkins', name: 'Jenkins', category: 'DevOps', description: 'CI/CD automation', icon: '🔧' },
  
  // Payments
  { slug: 'stripe', name: 'Stripe', category: 'Payments', description: 'Payment processing', icon: '💳' },
  { slug: 'paypal', name: 'PayPal', category: 'Payments', description: 'Payment gateway', icon: '🅿️' },
  { slug: 'square', name: 'Square', category: 'Payments', description: 'POS and payments', icon: '◼️' },
  { slug: 'braintree', name: 'Braintree', category: 'Payments', description: 'Online payments', icon: '💰' },
  { slug: 'razorpay', name: 'Razorpay', category: 'Payments', description: 'India payments', icon: '💸' },
  
  // E-Commerce
  { slug: 'shopify', name: 'Shopify', category: 'E-Commerce', description: 'Online store', icon: '🛒' },
  { slug: 'woocommerce', name: 'WooCommerce', category: 'E-Commerce', description: 'WordPress store', icon: '🛍️' },
  { slug: 'bigcommerce', name: 'BigCommerce', category: 'E-Commerce', description: 'Enterprise store', icon: '🏪' },
  { slug: 'magento', name: 'Magento', category: 'E-Commerce', description: 'Enterprise e-commerce', icon: '🏬' },
  { slug: 'etsy', name: 'Etsy', category: 'E-Commerce', description: 'Marketplace', icon: '🧶' },
  { slug: 'amazon', name: 'Amazon', category: 'E-Commerce', description: 'Amazon seller', icon: '📦' },
  
  // Social Media
  { slug: 'twitter', name: 'Twitter/X', category: 'Social', description: 'Social posts', icon: '🐦' },
  { slug: 'linkedin', name: 'LinkedIn', category: 'Social', description: 'Professional network', icon: '💼' },
  { slug: 'instagram', name: 'Instagram', category: 'Social', description: 'Photo sharing', icon: '📷' },
  { slug: 'facebook', name: 'Facebook', category: 'Social', description: 'Social network', icon: '👥' },
  { slug: 'tiktok', name: 'TikTok', category: 'Social', description: 'Video platform', icon: '🎵' },
  { slug: 'youtube', name: 'YouTube', category: 'Social', description: 'Video hosting', icon: '▶️' },
  { slug: 'pinterest', name: 'Pinterest', category: 'Social', description: 'Visual discovery', icon: '📌' },
  { slug: 'reddit', name: 'Reddit', category: 'Social', description: 'Community', icon: '🤖' },
  
  // AI & ML
  { slug: 'openai', name: 'OpenAI', category: 'AI', description: 'GPT models', icon: '🤖' },
  { slug: 'anthropic', name: 'Anthropic', category: 'AI', description: 'Claude AI', icon: '🧠' },
  { slug: 'google-ai', name: 'Google AI', category: 'AI', description: 'Gemini models', icon: '✨' },
  { slug: 'huggingface', name: 'Hugging Face', category: 'AI', description: 'ML models', icon: '🤗' },
  { slug: 'replicate', name: 'Replicate', category: 'AI', description: 'AI model hosting', icon: '🔄' },
  
  // Analytics
  { slug: 'google-analytics', name: 'Google Analytics', category: 'Analytics', description: 'Website analytics', icon: '📊' },
  { slug: 'mixpanel', name: 'Mixpanel', category: 'Analytics', description: 'Product analytics', icon: '📈' },
  { slug: 'amplitude', name: 'Amplitude', category: 'Analytics', description: 'Event tracking', icon: '📉' },
  { slug: 'segment', name: 'Segment', category: 'Analytics', description: 'Customer data', icon: '🔗' },
  { slug: 'hotjar', name: 'Hotjar', category: 'Analytics', description: 'User behavior', icon: '👁️' },
  
  // SEO
  { slug: 'semrush', name: 'SEMrush', category: 'SEO', description: 'Keyword research', icon: '🔍' },
  { slug: 'ahrefs', name: 'Ahrefs', category: 'SEO', description: 'Backlink analysis', icon: '🔗' },
  { slug: 'moz', name: 'Moz', category: 'SEO', description: 'SEO toolkit', icon: '🌐' },
  { slug: 'google-search-console', name: 'Search Console', category: 'SEO', description: 'Search analytics', icon: '🔎' },
  
  // Communication
  { slug: 'zoom', name: 'Zoom', category: 'Video', description: 'Video meetings', icon: '📹' },
  { slug: 'teams', name: 'Microsoft Teams', category: 'Video', description: 'Team collaboration', icon: '👥' },
  { slug: 'meet', name: 'Google Meet', category: 'Video', description: 'Video calls', icon: '📹' },
  { slug: 'calendly', name: 'Calendly', category: 'Scheduling', description: 'Meeting scheduler', icon: '📅' },
  
  // Support
  { slug: 'zendesk', name: 'Zendesk', category: 'Support', description: 'Customer support', icon: '🎧' },
  { slug: 'freshdesk', name: 'Freshdesk', category: 'Support', description: 'Help desk', icon: '🎫' },
  { slug: 'help scout', name: 'Help Scout', category: 'Support', description: 'Email support', icon: '📬' },
  
  // HR
  { slug: ' BambooHR', name: 'BambooHR', category: 'HR', description: 'HR software', icon: '🎋' },
  { slug: 'workday', name: 'Workday', category: 'HR', description: 'HR management', icon: '📅' },
  { slug: 'greenhouse', name: 'Greenhouse', category: 'HR', description: 'Recruiting', icon: '🌱' },
  { slug: 'lever', name: 'Lever', category: 'HR', description: 'Talent suite', icon: '🍋' },
  
  // Finance
  { slug: 'quickbooks', name: 'QuickBooks', category: 'Finance', description: 'Accounting', icon: '📒' },
  { slug: 'xero', name: 'Xero', category: 'Finance', description: 'Cloud accounting', icon: '❌' },
  { slug: 'freshbooks', name: 'FreshBooks', category: 'Finance', description: 'Small business', icon: '📚' },
  { slug: 'gusto', name: 'Gusto', category: 'Finance', description: 'Payroll', icon: '💵' },
  
  // Marketing
  { slug: 'marketo', name: 'Marketo', category: 'Marketing', description: 'Marketing automation', icon: '📣' },
  { slug: 'pardot', name: 'Pardot', category: 'Marketing', description: 'B2B marketing', icon: '📢' },
  { slug: 'activecampaign', name: 'ActiveCampaign', category: 'Marketing', description: 'Email automation', icon: '🎯' },
  { slug: 'klaviyo', name: 'Klaviyo', category: 'Marketing', description: 'E-commerce email', icon: '📧' },
  { slug: 'sendinblue', name: 'Sendinblue', category: 'Marketing', description: 'Marketing platform', icon: '📤' },
  { slug: 'hubspot-marketing', name: 'HubSpot Marketing', category: 'Marketing', description: 'Marketing hub', icon: '📣' },
  
  // Other
  { slug: 'figma', name: 'Figma', category: 'Design', description: 'Design tool', icon: '🎨' },
  { slug: 'canva', name: 'Canva', category: 'Design', description: 'Design platform', icon: '🖼️' },
  { slug: 'zapier', name: 'Zapier', category: 'Automation', description: 'Workflow automation', icon: '⚡' },
  { slug: 'make', name: 'Make', category: 'Automation', description: 'Scenario automation', icon: '🔧' },
  { slug: ' IFTTT', name: 'IFTTT', category: 'Automation', description: 'Applets', icon: '🔄' },
  { slug: ' Typeform', name: 'Typeform', category: 'Forms', description: 'Online forms', icon: '📝' },
  { slug: 'jotform', name: 'JotForm', category: 'Forms', description: 'Form builder', icon: '📋' },
  { slug: 'squarespace', name: 'Squarespace', category: 'Website', description: 'Website builder', icon: '⬜' },
  { slug: 'wordpress', name: 'WordPress', category: 'CMS', description: 'Content management', icon: '📄' },
  { slug: 'webflow', name: 'Webflow', category: 'CMS', description: 'Web design', icon: '🌊' },
  { slug: 'dropbox', name: 'Dropbox', category: 'Storage', description: 'File storage', icon: '📦' },
  { slug: 'onedrive', name: 'OneDrive', category: 'Storage', description: 'Microsoft cloud', icon: '☁️' },
  { slug: 'box', name: 'Box', category: 'Storage', description: 'Content cloud', icon: '📁' },
  { slug: 's3', name: 'AWS S3', category: 'Storage', description: 'Object storage', icon: '🪣' },
  { slug: 'cloudinary', name: 'Cloudinary', category: 'Media', description: 'Image CDN', icon: '☁️' },
  { slug: 'imgbb', name: 'ImgBB', category: 'Media', description: 'Image hosting', icon: '🖼️' },
]

export async function GET() {
  try {
    // Try to fetch from Composio API
    const response = await fetch('https://api.composio.dev/v2/tools/apps?limit=50', {
      headers: {
        'Authorization': `Bearer ${process.env.COMPOSIO_API_KEY}`,
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        tools: data.items || data.apps || [],
        source: 'composio',
        total: data.total || data.items?.length || 0,
      })
    }
  } catch (e) {
    console.log('Composio API unavailable, using fallback')
  }

  // Return expanded fallback
  return NextResponse.json({
    tools: FALLBACK_TOOLS,
    source: 'fallback',
    total: FALLBACK_TOOLS.length,
  })
}
