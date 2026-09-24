import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Send } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useBoardStore from '../store/useBoardStore';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export default function TaskModal({ task, onClose, projectId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const user = useAuthStore(state => state.user);
  
  const currentProject = useBoardStore(state => state.currentProject);
  const fetchBoard = useBoardStore(state => state.fetchBoard);
  const allMembers = currentProject ? [currentProject.owner, ...currentProject.members] : [];

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/boards/${projectId}/tasks/${task._id}/comments`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        setComments(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchComments();

    const socket = io('http://localhost:5000');
    socket.on('comment_added', (comment) => {
      if (comment.task === task._id) {
        setComments(prev => [comment, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [task._id, projectId, user?.token]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment) return;
    try {
      await axios.post(`http://localhost:5000/api/boards/${projectId}/tasks/${task._id}/comments`, {
        content: newComment
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (userId) => {
    try {
      let newAssignees = [...(task.assignees || [])];
      const isAssigned = newAssignees.some(a => (a._id || a) === userId);
      
      if (isAssigned) {
        newAssignees = newAssignees.filter(a => (a._id || a) !== userId);
      } else {
        newAssignees.push(userId);
      }

      await axios.put(`http://localhost:5000/api/boards/${projectId}/tasks/${task._id}`, {
        assignees: newAssignees
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      
      toast.success('Assignees updated');
      fetchBoard(projectId);
    } catch (err) {
      toast.error('Failed to update assignees');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {/* Assignees Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Assignees</h3>
            <div className="flex flex-wrap items-center gap-2">
              {task.assignees?.map(a => (
                <span key={a._id} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium flex items-center">
                  {a.name}
                  <button onClick={() => handleAssign(a._id)} className="ml-2 text-blue-500 hover:text-blue-800">
                    <X size={14} />
                  </button>
                </span>
              ))}
              
              <select 
                onChange={(e) => { if(e.target.value) handleAssign(e.target.value); e.target.value=''; }}
                className="text-sm border border-gray-300 rounded-full px-3 py-1 outline-none bg-white hover:bg-gray-50 cursor-pointer"
                value=""
              >
                <option value="" disabled>+ Assign</option>
                {allMembers.map(m => (
                  <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Description</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Activity</h3>
            
            <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                <Send size={18} />
              </button>
            </form>

            <div className="space-y-4">
              {comments.map(c => (
                <div key={c._id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    {c.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100 flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">{c.user.name}</span>
                      <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
