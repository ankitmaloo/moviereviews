---
name: movie-taste-profiler
description: Infer a movie-viewer "user type" (taste persona) by comparing movies they liked vs disliked, extracting consistent signals (genre/subgenre, tone, pacing, themes, filmmaking style), identifying dealbreakers vs "green flags", and producing an actionable profile for personalization. Use when given a user's list of liked/disliked movies (optionally with ratings/notes) and you need to summarize their preferences, explain patterns, ask the right clarifying questions, or generate tailored review angles/recommendations.
---

# Movie Taste Profiler

## Overview

Turn a user's liked vs disliked movies into a concise taste persona plus a set of preference/avoidance signals you can use to personalize reviews and recommendations. This skill should accept direct input from `movie-taste-binary-quiz` handoff data.

## Workflow

### 1) Normalize the input

Ask for (or infer) the minimum needed structure:

- **Likes**: 5–20 titles (more is better), optionally with 1–10 rating and a 1-line "why"
- **Dislikes**: 5–20 titles, optionally with rating and "why"
- Optional: "guilty pleasures", "too slow/too loud" sensitivities, and 2–3 recent favorites

If a `quiz_handoff` object is provided from `movie-taste-binary-quiz`, merge it as starter evidence:

- Append `likes_seed` to likes and `dislikes_seed` to dislikes (tag them as "quiz-seeded")
- Do not treat `unseen_seed` as dislikes
- Carry over quiz `confidence` and lower certainty if quiz confidence is low

If the user only gives titles, proceed, but explicitly mark uncertainty and ask 2–3 clarifying questions (see step 2).

If the list is long and the user provides years/genres/tags, run `scripts/taste_profile.py` to compute quick stats and deltas.

### 2) Extract signals and contrasts

Build a contrast view: what shows up in likes that does *not* show up in dislikes (and vice versa).

Focus on stable axes rather than one-off trivia:

- **Genre/subgenre**: e.g., heist, courtroom, found-footage horror, cozy mystery, slow cinema
- **Tone**: bleak vs hopeful, sincere vs ironic, comfort vs confrontation
- **Pacing & density**: slow burn vs brisk, dialogue-heavy vs action-heavy
- **Narrative shape**: linear vs fragmented, twist-driven, ambiguity tolerance
- **Style**: grounded realism vs heightened stylization, formal experimentation, visual-forward
- **Theme triggers**: authority vs rebellion, family trauma, moral ambiguity, redemption, etc.

Use the dislikes list to identify **dealbreakers** (hard no) vs **tradeoffs** (soft no).

If you need a structured set of axes, load `references/taste-axes.md`.

### 3) Ask the right clarifying questions (only if needed)

Ask at most 3 questions, and prefer questions that resolve ambiguity created by the likes/dislikes contrast:

- "When you disliked X, was it the **tone** (too bleak/too silly) or the **pace** (too slow/too frantic)?"
- "Do you like **ambiguity** and unresolved endings, or do you prefer clean answers?"
- "Which matters more: **characters** (relationships/acting) or **plot mechanics** (mystery, twists, worldbuilding)?"

### 4) Synthesize the persona (the “user type”)

Produce a persona that is:

- **Specific enough** to guide personalization
- **Not overfit** to a single title
- **Actionable**: what to recommend, what to avoid, and how to write reviews for them

Use this output template:

1. **Persona label (1 line)**: e.g., "Character-first, slow-burn realist with low tolerance for contrived twists"
2. **Taste thesis (2–3 sentences)**: unify the pattern across likes/dislikes
3. **Green flags (5 bullets max)**: signals that predict a like (tone/pacing/theme/style)
4. **Dealbreakers (3 bullets max)**: signals that reliably predict a dislike
5. **Tradeoffs (3 bullets max)**: "depends" items (e.g., action is ok if grounded)
6. **Review levers**: what to emphasize in a customized review (performance, theme, craft, plot, vibes)
7. **Recommendations** (optional): 5–10 titles with 1-line rationale each, explicitly tied to the profile

If the user’s list is sparse, include a short "confidence" note and what would increase it (e.g., “Add 3 disliked comedies”).

### 5) Publish preferences and request the next rating

After the persona, always include:

1. A short **"Your current preferences"** card:
   - Usually like: 3-5 items
   - Usually avoid: 2-3 items
   - Depends on: 1-2 tradeoffs
2. A direct prompt to rate one movie:
   - Ask for `title`, `rating (1-10)`, and `one-line why`
   - If the movie conflicts with inferred taste, ask whether it is an exception

## Script: quick stats for large lists

Use `scripts/taste_profile.py` when the user provides a structured list (years/genres/tags), `quiz_handoff`, or many items and you want fast frequency/delta summaries.

Example:

```bash
python3 skills/movie-taste-profiler/scripts/taste_profile.py \
  --input taste.json \
  --output taste-signals.json
```

Then use the output to inform the persona synthesis (don’t paste raw counters into the user-facing output unless asked).
