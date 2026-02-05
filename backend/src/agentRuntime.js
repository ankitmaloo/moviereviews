import { Codex } from '@openai/codex-sdk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadSkillBundle } from './skillsLoader.js'

const srcDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(srcDir, '..', '..')

const swipeResponseSchema = {
  type: 'object',
  properties: {
    personaLabel: { type: 'string' },
    tasteThesis: { type: 'string' },
    greenFlags: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 5
    },
    dealbreakers: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 4
    },
    tradeoffs: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 4
    },
    reviewLevers: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 6
    },
    usuallyLike: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 5
    },
    usuallyAvoid: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 4
    },
    dependsOn: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 3
    },
    recommendation: { type: 'string' },
    confidence: {
      type: 'string',
      enum: ['low', 'medium', 'high']
    }
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

const reviewResponseSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    year: { type: 'number', minimum: 1888, maximum: 2100 },
    genres: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
      maxItems: 6
    },
    runtime: { type: 'number', minimum: 50, maximum: 300 },
    rating: { type: 'number', minimum: 0, maximum: 10 },
    cast: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 8
    },
    shortPlot: { type: 'string' },
    summary: { type: 'string' },
    verdict: { type: 'string' },
    peopleLikeYou: {
      type: 'array',
      items: { type: 'string' },
      minItems: 2,
      maxItems: 5
    },
    sources: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          url: { type: 'string' },
          note: { type: 'string' }
        },
        required: ['source', 'url', 'note'],
        additionalProperties: false
      },
      minItems: 0,
      maxItems: 5
    },
    isGeneric: { type: 'boolean' }
  },
  required: [
    'title',
    'year',
    'genres',
    'runtime',
    'rating',
    'cast',
    'shortPlot',
    'summary',
    'verdict',
    'peopleLikeYou',
    'sources',
    'isGeneric'
  ],
  additionalProperties: false
}

const DEFAULT_REVIEW_SYSTEM_INSTRUCTIONS = `Its Jan 3 2026.

you are a movie reviewer for a very specific type of viewer. Your viewer likes:

- fast paced movies.
- No flashback, though if the entire movie happens in flashback thats okay. No jumps.
- no backstory.
- No emphasis on character study or growth or development.
- Emphasis on witty lines or exposition that moves the plot forward.
- in their own words "tell me the premise and i will accept it, but dont waste movie time on telling me things."
- Don't waste time on emotion heavy scenes unless the buildup is worth it. That is a hero sacrificing themselves is worth it if its indeed a huge arc.
- should not be long.
- Confrontations are fine but they do not like two characters having a dialogue understanding which requires subtext.
- No political commentary.
- They like surprises. Plot points that are not foreshadowed and you don't see coming.
- They may make an exception if it's a must watch, though that is a very high bar.

Based on these, you will be given a movie. Google for plot and public reviews, and if possible even scripts and dialogues. and then craft a review based on what your viewer likes.

Don't mention the viewer directly. Assume they are reading it passively, and they trust your review because tastes match. Dont mention broken rules, those are things you as a reviewer don't like. (As does the viewer, but they are reading your review as to why you liked and not liked)

Always score the rating as well when you can.
Along with casts, short plot summary your viewer would appreciate.`

function toJsonString(value) {
  return JSON.stringify(value, null, 2)
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    const firstBrace = text.indexOf('{')
    const lastBrace = text.lastIndexOf('}')
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1))
    }
    throw new Error('Could not parse model output as JSON.')
  }
}

function currentApiKey() {
  return process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY || null
}

function assertApiKey() {
  if (!currentApiKey()) {
    throw new Error('Missing OPENAI_API_KEY (or CODEX_API_KEY) for Codex SDK runtime.')
  }
}

function clampRating(value) {
  return Math.max(0, Math.min(10, Number(value) || 0))
}

