'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebar from '../../components/DashboardSidebar'; // Naya component import
import Navbar from '../../components/layout/Navbar';
import { Brain, GitCompare, MessageSquare, CheckCircle, Plus, Search, BookOpen, Send, AlertCircle } from 'lucide-react';

// Helper component for Stats
function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>
        <Icon size={24} />
      </div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [totalSkills, setTotalSkills] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return; 
    }

    async function fetchDashboardData() {
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }

    async function fetchSkillCount() {
      const res = await fetch('/api/skills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTotalSkills(data.length);
      }
    }

    fetchDashboardData();
    fetchSkillCount();
  }, [router]);

  const activities = [
    { text: 'New swap request received for React.js', time: '2m ago', icon: AlertCircle },
    { text: 'Your skill "Python" was endorsed', time: '1h ago', icon: CheckCircle },
    { text: 'New message from Sarah J.', time: '3h ago', icon: MessageSquare },
  ];

  if (!user) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar refactored */}
      <DashboardSidebar active="dashboard" />
      
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-8 space-y-8">
          
          <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-3xl p-8 text-white shadow-xl">
            <h1 className="text-3xl font-bold">Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
            <p className="text-purple-200 mt-2">You're doing great! Keep sharing your knowledge.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="My Skills" value={totalSkills} icon={Brain} color="text-purple-600" bg="bg-purple-50" />
            <StatCard title="Experience" value={user.experience?.length || 0} icon={GitCompare} color="text-blue-600" bg="bg-blue-50" />
            <StatCard title="Messages" value="18" icon={MessageSquare} color="text-orange-600" bg="bg-orange-50" />
            <StatCard title="Completed" value="08" icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Recent Activity</h3>
              <div className="space-y-4">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><act.icon size={18}/></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{act.text}</p>
                      <p className="text-xs text-gray-400">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/my-skills/add" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700">
                  <Plus size={20} className="mb-2"/>
                  <span className="text-xs font-medium">Add Skill</span>
                </Link>
                {[ {name: 'Browse', icon: Search}, {name: 'Requests', icon: BookOpen}, {name: 'Chat', icon: Send} ].map((item, i) => (
                  <button key={i} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700">
                    <item.icon size={20} className="mb-2"/>
                    <span className="text-xs font-medium">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}