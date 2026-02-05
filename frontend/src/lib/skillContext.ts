import fastapiSkill from '../../../skills/fastapi-backend/SKILL.md?raw'
import frontendDesignSkill from '../../../skills/frontend-design/SKILL.md?raw'
import movieQuizSkill from '../../../skills/movie-taste-binary-quiz/SKILL.md?raw'
import movieQuizAgent from '../../../skills/movie-taste-binary-quiz/agents/openai.yaml?raw'
import movieQuizQuestions from '../../../skills/movie-taste-binary-quiz/references/question-bank.md?raw'
import movieProfilerSkill from '../../../skills/movie-taste-profiler/SKILL.md?raw'
import movieProfilerAgent from '../../../skills/movie-taste-profiler/agents/openai.yaml?raw'
import movieProfilerAxes from '../../../skills/movie-taste-profiler/references/taste-axes.md?raw'
import viteFrontendSkill from '../../../skills/vite-frontend-dev/SKILL.md?raw'

type SkillFile = {
  path: string
  content: string
}

type SkillBundle = {
  name: string
  files: SkillFile[]
}

const skillBundles: SkillBundle[] = [
  {
    name: 'fastapi-backend',
    files: [{ path: 'skills/fastapi-backend/SKILL.md', content: fastapiSkill }]
  },
  {
    name: 'frontend-design',
    files: [{ path: 'skills/frontend-design/SKILL.md', content: frontendDesignSkill }]
  },
  {
    name: 'movie-taste-binary-quiz',
    files: [
      { path: 'skills/movie-taste-binary-quiz/SKILL.md', content: movieQuizSkill },
      { path: 'skills/movie-taste-binary-quiz/agents/openai.yaml', content: movieQuizAgent },
      { path: 'skills/movie-taste-binary-quiz/references/question-bank.md', content: movieQuizQuestions }
    ]
  },
  {
    name: 'movie-taste-profiler',
    files: [
      { path: 'skills/movie-taste-profiler/SKILL.md', content: movieProfilerSkill },
      { path: 'skills/movie-taste-profiler/agents/openai.yaml', content: movieProfilerAgent },
      { path: 'skills/movie-taste-profiler/references/taste-axes.md', content: movieProfilerAxes }
    ]
  },
  {
    name: 'vite-frontend-dev',
    files: [{ path: 'skills/vite-frontend-dev/SKILL.md', content: viteFrontendSkill }]
  }
]

function truncate(text: string, maxChars = 3500) {
  if (text.length <= maxChars) {
    return text
  }
  return `${text.slice(0, maxChars)}\n...[truncated]`
}

export function listLoadedSkills() {
  return skillBundles.map((bundle) => bundle.name)
}

export function skillContextForPrompt() {
  return skillBundles
    .map((bundle) => {
      const files = bundle.files
        .map((file) => `FILE: ${file.path}\n${truncate(file.content)}`)
        .join('\n\n')
      return `=== SKILL BUNDLE: ${bundle.name} ===\n${files}`
    })
    .join('\n\n')
}
