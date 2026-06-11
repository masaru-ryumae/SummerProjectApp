/**
 * CMS Service
 * Handles content management with workflow, versioning, scheduling, and analytics
 */

interface ContentVersion {
  version: number
  timestamp: string
  status: 'draft' | 'review' | 'published' | 'archived' | 'scheduled'
}

interface CMSContent {
  id: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  status: 'draft' | 'review' | 'published' | 'archived' | 'scheduled'
  version: number
  createdAt: string
  updatedAt: string
  scheduledFor?: string
  views: number
  engagement: number
  seoOptimized: boolean
}

export const validateContent = (content: Partial<CMSContent>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  if (!content.title?.trim()) errors.push('Title is required')
  if (!content.content?.trim()) errors.push('Content is required')
  if (content.title && content.title.length > 200) errors.push('Title must be 200 characters or less')
  return { isValid: errors.length === 0, errors }
}

export const publishContent = (content: CMSContent): CMSContent => {
  const validation = validateContent(content)
  if (!validation.isValid) throw new Error(validation.errors.join(', '))
  return {
    ...content,
    status: 'published',
    updatedAt: new Date().toISOString()
  }
}

export const archiveContent = (content: CMSContent): CMSContent => {
  return {
    ...content,
    status: 'archived',
    updatedAt: new Date().toISOString()
  }
}

export const calculateSEOScore = (content: CMSContent): number => {
  let score = 0
  if (content.title.length >= 30 && content.title.length <= 60) score += 20
  if (content.description.length >= 120 && content.description.length <= 160) score += 20
  const wordCount = content.content.split(/\s+/).length
  if (wordCount >= 300) score += 20
  if (content.tags.length >= 3) score += 20
  if (content.seoOptimized) score += 20
  return Math.min(score, 100)
}

export const contentStorage = {
  save: (content: CMSContent): void => {
    const allContent = contentStorage.getAll()
    const index = allContent.findIndex(c => c.id === content.id)
    if (index >= 0) {
      allContent[index] = content
    } else {
      allContent.push(content)
    }
    localStorage.setItem('cms_content', JSON.stringify(allContent))
  },

  getAll: (): CMSContent[] => {
    const data = localStorage.getItem('cms_content')
    return data ? JSON.parse(data) : []
  },

  getById: (id: string): CMSContent | null => {
    const allContent = contentStorage.getAll()
    return allContent.find(c => c.id === id) || null
  },

  delete: (id: string): void => {
    const allContent = contentStorage.getAll().filter(c => c.id !== id)
    localStorage.setItem('cms_content', JSON.stringify(allContent))
  },

  getByStatus: (status: string): CMSContent[] => {
    return contentStorage.getAll().filter(c => c.status === status)
  }
}

export default {
  validateContent,
  publishContent,
  archiveContent,
  calculateSEOScore,
  contentStorage
}
