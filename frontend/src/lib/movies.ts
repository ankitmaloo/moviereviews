export type UserReview = {
  id: number
  author: string
  postedAt: string
  rating: number
  text: string
}

export type MovieRecord = {
  slug: string
  title: string
  year: number
  genres: string[]
  runtime: number
  criticScore: number
  summary: string
  verdict: string
  userReviews: UserReview[]
  communityThen: string[]
  communityNow: string[]
  theories: string[]
  scenarioSeeds: string[]
}

export const movieCatalog: MovieRecord[] = [
  {
    slug: 'dune-part-two',
    title: 'Dune: Part Two',
    year: 2024,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: 166,
    criticScore: 91,
    summary:
      'A grand sequel that sharpens character motivation while scaling up political and spiritual conflict.',
    verdict:
      'Best when you want high-stakes spectacle with serious worldbuilding. The final act is emotionally brutal in a good way.',
    userReviews: [
      {
        id: 101,
        author: 'Jared M.',
        postedAt: 'March 8, 2024',
        rating: 5,
        text: 'Massive on screen, but the most impressive part is how intimate the character turns feel.'
      },
      {
        id: 102,
        author: 'Lina P.',
        postedAt: 'March 12, 2024',
        rating: 4,
        text: 'Long runtime but strong pacing. I liked this much more than part one.'
      },
      {
        id: 103,
        author: 'Kofi R.',
        postedAt: 'March 15, 2024',
        rating: 5,
        text: 'The audio and visual design are absurdly good. Instant rewatch for me.'
      }
    ],
    communityThen: [
      'Debates about whether Paul is hero or warning sign dominated opening-week discussions.',
      'Many viewers tracked differences from the novel, especially around Alia and pacing.',
      'Fans kept comparing IMAX and standard formats because spectacle was a huge talking point.'
    ],
    communityNow: [
      'The current conversation centers on how the next film could handle post-jihad consequences.',
      'People are revisiting Chani perspective edits and debating whether the ending reframes the saga.',
      'The fandom remains split on how faithfully future chapters should follow the books.'
    ],
    theories: [
      'What if Chani becomes the narrative center in the next installment rather than Paul?',
      'Could the film universe compress later books into one political thriller arc?',
      'Is the final montage hinting at a timeline break rather than a straight sequel?'
    ],
    scenarioSeeds: [
      'Paul refuses the southern war council at the final moment.',
      'Chani forms an independent Fremen coalition after the coronation.',
      'Irulan leaks private palace records to shift public sentiment.'
    ]
  },
  {
    slug: 'barbie',
    title: 'Barbie',
    year: 2023,
    genres: ['Comedy', 'Fantasy'],
    runtime: 114,
    criticScore: 88,
    summary:
      'A pop comedy that pivots into identity and expectation themes without sacrificing playful energy.',
    verdict:
      'Great pick if you want fast humor with layered social commentary. It lands hardest in the character-to-character scenes.',
    userReviews: [
      {
        id: 201,
        author: 'Nadia V.',
        postedAt: 'July 23, 2023',
        rating: 5,
        text: 'Funny and unexpectedly sharp. Theater crowd energy made every joke hit harder.'
      },
      {
        id: 202,
        author: 'Trevor H.',
        postedAt: 'July 28, 2023',
        rating: 4,
        text: 'Looks amazing and stays entertaining throughout. A couple monologues are a bit direct but still good.'
      },
      {
        id: 203,
        author: 'Mina A.',
        postedAt: 'August 2, 2023',
        rating: 5,
        text: 'I came for comedy and got both comedy and emotion. Great cast chemistry.'
      }
    ],
    communityThen: [
      'Opening weekend buzz focused on production design and quoteable one-liners.',
      'Audiences debated whether satire beats emotional scenes as the film strongest layer.',
      'Double-feature culture made it part of a broader moviegoing event conversation.'
    ],
    communityNow: [
      'Current fans discuss long-tail cultural impact and meme moments that still circulate.',
      'Many threads revisit Ken arc interpretations and whether his ending is fully earned.',
      'People continue ranking standout scenes as gateway moments for first-time viewers.'
    ],
    theories: [
      'What if Barbie Land represents a looping simulation rather than a stable world?',
      'Could a sequel center on supporting dolls navigating identity without Barbie as the anchor?',
      'Is the narrator framing meant to imply multiple contradictory timelines?'
    ],
    scenarioSeeds: [
      'Ken forms a leadership workshop and accidentally creates a second absurd hierarchy.',
      'Barbie Land opens an exchange program with real-world professionals.',
      'President Barbie loses an election to a coalition of discontinued dolls.'
    ]
  },
  {
    slug: 'oppenheimer',
    title: 'Oppenheimer',
    year: 2023,
    genres: ['Drama', 'History', 'Thriller'],
    runtime: 180,
    criticScore: 93,
    summary:
      'A dense dialogue-first historical drama about ambition, guilt, and institutional power struggle.',
    verdict:
      'Ideal when you are ready for intense character conflict and courtroom-style tension over a long runtime.',
    userReviews: [
      {
        id: 301,
        author: 'Tasha G.',
        postedAt: 'July 22, 2023',
        rating: 5,
        text: 'Felt like a legal thriller and biography at once. Editing rhythm is excellent.'
      },
      {
        id: 302,
        author: 'Ryan C.',
        postedAt: 'July 30, 2023',
        rating: 4,
        text: 'Very dialogue-heavy but rewarding. I liked it more on second watch.'
      },
      {
        id: 303,
        author: 'Sana K.',
        postedAt: 'August 7, 2023',
        rating: 5,
        text: 'Sound design and performances are unforgettable. Heavy material handled with intensity.'
      }
    ],
    communityThen: [
      'Initial discourse emphasized performance quality and nonlinear structure choices.',
      'The gymnasium scene became a focal point for ethical interpretation threads.',
      'Viewers debated whether supporting political context needed more space.'
    ],
    communityNow: [
      'Current discussion revisits how much agency the lead character truly had at key points.',
      'People compare theatrical and home-viewing comprehension of the timeline jumps.',
      'New essays keep appearing about the film stance on scientific responsibility.'
    ],
    theories: [
      'What if the security-hearing timeline is subtly framed through unreliable testimony?',
      'Could a companion story from Kitty perspective fully invert audience sympathy?',
      'Is the final Einstein exchange meant as factual memory or symbolic reconstruction?'
    ],
    scenarioSeeds: [
      'Strauss hearing concludes before election pressure builds.',
      'A younger scientist publicly challenges Oppenheimer during Manhattan Project planning.',
      'An alternate cut foregrounds policy debates over technical milestones.'
    ]
  },
  {
    slug: 'spider-man-across-the-spider-verse',
    title: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    genres: ['Animation', 'Action', 'Adventure'],
    runtime: 140,
    criticScore: 95,
    summary:
      'A style-forward multiverse story with sharp humor and an emotional conflict at its core.',
    verdict:
      'Excellent choice when you want high-energy visuals, strong character beats, and a cliffhanger ending.',
    userReviews: [
      {
        id: 401,
        author: 'Carlos D.',
        postedAt: 'June 3, 2023',
        rating: 5,
        text: 'Every sequence looks like a different artist took over in the best possible way.'
      },
      {
        id: 402,
        author: 'Priya S.',
        postedAt: 'June 5, 2023',
        rating: 5,
        text: 'Fast and emotional. The family scenes hit as hard as the action set pieces.'
      },
      {
        id: 403,
        author: 'Ethan L.',
        postedAt: 'June 11, 2023',
        rating: 4,
        text: 'Amazing movie. Just be prepared for a major part-one style ending.'
      }
    ],
    communityThen: [
      'Early reactions centered on animation innovation and emotional momentum.',
      'Canon-event discourse spread quickly across fan forums after opening weekend.',
      'Many threads compared character redesign choices between universes.'
    ],
    communityNow: [
      'Fans now track sequel release speculation and unresolved cliffhanger details.',
      'Theory posts map multiverse rules and exceptions with frame-by-frame evidence.',
      'Conversation remains active around Miguel motives and timeline ethics.'
    ],
    theories: [
      'What if canon events are a control mechanism rather than a natural law?',
      'Could Spot become less villain and more unstable antihero in the next chapter?',
      'Is Earth-42 a setup for a mirrored origin arc instead of pure dystopia?'
    ],
    scenarioSeeds: [
      'Miles allies with an unexpected Spider-team faction from Earth-42.',
      'Gwen takes command of an independent network outside Miguel authority.',
      'The next movie opens with Spot perspective before shifting back to Miles.'
    ]
  },
  {
    slug: 'everything-everywhere-all-at-once',
    title: 'Everything Everywhere All at Once',
    year: 2022,
    genres: ['Sci-Fi', 'Comedy', 'Drama'],
    runtime: 139,
    criticScore: 94,
    summary:
      'A maximalist multiverse film that balances absurd comedy with intimate family conflict and grief.',
    verdict:
      'Watch when you want emotional payoff under chaotic creativity. It rewards viewers who embrace tonal swings.',
    userReviews: [
      {
        id: 501,
        author: 'Ariel N.',
        postedAt: 'April 4, 2022',
        rating: 5,
        text: 'Ridiculous and heartfelt in equal measure. I have never seen another movie like it.'
      },
      {
        id: 502,
        author: 'Mohan J.',
        postedAt: 'April 9, 2022',
        rating: 5,
        text: 'The action is great, but the mother-daughter story is what stays with you.'
      },
      {
        id: 503,
        author: 'Ivy L.',
        postedAt: 'April 15, 2022',
        rating: 4,
        text: 'Wild pacing and visuals. Dense, but very rewarding by the end.'
      }
    ],
    communityThen: [
      'Viewers quickly rallied around its emotional core despite experimental structure.',
      'Hotdog-hands universe became both meme material and genuine thematic discussion.',
      'Fan essays unpacked nihilism vs kindness as the movie central argument.'
    ],
    communityNow: [
      'Current talk revisits how it influenced newer multiverse storytelling approaches.',
      'People still debate which universe transitions carry the strongest emotional weight.',
      'Discussion around Waymond kindness philosophy remains highly active.'
    ],
    theories: [
      'What if the bagel is less a weapon and more a shared perception metaphor?',
      'Could a sequel work as an anthology of unresolved side universes?',
      'Is the final laundromat scene evidence of a stable merged timeline?'
    ],
    scenarioSeeds: [
      'Joy and Evelyn open a cross-universe support hotline.',
      'Waymond discovers a universe where conflict never escalated in the first place.',
      'Alpha Waymond returns with a new threat tied to memory drift.'
    ]
  },
  {
    slug: 'past-lives',
    title: 'Past Lives',
    year: 2023,
    genres: ['Drama', 'Romance'],
    runtime: 106,
    criticScore: 96,
    summary:
      'A quiet relationship drama about migration, identity, and timing with exceptional restraint.',
    verdict:
      'Perfect if you want nuanced emotional storytelling and reflective pacing over spectacle.',
    userReviews: [
      {
        id: 601,
        author: 'Helena F.',
        postedAt: 'June 17, 2023',
        rating: 5,
        text: 'Subtle but devastating. Dialogue and silence are equally meaningful.'
      },
      {
        id: 602,
        author: 'Noah E.',
        postedAt: 'June 24, 2023',
        rating: 4,
        text: 'A very gentle movie that leaves a huge emotional impact afterward.'
      },
      {
        id: 603,
        author: 'Rhea M.',
        postedAt: 'July 1, 2023',
        rating: 5,
        text: 'The ending is one of the strongest emotional closes I have seen in years.'
      }
    ],
    communityThen: [
      'Initial discussion praised restraint and the realism of unresolved feeling.',
      'Many viewers debated who, if anyone, made the right choice in the ending.',
      'In-Yun concept became a major anchor in audience interpretation.'
    ],
    communityNow: [
      'People continue discussing the film as a benchmark for modern romantic drama.',
      'Current threads focus on immigrant identity portrayal and language shifts.',
      'Viewers keep revisiting final-scene framing for hidden intent cues.'
    ],
    theories: [
      'What if the narrative is designed as memory reconstruction rather than objective events?',
      'Could each reunion represent a different emotional timeline rather than strict chronology?',
      'Is Arthur perspective intentionally understated to mirror Nora internal conflict?'
    ],
    scenarioSeeds: [
      'Nora and Hae Sung reconnect years later as collaborators rather than lovers.',
      'Arthur narrates the same events from his own private journal.',
      'A final chapter explores parallel life paths in a second city.'
    ]
  }
]

export function findMovieBySlug(movieSlug: string) {
  return movieCatalog.find((movie) => movie.slug === movieSlug)
}

export function normalizeTitle(value: string) {
  return value.trim().toLowerCase()
}
