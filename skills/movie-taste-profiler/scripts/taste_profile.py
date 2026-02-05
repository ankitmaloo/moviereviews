#!/usr/bin/env python3

import argparse
import json
import sys
from collections import Counter
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple


@dataclass(frozen=True)
class ItemCount:
    key: str
    count: int


def _read_json(path: str) -> Any:
    if path == "-":
        return json.load(sys.stdin)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_json(path: str, obj: Any) -> None:
    if path == "-":
        json.dump(obj, sys.stdout, indent=2, ensure_ascii=False)
        sys.stdout.write("\n")
        return
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")


def _as_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _to_movie(raw: Any) -> Optional[Dict[str, Any]]:
    if raw is None:
        return None
    if isinstance(raw, str):
        title = raw.strip()
        return {"title": title} if title else None
    if isinstance(raw, dict):
        m = dict(raw)
        title = m.get("title")
        if isinstance(title, str):
            m["title"] = title.strip()
        return m
    return None


def _normalize_movies(value: Any) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for raw in _as_list(value):
        movie = _to_movie(raw)
        if movie is not None:
            out.append(movie)
    return out


def _norm_token(token: Any) -> Optional[str]:
    if token is None:
        return None
    if isinstance(token, (int, float)):
        token = str(token)
    if not isinstance(token, str):
        return None
    token = token.strip().lower()
    return token or None


def _decade(year: Any) -> Optional[str]:
    try:
        y = int(year)
    except Exception:
        return None
    if y <= 0:
        return None
    d = (y // 10) * 10
    return f"{d}s"


def _count_tokens(
    movies: Iterable[Dict[str, Any]],
    field: str,
    *,
    decade_field: bool = False,
) -> Counter:
    c: Counter = Counter()
    for m in movies:
        if decade_field:
            token = _decade(m.get(field))
            if token:
                c[token] += 1
            continue

        for raw in _as_list(m.get(field)):
            token = _norm_token(raw)
            if token:
                c[token] += 1
    return c


def _top(counter: Counter, n: int) -> List[ItemCount]:
    return [ItemCount(key=k, count=v) for k, v in counter.most_common(n)]


def _delta_top(likes: Counter, dislikes: Counter, n: int) -> List[ItemCount]:
    keys = set(likes.keys()) | set(dislikes.keys())
    deltas: List[Tuple[str, int]] = []
    for k in keys:
        deltas.append((k, int(likes.get(k, 0)) - int(dislikes.get(k, 0))))
    deltas.sort(key=lambda kv: (kv[1], likes.get(kv[0], 0)), reverse=True)
    return [ItemCount(key=k, count=d) for k, d in deltas[:n] if d != 0]


def _suggest_questions(summary: Dict[str, Any]) -> List[str]:
    questions: List[str] = []
    if not summary.get("has_notes"):
        questions.append(
            "For 2–3 liked and 2–3 disliked movies, what was the main reason (tone, pacing, characters, plot, style)?"
        )
    questions.append(
        "Do you prefer clean resolution or are ambiguous endings okay (or preferred)?"
    )
    questions.append(
        "Which matters more: character relationships/acting or plot mechanics/twists/worldbuilding?"
    )
    return questions[:3]


def _collect_preference_card(signals: Dict[str, Any]) -> Dict[str, List[str]]:
    usually_like: List[str] = []
    usually_avoid: List[str] = []

    label_map = {
        "genres": "genre",
        "tags": "tag",
        "directors": "director",
        "decades": "era",
    }

    for field in ["genres", "tags", "directors", "decades"]:
        entries = signals.get(field, {}).get("delta_top", [])
        for e in entries:
            key = e.get("key")
            count = int(e.get("count", 0))
            if not key or count == 0:
                continue
            prefix = label_map[field]
            line = f"{prefix}: {key} ({count:+d})"
            if count > 0 and len(usually_like) < 5:
                usually_like.append(line)
            if count < 0 and len(usually_avoid) < 3:
                usually_avoid.append(line)

    if not usually_like:
        usually_like = ["Insufficient structured metadata to extract stable likes yet."]
    if not usually_avoid:
        usually_avoid = ["Insufficient structured metadata to extract stable avoids yet."]

    return {
        "usually_like": usually_like,
        "usually_avoid": usually_avoid,
        "depends_on": [
            "Pacing and tone match can override genre preferences.",
            "Strong characters can make borderline genres work.",
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Summarize liked vs disliked movie signals from structured JSON."
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Path to input JSON (use '-' for stdin).",
    )
    parser.add_argument(
        "--output",
        required=True,
        help="Path to output JSON (use '-' for stdout).",
    )
    parser.add_argument("--top", type=int, default=10, help="How many items per list.")
    args = parser.parse_args()

    data = _read_json(args.input)
    likes = _normalize_movies(data.get("likes"))
    dislikes = _normalize_movies(data.get("dislikes"))

    quiz_handoff = data.get("quiz_handoff") or {}
    quiz_like_seeds = _normalize_movies(quiz_handoff.get("likes_seed"))
    quiz_dislike_seeds = _normalize_movies(quiz_handoff.get("dislikes_seed"))

    for m in quiz_like_seeds:
        m.setdefault("source", "quiz_seed")
    for m in quiz_dislike_seeds:
        m.setdefault("source", "quiz_seed")

    likes.extend(quiz_like_seeds)
    dislikes.extend(quiz_dislike_seeds)

    def _has_any(field: str) -> bool:
        for m in likes + dislikes:
            if m.get(field):
                return True
        return False

    summary = {
        "likes_count": len(likes),
        "dislikes_count": len(dislikes),
        "quiz_seed_likes_count": len(quiz_like_seeds),
        "quiz_seed_dislikes_count": len(quiz_dislike_seeds),
        "quiz_confidence": quiz_handoff.get("confidence"),
        "has_years": _has_any("year"),
        "has_genres": _has_any("genres"),
        "has_directors": _has_any("directors"),
        "has_tags": _has_any("tags"),
        "has_notes": _has_any("notes"),
    }

    signals: Dict[str, Any] = {}
    for label, field, decade_field in [
        ("genres", "genres", False),
        ("directors", "directors", False),
        ("tags", "tags", False),
        ("decades", "year", True),
    ]:
        like_c = _count_tokens(likes, field, decade_field=decade_field)
        dislike_c = _count_tokens(dislikes, field, decade_field=decade_field)
        signals[label] = {
            "likes_top": [ic.__dict__ for ic in _top(like_c, args.top)],
            "dislikes_top": [ic.__dict__ for ic in _top(dislike_c, args.top)],
            "delta_top": [ic.__dict__ for ic in _delta_top(like_c, dislike_c, args.top)],
        }

    output = {
        "summary": summary,
        "signals": signals,
        "preference_card": _collect_preference_card(signals),
        "prompt_helper": {
            "questions": _suggest_questions(summary),
            "rating_prompt": (
                "Ask the user to rate one movie next: title, rating (1-10), and one-line why."
            ),
            "exception_check": (
                "If the rating strongly conflicts with inferred preferences, ask whether it is an exception."
            ),
            "notes": (
                "delta_top is likes_count minus dislikes_count for each token; "
                "use it to spot discriminating signals, not as a definitive model."
            ),
        },
    }

    _write_json(args.output, output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
