'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditSkillPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    proficiencyLevel: 'Beginner',
    description: '',
    isSwapAvailable: false
  });

  useEffect(() => {
    if (!id) return;
    
    const fetchSkill = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/skills/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
        } else {
          alert("Failed to load skill data");
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkill();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/skills/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Skill updated successfully!');
        router.push('/dashboard/my-skills');
      } else {
        alert('Failed to update skill');
      }
    } catch (error) {
      alert('Error connecting to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Hardcoded (No import error) */}
      <div className="w-64 bg-purple-900 text-white p-6 flex flex-col space-y-8 fixed h-full">
        <h1 className="text-xl font-bold flex items-center gap-2">{"</>"} Swap Skill</h1>
        <nav className="space-y-2">
          <Link href="/dashboard/profile" className="block p-3 rounded-lg hover:bg-purple-800">Profile</Link>
          <Link href="/dashboard/my-skills" className="block p-3 rounded-lg bg-purple-950 font-bold">My Skills</Link>
        </nav>
      </div>

      {/* Main Content Area - ml-64 added to align with Sidebar */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-950 mb-8">Edit Skill</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <label className="block text-purple-700 font-bold mb-2">Skill Title *</label>
                <input className="w-full p-4 border rounded-xl bg-slate-50" required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-700 font-bold mb-2">Category *</label>
                  <select className="w-full p-4 border rounded-xl bg-slate-50" required 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">Select Category</option>
                    <option value="Development">Development</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-purple-700 font-bold mb-2">Skill Level</label>
                  <select className="w-full p-4 border rounded-xl bg-slate-50" 
                    value={formData.proficiencyLevel}
                    onChange={e => setFormData({...formData, proficiencyLevel: e.target.value})}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-purple-700 font-bold mb-2">Description</label>
                <textarea className="w-full p-4 border rounded-xl bg-slate-50 h-32" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="swap" className="w-5 h-5 accent-purple-600" 
                  checked={formData.isSwapAvailable}
                  onChange={e => setFormData({...formData, isSwapAvailable: e.target.checked})} />
                <label htmlFor="swap" className="font-medium text-gray-700">Available for swap</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => router.back()} className="flex-1 py-4 border rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button disabled={submitting} type="submit" className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">
                  {submitting ? 'Updating...' : 'Update Skill'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}