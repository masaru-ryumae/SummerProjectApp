import { useState, useEffect, useRef } from 'react';
import aiAssistantService from '../services/aiAssistant';

export default function AIAssistant({ onClose }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const convos = aiAssistantService.getConversations();
    setConversations(convos);
    if (convos.length === 0) {
      const newConvo = aiAssistantService.createConversation('Chat 1');
      setCurrentConversation(newConvo);
      setConversations([newConvo]);
    } else {
      aiAssistantService.setCurrentConversation(convos[0].id);
      setCurrentConversation(convos[0]);
      setMessages(convos[0].messages);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !currentConversation) return;
    const userMessage = inputValue;
    setInputValue('');
    aiAssistantService.addMessage(userMessage, 'user');
    setMessages([...aiAssistantService.getMessages()]);
    setIsLoading(true);
    try {
      const response = await aiAssistantService.generateResponse(userMessage);
      aiAssistantService.addMessage(response.content, 'assistant');
      setMessages([...aiAssistantService.getMessages()]);
      setConversations(aiAssistantService.getConversations());
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    const newConvo = aiAssistantService.createConversation(`Chat ${conversations.length + 1}`);
    setConversations(aiAssistantService.getConversations());
    setCurrentConversation(newConvo);
    setMessages([]);
  };

  const handleSelectConversation = (convoId) => {
    aiAssistantService.setCurrentConversation(convoId);
    const convo = aiAssistantService.getConversation(convoId);
    if (convo) {
      setCurrentConversation(convo);
      setMessages(convo.messages);
    }
  };

  const handleDeleteConversation = (e, convoId) => {
    e.stopPropagation();
    aiAssistantService.deleteConversation(convoId);
    setConversations(aiAssistantService.getConversations());
    if (currentConversation?.id === convoId) {
      const remaining = aiAssistantService.getConversations();
      if (remaining.length > 0) {
        handleSelectConversation(remaining[0].id);
      } else {
        handleNewConversation();
      }
    }
  };

  const handleExportConversation = (format = 'markdown') => {
    if (!currentConversation) return;
    let content, filename;
    if (format === 'markdown') {
      content = aiAssistantService.exportConversation(currentConversation.id);
      filename = `${currentConversation.title}.md`;
    } else {
      content = aiAssistantService.exportConversationJSON(currentConversation.id);
      filename = `${currentConversation.title}.json`;
    }
    if (content) {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex">
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <button
            onClick={handleNewConversation}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <span>+</span><span>New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => handleSelectConversation(convo.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                currentConversation?.id === convo.id ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm truncate flex-1">{convo.title}</p>
                <button onClick={(e) => handleDeleteConversation(e, convo.id)} className="p-1 hover:bg-red-600 rounded">
                  <span className="text-xs">×</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        {currentConversation && (
          <div className="p-4 border-t border-gray-800 space-y-2">
            <button
              onClick={() => handleExportConversation('markdown')}
              className="w-full px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
            >
              📥 Export as MD
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">{currentConversation?.title || 'AI Assistant'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-white mb-2">Welcome to AI Assistant</h3>
                <p className="text-gray-400 max-w-sm">Ask me anything about coding, debugging, or learning paths!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md rounded-lg px-4 py-3 ${
                      message.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 rounded-lg px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
