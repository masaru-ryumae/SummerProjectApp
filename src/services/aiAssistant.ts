export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  typing?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AIResponse {
  content: string;
  suggestedActions?: any[];
  relatedTopics?: string[];
}

class AIAssistantService {
  private conversationHistory: Conversation[] = [];
  private currentConversation: Conversation | null = null;

  constructor() {
    this.loadConversations();
  }

  private loadConversations(): void {
    const stored = localStorage.getItem('ai_conversations');
    if (stored) {
      this.conversationHistory = JSON.parse(stored);
    }
  }

  private saveConversations(): void {
    localStorage.setItem('ai_conversations', JSON.stringify(this.conversationHistory));
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createConversation(title?: string): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
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

  getConversations(): Conversation[] {
    return this.conversationHistory;
  }

  getConversation(conversationId: string): Conversation | null {
    return this.conversationHistory.find(c => c.id === conversationId) || null;
  }

  setCurrentConversation(conversationId: string): boolean {
    const conversation = this.getConversation(conversationId);
    if (conversation) {
      this.currentConversation = conversation;
      return true;
    }
    return false;
  }

  getCurrentConversation(): Conversation | null {
    return this.currentConversation;
  }

  deleteConversation(conversationId: string): void {
    this.conversationHistory = this.conversationHistory.filter(c => c.id !== conversationId);
    if (this.currentConversation?.id === conversationId) {
      this.currentConversation = this.conversationHistory[0] || null;
    }
    this.saveConversations();
  }

  addMessage(content: string, role: 'user' | 'assistant'): Message | null {
    if (!this.currentConversation) {
      return null;
    }

    const message: Message = {
      id: this.generateId(),
      role,
      content,
      timestamp: Date.now()
    };

    this.currentConversation.messages.push(message);
    this.currentConversation.updatedAt = Date.now();
    this.saveConversations();
    return message;
  }

  getMessages(): Message[] {
    return this.currentConversation?.messages || [];
  }

  async generateResponse(userMessage: string): Promise<AIResponse> {
    const responses: { [key: string]: string } = {
      'project': 'Great question about your project! Focus on: 1) MVP scope, 2) Milestones/sprints, 3) Early testing, 4) API documentation. Would you like help?',
      'code': 'Your code looks good! Consider: memoization with useMemo, React.lazy for code splitting, pagination for lists, and PropTypes/TypeScript for type safety.',
      'debug': 'Common causes: state mutations, missing hook dependencies, event listeners not cleaning up, or async operations after unmount. Check console for errors.',
      'learn': 'Great initiative! Learning progression: Phase 1 - Fundamentals (Weeks 1-2), Phase 2 - Intermediate (Weeks 3-4), Phase 3 - Mastery (Weeks 5-8).',
      'help': 'I can help with: explaining topics, debugging errors, learning paths, code review, optimization, and best practices!'
    };

    let selectedResponse = responses['help'];
    for (const keyword of Object.keys(responses)) {
      if (userMessage.toLowerCase().includes(keyword)) {
        selectedResponse = responses[keyword];
        break;
      }
    }

    return {
      content: selectedResponse,
      suggestedActions: [],
      relatedTopics: []
    };
  }

  exportConversation(conversationId: string): string | null {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return null;

    let markdown = `# ${conversation.title}\n\n`;
    markdown += `_Created: ${new Date(conversation.createdAt).toLocaleString()}_\n\n`;

    for (const message of conversation.messages) {
      const role = message.role === 'user' ? 'You' : 'Assistant';
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      markdown += `## ${role} _(${timestamp})_\n\n`;
      markdown += `${message.content}\n\n---\n\n`;
    }

    return markdown;
  }

  exportConversationJSON(conversationId: string): string | null {
    const conversation = this.getConversation(conversationId);
    if (!conversation) return null;
    return JSON.stringify(conversation, null, 2);
  }

  clearAllConversations(): void {
    this.conversationHistory = [];
    this.currentConversation = null;
    this.saveConversations();
  }
}

export const aiAssistantService = new AIAssistantService();
export default aiAssistantService;
