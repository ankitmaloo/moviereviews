#!/usr/bin/env python3

import argparse
import json
import sys
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


Answer = str  # "yes" | "no" | "unseen"


@dataclass(frozen=True)
class QuestionSpec:
    id: str
    title: str
    axes_on_yes: List[str]
    axes_on_no: List[str]
    unseen_bucket: Optional[str]


CORE_10: List[QuestionSpec] = [
    QuestionSpec(
        id="dark_knight",
        title="The Dark Knight (2008)",
        axes_on_yes=["BLOCKBUSTER", "DARK_INTENSE"],
        axes_on_no=["DARK_INTENSE"],
        unseen_bucket=None,
    ),
    QuestionSpec(
        id="avengers",
        title="The Avengers (2012)",
        axes_on_yes=["BLOCKBUSTER"],
        axes_on_no=["BLOCKBUSTER"],
        unseen_bucket="UNSEEN_FRANCHISE",
    ),
    QuestionSpec(
        id="titanic",
        title="Titanic (1997)",
        axes_on_yes=["COMFORT_LIGHT", "CANON_CLASSIC"],
        axes_on_no=["COMFORT_LIGHT"],
        unseen_bucket="UNSEEN_CLASSIC",
    ),
    QuestionSpec(
        id="lotr_fellowship",
        title="The Lord of the Rings: The Fellowship of the Ring (2001)",
        axes_on_yes=["FANTASY_SF"],
        axes_on_no=["FANTASY_SF"],
        unseen_bucket="UNSEEN_FRANCHISE",
    ),
    QuestionSpec(
        id="star_wars_new_hope",
        title="Star Wars: A New Hope (1977)",
        axes_on_yes=["FANTASY_SF", "CANON_CLASSIC"],
        axes_on_no=["FANTASY_SF", "CANON_CLASSIC"],
        unseen_bucket="UNSEEN_CLASSIC",
    ),
    QuestionSpec(
        id="harry_potter_1",
        title="Harry Potter and the Sorcerer's Stone (2001)",
        axes_on_yes=["COMFORT_LIGHT", "FANTASY_SF"],
        axes_on_no=["COMFORT_LIGHT"],
        unseen_bucket="UNSEEN_FRANCHISE",
    ),
    QuestionSpec(
        id="get_out",
        title="Get Out (2017)",
        axes_on_yes=["HORROR_THRILLER"],
        axes_on_no=["HORROR_THRILLER"],
        unseen_bucket="UNSEEN_GENRE_THRILLER",
    ),
    QuestionSpec(
        id="pulp_fiction",
        title="Pulp Fiction (1994)",
        axes_on_yes=["IRONIC_STYLIZED", "CANON_CLASSIC"],
        axes_on_no=["IRONIC_STYLIZED"],
        unseen_bucket="UNSEEN_CLASSIC",
    ),
    QuestionSpec(
        id="godfather",
        title="The Godfather (1972)",
        axes_on_yes=["CANON_CLASSIC"],
        axes_on_no=["CANON_CLASSIC"],
        unseen_bucket="UNSEEN_CLASSIC",
    ),
    QuestionSpec(
        id="frozen",
        title="Frozen (2013)",
        axes_on_yes=["COMFORT_LIGHT"],
        axes_on_no=["COMFORT_LIGHT"],
        unseen_bucket="UNSEEN_FAMILY",
    ),
]


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


def _norm_answer(raw: Any) -> Optional[Answer]:
    if raw is None:
        return None
    if isinstance(raw, bool):
        return "yes" if raw else "no"
    if not isinstance(raw, str):
        return None
    v = raw.strip().lower()
    if v in {"yes", "y", "like", "liked", "1", "true"}:
        return "yes"
    if v in {"no", "n", "dislike", "disliked", "0", "false"}:
        return "no"
    if v in {"unseen", "havent seen", "haven't seen", "not seen", "na", "n/a"}:
        return "unseen"
    return None


