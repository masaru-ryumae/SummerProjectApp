import templatesData from '../data/templates.json';
import tutorialsData from '../data/tutorials.json';

export interface Template {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  rating: number;
  reviews: number;
  downloads: number;
  tools: string[];
  estimatedHours: number;
  included: string[];
  creator: string;
  creatorId: string;
  price: number;
  tags: string[];
}

export interface Tutorial {
  id: string;
  title: string;
  category: string;
  skill: string;
  topic: string;
  description: string;
  difficulty: string;
  duration: number;
  videoUrl: string;
  instructor: string;
  rating: number;
  views: number;
  tags: string[];
  codeSnippet?: string;
  stepByStep: string[];
}

export interface Creator {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  totalEarnings: number;
  totalDownloads: number;
  templates: number;
  tutorials: number;
  rating: number;
  followers: number;
}

export interface Recommendation {
  type: 'template' | 'tutorial';
  id: string;
  reason: string;
}

// Templates Service
export const templateService = {
  getAllTemplates: (): Template[] => templatesData,

  getTemplateById: (id: string): Template | undefined => {
    return templatesData.find(t => t.id === id);
  },

  filterTemplates: (filters: {
    category?: string;
    difficulty?: string;
    minRating?: number;
    maxPrice?: number;
    search?: string;
  }): Template[] => {
    let results = [...templatesData];

    if (filters.category) {
      results = results.filter(t => t.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.difficulty) {
      results = results.filter(t => t.difficulty === filters.difficulty);
    }

    if (filters.minRating) {
      results = results.filter(t => t.rating >= filters.minRating!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter(t => t.price <= filters.maxPrice!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return results;
  },

  searchTemplates: (query: string): Template[] => {
    return templateService.filterTemplates({ search: query });
  },

  getTemplatesByCategory: (category: string): Template[] => {
    return templatesData.filter(t => t.category === category);
  },

  getTopTemplates: (limit: number = 6): Template[] => {
    return [...templatesData]
      .sort((a, b) => (b.rating * b.downloads) - (a.rating * a.downloads))
      .slice(0, limit);
  },

  getTrendingTemplates: (limit: number = 6): Template[] => {
    return [...templatesData]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  },

  getCategories: (): string[] => {
    const categories = new Set(templatesData.map(t => t.category));
    return Array.from(categories).sort();
  },

  getDifficulties: (): string[] => ['beginner', 'intermediate', 'advanced'],

  cloneTemplate: async (templateId: string, projectName: string): Promise<any> => {
    const template = templateService.getTemplateById(templateId);
    if (!template) throw new Error('Template not found');

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          projectId: `project_${Date.now()}`,
          projectName,
          templateId,
          createdAt: new Date().toISOString(),
          items: template.included,
          status: 'ready'
        });
      }, 1000);
    });
  }
};

// Tutorials Service
export const tutorialService = {
  getAllTutorials: (): Tutorial[] => tutorialsData,

  getTutorialById: (id: string): Tutorial | undefined => {
    return tutorialsData.find(t => t.id === id);
  },

  filterTutorials: (filters: {
    category?: string;
    skill?: string;
    topic?: string;
    difficulty?: string;
    minRating?: number;
    search?: string;
  }): Tutorial[] => {
    let results = [...tutorialsData];

    if (filters.category) {
      results = results.filter(t => t.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters.skill) {
      results = results.filter(t => t.skill === filters.skill);
    }

    if (filters.topic) {
      results = results.filter(t => t.topic.toLowerCase() === filters.topic!.toLowerCase());
    }

    if (filters.difficulty) {
      results = results.filter(t => t.difficulty === filters.difficulty);
    }

    if (filters.minRating) {
      results = results.filter(t => t.rating >= filters.minRating!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return results;
  },

  searchTutorials: (query: string): Tutorial[] => {
    return tutorialService.filterTutorials({ search: query });
  },

  getTutorialsByCategory: (category: string): Tutorial[] => {
    return tutorialsData.filter(t => t.category === category);
  },

  getTutorialsBySkill: (skill: string): Tutorial[] => {
    return tutorialsData.filter(t => t.skill === skill);
  },

  getTopTutorials: (limit: number = 6): Tutorial[] => {
    return [...tutorialsData]
      .sort((a, b) => (b.rating * b.views) - (a.rating * a.views))
      .slice(0, limit);
  },

  getMostViewedTutorials: (limit: number = 6): Tutorial[] => {
    return [...tutorialsData]
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  },

  getCategories: (): string[] => {
    const categories = new Set(tutorialsData.map(t => t.category));
    return Array.from(categories).sort();
  },

  getSkills: (): string[] => {
    const skills = new Set(tutorialsData.map(t => t.skill));
    return Array.from(skills).sort();
  },

  getTopics: (): string[] => {
    const topics = new Set(tutorialsData.map(t => t.topic));
    return Array.from(topics).sort();
  },

  markAsCompleted: async (tutorialId: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          tutorialId,
          completedAt: new Date().toISOString(),
          certificateUrl: `https://example.com/cert/${tutorialId}`
        });
      }, 500);
    });
  }
};

