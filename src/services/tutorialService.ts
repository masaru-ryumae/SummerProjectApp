interface Tutorial {
  id: string; title: string; description: string; category: string; difficulty: string; estimatedTime: string; steps: any[]; seoTitle: string; seoDescription: string; seoKeywords: string; tags: string[]; featured: boolean; createdAt: string; updatedAt: string; status: string
}
export const validateTutorial = (tutorial: Partial<Tutorial>) => ({ isValid: !!(tutorial.title?.trim() && tutorial.steps?.length > 0), errors: [] })
export const generateSlug = (title: string) => title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
export const calculateReadingTime = (tutorial: Tutorial) => Math.ceil(tutorial.steps.reduce((sum, s) => sum + (s.content?.split(/\s+/).length || 0), 0) / 200)
export const tutorialStorage = { save: (t: Tutorial) => localStorage.setItem('tutorials', JSON.stringify([...(JSON.parse(localStorage.getItem('tutorials') || '[]')), t])), getAll: () => JSON.parse(localStorage.getItem('tutorials') || '[]') }
