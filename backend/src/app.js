import cors from 'cors'
import express from 'express'

import { createAgentRuntime } from './agentRuntime.js'

const app = express()
const runtime = await createAgentRuntime()

const allowedOrigin = process.env.FRONTEND_ORIGIN || '*'

app.use(
  cors({
    origin: allowedOrigin
  })
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    sdk: '@openai/codex-sdk',
    skillsLoaded: runtime.skills.length,
    hasApiKey: Boolean(process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY)
  })
})

app.get('/api/skills', (_req, res) => {
  res.json({
    skills: runtime.skills.map((skill) => ({
      name: skill.name,
      files: skill.files.map((file) => file.relativePath)
    }))
  })
})

app.post('/api/swipe/analyze', async (req, res, next) => {
  try {
    const likes = Array.isArray(req.body?.likes) ? req.body.likes : []
    const dislikes = Array.isArray(req.body?.dislikes) ? req.body.dislikes : []

    if (likes.length + dislikes.length === 0) {
      res.status(400).json({ error: 'Provide at least one liked or disliked movie.' })
      return
    }

    const result = await runtime.analyzeSwipePreferences({
      likes,
      dislikes,
      metadata: req.body?.metadata ?? null
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.post('/api/review/generate', async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim()
    if (!title) {
      res.status(400).json({ error: 'Movie title is required.' })
      return
    }

    const result = await runtime.generateMovieReview({
      title,
      swipeContext: req.body?.swipeContext ?? null
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  const message = error instanceof Error ? error.message : 'Unexpected server error.'
  res.status(500).json({ error: message })
})

export default app
