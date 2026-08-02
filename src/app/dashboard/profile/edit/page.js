'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', bio: '', skills: '', experience: [] });

  useEffect(() => {
    fetch('/api/profile', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }})
      .then(res => res.json())
      .then(data => setFormData({ ...data, skills: data.skills?.join(', ') || '' }));
  }, []);

  const handleSave = async () => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (res.ok) router.push('/dashboard/profile');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <input className="w-full border p-2 mb-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Name" />
      <textarea className="w-full border p-2 mb-2" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Bio" />
      <input className="w-full border p-2 mb-2" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder="Skills (comma separated)" />
      <button onClick={handleSave} className="bg-purple-600 text-white p-2 w-full rounded">Save</button>
    </div>
  );
}