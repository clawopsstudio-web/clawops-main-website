import { Suspense } from 'react'
import CallbackClient from './CallbackClient'

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#04040c', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui'
      }}>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading...</p>
      </div>
    }>
      <CallbackClient />
    </Suspense>
  )
}
