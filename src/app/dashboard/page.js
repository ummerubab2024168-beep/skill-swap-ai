'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebar from '../../components/DashboardSidebar';
import Navbar from '../../components/layout/Navbar';
import { Brain, GitCompare, MessageSquare, CheckCircle, Plus, Search, BookOpen, Send, AlertCircle, Bot } from 'lucide-react';

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
  const [totalMessages, setTotalMessages] = useState(0);
  const [completedSwaps, setCompletedSwaps] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return; 
    }

    async function fetchDashboardData() {
      const activitiesList = [];
      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || data);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        const skillsRes = await fetch('/api/skills', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (skillsRes.ok) {
          const skillsData = await skillsRes.json();
          setTotalSkills(skillsData.length);
          if (skillsData.length > 0) {
            const latestSkill = skillsData[skillsData.length - 1];
            activitiesList.push({
              text: `New skill "${latestSkill.title || latestSkill.name || 'Skill'}" added`,
              time: 'Recently',
              icon: Brain
            });
          }
        }

        const [receivedRes, sentRes] = await Promise.all([
          fetch('/api/swap/received', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/swap/sent', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        let completedCount = 0;
        let pendingCount = 0;
        let acceptedUsersMap = new Map();

        if (receivedRes.ok) {
          const rData = await receivedRes.json();
          const reqs = rData.data || [];
          reqs.forEach(req => {
            if (req.status === 'Completed') completedCount++;
            if (req.status === 'Pending') pendingCount++;
            if (req.status === 'Accepted' && req.sender?._id) {
              acceptedUsersMap.set(req.sender._id.toString(), req.sender);
            }
          });
        }

        if (sentRes.ok) {
          const sData = await sentRes.json();
          const reqs = sData.data || [];
          reqs.forEach(req => {
            if (req.status === 'Completed') completedCount++;
            if (req.status === 'Accepted' && req.receiver?._id) {
              acceptedUsersMap.set(req.receiver._id.toString(), req.receiver);
            }
          });
        }

        setCompletedSwaps(completedCount);
        setPendingRequestsCount(pendingCount);
        setChatCount(acceptedUsersMap.size);

        if (pendingCount > 0) {
          activitiesList.push({
            text: `You have ${pendingCount} pending swap request(s)`,
            time: 'Active',
            icon: AlertCircle,
          });
        }

        if (completedCount > 0) {
          activitiesList.push({
            text: `Total ${completedCount} swap(s) completed successfully`,
            time: 'Recent',
            icon: CheckCircle,
          });
        }

        if (acceptedUsersMap.size > 0) {
          activitiesList.push({
            text: `You have ${acceptedUsersMap.size} active chat connection(s)`,
            time: 'Real-time',
            icon: MessageSquare,
          });
        }

        let totalMsgs = 0;
        const usersList = Array.from(acceptedUsersMap.values());
        for (const u of usersList) {
          try {
            const convRes = await fetch(`/api/chat/conversation?userId=${u._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const convData = await convRes.json();
            if (convRes.ok && convData.data) {
              totalMsgs += convData.data.length;
            }
          } catch (e) {
            console.error(e);
          }
        }
        setTotalMessages(totalMsgs);

        if (activitiesList.length === 0) {
          activitiesList.push({
            text: "No recent activity yet.",
            time: "Now",
            icon: CheckCircle,
          });
        }

        setRecentActivities(activitiesList);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    }

    fetchDashboardData();
  }, [router]);

  if (!user) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
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
            <StatCard title="Messages" value={totalMessages} icon={MessageSquare} color="text-orange-600" bg="bg-orange-50" />
            <StatCard title="Completed" value={completedSwaps} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivities.map((act, i) => (
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

                <Link href="/dashboard/browse-skills" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700">
                  <Search size={20} className="mb-2"/>
                  <span className="text-xs font-medium">Browse</span>
                </Link>

                <Link href="/ai-assistant" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700">
                  <Bot size={20} className="mb-2"/>
                  <span className="text-xs font-medium">AI Assistant</span>
                </Link>

                <Link href="/dashboard/swap-requests" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700 relative">
                  {pendingRequestsCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {pendingRequestsCount}
                    </span>
                  )}
                  <BookOpen size={20} className="mb-2"/>
                  <span className="text-xs font-medium">Requests</span>
                </Link>

                <Link href="/dashboard/chat" className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all text-gray-600 hover:text-purple-700 relative">
                  {chatCount > 0 && (
                    <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {chatCount}
                    </span>
                  )}
                  <Send size={20} className="mb-2"/>
                  <span className="text-xs font-medium">Chat</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}