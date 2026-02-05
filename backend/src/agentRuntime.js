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
      maxItems: 5
    },
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

export async function createAgentRuntime() {
  const { skills, promptContext } = await loadSkillBundle()

  const codex = new Codex({
    apiKey: currentApiKey() || undefined
  })

  function startThread() {
    return codex.startThread({
      model: process.env.CODEX_MODEL || 'gpt-5',
      workingDirectory: repoRoot,
      approvalPolicy: 'never',
      sandboxMode: 'read-only',
      networkAccessEnabled: false
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

    const prompt = [
      'You are the movie review synthesis engine for this app.',
      'Use the provided skill documents to personalize explanation style when profile signals are available.',
      'Return practical review copy: summary, verdict, and realistic user review snippets.',
      'Never include markdown or commentary outside the JSON object.',
      '',
      'SKILL CONTEXT:',
      promptContext,
      '',
      'INPUT PAYLOAD:',
      toJsonString(payload)
    ].join('\n')

    const turn = await thread.run(prompt, { outputSchema: reviewResponseSchema })
    return parseJson(turn.finalResponse)
  }

  return {
    skills,
    analyzeSwipePreferences,
    generateMovieReview
  }
}
