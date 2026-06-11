export class AIAssistantService {
  private conversationHistory: any[] = [];
  private currentConversation: any = null;

  constructor() {
    this.loadConversations();
  }

  private loadConversations() {
    const stored = localStorage.getItem('ai_conversations');
    if (stored) this.conversationHistory = JSON.parse(stored);
  }

  private saveConversations() {
    localStorage.setItem('ai_conversations', JSON.stringify(this.conversationHistory));
  }

  createConversation(title?: string) {
    const conversation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.conversationHistory.push(conversation);
    this.currentConversation = conversation;
    this.saveConversations();
    return conversation;
  }

  getConversations() { return this.conversationHistory; }
  getConversation(id: string) { return this.conversationHistory.find(c => c.id === id) || null; }
  setCurrentConversation(id: string) {
    const c = this.getConversation(id);
    if (c) { this.currentConversation = c; return true; }
    return false;
  }
  getCurrentConversation() { return this.currentConversation; }

  deleteConversation(id: string) {
    this.conversationHistory = this.conversationHistory.filter(c => c.id !== id);
    if (this.currentConversation?.id === id) this.currentConversation = this.conversationHistory[0] || null;
    this.saveConversations();
  }

  addMessage(content: string, role: string) {
    if (!this.currentConversation) return null;
    const message = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: Date.now()
    };
    this.currentConversation.messages.push(message);
    this.currentConversation.updatedAt = Date.now();
    this.saveConversations();
    return message;
  }

  getMessages() { return this.currentConversation?.messages || []; }

  async generateResponse(message: string) {
    const responses: any = {
      'project': 'Great question! Focus on: 1) MVP, 2) Sprints, 3) Testing, 4) Docs.',
      'code': 'Consider: memoization, code splitting, pagination, TypeScript.',
      'debug': 'Check: mutations, dependencies, cleanup, async issues.',
      'learn': 'Phase 1 (Weeks 1-2): Fundamentals. Phase 2 (3-4): Intermediate. Phase 3 (5-8): Mastery.',
      'help': 'I can help with explanations, debugging, learning, code review, and optimization!'
    };
    let selected = responses['help'];
    for (const [key, val] of Object.entries(responses)) {
      if (message.toLowerCase().includes(key)) { selected = val; break; }
    }
    return { content: selected, suggestedActions: [], relatedTopics: [] };
  }

  exportConversation(id: string) {
    const c = this.getConversation(id);
    if (!c) return null;
    let md = `# ${c.title}\n\n_Created: ${new Date(c.createdAt).toLocaleString()}_\n\n`;
    for (const msg of c.messages) {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      md += `## ${role}\n\n${msg.content}\n\n---\n\n`;
    }
    return md;
  }

  exportConversationJSON(id: string) {
    const c = this.getConversation(id);
    return c ? JSON.stringify(c, null, 2) : null;
  }
}

export const aiAssistantService = new AIAssistantService();
export default aiAssistantService;