function sanitizeText(value) {
  if (typeof value !== 'string') {
    return ''
  }

  return value
    .replace(/\u0000/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeCast(cast) {
  if (!Array.isArray(cast)) {
    return []
  }

  const flattened = cast.flatMap((entry) =>
    sanitizeText(String(entry))
      .replace(/^"+|"+$/g, '')
      .split(',')
      .map((name) => sanitizeText(name).replace(/^"+|"+$/g, ''))
  )

  const unique = []
  for (const name of flattened) {
    if (!name || unique.includes(name)) {
      continue
    }
    unique.push(name)
  }

  return unique.slice(0, 8)
}

function sanitizeReviewPayload(review) {
  return {
    ...review,
    title: sanitizeText(review.title),
    genres: Array.isArray(review.genres) ? review.genres.map((genre) => sanitizeText(String(genre))).filter(Boolean) : [],
    rating: clampRating(review.rating),
    cast: sanitizeCast(review.cast),
    shortPlot: sanitizeText(review.shortPlot),
    summary: sanitizeText(review.summary),
    verdict: sanitizeText(review.verdict),
    peopleLikeYou: Array.isArray(review.peopleLikeYou)
      ? review.peopleLikeYou.map((item) => sanitizeText(String(item))).filter(Boolean)
      : [],
    sources: Array.isArray(review.sources)
      ? review.sources
          .map((source) => ({
            source: sanitizeText(source?.source),
            url: sanitizeText(source?.url),
            note: sanitizeText(source?.note)
          }))
          .filter((source) => source.source && source.url)
      : []
  }
}

function buildReviewPrompt(payload, promptContext) {
  const preferenceText = typeof payload?.settings?.preferenceText === 'string' ? payload.settings.preferenceText.trim() : ''
  const activeInstructions = preferenceText || DEFAULT_REVIEW_SYSTEM_INSTRUCTIONS

  return [
    'You are the movie review synthesis engine for this app.',
    'Current date context: January 3, 2026.',
    'Execution policy:',
    '- Parallelize independent work aggressively.',
    '- Run multiple web searches in parallel for critic, audience, and consensus viewpoints.',
    '- Batch source gathering and only serialize steps that are strictly dependent.',
    'Workflow requirements:',
    '1) Use available web and network tools to research critic and audience reviews for the requested title.',
    '2) Synthesize consensus points and score sentiment from multiple sources.',
    '3) Rewrite into concise summary and verdict for this user.',
    '4) Return peopleLikeYou points based on likely similar-viewer sentiment.',
    '5) Always include cast and a short plot summary.',
    'When USER_SETTINGS_PREFERENCES_TEXT is empty, write generic mainstream-friendly output and set isGeneric=true.',
    'When USER_SETTINGS_PREFERENCES_TEXT is present, personalize focus and tradeoffs and set isGeneric=false.',
    'Use at least 3 independent sources when possible. Do not invent URLs.',
    'Return only JSON matching schema.',
    '',
    'SKILL CONTEXT:',
    promptContext,
    '',
    'ACTIVE_REVIEWER_INSTRUCTIONS:',
    activeInstructions,
    '',
    'INPUT PAYLOAD:',
    toJsonString({
      title: payload.title,
      swipeContext: payload.swipeContext || null
    })
  ].join('\n')
}

function summarizeProgressEvent(event) {
  if (event.type === 'turn.started') {
    return 'Codex started the review run.'
  }

  if (event.type === 'item.started' || event.type === 'item.updated' || event.type === 'item.completed') {
    const item = event.item

    if (item.type === 'web_search') {
      const prefix = event.type === 'item.completed' ? 'Completed web search' : 'Searching web'
      if (item.query && item.query.trim()) {
        return `${prefix}: ${item.query}`
      }
      return `${prefix}.`
    }

    if (item.type === 'reasoning') {
      return 'Analyzing review evidence and preferences.'
    }

    if (item.type === 'mcp_tool_call') {
      const prefix = event.type === 'item.completed' ? 'Finished tool call' : 'Running tool call'
      return `${prefix}: ${item.server}/${item.tool}`
    }

    if (item.type === 'todo_list') {
      return `Planning steps: ${item.items.length} tasks tracked.`
    }

    if (item.type === 'agent_message' && event.type === 'item.completed') {
      return 'Generated final review draft.'
    }

    if (item.type === 'error') {
      return `Agent warning: ${item.message}`
    }
  }

  if (event.type === 'turn.completed') {
    return 'Codex finished and returned structured review output.'
  }

  return null
}

function eventDetail(event) {
  return toJsonString(event)
}

export async function createAgentRuntime() {
  const { skills, promptContext } = await loadSkillBundle()

  const codex = new Codex({
    apiKey: currentApiKey() || undefined
  })

  function startThread() {
    return codex.startThread({
      model: process.env.CODEX_MODEL || 'gpt-5',
      modelReasoningEffort: 'low',
      workingDirectory: repoRoot,
      approvalPolicy: 'never',
      sandboxMode: 'read-only',
      networkAccessEnabled: true
    })
  }

  async function analyzeSwipePreferences(payload) {
    assertApiKey()
    const thread = startThread()

    const prompt = [
      'You are the movie preference intelligence engine for this app.',
      'Use the provided skill documents as hard guidance for analysis style and output priorities.',
      'Infer a concise and actionable taste profile from likes/dislikes.',
      'Return only valid JSON matching the requested schema.',
      '',
      'SKILL CONTEXT:',
      promptContext,
      '',
      'INPUT PAYLOAD:',
      toJsonString(payload)
    ].join('\n')

    const turn = await thread.run(prompt, { outputSchema: swipeResponseSchema })
    return parseJson(turn.finalResponse)
  }

  async function generateMovieReview(payload) {
    assertApiKey()
    const thread = startThread()

    const prompt = buildReviewPrompt(payload, promptContext)
    const turn = await thread.run(prompt, { outputSchema: reviewResponseSchema })
    const parsed = parseJson(turn.finalResponse)

    return sanitizeReviewPayload(parsed)
  }

  async function generateMovieReviewStream(payload, options = {}) {
    assertApiKey()
    const thread = startThread()

    const prompt = buildReviewPrompt(payload, promptContext)
    const streamed = await thread.runStreamed(prompt, {
      outputSchema: reviewResponseSchema,
      signal: options.signal
    })

    let finalResponse = ''

    for await (const event of streamed.events) {
      if (event.type === 'error') {
        throw new Error(event.message)
      }

      if (event.type === 'turn.failed') {
        throw new Error(event.error.message)
      }

      const progressMessage = summarizeProgressEvent(event)
      if (progressMessage) {
        options.onProgress?.({
          message: progressMessage,
          detail: eventDetail(event)
        })
      }

      if (event.type === 'item.completed' && event.item.type === 'agent_message') {
        finalResponse = event.item.text
      }
    }

    if (!finalResponse) {
      throw new Error('No final model response received from streaming run.')
    }

    const parsed = parseJson(finalResponse)

    return sanitizeReviewPayload(parsed)
  }

  return {
    skills,
    analyzeSwipePreferences,
    generateMovieReview,
    generateMovieReviewStream
  }
}
