'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../../../components/DashboardSidebar';

export default function MySkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/skills', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setSkills(data);
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const handleDelete = async (skillId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this skill?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert("Skill deleted successfully!");
        setSkills(skills.filter(skill => skill._id !== skillId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete skill.");
      }
    } catch (err) {
      console.error("Error deleting skill:", err);
      alert("An error occurred while deleting the skill.");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Component */}
      <DashboardSidebar active="skills" />

      {/* Main Content Area */}
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-950">My Skills</h1>
            <Link href="/dashboard/my-skills/add" className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700">
              + Add New Skill
            </Link>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : skills.length === 0 ? (
            <p>No skills found. Add one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill) => (
                <div key={skill._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="text-xl font-bold text-gray-950">{skill.title}</h3>
                  <div className="flex gap-2 my-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium">{skill.category}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{skill.proficiencyLevel}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 flex-grow">{skill.description}</p>
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
                    <div>
                      {skill.isSwapAvailable ? (
                        <p className="text-green-600 text-xs font-bold">✓ Available for swap</p>
                      ) : (
                        <p className="text-gray-400 text-xs font-bold">Not available for swap</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/dashboard/my-skills/edit/${skill._id}`} 
                        className="text-xs bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-100 transition-colors"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(skill._id)} 
                        className="text-xs bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}