'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../../../components/DashboardSidebar';

export default function BrowseSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Request loading & status tracking per skill
  const [requestStates, setRequestStates] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });
  const router = useRouter();

  useEffect(() => {
    fetchBrowseSkills();
  }, []);

  const fetchBrowseSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/skills/browse', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch skills');
      
      const json = await res.json();
      const fetchedSkills = json.data || [];
      setSkills(fetchedSkills);

      // Initialize requestStates based on backend requestStatus ('Pending', 'Accepted', or null)
      const initialStates = {};
      fetchedSkills.forEach(skill => {
        if (skill.requestStatus) {
          initialStates[skill._id] = { 
            sent: true, 
            status: skill.requestStatus, 
            loading: false 
          };
        }
      });
      setRequestStates(initialStates);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSwapRequest = async (skillId) => {
    setFeedbackMessage({ text: '', type: '' });
    const token = localStorage.getItem('token');
    
    if (!token) {
      setFeedbackMessage({ text: 'Unauthorized: No token provided. Please log in again.', type: 'error' });
      return;
    }

    // Set loading state for this specific skill button
    setRequestStates(prev => ({ ...prev, [skillId]: { ...prev[skillId], loading: true } }));

    try {
      const res = await fetch('/api/swap/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ skillId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send swap request');
      }

      // Success state for this specific skill (defaults to Pending upon new send)
      setRequestStates(prev => ({
        ...prev,
        [skillId]: { loading: false, sent: true, status: 'Pending' }
      }));

      setFeedbackMessage({ text: 'Swap request sent successfully', type: 'success' });

    } catch (err) {
      setRequestStates(prev => ({ ...prev, [skillId]: { ...prev[skillId], loading: false } }));
      setFeedbackMessage({ text: err.message, type: 'error' });
    }
  };

  // Filter Logic
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = 
      skill.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || skill.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Development', 'Design', 'Marketing'];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar active="browse" />

      <div className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-950 mb-6">Browse Skills</h1>
            
            {/* Global Feedback Banner */}
            {feedbackMessage.text && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                feedbackMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {feedbackMessage.text}
              </div>
            )}

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <input 
                type="text"
                placeholder="Search by skill, category, or owner..."
                className="flex-1 p-3 border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="p-3 border rounded-xl bg-slate-50 min-w-[200px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* States */}
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium">Loading opportunities...</div>
          ) : error ? (
            <div className="text-center py-20 text-red-500 font-medium">{error}</div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No skills found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => {
                const state = requestStates[skill._id] || {};
                const isSent = state.sent || skill.hasRequested;
                const requestStatus = state.status || skill.requestStatus;
                const isLoading = state.loading;

                // Determine button text & styling based on status
                let buttonText = 'Send Swap Request';
                let buttonStyle = 'bg-purple-600 hover:bg-purple-700 text-white';

                if (isLoading) {
                  buttonText = 'Sending...';
                } else if (isSent) {
                  if (requestStatus === 'Accepted') {
                    buttonText = 'Accepted';
                    buttonStyle = 'bg-green-100 text-green-700 cursor-not-allowed font-semibold';
                  } else {
                    buttonText = 'Request Sent';
                    buttonStyle = 'bg-gray-100 text-gray-400 cursor-not-allowed';
                  }
                }

                return (
                  <div key={skill._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase">{skill.category}</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{skill.level}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-950 mb-2">{skill.skillName}</h3>
                    <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">{skill.description}</p>
                    
                    <div className="pt-4 border-t border-slate-50 mt-auto">
                      <p className="text-sm font-bold text-gray-800">{skill.ownerName}</p>
                      <p className="text-xs text-gray-500 mb-4">📍 {skill.ownerLocation}</p>

                      <button
                        onClick={() => handleSendSwapRequest(skill._id)}
                        disabled={isLoading || isSent}
                        className={`w-full py-2.5 px-4 font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${buttonStyle}`}
                      >
                        {buttonText}
                      </button>
                      <button
  onClick={() => router.push(`/dashboard/profile?userId=${skill.ownerId}`)}
  className="w-full mt-2 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
>
  View Profile
</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}