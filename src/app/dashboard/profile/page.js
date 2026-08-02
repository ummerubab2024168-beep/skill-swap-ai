'use client';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const json = await res.json();
      setData(json);
      const expText = json.experience?.map(e => `${e.role} at ${e.company}`).join('\n') || '';
      setFormData({ ...json, experience: expText });
    }
  }

  async function handleUpdate() {
    const token = localStorage.getItem('token');
    const expArray = formData.experience?.split('\n').map(line => {
      const [role, company] = line.split(' at ');
      return { role: role?.trim(), company: company?.trim() || '' };
    }).filter(e => e.role);

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, experience: expArray })
    });

    if (res.ok) {
      const updated = await res.json();
      setData(updated);
      setIsEditing(false);
      fetchProfile();
    }
  }

  if (!data) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-64 bg-indigo-600 w-full"></div>

      <div className="relative -mt-24 mx-4 md:mx-auto max-w-5xl bg-white rounded-3xl shadow-xl p-6 md:p-12 z-10">
        
        {/* Header Section */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900">{data.name}</h2>
            <p className="text-indigo-600 font-medium">{data.email}</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)} 
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          /* EDIT SECTION */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input className="w-full p-4 border rounded-xl" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
              <textarea className="w-full p-4 border rounded-xl h-32" value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Bio" />
            </div>
            <div className="space-y-4">
              <input className="w-full p-4 border rounded-xl" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Location" />
              <input className="w-full p-4 border rounded-xl" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="Skills (comma separated)" />
              <textarea className="w-full p-4 border rounded-xl h-24" value={formData.experience || ''} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="Experience (Role at Company, per line)" />
              <button onClick={handleUpdate} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold">Save All Changes</button>
            </div>
          </div>
        ) : (
          /* VIEW SECTION - More spacious */
          <div className="space-y-10">
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">About Me</h3>
              <p className="text-gray-700 text-lg leading-relaxed">{data.bio || "No bio added."}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills?.map((s, i) => <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium">{s}</span>)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Experience</h3>
                {data.experience?.map((e, i) => (
                  <p key={i} className="text-gray-700 font-medium mb-2">● {e.role} <span className="text-gray-400 font-normal">at {e.company}</span></p>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Location</h3>
              <p className="text-gray-700 font-medium">{data.location || "N/A"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}