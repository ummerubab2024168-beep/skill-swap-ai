import { Bell, ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <div className="h-16 bg-white border-b border-purple-100 flex items-center justify-between px-8 w-full">
      <div className="flex items-center">
        {/* Search bar removed successfully */}
      </div>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-500 cursor-pointer" size={20} />
        <div className="flex items-center gap-2 border-l pl-4">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"></div>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}