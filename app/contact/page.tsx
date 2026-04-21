import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact — ClawOps Studio',
  description: 'Get in touch with the ClawOps team. Email us at hello@clawops.studio.',
}

export default function ContactPage() {
  return <ContactClient />
}
