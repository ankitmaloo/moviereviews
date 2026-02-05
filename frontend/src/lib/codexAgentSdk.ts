import { listLoadedSkills, skillContextForPrompt } from './skillContext'

export type SwipeMovieInput = {
  title: string
  year: number
  genres: string[]
  runtime: number
  mood: string
  setup: string
}

export type SwipeAnalysis = {
  personaLabel: string
  tasteThesis: string
  greenFlags: string[]
  dealbreakers: string[]
  tradeoffs: string[]
  reviewLevers: string[]
  usuallyLike: string[]
  usuallyAvoid: string[]
  dependsOn: string[]
  recommendation: string
  confidence: 'low' | 'medium' | 'high'
}

export type GeneratedUserReview = {
  author: string
  postedAt: string
  rating: number
  text: string
}

export type GeneratedMovieReview = {
  title: string
  year: number
  genres: string[]
  runtime: number
  criticScore: number
  summary: string
  verdict: string
  userReviews: GeneratedUserReview[]
}

const loadedSkills = listLoadedSkills()
const promptSkillContext = skillContextForPrompt()

function hashText(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24)
  }
  return Math.abs(hash >>> 0)
}

function chooseFrom<T>(values: T[], seed: number, index = 0) {
  if (values.length === 0) {
    throw new Error('chooseFrom requires at least one value')
  }
  return values[(seed + index) % values.length]
}

function normalizeRating(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)))
}

function sortedGenreScores(likes: SwipeMovieInput[], dislikes: SwipeMovieInput[]) {
  const scores = new Map<string, number>()

  likes.forEach((movie) => {
    movie.genres.forEach((genre) => {
      scores.set(genre, (scores.get(genre) ?? 0) + 2)
    })
  })

  dislikes.forEach((movie) => {
    movie.genres.forEach((genre) => {
      scores.set(genre, (scores.get(genre) ?? 0) - 1)
    })
  })

  return Array.from(scores.entries()).sort((left, right) => right[1] - left[1])
}

function fallbackSwipeAnalysis(payload: { likes: SwipeMovieInput[]; dislikes: SwipeMovieInput[] }): SwipeAnalysis {
  const scoredGenres = sortedGenreScores(payload.likes, payload.dislikes)
  const topGenres = scoredGenres.filter((entry) => entry[1] > 0).slice(0, 3).map((entry) => entry[0])
  const avoidGenres = scoredGenres.filter((entry) => entry[1] < 0).slice(0, 3).map((entry) => entry[0])

  const likedRuntimes = payload.likes.map((movie) => movie.runtime)
  const avgRuntime =
    likedRuntimes.length === 0 ? 110 : Math.round(likedRuntimes.reduce((sum, runtime) => sum + runtime, 0) / likedRuntimes.length)

  const commonMoods = payload.likes.map((movie) => movie.mood)
  const moodPreference = commonMoods[0] || 'Balanced'

  const confidence: SwipeAnalysis['confidence'] =
    payload.likes.length + payload.dislikes.length >= 6
      ? 'high'
      : payload.likes.length + payload.dislikes.length >= 3
        ? 'medium'
        : 'low'

  const leadGenre = topGenres[0] || 'character-driven'
  const avoidLead = avoidGenres[0] || 'overly formulaic'

  return {
    personaLabel: `${moodPreference} ${leadGenre} Explorer`,
    tasteThesis: `You consistently favor ${topGenres.join(', ') || 'nuanced'} stories with a ${moodPreference.toLowerCase()} tone and around ${avgRuntime} minute runtimes.`,
    greenFlags: [
      `Strong ${leadGenre} premise`,
      `${moodPreference} emotional tone`,
      avgRuntime > 120 ? 'Long-form worldbuilding' : 'Tight, focused pacing',
      'Clear thematic identity',
      'Memorable lead performances'
    ],
    dealbreakers: [
      `${avoidLead} angle`,
      'Flat character arcs',
      'Tone mismatch with your current mood'
    ],
    tradeoffs: [
      'Stylized visuals work if character stakes are strong',
      'Long runtime is fine when pacing stays purposeful',
      'Genre hybrids can work with a clear emotional core'
    ],
    reviewLevers: [
      'Character depth',
      'Pacing fit',
      'Theme clarity',
      'Tone consistency',
      'Performance strength'
    ],
    usuallyLike: topGenres.length > 0 ? topGenres : ['Character-centric drama', 'Sci-Fi with ideas', 'Well-paced thrillers'],
    usuallyAvoid: avoidGenres.length > 0 ? avoidGenres : ['Generic romance beats', 'Predictable twists'],
    dependsOn: ['Runtime pacing', 'Lead character arc quality'],
    recommendation: `Try a ${leadGenre} movie tonight and pair it with a lighter backup option in case you want less intensity.`,
    confidence
  }
}

