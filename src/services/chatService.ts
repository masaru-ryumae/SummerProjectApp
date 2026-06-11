/**
 * Chat Service - Handles team chat and collaboration messaging
 * Supports real-time chat, mentions, reactions, and discussion threads
 */

export interface ChatMessage {
  id: string;
  teamId: string;
  threadId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  mentions: string[];
  reactions: { emoji: string; userIds: string[] }[];
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
}

export interface ChatThread {
  id: string;
  teamId: string;
  projectId?: string;
  title: string;
  createdBy: string;
  createdAt: string;
  messages: ChatMessage[];
  participants: string[];
  archived: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface MentionNotification {
  id: string;
  userId: string;
  mentionedBy: string;
  messageId: string;
  threadId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

class ChatService {
  private messages: Map<string, ChatMessage> = new Map();
  private threads: Map<string, ChatThread> = new Map();
  private notifications: MentionNotification[] = [];
  private storageKey = 'chat_data';
  private threadsKey = 'chat_threads';
  private notificationsKey = 'chat_notifications';

  // Simulate WebSocket for real-time updates
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const msgData = localStorage.getItem(this.storageKey);
      const threadData = localStorage.getItem(this.threadsKey);
      const notifData = localStorage.getItem(this.notificationsKey);

      if (msgData) {
        const parsed = JSON.parse(msgData);
        this.messages = new Map(Object.entries(parsed));
      }
      if (threadData) {
        const parsed = JSON.parse(threadData);
        this.threads = new Map(Object.entries(parsed));
      }
      if (notifData) {
        this.notifications = JSON.parse(notifData);
      }
    } catch (error) {
      console.error('Error loading chat data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const msgData = Object.fromEntries(this.messages);
      const threadData = Object.fromEntries(this.threads);
      localStorage.setItem(this.storageKey, JSON.stringify(msgData));
      localStorage.setItem(this.threadsKey, JSON.stringify(threadData));
      localStorage.setItem(this.notificationsKey, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving chat data to storage:', error);
    }
  }

  private parseMentions(content: string): string[] {
    const mentionPattern = /@(\w+)/g;
    const matches = content.match(mentionPattern) || [];
    return matches.map(m => m.slice(1)); // Remove @ symbol
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  createThread(
    teamId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    title: string,
    projectId?: string
  ): ChatThread {
    const thread: ChatThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      projectId,
      title,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      messages: [],
      participants: [userId],
      archived: false
    };

    this.threads.set(thread.id, thread);
    this.saveToStorage();
    this.notifyListeners('thread:created', thread);
    return thread;
  }

  getThread(threadId: string): ChatThread | null {
    return this.threads.get(threadId) || null;
  }

  getTeamThreads(teamId: string): ChatThread[] {
    return Array.from(this.threads.values())
      .filter(t => t.teamId === teamId && !t.archived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getProjectThreads(projectId: string): ChatThread[] {
    return Array.from(this.threads.values())
      .filter(t => t.projectId === projectId && !t.archived)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  sendMessage(
    threadId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string
  ): ChatMessage {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error('Thread not found');

    const mentions = this.parseMentions(content);

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId: thread.teamId,
      threadId,
      userId,
      userName,
      userAvatar,
      content,
      mentions,
      reactions: [],
      timestamp: new Date().toISOString()
    };

    this.messages.set(message.id, message);
    thread.messages.push(message);

    // Add user to participants if not already there
    if (!thread.participants.includes(userId)) {
      thread.participants.push(userId);
    }

    // Create mention notifications
    mentions.forEach(mention => {
      const notification: MentionNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: mention,
        mentionedBy: userId,
        messageId: message.id,
        threadId,
        content: content.substring(0, 100),
        read: false,
        createdAt: new Date().toISOString()
      };
      this.notifications.push(notification);
    });

    this.saveToStorage();
    this.notifyListeners('message:sent', message);
    return message;
  }

  addReaction(messageId: string, userId: string, emoji: string): ChatMessage | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    let reaction = message.reactions.find(r => r.emoji === emoji);
    if (!reaction) {
      reaction = { emoji, userIds: [] };
      message.reactions.push(reaction);
    }

    if (!reaction.userIds.includes(userId)) {
      reaction.userIds.push(userId);
    }

    this.saveToStorage();
    this.notifyListeners('reaction:added', { messageId, emoji, userId });
    return message;
  }

  removeReaction(messageId: string, userId: string, emoji: string): ChatMessage | null {
    const message = this.messages.get(messageId);
    if (!message) return null;

    const reaction = message.reactions.find(r => r.emoji === emoji);
    if (reaction) {
      reaction.userIds = reaction.userIds.filter(id => id !== userId);
      if (reaction.userIds.length === 0) {
        message.reactions = message.reactions.filter(r => r.emoji !== emoji);
      }
    }

    this.saveToStorage();
    this.notifyListeners('reaction:removed', { messageId, emoji, userId });
    return message;
  }

  editMessage(messageId: string, userId: string, newContent: string): ChatMessage | null {
    const message = this.messages.get(messageId);
    if (!message) return null;
    if (message.userId !== userId) throw new Error('Can only edit your own messages');

    message.content = newContent;
    message.edited = true;
    message.editedAt = new Date().toISOString();
    message.mentions = this.parseMentions(newContent);

    this.saveToStorage();
    this.notifyListeners('message:edited', message);
    return message;
  }

  deleteMessage(messageId: string, userId: string): boolean {
    const message = this.messages.get(messageId);
    if (!message) return false;
    if (message.userId !== userId) throw new Error('Can only delete your own messages');

    this.messages.delete(messageId);

    // Remove from thread
    const thread = this.threads.get(message.threadId || '');
    if (thread) {
      thread.messages = thread.messages.filter(m => m.id !== messageId);
    }

    this.saveToStorage();
    this.notifyListeners('message:deleted', { messageId });
    return true;
  }

  getThreadMessages(threadId: string): ChatMessage[] {
    const thread = this.threads.get(threadId);
    return thread ? thread.messages : [];
  }

  getMentionNotifications(userId: string): MentionNotification[] {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
    }
  }

  archiveThread(threadId: string, userId: string): void {
    const thread = this.threads.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.createdBy !== userId) throw new Error('Only creator can archive thread');

    thread.archived = true;
    this.saveToStorage();
    this.notifyListeners('thread:archived', threadId);
  }

  // Mock WebSocket listener
  on(event: string, callback: Function): Function {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
}

export const chatService = new ChatService();
