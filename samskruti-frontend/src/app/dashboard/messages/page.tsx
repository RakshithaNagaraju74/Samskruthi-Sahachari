"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { messageService, Conversation, Message } from "@/services/messageService";

// Icons
const Icons = {
  Back: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  More: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
  Archive: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Phone: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
  Mail: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Star: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
};

export default function MessagesPage() {
  const { isDarkMode } = useTheme();
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'enterprise'>('user');
  const [showTouristDetails, setShowTouristDetails] = useState(false);
  const [touristStats, setTouristStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    memberSince: '',
    lastActive: ''
  });

  // New state for enterprise list modal
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [loadingEnterprises, setLoadingEnterprises] = useState(false);
  const [enterpriseSearch, setEnterpriseSearch] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Handle authentication
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }

    setUserRole(user.role === 'enterprise' ? 'enterprise' : 'user');
    fetchConversations();
  }, [user, isLoading, router]);

  // Filter conversations based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter(conv =>
        conv.enterprise_name?.toLowerCase().includes(query) ||
        conv.site_name?.toLowerCase().includes(query) ||
        conv.subject?.toLowerCase().includes(query) ||
        conv.user_name?.toLowerCase().includes(query) ||
        conv.user_email?.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchQuery]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch tourist stats when conversation selected
  useEffect(() => {
    if (selectedConversation && userRole === 'enterprise') {
      fetchTouristStats(selectedConversation.user_id);
    }
  }, [selectedConversation, userRole]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      console.log('Fetching conversations...');
      console.log('User role:', userRole);

      let data;
      if (userRole === 'enterprise') {
        console.log('Fetching enterprise conversations...');
        data = await messageService.getEnterpriseConversations();
      } else {
        console.log('Fetching user conversations...');
        data = await messageService.getUserConversations();
      }

      console.log('Conversations data received:', data);
      setConversations(data);
      setFilteredConversations(data);

      if (data.length === 0) {
        console.log('No conversations found');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTouristStats = async (userId: number) => {
    try {
      const details = await messageService.getTouristDetails(userId);
      if (details) {
        setTouristStats({
          totalBookings: details.total_bookings || 0,
          totalSpent: details.total_spent || 0,
          memberSince: details.joined_date || 'N/A',
          lastActive: details.last_active || 'N/A'
        });
      }
    } catch (error) {
      console.error('Error fetching tourist stats:', error);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const data = await messageService.getMessages(conversationId);
      setMessages(data);

      // Mark as read
      if (userRole === 'enterprise') {
        await messageService.markEnterpriseAsRead(conversationId);
      } else {
        await messageService.markAsRead(conversationId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileList(false);
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      let sentMessage;
      if (userRole === 'enterprise') {
        sentMessage = await messageService.sendEnterpriseMessage(
          selectedConversation.id,
          newMessage
        );
      } else {
        sentMessage = await messageService.sendMessage(
          selectedConversation.id,
          newMessage
        );
      }

      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');

        // Update conversation list with new last message
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, last_message: newMessage, last_message_at: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
      messageInputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    return messageService.formatMessageTime(timestamp);
  };

  // New functions for enterprise modal
  const fetchEnterprises = async () => {
    setLoadingEnterprises(true);
    try {
      const data = await messageService.getAllEnterprises();
      setEnterprises(data);
    } catch (error) {
      console.error('Error fetching enterprises:', error);
    } finally {
      setLoadingEnterprises(false);
    }
  };

  const handleOpenNewMessage = () => {
    fetchEnterprises();
    setShowNewMessageModal(true);
  };

  const handleStartConversation = async (enterpriseId: number, enterpriseName: string) => {
    try {
      const conversation = await messageService.startConversation(
        enterpriseId,
        null,
        `Inquiry about ${enterpriseName}`
      );
      if (conversation) {
        setShowNewMessageModal(false);
        // Refresh conversations and select the new one
        await fetchConversations();
        // Find the new conversation in the updated list
        const newConv = conversations.find(c => c.id === conversation.id);
        if (newConv) {
          handleSelectConversation(newConv);
        } else {
          // If not found, maybe just fetch again or navigate
          // For simplicity, we'll just select the first conversation? Better to wait for state update
          // We can set a timeout to find after state updates
          setTimeout(() => {
            const updatedConv = conversations.find(c => c.id === conversation.id);
            if (updatedConv) handleSelectConversation(updatedConv);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const filteredEnterprises = enterprises.filter(e =>
    e.enterprise_name?.toLowerCase().includes(enterpriseSearch.toLowerCase()) ||
    e.description?.toLowerCase().includes(enterpriseSearch.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen font-sans ${
      isDarkMode
        ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white"
        : "bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900"
    }`}>

      {/* Header */}
      <header className={`fixed top-0 right-0 left-0 z-40 h-16 border-b backdrop-blur-md ${
        isDarkMode ? "border-gray-800/50 bg-gray-900/50" : "border-gray-200/50 bg-white/50"
      }`}>
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {selectedConversation && !showMobileList ? (
              <button
                onClick={() => {
                  setShowMobileList(true);
                  setSelectedConversation(null);
                }}
                className="md:hidden p-2 rounded-lg transition-colors"
              >
                <Icons.Back />
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg transition-colors"
              >
                <Icons.Back />
              </button>
            )}
            <h1 className="text-xl font-light">
              {selectedConversation && !showMobileList
                ? userRole === 'enterprise'
                  ? selectedConversation.user_name || 'Tourist'
                  : selectedConversation.enterprise_name
                : 'Messages'
              }
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {selectedConversation && !showMobileList && userRole === 'enterprise' && (
              <button
                onClick={() => setShowTouristDetails(!showTouristDetails)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <Icons.User />
              </button>
            )}
            {userRole !== 'enterprise' && (
              <button
                onClick={handleOpenNewMessage}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
                title="New message"
              >
                <Icons.Plus />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 h-screen">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Conversation List - Left Sidebar */}
          <div className={`${
            showMobileList ? 'block' : 'hidden md:block'
          } w-full md:w-80 border-r ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          } overflow-y-auto`}>

            {/* Search Bar */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={userRole === 'enterprise' ? "Search tourists..." : "Search conversations..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-2 pl-10 rounded-lg text-sm border ${
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                  } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Icons.Search />
                </span>
              </div>
            </div>

            {/* Conversations */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-6xl mb-4 opacity-30">💬</div>
                <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {userRole === 'enterprise'
                    ? "Tourists will contact you about heritage sites"
                    : "Start chatting with enterprises about heritage sites"}
                </p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedConversation?.id === conv.id
                        ? isDarkMode
                          ? "bg-gray-800"
                          : "bg-gray-100"
                        : isDarkMode
                          ? "hover:bg-gray-800/50"
                          : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0">
                        {userRole === 'enterprise' ? (
                          // Show tourist avatar for enterprise view
                          conv.user_image ? (
                            <Image
                              src={conv.user_image}
                              alt={conv.user_name || 'Tourist'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                              {conv.user_name?.charAt(0).toUpperCase() ||
                               conv.user_email?.charAt(0).toUpperCase() || 'T'}
                            </div>
                          )
                        ) : (
                          // Show enterprise avatar for user view
                          conv.enterprise_logo ? (
                            <Image
                              src={conv.enterprise_logo}
                              alt={conv.enterprise_name || 'Enterprise'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                              {conv.enterprise_name?.charAt(0) || 'E'}
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">
                            {userRole === 'enterprise'
                              ? (conv.user_name || conv.user_email || 'Tourist')
                              : conv.enterprise_name
                            }
                          </h3>
                          {conv.last_message_at && (
                            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                              {formatMessageTime(conv.last_message_at)}
                            </span>
                          )}
                        </div>

                        {conv.site_name && (
                          <p className={`text-xs mb-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                            📍 {conv.site_name}
                          </p>
                        )}

                        {conv.last_message && (
                          <p className={`text-sm truncate ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            {conv.last_message}
                          </p>
                        )}

                        {/* Unread indicator */}
                        {(userRole === 'enterprise' ? conv.unread_count_enterprise : conv.unread_count_user) > 0 && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area - Right Side */}
          <div className={`${
            showMobileList ? 'hidden md:block' : 'block'
          } flex-1 flex flex-col relative`}>

            {selectedConversation ? (
              <>
                {/* Chat Header with Tourist Info (for enterprise view) */}
                {userRole === 'enterprise' && showTouristDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"} overflow-hidden`}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500">
                          {selectedConversation.user_image ? (
                            <Image
                              src={selectedConversation.user_image}
                              alt={selectedConversation.user_name || 'Tourist'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                              {selectedConversation.user_name?.charAt(0).toUpperCase() ||
                               selectedConversation.user_email?.charAt(0).toUpperCase() || 'T'}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">
                            {selectedConversation.user_name || 'Tourist'}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {selectedConversation.user_email}
                          </p>
                          {selectedConversation.user_phone && (
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              📞 {selectedConversation.user_phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Tourist Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <p className="text-xs opacity-70">Bookings</p>
                          <p className="text-lg font-semibold text-emerald-500">{touristStats.totalBookings}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <p className="text-xs opacity-70">Total Spent</p>
                          <p className="text-lg font-semibold text-emerald-500">₹{touristStats.totalSpent}</p>
                        </div>
                        <div className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <p className="text-xs opacity-70">Member Since</p>
                          <p className="text-lg font-semibold text-emerald-500">
                            {new Date(touristStats.memberSince).getFullYear()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => {
                    const isUser = (userRole === 'enterprise' && msg.sender_type === 'enterprise') ||
                                  (userRole === 'user' && msg.sender_type === 'user');
                    const showAvatar = index === 0 ||
                      messages[index - 1]?.sender_type !== msg.sender_type;

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${
                          isUser ? 'flex-row-reverse' : 'flex-row'
                        }`}>
                          {!isUser && showAvatar && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0">
                              {userRole === 'enterprise' ? (
                                // Show tourist avatar for enterprise receiving message
                                selectedConversation.user_image ? (
                                  <Image
                                    src={selectedConversation.user_image}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm">
                                    {selectedConversation.user_name?.charAt(0).toUpperCase() ||
                                     selectedConversation.user_email?.charAt(0).toUpperCase() || 'T'}
                                  </div>
                                )
                              ) : (
                                // Show enterprise avatar for user receiving message
                                selectedConversation.enterprise_logo ? (
                                  <Image
                                    src={selectedConversation.enterprise_logo}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm">
                                    {selectedConversation.enterprise_name?.charAt(0) || 'E'}
                                  </div>
                                )
                              )}
                            </div>
                          )}

                          <div>
                            <div
                              className={`p-3 rounded-2xl ${
                                isUser
                                  ? 'bg-emerald-500 text-white rounded-br-none'
                                  : isDarkMode
                                    ? 'bg-gray-800 rounded-bl-none'
                                    : 'bg-gray-100 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            </div>
                            <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-400"} ${
                              isUser ? 'text-right' : 'text-left'
                            }`}>
                              {formatMessageTime(msg.created_at)}
                              {msg.is_read && isUser && (
                                <span className="ml-1 inline-block">
                                  <Icons.Check />
                                </span>
                              )}
                            </p>
                          </div>

                          {isUser && showAvatar && (
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0">
                              {userRole === 'enterprise' ? (
                                // Show enterprise avatar for enterprise sending
                                selectedConversation.enterprise_logo ? (
                                  <Image
                                    src={selectedConversation.enterprise_logo}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-sm">
                                    {selectedConversation.enterprise_name?.charAt(0) || 'E'}
                                  </div>
                                )
                              ) : (
                                // Show user avatar for user sending
                                <div className="w-full h-full flex items-center justify-center text-white text-sm">
                                  {user.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className={`p-4 border-t ${
                  isDarkMode ? "border-gray-800" : "border-gray-200"
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      ref={messageInputRef}
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={sending}
                      className={`flex-1 px-4 py-3 rounded-xl text-sm border ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                          : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                      } focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50`}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className={`p-3 rounded-xl transition-all ${
                        newMessage.trim() && !sending
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : isDarkMode
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icons.Send />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl mb-4 opacity-30">💬</div>
                  <h3 className="text-xl font-light mb-2">Select a conversation</h3>
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {userRole === 'enterprise'
                      ? "Choose a tourist to start chatting"
                      : "Choose a conversation from the list to start chatting"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-2xl ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } shadow-2xl`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
                <h2 className="text-2xl font-bold">New Message</h2>
                <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Select an enterprise to start a conversation
                </p>
              </div>

              {/* Modal Search */}
              <div className="p-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search enterprises..."
                    value={enterpriseSearch}
                    onChange={(e) => setEnterpriseSearch(e.target.value)}
                    className={`w-full px-4 py-2 pl-10 rounded-lg text-sm border ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400"
                    } focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icons.Search />
                  </span>
                </div>
              </div>

              {/* Modal Content - Enterprise List */}
              <div className="max-h-96 overflow-y-auto p-4">
                {loadingEnterprises ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                  </div>
                ) : filteredEnterprises.length === 0 ? (
                  <div className="text-center py-8">
                    <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No enterprises found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEnterprises.map((enterprise) => (
                      <button
                        key={enterprise.id}
                        onClick={() => handleStartConversation(enterprise.id, enterprise.enterprise_name)}
                        className={`w-full p-4 rounded-lg text-left transition-colors ${
                          isDarkMode
                            ? "hover:bg-gray-800"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex-shrink-0">
                            {enterprise.logo ? (
                              <Image
                                src={enterprise.logo}
                                alt={enterprise.enterprise_name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {enterprise.enterprise_name?.charAt(0) || 'E'}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{enterprise.enterprise_name}</h3>
                            {enterprise.business_type && (
                              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                {enterprise.business_type}
                              </p>
                            )}
                            {enterprise.description && (
                              <p className={`text-sm mt-1 line-clamp-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {enterprise.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className={`p-4 border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"} flex justify-end`}>
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                    isDarkMode
                      ? "border-gray-700 hover:bg-gray-800 text-gray-300"
                      : "border-gray-200 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}