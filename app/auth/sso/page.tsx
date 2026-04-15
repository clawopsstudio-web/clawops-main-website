import { Suspense } from 'react'
import SSOClient from './SSOClient'

export default function SSOPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#04040c', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
      </div>
    }>
      <SSOClient />
    </Suspense>
  )
}
