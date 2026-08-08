'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your SkillSwap AI Assistant. How can I help you with learning skills, improving your profile, or finding skill exchanges today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.error || "Sorry, I'm unable to respond right now. Please try again." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I'm unable to respond right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: 'Conversation cleared. How else can I help you with SkillSwap?' }
    ]);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Navigation Link Back */}
      <div className="w-64 bg-purple-950 p-5 flex flex-col justify-between hidden md:flex border-r border-purple-900">
        <div>
          <h1 className="text-xl font-bold text-purple-300 mb-8">&lt;/&gt; Swap Skill</h1>
          <nav className="space-y-3">
            <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-gray-300 hover:bg-purple-900 transition">Dashboard</Link>
            <Link href="/ai-assistant" className="block px-4 py-2.5 rounded-lg bg-purple-800 text-white font-medium">AI Assistant</Link>
          </nav>
        </div>
        <Link href="/dashboard" className="text-sm text-purple-300 hover:underline">← Back to Dashboard</Link>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col h-full bg-gray-950">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-purple-200">SkillSwap AI Assistant</h2>
          </div>
          <button 
            onClick={clearChat}
            className="px-3 py-1.5 text-xs bg-purple-900 hover:bg-purple-800 text-purple-200 rounded-lg transition border border-purple-700"
          >
            Clear Conversation
          </button>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-gray-400 rounded-2xl rounded-bl-none px-4 py-3 text-sm border border-gray-700 animate-pulse">
                AI is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about skills, learning roadmaps, or profiles..."
            className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-medium transition shadow-lg"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}