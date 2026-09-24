import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useBoardStore from '../store/useBoardStore';
import useAuthStore from '../store/useAuthStore';
import { LogOut, Plus } from 'lucide-react';

export default function Dashboard() {
  const { projects, fetchProjects, createProject, isLoading } = useBoardStore();
  const { user, logout } = useAuthStore();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    await createProject(newTitle, newDesc);
    setNewTitle('');
    setNewDesc('');
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Project Hub</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hello, {user?.name}</span>
          <button onClick={logout} className="flex items-center text-red-500 hover:text-red-700">
            <LogOut size={18} className="mr-1" /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl p-6 mx-auto mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Your Projects</h2>
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" /> New Project
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 mb-6 bg-white rounded-lg shadow-sm border">
            <h3 className="mb-4 text-lg font-medium">Create New Project</h3>
            <div className="flex gap-4 mb-4">
              <input 
                type="text" 
                placeholder="Project Title" 
                className="flex-1 px-3 py-2 border rounded-md"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="Description (Optional)" 
                className="flex-1 px-3 py-2 border rounded-md"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700">Save</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p>Loading projects...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link 
                key={project._id} 
                to={`/project/${project._id}`}
                className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{project.members?.length || 0} member(s)</span>
                </div>
              </Link>
            ))}
            {projects.length === 0 && !isCreating && (
              <p className="text-gray-500 col-span-full">No projects found. Create one to get started.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
