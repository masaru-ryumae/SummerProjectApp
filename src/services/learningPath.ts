export interface LearningPath {
  id: string;
  goal: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDays: number;
  prerequisites: string[];
  steps: any[];
  milestones: any[];
  resources: any[];
  createdAt: number;
}

class LearningPathGeneratorService {
  private learningPaths: LearningPath[] = [];

  constructor() {
    this.loadLearningPaths();
  }

  generateLearningPath(goal: string, currentSkills?: string[], targetLevel?: string): LearningPath {
    const difficulty = this.assessDifficulty(goal, currentSkills);
    const prerequisites = this.identifyPrerequisites(goal, currentSkills || []);

    const steps = Array.from({ length: 5 }, (_, i) => ({
      id: this.generateId(),
      number: i + 1,
      title: `Step ${i + 1}: ${goal}`,
      description: `Learn aspect ${i + 1} of ${goal}`,
      estimatedTime: 300,
      topics: ['Core concepts', 'Practice', 'Examples'],
      resources: [],
      completed: false
    }));

    const milestones = Array.from({ length: 4 }, (_, i) => ({
      number: i + 1,
      stepRange: { from: i + 1, to: i + 2 },
      title: `Milestone ${i + 1}`,
      description: `Complete steps ${i + 1} to ${i + 2}`,
      requirements: [`Complete steps ${i + 1} to ${i + 2}`],
      estimatedTime: 600,
      completed: false
    }));

    const learningPath: LearningPath = {
      id: this.generateId(),
      goal,
      difficulty: (targetLevel as any) || difficulty,
      estimatedDays: 14,
      prerequisites,
      steps,
      milestones,
      resources: [],
      createdAt: Date.now()
    };

    this.learningPaths.push(learningPath);
    this.saveLearningPaths();
    return learningPath;
  }

  getLearningPaths(): LearningPath[] {
    return this.learningPaths;
  }

  getLearningPath(pathId: string): LearningPath | null {
    return this.learningPaths.find(p => p.id === pathId) || null;
  }

  completeStep(pathId: string, stepNumber: number): boolean {
    const path = this.getLearningPath(pathId);
    if (!path) return false;

    const step = path.steps.find((s: any) => s.number === stepNumber);
    if (step) {
      step.completed = true;
      this.saveLearningPaths();
      return true;
    }
    return false;
  }

  getProgress(pathId: string): { completed: number; total: number; percentage: number } {
    const path = this.getLearningPath(pathId);
    if (!path) return { completed: 0, total: 0, percentage: 0 };

    const completed = path.steps.filter((s: any) => s.completed).length;
    const total = path.steps.length;

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  }

  private assessDifficulty(goal: string, currentSkills?: string[]): 'beginner' | 'intermediate' | 'advanced' {
    const lowerGoal = goal.toLowerCase();
    if (['html', 'css', 'basics'].some(g => lowerGoal.includes(g))) return 'beginner';
    if (['advanced', 'optimization', 'architecture'].some(g => lowerGoal.includes(g))) return 'advanced';
    return 'intermediate';
  }

  private identifyPrerequisites(goal: string, currentSkills: string[]): string[] {
    const prerequisites: { [key: string]: string[] } = {
      'react': ['JavaScript', 'HTML', 'CSS'],
      'typescript': ['JavaScript'],
      'python': [],
      'web': ['HTML', 'CSS', 'JavaScript']
    };

    const lowerGoal = goal.toLowerCase();
    for (const [key, prereqs] of Object.entries(prerequisites)) {
      if (lowerGoal.includes(key)) {
        return prereqs.filter(p => !currentSkills.includes(p));
      }
    }

    return [];
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveLearningPaths(): void {
    localStorage.setItem('learning_paths', JSON.stringify(this.learningPaths));
  }

  private loadLearningPaths(): void {
    const stored = localStorage.getItem('learning_paths');
    if (stored) {
      this.learningPaths = JSON.parse(stored);
    }
  }

  exportAsMarkdown(pathId: string): string | null {
    const path = this.getLearningPath(pathId);
    if (!path) return null;

    let markdown = `# ${path.goal}\n\n`;
    markdown += `**Difficulty:** ${path.difficulty}\n`;
    markdown += `**Estimated Duration:** ${path.estimatedDays} days\n\n`;

    if (path.prerequisites.length > 0) {
      markdown += `## Prerequisites\n`;
      path.prerequisites.forEach(p => {
        markdown += `- ${p}\n`;
      });
      markdown += '\n';
    }

    markdown += `## Learning Steps\n\n`;
    path.steps.forEach((step: any) => {
      markdown += `### Step ${step.number}: ${step.title}\n`;
      markdown += `${step.description}\n\n`;
    });

    return markdown;
  }
}

export const learningPathService = new LearningPathGeneratorService();
export default learningPathService;