def _persona_from_axes(axes: Dict[str, int], unseen: Dict[str, int]) -> Dict[str, Any]:
    sorted_axes = sorted(axes.items(), key=lambda kv: kv[1], reverse=True)
    top = [k for k, v in sorted_axes if v >= 2][:3]
    bottom = [k for k, v in reversed(sorted_axes) if v <= -2][:2]

    unseen_total = sum(unseen.values())
    confidence = "high"
    if unseen_total >= 4:
        confidence = "low"
    elif unseen_total >= 2:
        confidence = "medium"

    label_bits: List[str] = []
    if "COMFORT_LIGHT" in top:
        label_bits.append("comfort-forward")
    if "CANON_CLASSIC" in top:
        label_bits.append("classic/prestige-leaning")
    if "BLOCKBUSTER" in top:
        label_bits.append("blockbuster-friendly")
    if "FANTASY_SF" in top:
        label_bits.append("worldbuilding-friendly")
    if "IRONIC_STYLIZED" in top:
        label_bits.append("stylized/edgy")
    if "HORROR_THRILLER" in top:
        label_bits.append("thriller/horror-tolerant")
    if "DARK_INTENSE" in top:
        label_bits.append("dark/intense")

    if not label_bits:
        label_bits.append("broad/undetermined")

    return {
        "persona_label": ", ".join(label_bits),
        "top_axes": top,
        "bottom_axes": bottom,
        "confidence": confidence,
        "unseen_summary": unseen,
    }


def _axis_label(axis: str) -> str:
    return {
        "BLOCKBUSTER": "crowd-pleasing blockbusters",
        "CANON_CLASSIC": "classic/prestige cinema",
        "FANTASY_SF": "fantasy and sci-fi worldbuilding",
        "DARK_INTENSE": "dark/intense tone",
        "IRONIC_STYLIZED": "stylized/edgy storytelling",
        "COMFORT_LIGHT": "comfort/lighthearted tone",
        "HORROR_THRILLER": "thriller/horror tension",
    }.get(axis, axis.lower())


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Score a Movie Taste Binary Quiz response JSON."
    )
    parser.add_argument("--input", required=True, help="Responses JSON path (or '-').")
    parser.add_argument("--output", required=True, help="Output JSON path (or '-').")
    args = parser.parse_args()

    data = _read_json(args.input)
    responses: Dict[str, Any] = data.get("responses", data)

    axes: Dict[str, int] = {
        "BLOCKBUSTER": 0,
        "CANON_CLASSIC": 0,
        "FANTASY_SF": 0,
        "DARK_INTENSE": 0,
        "IRONIC_STYLIZED": 0,
        "COMFORT_LIGHT": 0,
        "HORROR_THRILLER": 0,
    }
    unseen: Dict[str, int] = {
        "UNSEEN_FRANCHISE": 0,
        "UNSEEN_CLASSIC": 0,
        "UNSEEN_GENRE_THRILLER": 0,
        "UNSEEN_FAMILY": 0,
    }

    missing: List[str] = []
    invalid: Dict[str, Any] = {}
    likes_seed: List[Dict[str, str]] = []
    dislikes_seed: List[Dict[str, str]] = []
    unseen_seed: List[Dict[str, str]] = []

    for q in CORE_10:
        raw = responses.get(q.id)
        ans = _norm_answer(raw)
        if ans is None:
            missing.append(q.id)
            if raw is not None:
                invalid[q.id] = raw
            continue

        if ans == "unseen":
            if q.unseen_bucket:
                unseen[q.unseen_bucket] += 1
            unseen_seed.append({"title": q.title, "question_id": q.id})
            continue

        if ans == "yes":
            for ax in q.axes_on_yes:
                axes[ax] += 1
            likes_seed.append({"title": q.title, "question_id": q.id})
        elif ans == "no":
            for ax in q.axes_on_no:
                axes[ax] -= 1
            dislikes_seed.append({"title": q.title, "question_id": q.id})

    persona = _persona_from_axes(axes, unseen)
    preference_snapshot = {
        "usually_like": [_axis_label(a) for a in persona["top_axes"]],
        "usually_avoid": [_axis_label(a) for a in persona["bottom_axes"]],
    }
    output = {
        "axes": axes,
        "unseen": unseen,
        "persona": persona,
        "preference_snapshot": preference_snapshot,
        "quiz_handoff": {
            "likes_seed": likes_seed,
            "dislikes_seed": dislikes_seed,
            "unseen_seed": unseen_seed,
            "persona_label": persona["persona_label"],
            "top_axes": persona["top_axes"],
            "bottom_axes": persona["bottom_axes"],
            "confidence": persona["confidence"],
        },
        "quality": {
            "missing_ids": missing,
            "invalid_values": invalid,
            "answered_count": len(CORE_10) - len(missing),
        },
        "next_action": {
            "preferences_prompt": "Show this user their current preferences as a short card: usually like, usually avoid, and confidence.",
            "rating_prompt": "Ask them to rate one movie with: title, rating 1-10, and one-line why.",
        },
        "notes": [
            "This is a coarse heuristic scorer meant for onboarding and broad taste; prefer follow-up questions for edge cases.",
            "Unseen answers reduce confidence and should shape what you recommend next (avoid assigning dislike).",
        ],
    }
    _write_json(args.output, output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
