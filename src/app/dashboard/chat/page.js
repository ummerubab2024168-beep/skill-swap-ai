'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Search, Send, MessageSquare, User, RefreshCw, MoreVertical, Check, CheckCheck } from 'lucide-react';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(selectedUser);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUserId(localStorage.getItem('userId'));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = messageDate.toDateString() === today.toDateString();
    const isYesterday = messageDate.toDateString() === yesterday.toDateString();

    const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return timeString;
    } else if (isYesterday) {
      return `Yesterday, ${timeString}`;
    } else {
      const dateStr = messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return `${dateStr}, ${timeString}`;
    }
  };

  const markMessagesAsRead = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token || !userId) return;
    try {
      await fetch('/api/chat/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderId: userId }),
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const fetchConversations = async (isBackground = false) => {
    if (!isBackground) setLoadingUsers(true);
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch('/api/swap/received', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/swap/sent', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const receivedData = await receivedRes.json();
      const sentData = await sentRes.json();

      const usersMap = new Map();

      if (receivedRes.ok && receivedData.data) {
        receivedData.data.forEach(req => {
          if (req.status === 'Accepted' && req.sender && req.sender._id) {
            usersMap.set(req.sender._id.toString(), req.sender);
          }
        });
      }

      if (sentRes.ok && sentData.data) {
        sentData.data.forEach(req => {
          if (req.status === 'Accepted' && req.receiver && req.receiver._id) {
            usersMap.set(req.receiver._id.toString(), req.receiver);
          }
        });
      }

      const usersList = Array.from(usersMap.values());
      setConversations(usersList);

      const activeUser = selectedUserRef.current;
      const counts = {};

      await Promise.all(
        usersList.map(async (user) => {
          try {
            const res = await fetch(`/api/chat/conversation?userId=${user._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok && data.data) {
              const msgs = data.data;
              if (activeUser && activeUser._id === user._id) {
                counts[user._id] = 0;
              } else {
                const unread = msgs.filter(m => {
                  const sId = typeof m.sender === 'object' && m.sender !== null ? m.sender._id : m.sender;
                  return sId?.toString() !== localStorage.getItem('userId') && m.isRead === false;
                }).length;
                counts[user._id] = unread;
              }
            }
          } catch (err) {
            console.error('Error fetching unread count:', err);
          }
        })
      );

      setUnreadCounts(counts);

    } catch (err) {
      console.error('Error fetching chat users:', err);
      if (!isBackground) setError('Failed to load conversations.');
    } finally {
      if (!isBackground) setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  const fetchConversationMessages = async (userId, isBackground = false) => {
    if (!isBackground) setLoadingMessages(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/chat/conversation?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok) {
        const newMessages = data.data || [];

        setMessages((prevMessages) => {
          if (newMessages.length !== prevMessages.length) {
            return newMessages;
          }
          const hasNew = newMessages.some((msg, idx) => prevMessages[idx]?._id !== msg._id || prevMessages[idx]?.isRead !== msg.isRead);
          return hasNew ? newMessages : prevMessages;
        });

        if (selectedUserRef.current && selectedUserRef.current._id === userId) {
          setUnreadCounts(prev => ({ ...prev, [userId]: 0 }));
        }
      } else if (!isBackground) {
        throw new Error(data.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      if (!isBackground) setError('Failed to load messages.');
    } finally {
      if (!isBackground) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!selectedUser) return;

    fetchConversationMessages(selectedUser._id, false);
    markMessagesAsRead(selectedUser._id);

    const interval = setInterval(() => {
      if (selectedUserRef.current) {
        fetchConversationMessages(selectedUserRef.current._id, true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(true);
      if (selectedUserRef.current) {
        fetchConversationMessages(selectedUserRef.current._id, true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setError('');
    setActiveMenuMsgId(null);
    setUnreadCounts(prev => ({ ...prev, [user._id]: 0 }));

    await markMessagesAsRead(user._id);
    fetchConversationMessages(user._id, false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || sending) return;

    setSending(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          message: newMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setNewMessage('');
      await fetchConversationMessages(selectedUser._id, true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId, type) => {
    setActiveMenuMsgId(null);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const endpoint = type === 'everyone' ? '/api/chat/delete-everyone' : '/api/chat/delete-me';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete message');
      }

      if (type === 'everyone') {
        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, message: 'This message was deleted', isDeleted: true } : m));
      } else {
        setMessages(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message);
    }
  };

  const filteredConversations = conversations.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnreadCount = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar active="chat" unreadTotal={totalUnreadCount} />

      <main className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex flex-1 h-full overflow-hidden border-t border-gray-200">
          
          <div className="w-full md:w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Chats</h2>
              <button onClick={() => fetchConversations(false)} className="text-purple-900 hover:text-purple-700 transition">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
              {loadingUsers ? (
                <div className="text-center py-8 text-gray-400 text-sm">Loading chats...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm px-4">
                  {conversations.length === 0 
                    ? "No accepted swap requests found. Accept a swap request to start chatting!"
                    : "No conversations found."}
                </div>
              ) : (
                filteredConversations.map((user) => {
                  const unread = unreadCounts[user._id] || 0;
                  return (
                    <div
                      key={user._id}
                      onClick={() => handleSelectUser(user)}
                      className={`flex items-center justify-between p-4 cursor-pointer transition hover:bg-purple-50 ${
                        selectedUser?._id === user._id ? 'bg-purple-50 border-l-4 border-purple-900' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-900 font-bold shrink-0">
                          <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{user.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      {unread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
            {selectedUser ? (
              <>
                <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-900 text-white rounded-full flex items-center justify-center font-bold">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-xs text-green-600 flex items-center gap-1 font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Online
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 px-4 py-2 text-xs border-b border-red-100 shrink-0">
                    {error}
                  </div>
                )}

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {loadingMessages ? (
                    <div className="text-center py-12 text-gray-400">Loading conversation...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                      No messages yet. Send a message to start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const senderId = typeof msg.sender === 'object' && msg.sender !== null 
                        ? msg.sender._id 
                        : msg.sender;

                      const isMe = currentUserId && senderId && senderId.toString() === currentUserId.toString();
                      const isSeen = msg.isRead === true;

                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col relative group ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 max-w-md">
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm shadow-xs relative ${
                                isMe
                                  ? 'bg-purple-900 text-white rounded-br-none'
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                              }`}
                            >
                              <p className={msg.isDeleted ? 'italic text-gray-300' : ''}>{msg.message}</p>
                            </div>

                            {!msg.isDeleted && (
                              <div className="relative">
                                <button
                                  onClick={() => setActiveMenuMsgId(activeMenuMsgId === msg._id ? null : msg._id)}
                                  className="opacity-0 group-hover:opacity-100 transition p-1 text-gray-400 hover:text-gray-600 rounded-full bg-white shadow-xs border border-gray-200"
                                >
                                  <MoreVertical size={14} />
                                </button>

                                {activeMenuMsgId === msg._id && (
                                  <div className={`absolute z-10 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 text-xs text-gray-700 ${isMe ? 'right-0' : 'left-0'} mt-1`}>
                                    {isMe && (
                                      <button
                                        onClick={() => handleDeleteMessage(msg._id, 'everyone')}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600 font-medium"
                                      >
                                        Delete for everyone
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteMessage(msg._id, 'me')}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-700 font-medium"
                                    >
                                      Delete for me
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-400">
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMe && (
                              <span className="flex items-center ml-1" title={isSeen ? 'Seen' : 'Delivered'}>
                                {isSeen ? (
                                  <span className="text-blue-500 font-semibold flex items-center gap-0.5">
                                    <CheckCheck size={13} /> Seen
                                  </span>
                                ) : (
                                  <span className="text-gray-400 flex items-center gap-0.5">
                                    <CheckCheck size={13} /> Delivered
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-white p-4 border-t border-gray-200 shrink-0">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="px-5 py-3 bg-purple-900 text-white rounded-xl hover:bg-purple-800 transition flex items-center gap-2 font-medium text-sm shadow-sm disabled:opacity-50"
                    >
                      <Send size={16} /> {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <div className="w-20 h-20 bg-purple-50 text-purple-900 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No conversation selected</h3>
                <p className="text-sm text-gray-500">Select an accepted conversation from the list to start chatting.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}