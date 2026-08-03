import Link from 'next/link';
import { LogOut } from 'lucide-react'; // Agar icons use kar rahi hain

export default function DashboardSidebar({ active }) {
  return (
    <div className="w-64 bg-purple-900 text-white p-6 flex flex-col min-h-screen fixed left-0 top-0">
      {/* Title */}
      <h1 className="text-xl font-bold flex items-center gap-2 mb-8">{"</>"} Swap Skill</h1>
      
      {/* Menu */}
      <nav className="space-y-2 flex-grow">
        <Link href="/dashboard" className={`block p-3 rounded-lg ${active === 'dashboard' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>Dashboard</Link>
        <Link href="/dashboard/profile" className={`block p-3 rounded-lg ${active === 'profile' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>Profile</Link>
        <Link href="/dashboard/my-skills" className={`block p-3 rounded-lg ${active === 'my-skills' ? 'bg-purple-950 font-bold' : 'hover:bg-purple-800'}`}>My Skills</Link>
      </nav>

      {/* Logout Button at the bottom */}
      <div className="mt-auto pt-6 border-t border-purple-800">
        <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="flex items-center gap-2 text-purple-200 hover:text-white transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}