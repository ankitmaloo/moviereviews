import { useMemo, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'

import { LoreExplorerPage } from './features/LoreExplorerPage'
import { PersonalizedReviewPage } from './features/PersonalizedReviewPage'
import { VersusVotePage } from './features/VersusVotePage'
import type { MovieRecord } from './lib/movies'
import { applyVersusVote, initialTasteProfile, rankGenres, type TasteProfile } from './lib/taste'

export default function App() {
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>(initialTasteProfile)
  const [watchedMovieSlugs, setWatchedMovieSlugs] = useState<string[]>([])

  const highlightedGenres = useMemo(() => rankGenres(tasteProfile.genreScores).slice(0, 3), [tasteProfile.genreScores])

  function handleVote(winner: MovieRecord, loser: MovieRecord) {
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
        <p className="brand-kicker">Movie Match Lab</p>
        <h1 className="app-title">Three-screen flow for taste, reviews, and interactive lore</h1>
        <p className="app-subtitle">
          Vote on movie matchups, search for a personalized review, and jump into fan theories for films you have watched.
        </p>
        <nav className="top-nav" aria-label="Movie workflow pages">
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
            to="/vote"
          >
            1. X vs Y Vote
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
            to="/review"
          >
            2. Personalized Review
          </NavLink>
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link')}
            to="/lore"
          >
            3. Lore & Theories
          </NavLink>
        </nav>
        <div className="profile-strip">
          <p className="profile-label">Taste signal:</p>
          <p className="profile-value">
            {highlightedGenres.length > 0
              ? highlightedGenres.map((entry) => entry.genre).join(' • ')
              : 'No signal yet, cast a few X vs Y votes'}
          </p>
          <p className="profile-meta">
            {tasteProfile.votes} votes • {watchedMovieSlugs.length} watched movies tracked
          </p>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/vote" replace />} />
          <Route path="/vote" element={<VersusVotePage profile={tasteProfile} onVote={handleVote} />} />
          <Route
            path="/review"
            element={
              <PersonalizedReviewPage
                profile={tasteProfile}
                watchedMovieSlugs={watchedMovieSlugs}
                onMarkWatched={handleMarkWatched}
              />
            }
          />
          <Route
            path="/lore"
            element={<LoreExplorerPage profile={tasteProfile} watchedMovieSlugs={watchedMovieSlugs} />}
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>Frontend-only experience with route-based scenarios and shared taste memory.</p>
      </footer>
    </div>
  )
}
