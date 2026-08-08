import Link from 'next/link';
import { LogOut, Bot } from 'lucide-react'; 

export default function DashboardSidebar({ active, unreadTotal = 0 }) {
  return (
    <div className="w-64 bg-purple-900 text-white p-6 flex flex-col min-h-screen fixed left-0 top-0 z-50">
      {/* Title */}
      <h1 className="text-xl font-bold flex items-center gap-2 mb-8">{"</>"} Swap Skill</h1>
      
      {/* Menu */}
      <nav className="space-y-2 flex-grow">
        <Link href="/dashboard" className={`block p-3 rounded-lg ${active === 'dashboard' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>Dashboard</Link>
        <Link href="/dashboard/profile" className={`block p-3 rounded-lg ${active === 'profile' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>Profile</Link>
        <Link href="/dashboard/my-skills" className={`block p-3 rounded-lg ${active === 'my-skills' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>My Skills</Link>
        
        {/* Browse Skills link */}
        <Link href="/dashboard/browse-skills" className={`block p-3 rounded-lg ${active === 'browse' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>Browse Skills</Link>

        {/* Swap Requests link */}
        <Link href="/dashboard/swap-requests" className={`block p-3 rounded-lg ${active === 'requests' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>Swap Requests</Link>

        {/* Chat link with unread badge */}
        <Link href="/dashboard/chat" className={`flex items-center justify-between p-3 rounded-lg ${active === 'chat' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>
          <span>Chat</span>
          {unreadTotal > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {unreadTotal}
            </span>
          )}
        </Link>

        {/* AI Assistant link */}
        <Link href="/ai-assistant" className={`flex items-center gap-2 p-3 rounded-lg ${active === 'ai-assistant' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>
          <Bot size={18} /> AI Assistant
        </Link>
      </nav>

      {/* Logout Button at the bottom */}
      <div className="mt-auto pt-6 border-t border-purple-800">
        <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userId'); window.location.href = '/login'; }} className="flex items-center gap-2 text-purple-200 hover:text-white transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}