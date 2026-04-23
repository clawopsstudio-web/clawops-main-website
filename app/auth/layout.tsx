// Auth route layout — minimal, no GlobalStarField, no SmoothScroll, no AuthProvider.
// Clerk's SignIn/SignUp components need a clean DOM with no conflicting JS or CSS.
// ClerkProvider is still available via the root layout.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