// Recommendations Service
export const recommendationService = {
  getRelatedTemplates: (templateId: string, limit: number = 3): Template[] => {
    const template = templateService.getTemplateById(templateId);
    if (!template) return [];

    return templateService.filterTemplates({
      category: template.category
    })
      .filter(t => t.id !== templateId)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },

  getRelatedTutorials: (tutorialId: string, limit: number = 3): Tutorial[] => {
    const tutorial = tutorialService.getTutorialById(tutorialId);
    if (!tutorial) return [];

    return tutorialService.filterTutorials({
      topic: tutorial.topic
    })
      .filter(t => t.id !== tutorialId)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  },

  getNextStepRecommendations: (completedId: string, isTemplate: boolean): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (isTemplate) {
      const template = templateService.getTemplateById(completedId);
      if (template) {
        const tutorials = tutorialService.filterTutorials({
          topic: template.category,
          skill: 'Intermediate'
        }).slice(0, 2);
        tutorials.forEach(t => {
          recommendations.push({
            type: 'tutorial',
            id: t.id,
            reason: 'Learn more skills for this project type'
          });
        });
      }
    } else {
      const tutorial = tutorialService.getTutorialById(completedId);
      if (tutorial) {
        const templates = templateService.filterTemplates({
          category: tutorial.category,
          difficulty: tutorial.difficulty
        }).slice(0, 2);
        templates.forEach(t => {
          recommendations.push({
            type: 'template',
            id: t.id,
            reason: 'Practice with a complete template'
          });
        });
      }
    }

    return recommendations;
  },

  getCuratedPicks: (limit: number = 6): (Template | Tutorial)[] => {
    const picks: (Template | Tutorial)[] = [];
    const topTemplates = templateService.getTopTemplates(3);
    const topTutorials = tutorialService.getTopTutorials(3);

    return [...topTemplates, ...topTutorials].slice(0, limit);
  },

  getPersonalizedRecommendations: (userPreferences: {
    favoriteCategories?: string[];
    skillLevel?: string;
    preferredTools?: string[];
  }, limit: number = 6): (Template | Tutorial)[] => {
    const recommendations: (Template | Tutorial)[] = [];

    if (userPreferences.favoriteCategories) {
      for (const category of userPreferences.favoriteCategories) {
        const templates = templateService.filterTemplates({
          category,
          difficulty: userPreferences.skillLevel
        });
        recommendations.push(...templates);
      }
    }

    return recommendations
      .sort((a, b) => {
        const aRating = 'rating' in a ? a.rating : 0;
        const bRating = 'rating' in b ? b.rating : 0;
        return bRating - aRating;
      })
      .slice(0, limit);
  }
};

// Creator Service (Mock)
export const creatorService = {
  getCreatorStats: (creatorId: string): Creator | null => {
    const templates = templatesData.filter(t => t.creatorId === creatorId);
    if (templates.length === 0) return null;

    const totalEarnings = templates.reduce((sum, t) => {
      return sum + (t.price * t.downloads * 0.3);
    }, 0);

    const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0);
    const avgRating = templates.reduce((sum, t) => sum + t.rating, 0) / templates.length;

    return {
      id: creatorId,
      name: templates[0].creator,
      bio: `Creator of ${templates.length} high-quality templates`,
      avatar: `https://ui-avatars.com/api/?name=${templates[0].creator}&background=random`,
      totalEarnings: Math.round(totalEarnings),
      totalDownloads,
      templates: templates.length,
      tutorials: 0,
      rating: Math.round(avgRating * 10) / 10,
      followers: Math.floor(totalDownloads / 10)
    };
  },

  getTopCreators: (limit: number = 5): Creator[] => {
    const creatorIds = new Set(templatesData.map(t => t.creatorId));
    const creators = Array.from(creatorIds)
      .map(id => creatorService.getCreatorStats(id))
      .filter((c): c is Creator => c !== null)
      .sort((a, b) => b.totalEarnings - a.totalEarnings);

    return creators.slice(0, limit);
  },

  processPayment: async (amount: number, creatorId: string): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactionId: `txn_${Date.now()}`,
          amount,
          creatorId,
          status: 'completed',
          timestamp: new Date().toISOString()
        });
      }, 2000);
    });
  },

  uploadTemplate: async (templateData: any): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          templateId: `template_${Date.now()}`,
          status: 'published',
          url: `/templates/${Date.now()}`,
          createdAt: new Date().toISOString()
        });
      }, 1500);
    });
  }
};
