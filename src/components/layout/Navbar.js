// src/components/layout/Navbar.js
import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <div className="h-16 bg-white border-b border-purple-100 flex items-center justify-between px-8 w-full">
      <div className="relative w-96">
        <Search className="absolute left-3 text-gray-400" size={18} />
        <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Search skills..." />
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-500 cursor-pointer" size={20} />
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">U</div>
          <span className="font-medium text-gray-700">Umme Rubab</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}