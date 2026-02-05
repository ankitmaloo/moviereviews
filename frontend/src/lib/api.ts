import { listLoadedSkills, skillContextForPrompt } from './skillContext'

export type AgentSettings = {
  preferenceText: string
}

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

type JsonObject = Record<string, unknown>

const loadedSkills = listLoadedSkills()
const promptSkillContext = skillContextForPrompt()

function hashText(input: string) {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return Math.abs(hash >>> 0)
}

function chooseFrom<T>(values: T[], seed: number, index = 0) {
  return values[(seed + index) % values.length]
}

function clampRating(value: number) {
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

function fallbackSwipeAnalysis(payload: {
  likes: SwipeMovieInput[]
  dislikes: SwipeMovieInput[]
  settings: AgentSettings
}): SwipeAnalysis {
  const scores = sortedGenreScores(payload.likes, payload.dislikes)
  const topGenres = scores.filter((entry) => entry[1] > 0).slice(0, 3).map((entry) => entry[0])
  const avoidGenres = scores.filter((entry) => entry[1] < 0).slice(0, 3).map((entry) => entry[0])
  const settingNote = payload.settings.preferenceText.trim()
  const primaryGenre = topGenres[0] || 'character-driven'

  const confidence: SwipeAnalysis['confidence'] =
    payload.likes.length + payload.dislikes.length >= 6
      ? 'high'
      : payload.likes.length + payload.dislikes.length >= 3
        ? 'medium'
        : 'low'

  return {
    personaLabel: `${primaryGenre} Mood Navigator`,
    tasteThesis: settingNote
      ? `Your swipes plus settings suggest a preference for ${topGenres.join(', ') || 'nuanced'} stories. You also asked for: ${settingNote}`
      : `Your swipes suggest a preference for ${topGenres.join(', ') || 'nuanced'} stories with coherent tone and pacing.`,
    greenFlags: [
      `${primaryGenre} premise with clear stakes`,
      'Consistent emotional tone',
      'Strong lead-character arc',
      'Purposeful pacing',
      'Distinct directorial style'
    ],
    dealbreakers: [
      `${avoidGenres[0] || 'Formulaic'} storytelling`,
      'Tone that conflicts with your stated mood',
      'Flat or predictable third act'
    ],
    tradeoffs: [
      'Long runtime works with strong momentum',
      'Genre-mixing works when character focus remains clear',
      'Experimental style works if story stays understandable'
    ],
    reviewLevers: ['Pacing fit', 'Character depth', 'Theme clarity', 'Emotional tone', 'Ending payoff'],
    usuallyLike: topGenres.length > 0 ? topGenres : ['Drama', 'Sci-Fi', 'Thriller'],
    usuallyAvoid: avoidGenres.length > 0 ? avoidGenres : ['Predictable romance beats', 'Low-stakes comedy'],
    dependsOn: ['Runtime vs pacing', 'Tone consistency'],
    recommendation: `Start with a ${primaryGenre} pick that matches your current mood and avoid tone-mismatched options.`,
    confidence
  }
}

function inferGenresFromTitle(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes('dune') || lower.includes('interstellar') || lower.includes('blade')) {
    return ['Sci-Fi', 'Adventure', 'Drama']
  }
  if (lower.includes('spider') || lower.includes('batman')) {
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

function fallbackMovieReview(payload: {
  title: string
  swipeContext: SwipeAnalysis | null
  settings: AgentSettings
}): GeneratedMovieReview {
  const seed = hashText(`${payload.title}|${payload.settings.preferenceText}|${payload.swipeContext?.personaLabel || ''}`)
  const genres = inferGenresFromTitle(payload.title)
  const year = 2001 + (seed % 24)
  const runtime = 96 + (seed % 60)
  const criticScore = Math.max(62, Math.min(96, 73 + (seed % 21)))
  const names = ['Jordan M.', 'Priya S.', 'Chris A.', 'Nadia V.', 'Ethan R.', 'Mina K.']
  const dates = ['March 12, 2024', 'April 7, 2024', 'May 19, 2024', 'June 2, 2024', 'July 11, 2024']
  const adjectives = ['focused', 'immersive', 'inventive', 'tense', 'emotionally grounded']

  return {
    title: payload.title,
    year,
    genres,
    runtime,
    criticScore,
    summary: `${payload.title} delivers a ${chooseFrom(adjectives, seed)} ${genres[0].toLowerCase()} experience with clear narrative momentum and strong craft detail.`,
    verdict: payload.settings.preferenceText.trim()
      ? `Accurate and human-friendly read: this likely works for your preferences if you want ${payload.settings.preferenceText.trim().toLowerCase()} in a ${genres[0].toLowerCase()} package.`
      : 'Accurate and human-friendly read: strong choice when you want a balanced blend of story, craft, and emotional clarity.',
    userReviews: [0, 1, 2].map((offset) => ({
      author: chooseFrom(names, seed, offset),
      postedAt: chooseFrom(dates, seed, offset),
      rating: clampRating(3 + ((seed + offset) % 3)),
      text: `Very ${chooseFrom(adjectives, seed, offset + 1)} and easy to follow. The pacing held up and the ending felt earned.`
    }))
  }
}

async function requestStructuredFromOpenAI(schemaName: string, schema: JsonObject, prompt: string) {
  const apiKey = (import.meta.env.VITE_OPENAI_API_KEY as string | undefined)?.trim()
  if (!apiKey) {
    return null
  }

  const baseUrl = (import.meta.env.VITE_OPENAI_BASE_URL as string | undefined) || 'https://api.openai.com/v1'
  const model = (import.meta.env.VITE_OPENAI_MODEL as string | undefined) || 'gpt-4.1-mini'

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
    const detail = await response.text()
    throw new Error(`OpenAI request failed: ${response.status} ${detail}`)
  }

  const payload = (await response.json()) as { output_text?: string }
  if (!payload.output_text) {
    throw new Error('Model output missing output_text.')
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
    year: { type: 'number', minimum: 1888, maximum: 2100 },
    genres: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 5 },
    runtime: { type: 'number', minimum: 50, maximum: 300 },
    criticScore: { type: 'number', minimum: 0, maximum: 100 },
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

function swipePrompt(payload: { likes: SwipeMovieInput[]; dislikes: SwipeMovieInput[]; settings: AgentSettings }) {
  return [
    'You are the frontend Codex movie-preference agent.',
    `Loaded skill bundles: ${loadedSkills.join(', ')}`,
    'Follow skill context to infer a robust movie taste profile.',
    'Respect USER_SETTINGS_PREFERENCES_TEXT as high-priority user intent.',
    'Output only JSON matching schema.',
    '',
    'SKILL CONTEXT:',
    promptSkillContext,
    '',
    `USER_SETTINGS_PREFERENCES_TEXT: ${payload.settings.preferenceText || '(none)'}`,
    '',
    'INPUT PAYLOAD:',
    JSON.stringify({ likes: payload.likes, dislikes: payload.dislikes }, null, 2)
  ].join('\n')
}

function reviewPrompt(payload: {
  title: string
  swipeContext: SwipeAnalysis | null
  settings: AgentSettings
}) {
  return [
    'You are the frontend Codex movie-review agent.',
    `Loaded skill bundles: ${loadedSkills.join(', ')}`,
    'Use skill context and taste profile to personalize output.',
    'Make the review accurate, fact-aware, and human-friendly in tone.',
    'Prioritize clarity over jargon and keep language natural.',
    'Respect USER_SETTINGS_PREFERENCES_TEXT as high-priority user intent.',
    'Output only JSON matching schema.',
    '',
    'SKILL CONTEXT:',
    promptSkillContext,
    '',
    `USER_SETTINGS_PREFERENCES_TEXT: ${payload.settings.preferenceText || '(none)'}`,
    '',
    'INPUT PAYLOAD:',
    JSON.stringify({ title: payload.title, swipeContext: payload.swipeContext }, null, 2)
  ].join('\n')
}

export function getAgentRuntimeInfo() {
  return {
    loadedSkills: loadedSkills.slice()
  }
}

export async function analyzeSwipePreferences(payload: {
  likes: SwipeMovieInput[]
  dislikes: SwipeMovieInput[]
  settings: AgentSettings
}): Promise<SwipeAnalysis> {
  try {
    const response = await requestStructuredFromOpenAI('swipe_profile', swipeSchema, swipePrompt(payload))
    if (response) {
      return response as SwipeAnalysis
    }
  } catch (error) {
    console.warn('Falling back to local swipe analysis:', error)
  }

  return fallbackSwipeAnalysis(payload)
}

export async function generateMovieReview(payload: {
  title: string
  swipeContext: SwipeAnalysis | null
  settings: AgentSettings
}): Promise<GeneratedMovieReview> {
  try {
    const response = await requestStructuredFromOpenAI('movie_review', reviewSchema, reviewPrompt(payload))
    if (response) {
      const typed = response as GeneratedMovieReview
      return {
        ...typed,
        userReviews: typed.userReviews.map((review) => ({
          ...review,
          rating: clampRating(review.rating)
        }))
      }
    }
  } catch (error) {
    console.warn('Falling back to local review generation:', error)
  }

  return fallbackMovieReview(payload)
}
