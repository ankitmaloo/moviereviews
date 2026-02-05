import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MAX_FILE_CHARS = 12000

const srcDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(srcDir, '..', '..')
const skillsRoot = path.join(repoRoot, 'skills')

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

function clampContent(content) {
  if (content.length <= MAX_FILE_CHARS) {
    return content
  }

  return `${content.slice(0, MAX_FILE_CHARS)}\n...[truncated]`
}

async function loadSkillDirectory(dirPath) {
  const skillName = path.basename(dirPath)
  const skillFilePath = path.join(dirPath, 'SKILL.md')
  const skillContent = await readFileIfExists(skillFilePath)

  if (!skillContent) {
    return null
  }

  const files = [{ relativePath: 'SKILL.md', content: clampContent(skillContent) }]

  const agentConfigPath = path.join(dirPath, 'agents', 'openai.yaml')
  const agentConfig = await readFileIfExists(agentConfigPath)
  if (agentConfig) {
    files.push({ relativePath: 'agents/openai.yaml', content: clampContent(agentConfig) })
  }

  const referencesPath = path.join(dirPath, 'references')
  try {
    const referenceEntries = await fs.readdir(referencesPath, { withFileTypes: true })
    for (const entry of referenceEntries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) {
        continue
      }

      const filePath = path.join(referencesPath, entry.name)
      const content = await readFileIfExists(filePath)
      if (content) {
        files.push({
          relativePath: `references/${entry.name}`,
          content: clampContent(content)
        })
      }
    }
  } catch {
    // No references directory for this skill.
  }

  return {
    name: skillName,
    path: dirPath,
    files
  }
}

function serializeSkillsForPrompt(skills) {
  const sections = skills.map((skill) => {
    const fileBlocks = skill.files
      .map((file) => `FILE: ${skill.name}/${file.relativePath}\n${file.content}`)
      .join('\n\n')

    return `=== SKILL: ${skill.name} ===\n${fileBlocks}`
  })

  return sections.join('\n\n')
}

export async function loadSkillBundle() {
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true })
  const skillDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(skillsRoot, entry.name))
    .sort((a, b) => a.localeCompare(b))

  const loaded = await Promise.all(skillDirectories.map(loadSkillDirectory))
  const skills = loaded.filter(Boolean)

  return {
    skills,
    promptContext: serializeSkillsForPrompt(skills)
  }
}
