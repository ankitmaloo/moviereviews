import { Sparkles, Star } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

type Movie = {
  id: number
  title: string
  year: number
  runtime: number
  genres: string[]
  depth: number
  energy: number
  visuals: number
  comfort: number
  summary: string
}

const movies: Movie[] = [
  {
    id: 1,
    title: 'Midnight Satellite',
    year: 2024,
    runtime: 112,
    genres: ['Sci-Fi', 'Drama'],
    depth: 88,
    energy: 54,
    visuals: 93,
    comfort: 41,
    summary: 'A calm but thought-heavy space drama with big ideas and long emotional arcs.'
  },
  {
    id: 2,
    title: 'Glass Harbor',
    year: 2023,
    runtime: 96,
    genres: ['Thriller', 'Mystery'],
    depth: 72,
    energy: 83,
    visuals: 68,
    comfort: 34,
    summary: 'A twisty, quick-moving mystery that rewards close attention and prediction.'
  },
  {
    id: 3,
    title: 'Velvet Summer',
    year: 2025,
    runtime: 104,
    genres: ['Romance', 'Comedy'],
    depth: 52,
    energy: 61,
    visuals: 70,
    comfort: 84,
    summary: 'A warm and charming relationship story with easy laughs and low stress.'
  },
  {
    id: 4,
    title: 'Paper Kingdom',
    year: 2022,
    runtime: 128,
    genres: ['Fantasy', 'Adventure'],
    depth: 66,
    energy: 77,
    visuals: 95,
    comfort: 59,
    summary: 'A visually rich world-building adventure with emotional family stakes.'
  }
]

const genres = ['Sci-Fi', 'Drama', 'Thriller', 'Mystery', 'Romance', 'Comedy', 'Fantasy', 'Adventure']

type GenreWeights = Record<string, number>

const initialWeights: GenreWeights = Object.fromEntries(genres.map((genre) => [genre, 50]))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function scoreBand(score: number) {
  if (score >= 82) return 'score-chip score-high'
  if (score >= 65) return 'score-chip score-mid'
  return 'score-chip score-low'
}

export default function App() {
  const [weights, setWeights] = useState<GenreWeights>(initialWeights)
  const [energyNeed, setEnergyNeed] = useState(60)
  const [depthNeed, setDepthNeed] = useState(75)
  const [preferShort, setPreferShort] = useState(true)
  const [comfortMode, setComfortMode] = useState(false)

  const rankedMovies = useMemo(() => {
    return movies
      .map((movie) => {
        const genreAffinity = movie.genres.reduce((acc, genre) => acc + (weights[genre] || 0), 0) / movie.genres.length
        const energyFit = 100 - Math.abs(movie.energy - energyNeed)
        const depthFit = 100 - Math.abs(movie.depth - depthNeed)
        const runtimeFit = preferShort ? clamp(130 - movie.runtime, 35, 100) : clamp(movie.runtime - 80, 35, 100)
        const comfortFit = comfortMode ? movie.comfort : 100 - Math.abs(movie.comfort - 45)

        const personalizedScore = Math.round(
          genreAffinity * 0.35 + energyFit * 0.2 + depthFit * 0.2 + runtimeFit * 0.1 + comfortFit * 0.15
        )

        return {
          ...movie,
          personalizedScore
        }
      })
      .sort((a, b) => b.personalizedScore - a.personalizedScore)
  }, [weights, energyNeed, depthNeed, preferShort, comfortMode])

  const topPick = rankedMovies[0]

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <Badge>Preference-First Review Engine</Badge>
          <h1 className="hero-title">Movie reviews tuned to your taste, not the crowd.</h1>
          <p className="hero-text">
            Shift the sliders to match how you feel today. The ranking and written feedback update around your profile in real time.
          </p>
          <div className="hero-actions">
            <Button variant="primary">Refresh Suggestions</Button>
            <Button variant="outline">Save This Profile</Button>
          </div>
        </div>
        <Card className="profile-card">
          <CardHeader>
            <CardTitle>Your Reviewer Persona</CardTitle>
            <CardDescription>Small changes in preference can completely reorder recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="persona-content">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/160?img=13" alt="User avatar" />
              <AvatarFallback>AN</AvatarFallback>
            </Avatar>
            <div>
              <p className="persona-name">Ankit's Lens</p>
              <p className="persona-subtitle">Balanced thinker with a bias toward depth and imagination.</p>
            </div>
          </CardContent>
          <CardFooter className="persona-footer">
            <span className="label-text">Mood Match Confidence</span>
            <Progress value={topPick.personalizedScore} />
          </CardFooter>
        </Card>
      </section>

      <section className="content-grid">
        <Card>
          <CardHeader>
            <CardTitle>Preference Controls</CardTitle>
            <CardDescription>All values affect the ranking model instantly.</CardDescription>
          </CardHeader>
          <CardContent className="controls-grid">
            <div className="control-group">
              <div className="control-head">
                <span className="label-text">Desired Energy</span>
                <span className="value-text">{energyNeed}</span>
              </div>
              <Slider value={[energyNeed]} max={100} step={1} onValueChange={(value) => setEnergyNeed(value[0] ?? 0)} />
            </div>

            <div className="control-group">
              <div className="control-head">
                <span className="label-text">Narrative Depth</span>
                <span className="value-text">{depthNeed}</span>
              </div>
              <Slider value={[depthNeed]} max={100} step={1} onValueChange={(value) => setDepthNeed(value[0] ?? 0)} />
            </div>

            {genres.map((genre) => (
              <div className="control-group" key={genre}>
                <div className="control-head">
                  <span className="label-text">{genre} affinity</span>
                  <span className="value-text">{weights[genre]}</span>
                </div>
                <Slider
                  value={[weights[genre]]}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setWeights((current) => ({ ...current, [genre]: value[0] ?? 0 }))
                  }}
                />
              </div>
            ))}

            <div className="toggle-row">
              <div>
                <p className="label-text">Prefer shorter movies</p>
                <p className="hint-text">Bias toward runtime under 2 hours.</p>
              </div>
              <Switch checked={preferShort} onCheckedChange={setPreferShort} />
            </div>

            <div className="toggle-row">
              <div>
                <p className="label-text">Comfort mode</p>
                <p className="hint-text">Favor warmth and familiarity over intensity.</p>
              </div>
              <Switch checked={comfortMode} onCheckedChange={setComfortMode} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personalized Review Feed</CardTitle>
            <CardDescription>Scores are calculated from your inputs, not public ratings.</CardDescription>
          </CardHeader>
          <CardContent className="results-list">
            {rankedMovies.map((movie, index) => (
              <article className="movie-item" key={movie.id}>
                <div className="movie-head">
                  <p className="movie-title">
                    {movie.title} <span className="movie-year">({movie.year})</span>
                  </p>
                  <span className={scoreBand(movie.personalizedScore)}>{movie.personalizedScore}</span>
                </div>
                <p className="movie-meta">{movie.genres.join(' • ')} • {movie.runtime} min</p>
                <p className="movie-summary">{movie.summary}</p>
                <div className="review-note">
                  {index === 0 ? <Sparkles className="icon" /> : <Star className="icon" />}
                  <p>
                    {index === 0
                      ? 'Top pick: strongest alignment with your current energy and depth profile.'
                      : 'Solid option: good fit, but less precise than your top match today.'}
                  </p>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
