---
name: movie-taste-binary-quiz
description: Detect a user's broad movie taste by running a short, standardized set of ~10 yes/no questions anchored to widely seen (or culturally ubiquitous) movies. Treat "haven't seen" as an informative signal about exposure/avoidance. Use when you need to quickly infer a taste profile without asking for a long likes/dislikes list, or when onboarding a new user for customized reviews and recommendations.
---

# Movie Taste Binary Quiz

## Overview

Ask ~10 popular-movie questions, interpret both the answers and the "haven't seen" pattern, then output a coarse taste persona plus a **handoff packet** that can be passed directly to `movie-taste-profiler`.

## Workflow

### 1) Run the quiz (10 questions)

Use the **core 10** from `references/question-bank.md`.

For each question, accept one of:

- **Yes** (liked / would rewatch)
- **No** (disliked / not their thing)
- **Haven’t seen** (important signal; don’t treat as a dislike)

If the user tries to answer with nuance, bin it:

- "Yes, but…" → Yes (record the caveat as a note)
- "It’s fine" → No (unless they’d choose it again)

### 2) Interpret “haven’t seen” as a signal

Use unseen patterns to refine your read:

- Unseen **only in one bucket** (e.g., most horror not seen) often means **avoidance**, not ignorance.
- Many unseen across the board can mean **new/low-exposure** user; keep confidence lower and ask 1 follow-up about how they choose movies (friends, trailers, critics, genre).
- Unseen in “classic canon” (e.g., crime drama classics) can indicate **modern-first** taste or lower patience for older pacing.

### 3) Convert answers into a profile

For broad taste, you only need **coarse axes** (don’t overfit):

- blockbuster crowd-pleaser ↔ auteur/arthouse
- grounded realism ↔ fantasy/sci‑fi worldbuilding
- light/comfort ↔ dark/intense
- plot/twists ↔ character/emotion
- patience for slow pacing / older films

Use the rubric in `references/question-bank.md` to map each response to signals. If you want a deterministic summary, run `scripts/score_quiz.py`.

### 4) Build a handoff packet for the next skill

Always emit a small machine-readable handoff object after the quiz summary so `movie-taste-profiler` can continue without re-asking everything.

```json
{
  "quiz_handoff": {
    "likes_seed": [{"title": "Movie A"}],
    "dislikes_seed": [{"title": "Movie B"}],
    "unseen_seed": [{"title": "Movie C"}],
    "persona_label": "coarse label",
    "top_axes": ["AXIS_A", "AXIS_B"],
    "bottom_axes": ["AXIS_C"],
    "confidence": "high|medium|low"
  }
}
```

Rules:

- `likes_seed`: questions answered **Yes**
- `dislikes_seed`: questions answered **No**
- `unseen_seed`: questions answered **Haven't seen**
- Keep title spellings canonical (same as the question bank)

### 5) Output template

1. **Persona label (1 line)**
2. **Taste thesis (2–3 sentences)** (include how “unseen” shaped the read)
3. **Green flags (5 bullets max)**
4. **Dealbreakers (3 bullets max)**
5. **Confidence + 1 follow-up** (only if many unseen or mixed signals)
6. **Preference snapshot card**: "What you usually like" vs "What you usually avoid"
7. **Ask for one rating next**: ask the user to rate one movie (`title + rating 1-10 + one-line why`)
8. **What to recommend / avoid next** (5–10 titles max, optional)
9. **Handoff JSON**: include the `quiz_handoff` object for `movie-taste-profiler`

## Script: scoring the quiz

Use `scripts/score_quiz.py` when you have responses in JSON and want consistent axis scoring plus handoff JSON for `movie-taste-profiler`.

Example:

```bash
python3 skills/movie-taste-binary-quiz/scripts/score_quiz.py \
  --input responses.json \
  --output quiz-signals.json
```
