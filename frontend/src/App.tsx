import { useState } from 'react'

import { MovieReviewPage } from './features/MovieReviewPage'
import { SettingsPage } from './features/SettingsPage'
import { SwipePreferencePage } from './features/SwipePreferencePage'
import { getAgentRuntimeInfo, type SwipeAnalysis } from './lib/api'

type WorkflowView = 'swipe' | 'review' | 'settings'

export default function App() {
  const [view, setView] = useState<WorkflowView>('swipe')
  const [swipeProfile, setSwipeProfile] = useState<SwipeAnalysis | null>(null)
  const [preferenceText, setPreferenceText] = useState('')
  const runtimeInfo = getAgentRuntimeInfo()

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
          <button
            className={view === 'settings' ? 'nav-btn is-active' : 'nav-btn'}
            aria-current={view === 'settings' ? 'page' : undefined}
            onClick={() => setView('settings')}
          >
            3. Settings
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'swipe' ? (
          <SwipePreferencePage onProfileUpdate={setSwipeProfile} preferenceText={preferenceText} />
        ) : view === 'review' ? (
          <MovieReviewPage swipeContext={swipeProfile} preferenceText={preferenceText} />
        ) : (
          <SettingsPage
            preferenceText={preferenceText}
            onPreferenceTextChange={setPreferenceText}
            loadedSkills={runtimeInfo.loadedSkills}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Frontend Codex runtime + local skills power swipe analysis and accurate, human-friendly review generation.</p>
      </footer>
    </div>
  )
}
