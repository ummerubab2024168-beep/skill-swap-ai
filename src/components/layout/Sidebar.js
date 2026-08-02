'use client'; // Ye zaroori hai kyunki hum hooks use kar rahe hain
import { LayoutDashboard, User, Brain, Search, GitCompare, MessageSquare, Bell, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 1. Router import kiya

export default function Sidebar() {
  const router = useRouter(); // 2. Router initialize kiya

  // 3. Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const menu = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }, 
    { name: 'Profile', icon: User, path: '/dashboard/profile' },
    { name: 'My Skills', icon: Brain, path: '/dashboard/my-skills' }, 
    { name: 'Browse Skills', icon: Search, path: '/dashboard/browse' },
    { name: 'Swap Requests', icon: GitCompare, path: '/dashboard/requests' }, 
    { name: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
    { name: 'Notifications', icon: Bell, path: '/dashboard/notifications' }, 
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' }
  ];

  return (
    <div className="w-64 bg-white border-r border-purple-100 p-6 flex flex-col h-screen fixed">
      <div className="text-2xl font-bold text-purple-700 mb-10">SkillSwap AI</div>
      <div className="flex-1 space-y-2">
        {menu.map((item) => (
          <Link href={item.path} key={item.name} className="flex items-center space-x-3 text-gray-600 p-3 hover:bg-purple-50 hover:text-purple-700 rounded-xl cursor-pointer transition">
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
      
      {/* 4. Ye Logout button ab functional hai */}
      <button 
        onClick={handleLogout} 
        className="flex items-center space-x-3 text-red-500 p-3 hover:bg-red-50 rounded-xl cursor-pointer w-full transition"
      >
        <LogOut size={20} />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
}