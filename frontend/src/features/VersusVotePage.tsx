import { useMemo, useState } from 'react'

import { findMovieBySlug, type MovieRecord } from '@/lib/movies'
import { rankGenres, type TasteProfile } from '@/lib/taste'

type VersusVotePageProps = {
  profile: TasteProfile
  onVote: (winner: MovieRecord, loser: MovieRecord) => void
}

type VoteHistory = {
  id: number
  winner: string
  loser: string
}

const matchupQueue: [string, string][] = [
  ['dune-part-two', 'barbie'],
  ['oppenheimer', 'spider-man-across-the-spider-verse'],
  ['everything-everywhere-all-at-once', 'past-lives'],
  ['dune-part-two', 'everything-everywhere-all-at-once'],
  ['barbie', 'past-lives']
]

export function VersusVotePage({ profile, onVote }: VersusVotePageProps) {
  const [matchupIndex, setMatchupIndex] = useState(0)
  const [history, setHistory] = useState<VoteHistory[]>([])

  const [leftSlug, rightSlug] = matchupQueue[matchupIndex % matchupQueue.length]
  const leftMovie = findMovieBySlug(leftSlug)
  const rightMovie = findMovieBySlug(rightSlug)
  const topGenres = useMemo(() => rankGenres(profile.genreScores).slice(0, 5), [profile])

  if (!leftMovie || !rightMovie) {
    return (
      <section className="page vote-route">
        <p className="status-line warning">Matchup data is unavailable.</p>
      </section>
    )
  }

  function castVote(winner: MovieRecord, loser: MovieRecord) {
    onVote(winner, loser)
    setHistory((current) => [{ id: Date.now(), winner: winner.title, loser: loser.title }, ...current].slice(0, 6))
    setMatchupIndex((current) => current + 1)
  }

  return (
    <section className="page vote-route">
      <header className="page-header">
        <p className="eyebrow">Scenario 3</p>
        <h2 className="section-title">Switch from swiping to X vs Y movie voting</h2>
        <p className="section-copy">
          Faster binary decisions create clearer signals. Pick one winner from each matchup and shape your profile.
        </p>
      </header>

      <div className="surface matchup-panel">
        <div className="matchup-head">
          <p className="panel-label">Current matchup</p>
          <p className="panel-copy">
            Round {matchupIndex + 1} • {profile.votes} total profile votes
          </p>
        </div>

        <div className="versus-grid" role="group" aria-label="Choose a movie winner">
          <article className="match-card left">
            <p className="match-kicker">Option X</p>
            <h3 className="card-title">{leftMovie.title}</h3>
            <p className="card-meta">
              {leftMovie.year} • {leftMovie.genres.join(' • ')}
            </p>
            <p className="body-copy">{leftMovie.summary}</p>
            <button className="action-btn primary" onClick={() => castVote(leftMovie, rightMovie)}>
              Vote for {leftMovie.title}
            </button>
          </article>

          <article className="match-card right">
            <p className="match-kicker">Option Y</p>
            <h3 className="card-title">{rightMovie.title}</h3>
            <p className="card-meta">
              {rightMovie.year} • {rightMovie.genres.join(' • ')}
            </p>
            <p className="body-copy">{rightMovie.summary}</p>
            <button className="action-btn secondary" onClick={() => castVote(rightMovie, leftMovie)}>
              Vote for {rightMovie.title}
            </button>
          </article>
        </div>
      </div>

      <div className="vote-grid">
        <aside className="surface">
          <h4 className="block-title">Live genre scoreboard</h4>
          {topGenres.length === 0 ? (
            <p className="inline-note">Cast your first vote to create genre signals.</p>
          ) : (
            <ul className="stack-list compact">
              {topGenres.map((entry) => (
                <li className="list-card scoreboard" key={entry.genre}>
                  <p className="list-title">{entry.genre}</p>
                  <p className="list-meta">{entry.score > 0 ? `+${entry.score}` : entry.score}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <aside className="surface">
          <h4 className="block-title">Recent winners</h4>
          {history.length === 0 ? (
            <p className="inline-note">No votes yet in this session.</p>
          ) : (
            <ul className="stack-list compact">
              {history.map((entry) => (
                <li className="list-card" key={entry.id}>
                  <p className="list-title">{entry.winner}</p>
                  <p className="list-meta">beat {entry.loser}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  )
}
