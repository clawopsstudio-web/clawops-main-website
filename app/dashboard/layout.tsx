import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - ClawOps Studio',
  description: 'Your ClawOps Studio dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
