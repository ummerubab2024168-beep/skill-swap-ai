'use client';
import { useState, useEffect } from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => { fetchProfile(); }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  async function fetchProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/profile', { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) {
      const json = await res.json();
      setData(json);
      const expText = json.experience?.map(e => `${e.role} at ${e.company}`).join('\n') || '';
      const skillsText = Array.isArray(json.skills) ? json.skills.join(', ') : json.skills;
      setFormData({ ...json, experience: expText, skills: skillsText });
    }
  }

  async function handleUpdate() {
    const token = localStorage.getItem('token');
    const expArray = formData.experience?.split('\n').map(line => {
      const [role, company] = line.split(' at ');
      return { role: role?.trim(), company: company?.trim() || '' };
    }).filter(e => e.role);
    
    const skillsArray = formData.skills?.split(',').map(s => s.trim());

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, experience: expArray, skills: skillsArray })
    });

    if (res.ok) {
      const updated = await res.json();
      setData(updated);
      setIsEditing(false);
      fetchProfile();
    }
  }

  if (!data) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const initials = getInitials(data.name);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Component */}
      <DashboardSidebar active="profile" />

      {/* Main Content Area - ml-64 added here to fix layout */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-end items-center gap-4 mb-8 pb-4 border-b">
              <p className='font-semibold text-gray-800'>{data.name}</p>
              <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold">{initials}</div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-950">My Profile</h1>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm mb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                 <div className="w-24 h-24 rounded-full bg-purple-700 flex items-center justify-center text-white text-3xl font-bold relative">
                    {initials}
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></span>
                 </div>
                <div>
                  <h2 className="text-4xl font-extrabold text-gray-950">{data.name}</h2>
                  <p className="text-purple-700 font-medium">{data.title || "Software Developer"}</p>
                  <div className="text-slate-500 text-sm mt-2 space-y-1">
                      <p>📧 {data.email}</p>
                      <p>📍 {data.location || "Location not set"}</p>
                     <p>
  📅 Joined{" "}
  {data.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "N/A"}
</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsEditing(!isEditing)} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-4">
                   <div>
                       <label className="block text-purple-700 font-bold mb-1">Full Name</label>
                       <input className="w-full p-4 border rounded-xl bg-slate-50" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" />
                   </div>
                   <div>
                       <label className="block text-purple-700 font-bold mb-1">Location</label>
                       <input className="w-full p-4 border rounded-xl bg-slate-50" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Location" />
                   </div>
                   <div>
                       <label className="block text-purple-700 font-bold mb-1">Skills</label>
                       <textarea className="w-full p-4 border rounded-xl bg-slate-50 h-24" value={formData.skills || ''} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="Skills (comma separated)" />
                   </div>
               </div>
               <div className="space-y-4">
                   <div>
                       <label className="block text-purple-700 font-bold mb-1">Bio</label>
                       <textarea className="w-full p-4 border rounded-xl bg-slate-50 h-24" value={formData.bio || ''} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Write your bio..." />
                   </div>
                   <div>
                       <label className="block text-purple-700 font-bold mb-1">Experience</label>
                       <textarea className="w-full p-4 border rounded-xl bg-slate-50 h-24" value={formData.experience || ''} onChange={e => setFormData({...formData, experience: e.target.value})} placeholder="Role at Company (per line)" />
                   </div>
                   <button onClick={handleUpdate} className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">Save All Changes</button>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-3">ABOUT ME</h3>
                <p className="text-gray-700">{data.bio || "No bio added yet."}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">SKILLS</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(data.skills) ? data.skills.map((s, i) => <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm">{s}</span>) : <span className="text-gray-400">No skills added.</span>}
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-4">EXPERIENCE</h3>
                  {data.experience && data.experience.length > 0 ? data.experience.map((e, i) => (
                    <div key={i} className="mb-2"><p className="font-semibold text-gray-800">● {e.role}</p><p className="text-gray-600 text-sm ml-5">at {e.company}</p></div>
                  )) : <p className="text-gray-400">No experience added.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}