import type { MovieRecord } from './movies'

export type TasteProfile = {
  genreScores: Record<string, number>
  votes: number
}

export const initialTasteProfile: TasteProfile = {
  genreScores: {},
  votes: 0
}

export function rankGenres(genreScores: Record<string, number>) {
  return Object.entries(genreScores)
    .map(([genre, score]) => ({ genre, score }))
    .sort((a, b) => b.score - a.score)
}

export function applyVersusVote(profile: TasteProfile, winner: MovieRecord, loser: MovieRecord): TasteProfile {
  const nextScores = { ...profile.genreScores }

  winner.genres.forEach((genre) => {
    nextScores[genre] = (nextScores[genre] ?? 0) + 2
  })

  loser.genres.forEach((genre) => {
    nextScores[genre] = (nextScores[genre] ?? 0) - 1
  })

  return {
    votes: profile.votes + 1,
    genreScores: nextScores
  }
}