function inferGenresFromTitle(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes('dune') || lower.includes('star') || lower.includes('blade')) {
    return ['Sci-Fi', 'Adventure', 'Drama']
  }
  if (lower.includes('spider') || lower.includes('man')) {
    return ['Action', 'Adventure', 'Fantasy']
  }
  if (lower.includes('oppenheimer') || lower.includes('social')) {
    return ['Drama', 'History', 'Thriller']
  }
  if (lower.includes('barbie') || lower.includes('lady bird')) {
    return ['Comedy', 'Drama']
  }
  return ['Drama', 'Thriller']
}

function fallbackReview(payload: { title: string; swipeContext: SwipeAnalysis | null }): GeneratedMovieReview {
  const seed = hashText(`${payload.title}|${payload.swipeContext?.personaLabel || ''}`)
  const baseYear = 1998 + (seed % 27)
  const runtime = 95 + (seed % 55)
  const genres = inferGenresFromTitle(payload.title)
  const bias = payload.swipeContext ? 4 : 0
  const criticScore = Math.max(62, Math.min(96, 74 + (seed % 19) + bias))

  const reviewerNames = ['Jordan M.', 'Priya S.', 'Chris A.', 'Nadia V.', 'Ethan R.', 'Mina K.']
  const datePool = ['March 12, 2024', 'April 7, 2024', 'May 19, 2024', 'June 2, 2024', 'July 11, 2024']
  const sentimentTerms = ['focused', 'immersive', 'inventive', 'tense', 'emotionally grounded']

  return {
    title: payload.title,
    year: baseYear,
    genres,
    runtime,
    criticScore,
    summary: `${payload.title} leans into ${genres[0]} momentum with ${chooseFrom(sentimentTerms, seed)} execution, combining strong set pieces and character pressure without losing narrative clarity.`,
    verdict: payload.swipeContext
      ? `Based on your ${payload.swipeContext.personaLabel} profile, this is a likely match if you want ${payload.swipeContext.reviewLevers[0]?.toLowerCase() || 'character depth'} and steady pacing.`
      : 'Strong pick if you want a balanced mix of story and craft, with enough momentum to stay engaging through the full runtime.',
    userReviews: [0, 1, 2].map((offset) => ({
      author: chooseFrom(reviewerNames, seed, offset),
      postedAt: chooseFrom(datePool, seed, offset),
      rating: normalizeRating(3 + ((seed + offset) % 3)),
      text: `Great ${genres[0].toLowerCase()} energy with a ${chooseFrom(sentimentTerms, seed, offset + 1)} second half. The pacing stayed strong and the ending felt earned.`
    }))
  }
}

type JsonObject = Record<string, unknown>

async function requestStructuredFromOpenAI(schemaName: string, schema: JsonObject, prompt: string) {
  const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined)?.trim()
  if (!apiKey) {
    return null
  }

  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || 'gpt-4.1-mini'
  const baseUrl = (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined) || 'https://api.openai.com/v1'

  const response = await fetch(`${baseUrl}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: {
        format: {
          type: 'json_schema',
          name: schemaName,
          schema,
          strict: true
        }
      }
    })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI request failed: ${response.status} ${text}`)
  }

  const payload = (await response.json()) as { output_text?: string }
  if (!payload.output_text) {
    throw new Error('OpenAI response did not include output_text.')
  }

  return JSON.parse(payload.output_text) as JsonObject
}

