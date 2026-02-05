import { useState } from 'react'

import { MovieReviewPage } from './features/MovieReviewPage'
import { SwipePreferencePage } from './features/SwipePreferencePage'

type WorkflowView = 'swipe' | 'review'

export default function App() {
  const [view, setView] = useState<WorkflowView>('swipe')

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="brand-kicker">Movie Match Lab</p>
        <h1 className="app-title">Find taste first, then read the right review</h1>
        <p className="app-subtitle">
          Use the swipe workflow to infer preferences, then jump to the review page to search a movie and read curated
          feedback with user reactions.
        </p>
        <nav className="top-nav" aria-label="Movie workflow pages">
          <button
            className={view === 'swipe' ? 'nav-btn is-active' : 'nav-btn'}
            aria-current={view === 'swipe' ? 'page' : undefined}
            onClick={() => setView('swipe')}
          >
            1. Swipe Preferences
          </button>
          <button
            className={view === 'review' ? 'nav-btn is-active' : 'nav-btn'}
            aria-current={view === 'review' ? 'page' : undefined}
            onClick={() => setView('review')}
          >
            2. Review Lookup
          </button>
        </nav>
      </header>

      <main className="app-main">{view === 'swipe' ? <SwipePreferencePage /> : <MovieReviewPage />}</main>

      <footer className="app-footer">
        <p>Frontend-only demo. No backend required.</p>
      </footer>
    </div>
  )
}
