export class LearningPathGeneratorService {
  private paths: any[] = [];

  constructor() {
    const stored = localStorage.getItem('learning_paths');
    if (stored) this.paths = JSON.parse(stored);
  }

  generateLearningPath(goal: string, skills?: string[]) {
    const path = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      goal,
      difficulty: this.assessDifficulty(goal),
      estimatedDays: 14,
      prerequisites: this.identifyPrerequisites(goal, skills || []),
      steps: this.generateSteps(goal),
      milestones: this.generateMilestones(),
      resources: [],
      createdAt: Date.now()
    };
    this.paths.push(path);
    this.save();
    return path;
  }

  private generateSteps(goal: string) {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `step_${i}`,
      number: i + 1,
      title: `Step ${i + 1}: ${goal}`,
      description: `Learn aspect ${i + 1}`,
      estimatedTime: 300,
      topics: ['Core', 'Practice'],
      resources: [],
      completed: false
    }));
  }

  private generateMilestones() {
    return Array.from({ length: 4 }, (_, i) => ({
      number: i + 1,
      stepRange: { from: i + 1, to: i + 2 },
      title: `Milestone ${i + 1}`,
      description: `Steps ${i + 1}-${i + 2}`,
      estimatedTime: 600,
      completed: false
    }));
  }

  private assessDifficulty(goal: string) {
    const lower = goal.toLowerCase();
    if (['html', 'css', 'basics'].some(g => lower.includes(g))) return 'beginner';
    if (['advanced', 'optimization'].some(g => lower.includes(g))) return 'advanced';
    return 'intermediate';
  }

  private identifyPrerequisites(goal: string, skills: string[]) {
    const reqs: any = {
      'react': ['JavaScript', 'HTML', 'CSS'],
      'python': [],
      'web': ['HTML', 'CSS', 'JavaScript']
    };
    const lower = goal.toLowerCase();
    for (const [key, val] of Object.entries(reqs)) {
      if (lower.includes(key)) return (val as string[]).filter(p => !skills.includes(p));
    }
    return [];
  }

  getLearningPaths() { return this.paths; }
  getLearningPath(id: string) { return this.paths.find(p => p.id === id) || null; }
  completeStep(pathId: string, step: number) {
    const p = this.getLearningPath(pathId);
    if (p) {
      const s = p.steps.find((s: any) => s.number === step);
      if (s) { s.completed = true; this.save(); return true; }
    }
    return false;
  }
  getProgress(pathId: string) {
    const p = this.getLearningPath(pathId);
    if (!p) return { completed: 0, total: 0, percentage: 0 };
    const completed = p.steps.filter((s: any) => s.completed).length;
    return { completed, total: p.steps.length, percentage: Math.round(completed / p.steps.length * 100) };
  }
  exportAsMarkdown(pathId: string) {
    const p = this.getLearningPath(pathId);
    if (!p) return null;
    let md = `# ${p.goal}\n\n**Difficulty:** ${p.difficulty}\n**Days:** ${p.estimatedDays}\n\n`;
    p.steps.forEach((s: any) => {
      md += `### Step ${s.number}: ${s.title}\n${s.description}\n\n`;
    });
    return md;
  }
  private save() {
    localStorage.setItem('learning_paths', JSON.stringify(this.paths));
  }
}

export const learningPathService = new LearningPathGeneratorService();
export default learningPathService;