const swipeSchema: JsonObject = {
  type: 'object',
  properties: {
    personaLabel: { type: 'string' },
    tasteThesis: { type: 'string' },
    greenFlags: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
    dealbreakers: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    tradeoffs: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    reviewLevers: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 5 },
    usuallyLike: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
    usuallyAvoid: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    dependsOn: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 3 },
    recommendation: { type: 'string' },
    confidence: { type: 'string', enum: ['low', 'medium', 'high'] }
  },
  required: [
    'personaLabel',
    'tasteThesis',
    'greenFlags',
    'dealbreakers',
    'tradeoffs',
    'reviewLevers',
    'usuallyLike',
    'usuallyAvoid',
    'dependsOn',
    'recommendation',
    'confidence'
  ],
  additionalProperties: false
}

const reviewSchema: JsonObject = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    year: { type: 'number' },
    genres: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
    runtime: { type: 'number' },
    criticScore: { type: 'number' },
    summary: { type: 'string' },
    verdict: { type: 'string' },
    userReviews: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          author: { type: 'string' },
          postedAt: { type: 'string' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
          text: { type: 'string' }
        },
        required: ['author', 'postedAt', 'rating', 'text'],
        additionalProperties: false
      }
    }
  },
  required: ['title', 'year', 'genres', 'runtime', 'criticScore', 'summary', 'verdict', 'userReviews'],
  additionalProperties: false
}

function swipePrompt(payload: { likes: SwipeMovieInput[]; dislikes: SwipeMovieInput[] }) {
  return [
    'You are a frontend Codex Agent SDK runtime for movie preference analysis.',
    `Loaded skills: ${loadedSkills.join(', ')}`,
    'Use skills context as instructions for taste profiling.',
    'Output only valid JSON per schema.',
    '',
    'SKILLS CONTEXT:',
    promptSkillContext,
    '',
    'INPUT PAYLOAD:',
    JSON.stringify(payload, null, 2)
  ].join('\n')
}

function reviewPrompt(payload: { title: string; swipeContext: SwipeAnalysis | null }) {
  return [
    'You are a frontend Codex Agent SDK runtime for movie review synthesis.',
    `Loaded skills: ${loadedSkills.join(', ')}`,
    'Use skills context and optional swipe profile for personalization.',
    'Output only valid JSON per schema.',
    '',
    'SKILLS CONTEXT:',
    promptSkillContext,
    '',
    'INPUT PAYLOAD:',
    JSON.stringify(payload, null, 2)
  ].join('\n')
}

class CodexAgentSdk {
  getLoadedSkills() {
    return loadedSkills
  }

  async analyzeSwipePreferences(payload: { likes: SwipeMovieInput[]; dislikes: SwipeMovieInput[] }): Promise<SwipeAnalysis> {
    try {
      const remote = await requestStructuredFromOpenAI('swipe_profile', swipeSchema, swipePrompt(payload))
      if (remote) {
        return remote as SwipeAnalysis
      }
    } catch (error) {
      console.warn('Falling back to local swipe analysis:', error)
    }
    return fallbackSwipeAnalysis(payload)
  }

  async generateMovieReview(payload: { title: string; swipeContext: SwipeAnalysis | null }): Promise<GeneratedMovieReview> {
    try {
      const remote = await requestStructuredFromOpenAI('movie_review', reviewSchema, reviewPrompt(payload))
      if (remote) {
        const typed = remote as GeneratedMovieReview
        return {
          ...typed,
          userReviews: typed.userReviews.map((review) => ({
            ...review,
            rating: normalizeRating(review.rating)
          }))
        }
      }
    } catch (error) {
      console.warn('Falling back to local review generation:', error)
    }
    return fallbackReview(payload)
  }
}

export const codexAgentSdk = new CodexAgentSdk()
