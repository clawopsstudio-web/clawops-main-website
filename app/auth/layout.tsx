// Auth layout — no wrappers, no GlobalStarField, no SmoothScroll.
// Clerk SignIn/SignUp need a clean rendering context.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
