'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Path ko update kiya hai taake ye sahi jagah se component load kare
import DashboardSidebar from '../../../../components/DashboardSidebar'; 

export default function AddSkillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    proficiencyLevel: 'Beginner',
    description: '',
    isSwapAvailable: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Skill saved successfully!');
        router.push('/dashboard/my-skills');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to save skill');
      }
    } catch (error) {
      alert('Error connecting to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Component */}
      <DashboardSidebar active="skills" />

      {/* Main Content Area */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-950 mb-8">Add New Skill</h1>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div>
              <label className="block text-purple-700 font-bold mb-2">Skill Title *</label>
              <input 
                className="w-full p-4 border rounded-xl bg-slate-50" 
                placeholder="e.g. React.js" 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-purple-700 font-bold mb-2">Category *</label>
                <select 
                  className="w-full p-4 border rounded-xl bg-slate-50" 
                  required 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="Development">Development</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-purple-700 font-bold mb-2">Skill Level</label>
                <select 
                  className="w-full p-4 border rounded-xl bg-slate-50" 
                  value={formData.proficiencyLevel}
                  onChange={e => setFormData({...formData, proficiencyLevel: e.target.value})}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-purple-700 font-bold mb-2">Description</label>
              <textarea 
                className="w-full p-4 border rounded-xl bg-slate-50 h-32" 
                placeholder="Tell us about this skill..." 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="swap" 
                className="w-5 h-5 accent-purple-600" 
                checked={formData.isSwapAvailable}
                onChange={e => setFormData({...formData, isSwapAvailable: e.target.checked})} 
              />
              <label htmlFor="swap" className="font-medium text-gray-700">Available for swap</label>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => router.back()} 
                className="flex-1 py-4 border rounded-xl font-bold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                disabled={loading} 
                type="submit" 
                className={`flex-1 py-4 rounded-xl font-bold text-white transition ${loading ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {loading ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}