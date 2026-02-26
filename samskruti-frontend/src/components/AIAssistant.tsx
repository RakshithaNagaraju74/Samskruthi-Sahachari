// components/AIAssistant.tsx - Fixed version
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { groqService, ChatMessage } from '@/services/groqService';
import { useTheme } from '@/context/ThemeContext';

interface AIAssistantProps {
  onClose?: () => void;
}

export default function AIAssistant({ onClose }: AIAssistantProps) {
  const { isDarkMode } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load chat history
    const history = groqService.getChatHistory();
    setMessages(history);
    
    // Add welcome message if no history
    if (history.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '👋 Hi! I\'m your Karnataka Heritage Assistant. Ask me about heritage sites, check your ticket status, or get recommendations!',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message immediately with unique ID using timestamp
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);

    setLoading(true);

    // Get AI response
    const response = await groqService.sendMessage(userMessage);

    setLoading(false);

    if (response.success) {
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } else {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: '😔 Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    groqService.clearChatHistory();
    setMessages([{
      role: 'assistant',
      content: '👋 Chat cleared! How can I help you?',
      timestamp: new Date()
    }]);
  };

  // Generate a unique key for each message
  const getMessageKey = (msg: ChatMessage, index: number): string => {
    // Use timestamp + index + role to create a unique key
    const timestamp = msg.timestamp?.getTime() || Date.now() + index;
    return `${msg.role}-${timestamp}-${index}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-24 right-6 w-96 rounded-2xl shadow-2xl overflow-hidden z-40 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      {/* Header */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r from-emerald-500 to-teal-500`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white">🤖</span>
            </div>
            <div>
              <h3 className="text-white font-semibold">Heritage Assistant</h3>
              <p className="text-white/80 text-xs">Powered by Groq AI</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleClearChat}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              title="Clear chat"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => (
            <motion.div
              key={getMessageKey(msg, index)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${
                  msg.role === 'user'
                    ? 'text-emerald-100'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`}>
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              key="loading-indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className={`max-w-[80%] rounded-2xl p-3 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about heritage sites..."
            className={`flex-1 px-4 py-2 rounded-xl text-sm border ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`px-4 py-2 rounded-xl transition-all ${
              input.trim() && !loading
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className={`text-[10px] mt-2 text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Ask about sites, tickets, expiring tickets, or get recommendations
        </p>
      </div>
    </motion.div>
  );
}