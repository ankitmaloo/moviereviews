# Backend Agent SDK

This backend runs movie preference and review logic through `@openai/codex-sdk` and injects local skill files from `../skills` into each agent prompt.

## Setup

1. Install dependencies:
   - `npm install`
2. Create env file:
   - `cp .env.example .env`
3. Set `OPENAI_API_KEY` (or `CODEX_API_KEY`) in `.env`.

## Run

- Dev: `npm run dev`
- Start: `npm start`
- Syntax check: `npm run check`

## API

- `GET /api/health`
- `GET /api/skills`
- `POST /api/swipe/analyze`
- `POST /api/review/generate`
