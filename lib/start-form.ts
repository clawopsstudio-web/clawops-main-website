// Types for the /start onboarding form

export interface StartFormData {
  // Meta
  _step?: number

  // Step 1: Profile
  full_name: string
  email: string
  business_name: string
  website_url: string
  industry: string
  business_description: string

  // Step 2: Goals
  goals: string[]

  // Step 3: Tools
  tools_crm: string[]
  tools_email: string[]
  tools_comms: string[]
  tools_workspace: string[]
  tools_social: string[]

  // Step 4: Identity + Plan
  agent_name: string
  agent_tone: string
  plan: string
}

export const defaultFormData: StartFormData = {
  _step: 1,
  full_name: '',
  email: '',
  business_name: '',
  website_url: '',
  industry: '',
  business_description: '',
  goals: [],
  tools_crm: [],
  tools_email: [],
  tools_comms: [],
  tools_workspace: [],
  tools_social: [],
  agent_name: '',
  agent_tone: 'professional',
  plan: 'personal',
}

export const STEPS = [
  { id: 1, title: 'Profile', description: 'Tell us about your business' },
  { id: 2, title: 'Goals', description: 'What should your agent do?' },
  { id: 3, title: 'Tools', description: 'Connect your apps' },
  { id: 4, title: 'Identity', description: 'Name your agent' },
  { id: 5, title: 'Confirm', description: 'Review and pay' },
]

export const INDUSTRIES = [
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'agency', label: 'Agency' },
  { id: 'saas', label: 'SaaS' },
  { id: 'local_business', label: 'Local Business' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'creator', label: 'Creator' },
  { id: 'other', label: 'Other' },
]

export const GOALS = [
  { id: 'generate_leads', label: 'Generate leads & cold outreach', icon: '🎯' },
  { id: 'create_content', label: 'Create content & run social media', icon: '✍️' },
  { id: 'manage_support', label: 'Manage customer support & inbox', icon: '💬' },
  { id: 'research_market', label: 'Research competitors & market', icon: '🔍' },
  { id: 'internal_ops', label: 'Internal ops, scheduling & reporting', icon: '⚙️' },
  { id: 'all_of_above', label: 'All of the above', icon: '🚀' },
]

export const TOOLS_CRM = [
  { id: 'hubspot', label: 'HubSpot' },
  { id: 'gohighlevel', label: 'GoHighLevel' },
  { id: 'pipedrive', label: 'Pipedrive' },
  { id: 'notion_crm', label: 'Notion (as CRM)' },
  { id: 'none_crm', label: 'None' },
]

export const TOOLS_EMAIL = [
  { id: 'gmail', label: 'Gmail / Google Workspace' },
  { id: 'outlook', label: 'Outlook / Microsoft' },
  { id: 'other_email', label: 'Other' },
]

export const TOOLS_COMMS = [
  { id: 'slack', label: 'Slack' },
  { id: 'discord', label: 'Discord' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'whatsapp', label: 'WhatsApp' },
]

export const TOOLS_WORKSPACE = [
  { id: 'notion', label: 'Notion' },
  { id: 'google_drive', label: 'Google Drive' },
  { id: 'airtable', label: 'Airtable' },
  { id: 'confluence', label: 'Confluence' },
]

export const TOOLS_SOCIAL = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
]

export const TONES = [
  { id: 'professional', label: 'Professional', description: 'Formal, polished' },
  { id: 'casual', label: 'Casual', description: 'Relaxed, friendly' },
  { id: 'direct', label: 'Direct', description: 'Straight to the point' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
]

export const PLANS = [
  {
    id: 'personal',
    name: 'Personal',
    price: 49,
    description: 'Your first AI agent. Everything included.',
    features: ['1 AI Agent', '500+ app integrations', '5 automations/mo', 'Community support'],
  },
  {
    id: 'team',
    name: 'Team',
    price: 149,
    description: 'Full AI team. For growing businesses.',
    features: ['5 AI Agents', 'Unlimited automations', 'Priority support', 'All integrations'],
  },
  {
    id: 'business',
    name: 'Business',
    price: 299,
    description: 'Claude API key included.',
    features: ['20 AI Agents', 'Claude API key included', 'White-label ready', 'Dedicated support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 349,
    description: '20x capacity. Unlimited everything.',
    features: ['Unlimited AI Agents', 'Everything in Business', 'Custom SLA', 'On-premise option'],
  },
]

export const PLAN_LABELS: Record<string, string> = {
  personal: 'Personal — $49/mo',
  team: 'Team — $149/mo',
  business: 'Business — $299/mo',
  enterprise: 'Enterprise — $349/mo',
}

export const GOAL_LABELS: Record<string, string> = {
  generate_leads: 'Lead generation & cold outreach',
  create_content: 'Content creation & social media',
  manage_support: 'Customer support & inbox',
  research_market: 'Competitor & market research',
  internal_ops: 'Internal ops, scheduling & reporting',
  all_of_above: 'All of the above',
}
