/**
 * Tutorial Service
 * Handles tutorial creation, management, publishing, and SEO optimization
 */

interface TutorialStep {
  id: number
  title: string
  content: string
  type: 'text' | 'code' | 'image' | 'video' | 'quiz'
}

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps: TutorialStep[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  tags: string[]
  featured: boolean
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
}

export const validateTutorial = (tutorial: Partial<Tutorial>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  if (!tutorial.title?.trim()) errors.push('Tutorial title is required')
  if (!tutorial.steps || tutorial.steps.length === 0) errors.push('At least one step is required')
  if (tutorial.steps?.some(step => !step.title.trim())) errors.push('All steps must have a title')
  return { isValid: errors.length === 0, errors }
}

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const calculateReadingTime = (tutorial: Tutorial): number => {
  let totalWords = 0
  tutorial.steps.forEach(step => {
    if (step.type === 'text' || step.type === 'code') {
      totalWords += step.content.split(/\s+/).length
    }
  })
  return Math.ceil(totalWords / 200)
}

export const exportToMarkdown = (tutorial: Tutorial): string => {
  let markdown = `# ${tutorial.title}\n\n`
  markdown += `**Difficulty:** ${tutorial.difficulty} | **Time:** ${tutorial.estimatedTime} min\n\n`
  tutorial.steps.forEach((step, idx) => {
    markdown += `## Step ${idx + 1}: ${step.title}\n\n${step.content}\n\n`
  })
  return markdown
}

export const tutorialStorage = {
  save: (tutorial: Tutorial): void => {
    const tutorials = tutorialStorage.getAll()
    const index = tutorials.findIndex(t => t.id === tutorial.id)
    if (index >= 0) {
      tutorials[index] = tutorial
    } else {
      tutorials.push(tutorial)
    }
    localStorage.setItem('tutorials', JSON.stringify(tutorials))
  },

  getAll: (): Tutorial[] => {
    const data = localStorage.getItem('tutorials')
    return data ? JSON.parse(data) : []
  },

  getById: (id: string): Tutorial | null => {
    const tutorials = tutorialStorage.getAll()
    return tutorials.find(t => t.id === id) || null
  },

  delete: (id: string): void => {
    const tutorials = tutorialStorage.getAll().filter(t => t.id !== id)
    localStorage.setItem('tutorials', JSON.stringify(tutorials))
  }
}

export default {
  validateTutorial,
  generateSlug,
  calculateReadingTime,
  exportToMarkdown,
  tutorialStorage
}
