import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';

export default function TeamChat({ teamId, teamMembers, onClose }) {
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [currentUser] = useState(() => {
    const user = localStorage.getItem('app_user');
    return user ? JSON.parse(user) : { id: 'anon', name: 'Anonymous' };
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadThreads();
  }, [teamId]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubMessage = chatService.on('message:sent', () => {
      if (selectedThread) {
        loadMessages(selectedThread.id);
      }
    });

    const unsubReaction = chatService.on('reaction:added', () => {
      if (selectedThread) {
        loadMessages(selectedThread.id);
      }
    });

    return () => {
      unsubMessage();
      unsubReaction();
    };
  }, [selectedThread]);

  const loadThreads = () => {
    const allThreads = chatService.getTeamThreads(teamId);
    setThreads(allThreads);
    if (allThreads.length > 0 && !selectedThread) {
      setSelectedThread(allThreads[0]);
    }
  };

  const loadMessages = (threadId) => {
    const thread = chatService.getThread(threadId);
    if (thread) {
      setMessages(thread.messages || []);
    }
  };

  const handleCreateThread = (e) => {
    e.preventDefault();
    if (!newThreadTitle.trim()) return;

    const thread = chatService.createThread(
      teamId,
      currentUser.id,
      currentUser.name || 'User',
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
      newThreadTitle
    );

    setThreads([...threads, thread]);
    setSelectedThread(thread);
    setNewThreadTitle('');
    setShowNewThread(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!selectedThread || !messageInput.trim()) return;

    const message = chatService.sendMessage(
      selectedThread.id,
      currentUser.id,
      currentUser.name || 'User',
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
      messageInput
    );

    setMessages([...messages, message]);
    setMessageInput('');
  };

  const handleAddReaction = (messageId, emoji) => {
    const message = chatService.addReaction(messageId, currentUser.id, emoji);
    if (message) {
      const updatedMessages = messages.map((m) => (m.id === messageId ? message : m));
      setMessages(updatedMessages);
    }
  };

  const getCurrentUserMessage = (message) => {
    return message.userId === currentUser.id;
  };

  const getReactionCount = (reaction) => {
    return reaction.userIds.length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-hidden flex">
        {/* Threads Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white">Discussions</h3>
            <button
              onClick={() => setShowNewThread(!showNewThread)}
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              +
            </button>
          </div>

          {showNewThread && (
            <form onSubmit={handleCreateThread} className="p-4 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Thread title"
                value={newThreadTitle}
                onChange={(e) => setNewThreadTitle(e.target.value)}
                autoFocus
                className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewThread(false)}
                  className="flex-1 px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left p-3 border-l-4 transition-colors ${
                  selectedThread?.id === thread.id
                    ? 'border-blue-600 bg-white dark:bg-gray-900 text-blue-600'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <h5 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                  {thread.title}
                </h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {thread.messages.length} messages
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedThread ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {selectedThread.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedThread.participants.length} participants
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        getCurrentUserMessage(message) ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs ${
                          getCurrentUserMessage(message)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        } rounded-lg p-3`}
                      >
                        {!getCurrentUserMessage(message) && (
                          <p className="text-xs font-semibold opacity-75 mb-1">
                            {message.userName}
                          </p>
                        )}
                        <p className="text-sm break-words">{message.content}</p>
                        {message.mentions.length > 0 && (
                          <p className="text-xs opacity-75 mt-1">
                            Mentioned: {message.mentions.join(', ')}
                          </p>
                        )}
                        <p className="text-xs opacity-60 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>

                        {/* Reactions */}
                        {message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction) => (
                              <button
                                key={reaction.emoji}
                                onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
                                title={reaction.userIds.join(', ')}
                              >
                                {reaction.emoji} {getReactionCount(reaction)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Reaction Add Button */}
                      {getCurrentUserMessage(message) && (
                        <div className="flex gap-1 items-center ml-2">
                          <button
                            onClick={() => handleAddReaction(message.id, '👍')}
                            className="text-lg hover:scale-110 transition-transform"
                            title="Like"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleAddReaction(message.id, '❤️')}
                            className="text-lg hover:scale-110 transition-transform"
                            title="Love"
                          >
                            ❤️
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message... (use @name to mention)"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 dark:text-gray-400">
              Select a thread to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
