import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom'

import { LoreExplorerPage } from '@/features/LoreExplorerPage'
import { PersonalizedReviewPage } from '@/features/PersonalizedReviewPage'
import { ReviewPage } from '@/features/ReviewPage'
import { SearchPage } from '@/features/SearchPage'
import { SettingsPage } from '@/features/SettingsPage'
import { SwipePreferencePage } from '@/features/SwipePreferencePage'
import { VersusVotePage } from '@/features/VersusVotePage'
import { generateMovieReview, type GeneratedReview, type ProgressUpdate } from '@/lib/backendApi'
import { DEFAULT_REVIEW_PREFERENCES } from '@/lib/reviewPreferences'
import { applyVersusVote, initialTasteProfile, rankGenres, type TasteProfile } from '@/lib/taste'

type ReviewState =
  | {
      status: 'idle'
      movieTitle: ''
      data: null
      error: ''
      progress: []
    }
  | {
      status: 'loading'
      movieTitle: string
      data: null
      error: ''
      progress: ProgressUpdate[]
    }
  | {
      status: 'success'
      movieTitle: string
      data: GeneratedReview
      error: ''
      progress: ProgressUpdate[]
    }
  | {
      status: 'error'
      movieTitle: string
      data: null
      error: string
      progress: ProgressUpdate[]
    }

const preferenceStorageKey = 'movie-review-preferences-v1'

function initialPreferenceText() {
  try {
    return localStorage.getItem(preferenceStorageKey) || DEFAULT_REVIEW_PREFERENCES
  } catch {
    return DEFAULT_REVIEW_PREFERENCES
  }
}

function appendProgress(existing: ProgressUpdate[], nextItem: ProgressUpdate) {
  const trimmed = nextItem.message.trim()
  if (!trimmed) {
    return existing
  }

  const next = {
    message: trimmed,
    detail: nextItem.detail.trim()
  }

  const previous = existing[existing.length - 1]
  if (previous && previous.message === next.message && previous.detail === next.detail) {
    return existing
  }

  return [...existing, next]
}

export default function App() {
  const navigate = useNavigate()
  const requestIdRef = useRef(0)

  const [preferenceText, setPreferenceText] = useState<string>(initialPreferenceText)
  const [reviewState, setReviewState] = useState<ReviewState>({
    status: 'idle',
    movieTitle: '',
    data: null,
    error: '',
    progress: []
  })

  const [tasteProfile, setTasteProfile] = useState<TasteProfile>(initialTasteProfile)
  const [watchedMovieSlugs, setWatchedMovieSlugs] = useState<string[]>([])

  const highlightedGenres = useMemo(() => rankGenres(tasteProfile.genreScores).slice(0, 3), [tasteProfile.genreScores])

  useEffect(() => {
    try {
      localStorage.setItem(preferenceStorageKey, preferenceText)
    } catch {
      // Ignore storage failures.
    }
  }, [preferenceText])

  function startSearch(movieTitle: string) {
    const nextTitle = movieTitle.trim()
    if (!nextTitle) {
      return
    }

    requestIdRef.current += 1
    const requestId = requestIdRef.current

    setReviewState({
      status: 'loading',
      movieTitle: nextTitle,
      data: null,
      error: '',
      progress: [
        {
          message: 'Queued review request.',
          detail: 'Waiting for backend stream to start.'
        }
      ]
    })

    navigate('/review')

    void generateMovieReview({
      title: nextTitle,
      preferenceText,
      onProgress: (progressUpdate) => {
        if (requestIdRef.current !== requestId) {
          return
        }

        setReviewState((current) => {
          if (current.status !== 'loading') {
            return current
          }

          return {
            ...current,
            progress: appendProgress(current.progress, progressUpdate)
          }
        })
      }
    })
      .then((review) => {
        if (requestIdRef.current !== requestId) {
          return
        }

        setReviewState((current) => ({
          status: 'success',
          movieTitle: nextTitle,
          data: review,
          error: '',
          progress:
            current.status === 'loading'
              ? appendProgress(current.progress, {
                  message: 'Review payload received.',
                  detail: 'Structured review parsed and rendered in UI.'
                })
              : [
                  {
                    message: 'Review payload received.',
                    detail: 'Structured review parsed and rendered in UI.'
                  }
                ]
        }))
      })
      .catch((error: unknown) => {
        if (requestIdRef.current !== requestId) {
          return
        }

        const message = error instanceof Error ? error.message : 'Failed to generate review.'

        setReviewState((current) => ({
          status: 'error',
          movieTitle: nextTitle,
          data: null,
          error: message,
          progress: current.status === 'loading' ? current.progress : []
        }))
      })
  }

  function handleVote(winner: Parameters<typeof applyVersusVote>[1], loser: Parameters<typeof applyVersusVote>[2]) {
    setTasteProfile((current) => applyVersusVote(current, winner, loser))
  }

  function handleMarkWatched(movieSlug: string) {
    setWatchedMovieSlugs((current) => {
      if (current.includes(movieSlug)) {
        return current
      }

      return [...current, movieSlug]
    })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-brand">
          <p className="brand-kicker">Movie Review Agent</p>
          <h1 className="app-title">Separate pages, separate flows</h1>
          <p className="page-copy">
            Review flow starts at Search. Other flows are available as standalone routes.
          </p>
        </div>
        <nav className="top-nav" aria-label="Main navigation">
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/search">
            Search
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/review">
            Review
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/settings">
            Settings
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/vote">
            Vote
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/swipe">
            Swipe
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/taste-review">
            Taste Review
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')} to="/lore">
            Lore
          </NavLink>
        </nav>
        <div className="signal-row">
          <p className="signal-label">Taste signal:</p>
          <p className="signal-value">
            {highlightedGenres.length > 0
              ? highlightedGenres.map((entry) => entry.genre).join(' • ')
              : 'No vote signal yet'}
          </p>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/search" replace />} />
          <Route path="/search" element={<SearchPage isLoading={reviewState.status === 'loading'} onSearch={startSearch} />} />
          <Route path="/review" element={<ReviewPage state={reviewState} />} />
          <Route
            path="/settings"
            element={<SettingsPage preferenceText={preferenceText} onPreferenceTextChange={setPreferenceText} />}
          />
          <Route path="/vote" element={<VersusVotePage profile={tasteProfile} onVote={handleVote} />} />
          <Route path="/swipe" element={<SwipePreferencePage />} />
          <Route
            path="/taste-review"
            element={
              <PersonalizedReviewPage
                profile={tasteProfile}
                watchedMovieSlugs={watchedMovieSlugs}
                onMarkWatched={handleMarkWatched}
              />
            }
          />
          <Route path="/lore" element={<LoreExplorerPage profile={tasteProfile} watchedMovieSlugs={watchedMovieSlugs} />} />
        </Routes>
      </main>
    </div>
  )
}
