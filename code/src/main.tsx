import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,

  // Alternatively, use `process.env.npm_package_version` for a dynamic release version
  // if your build tool supports it.
  release: 'booking-hexlet',

  integrations: [],
  tracesSampleRate: 0,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
