import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'

const sentryDsn = import.meta.env.VITE_SENTRY_DSN

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    release: import.meta.env.VITE_SENTRY_RELEASE,
    tracesSampleRate: 0,
  })
}

const appFallback = (
  <main className="container py-5" role="alert">
    <h1>Не удалось открыть приложение</h1>
    <p><a href="/">Попробовать снова</a></p>
  </main>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={appFallback}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
