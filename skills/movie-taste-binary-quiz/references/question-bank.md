# Question bank (core 10)

Goal: nail broad taste in ~10 questions using **popular / widely known** anchors. Always accept **Yes / No / Haven’t seen**.

Interpretation rules:

- **Yes** = positive preference signal for the listed axes.
- **No** = negative preference signal (or opposite axis).
- **Haven’t seen** = *exposure/avoidance* signal; do not treat as dislike.

If the user truly can’t answer due to memory (“saw it long ago”), treat as **Haven’t seen** and move on.

## Core 10 questions

Ask them in this order unless you’re branching (see “Branching swaps” below).

1) **Have you seen and liked _The Dark Knight_ (2008)?**
   - Yes → blockbuster craft, grounded grit, tension, plot-forward
   - No → avoid grim intensity or comic-book tone
   - Unseen → may avoid “serious” blockbusters

2) **Have you seen and liked _The Avengers_ (2012)?**
   - Yes → crowd-pleaser, quippy ensemble, spectacle tolerance
   - No → low tolerance for quips / CGI-first spectacles
   - Unseen → may avoid franchise/cinematic-universe movies

3) **Have you seen and liked _Titanic_ (1997)?**
   - Yes → romance + emotion-forward, melodrama tolerance, long runtime patience
   - No → avoids big romance / earnest sentiment / tragic melodrama
   - Unseen → may avoid older mainstream epics / romance

4) **Have you seen and liked _The Lord of the Rings: The Fellowship of the Ring_ (2001)?**
   - Yes → fantasy worldbuilding, earnest heroism, long-form saga patience
   - No → low tolerance for fantasy quest pacing / lore
   - Unseen → low exposure to fantasy canon

5) **Have you seen and liked _Star Wars: A New Hope_ (1977) (or the original trilogy vibe)?**
   - Yes → classic adventure sci‑fi, mythic storytelling, older pacing tolerance
   - No → not into space opera / older film texture
   - Unseen → low classic-canon exposure (modern-first taste likely)

6) **Have you seen and liked _Harry Potter and the Sorcerer’s Stone_ (2001) (or early HP vibe)?**
   - Yes → cozy fantasy, coming‑of‑age, comfort franchise
   - No → avoids kid/YA tone or magical-school vibe
   - Unseen → may avoid long franchises or family fantasy

7) **Have you seen and liked _Get Out_ (2017)?**
   - Yes → smart genre, social thriller/horror, tension + theme
   - No → avoids horror-adjacent tension or “message” genre
   - Unseen → may avoid horror/thriller generally

8) **Have you seen and liked _Pulp Fiction_ (1994)?**
   - Yes → stylized dialogue, nonlinear structure, ironic/edgy tone tolerance
   - No → avoids violence + irony + “cool” detachment / nonlinear storytelling
   - Unseen → may avoid 90s crime-canon / edgy tone

9) **Have you seen and liked _The Godfather_ (1972)?**
   - Yes → patient pacing, character power drama, “classic” seriousness
   - No → avoids slow prestige crime dramas / older pacing
   - Unseen → low classic-prestige exposure (or deliberate avoidance)

10) **Have you seen and liked _Frozen_ (2013)?**
   - Yes → comfort viewing, musical/family animation openness, bright tone
   - No → avoids musicals, broad family tone, “cute” animation
   - Unseen → may avoid family animation/musicals

## Turning answers into axes (coarse scoring)

Maintain these axis scores (start at 0):

- `BLOCKBUSTER` (crowd-pleaser spectacle)
- `CANON_CLASSIC` (older films / prestige canon)
- `FANTASY_SF` (worldbuilding tolerance)
- `DARK_INTENSE` (grim tension / heavy tone)
- `IRONIC_STYLIZED` (nonlinear / stylized / edgy)
- `COMFORT_LIGHT` (cozy, bright, family-friendly)
- `HORROR_THRILLER` (tension/horror adjacency)

Add +1 on **Yes** when the question indicates the axis; add -1 on **No** (opposite preference).
Track unseen counts per bucket:

- `UNSEEN_FRANCHISE` (Avengers, HP, Star Wars, LOTR)
- `UNSEEN_CLASSIC` (Godfather, Star Wars, Titanic, Pulp Fiction)
- `UNSEEN_GENRE_THRILLER` (Get Out)
- `UNSEEN_FAMILY` (Frozen)

Interpretation heuristics:

- High `BLOCKBUSTER` + low `CANON_CLASSIC` → modern crowd-pleaser taste
- High `CANON_CLASSIC` + patience signals → prestige/classic-leaning
- High `FANTASY_SF` + franchise yeses → worldbuilding-forward
- High `COMFORT_LIGHT` + Frozen/HP/Titanic yes → comfort/heart-forward
- High `IRONIC_STYLIZED` + Pulp Fiction yes → stylized / dialogue-forward / edgy
- High `HORROR_THRILLER` + Get Out yes → tension/genre-smart thrillers

Unseen heuristics:

- High `UNSEEN_FRANCHISE` → may avoid long franchises (or low exposure); lower confidence on franchise axes.
- High `UNSEEN_CLASSIC` → modern-first taste or low patience for older pacing; don’t recommend “canon homework” early.
- Clustered unseen in one area (e.g., only classics unseen) → treat as targeted avoidance, not general low exposure.

## Branching swaps (optional)

If a user answers “Haven’t seen” to **3+** of the first 5, swap in 2–3 of these “ultra-common” alternates:

- _Toy Story_ (1995): animation openness, warmth vs cynicism
- _Jurassic Park_ (1993): adventure/thrill, creature-feature tolerance
- _The Matrix_ (1999): sci‑fi style, philosophical action, stylization
- _The Shawshank Redemption_ (1994): earnestness, classic drama patience

Keep the quiz at ~10 total questions.
