import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, Plus, UserPlus } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import axios from 'axios';
import useBoardStore from '../store/useBoardStore';
import useAuthStore from '../store/useAuthStore';
import TaskModal from '../components/TaskModal';

const socket = io('http://localhost:5000');

export default function ProjectBoard() {
  const { id: projectId } = useParams();
  const { 
    currentProject, lists, tasks, 
    fetchBoard, createList, createTask, 
    updateTaskOrderState, updateTaskOrderServer 
  } = useBoardStore();

  const user = useAuthStore(state => state.user);

  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [addingTaskToList, setAddingTaskToList] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchBoard(projectId);

    socket.emit('join_project', projectId);

    socket.on('board_updated', () => {
      fetchBoard(projectId);
    });

    socket.on('comment_added', (comment) => {
      if (comment.user._id !== user?._id) {
        toast.success(`${comment.user.name} commented on a task!`);
      }
    });

    return () => {
      socket.emit('leave_project', projectId);
      socket.off('board_updated');
      socket.off('comment_added');
    };
  }, [projectId, fetchBoard, user]);

  const handleInvite = async () => {
    const email = window.prompt("Enter the email of the user to invite:");
    if (!email) return;
    try {
      await axios.post(`http://localhost:5000/api/projects/${projectId}/members`, { email }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success('Member invited successfully!');
      fetchBoard(projectId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    }
  };

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceList = source.droppableId;
    const destList = destination.droppableId;

    let newTasks = Array.from(tasks);
    const draggedTask = newTasks.find(t => t._id === draggableId);

    if (!draggedTask) return;

    const sourceTasks = newTasks.filter(t => t.list === sourceList).sort((a,b) => a.order - b.order);
    sourceTasks.splice(source.index, 1);
    
    const destTasks = sourceList === destList ? sourceTasks : newTasks.filter(t => t.list === destList).sort((a,b) => a.order - b.order);
    
    if (sourceList !== destList) {
       draggedTask.list = destList;
    }
    
    destTasks.splice(destination.index, 0, draggedTask);

    const updatedTasks = [];
    sourceTasks.forEach((t, i) => {
      t.order = i;
      updatedTasks.push({ _id: t._id, order: i, list: sourceList });
    });
    
    if (sourceList !== destList) {
      destTasks.forEach((t, i) => {
        t.order = i;
        updatedTasks.push({ _id: t._id, order: i, list: destList });
      });
    }

    const finalTasks = newTasks.map(t => {
      const update = updatedTasks.find(u => u._id === t._id);
      if (update) {
        return { ...t, order: update.order, list: update.list };
      }
      return t;
    });

    updateTaskOrderState(finalTasks);
    updateTaskOrderServer(projectId, updatedTasks);
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle) return;
    await createList(projectId, newListTitle);
    setNewListTitle('');
    setIsAddingList(false);
  };

  const handleAddTask = async (e, listId) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    await createTask(projectId, listId, newTaskTitle, '');
    setNewTaskTitle('');
    setAddingTaskToList(null);
  };

  if (!currentProject) return <div className="p-8">Loading board...</div>;

  return (
    <div className="flex flex-col h-screen bg-blue-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-gray-500 hover:text-gray-800"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-gray-800">{currentProject.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleInvite}
            className="flex items-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <UserPlus size={16} className="mr-1" /> Invite Member
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex items-start gap-6 h-full">
            {lists.map(list => {
              const listTasks = tasks.filter(t => t.list === list._id).sort((a,b) => a.order - b.order);
              
              return (
                <div key={list._id} className="w-80 shrink-0 bg-gray-100 rounded-xl flex flex-col max-h-full">
                  <div className="p-4 font-semibold text-gray-700">{list.title}</div>
                  
                  <Droppable droppableId={list._id}>
                    {(provided, snapshot) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 p-2 overflow-y-auto min-h-[150px] ${snapshot.isDraggingOver ? 'bg-gray-200' : ''}`}
                      >
                        {listTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                                className={`p-4 mb-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:border-blue-400 ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span>{task.title}</span>
                                </div>
                                {task.assignees && task.assignees.length > 0 && (
                                  <div className="flex gap-1 mt-2">
                                    {task.assignees.map(a => (
                                      <div key={a._id} className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center" title={a.name}>
                                        {a.name.charAt(0).toUpperCase()}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="p-2">
                    {addingTaskToList === list._id ? (
                      <form onSubmit={(e) => handleAddTask(e, list._id)} className="p-2">
                        <input
                          autoFocus
                          type="text"
                          className="w-full px-3 py-2 mb-2 text-sm border rounded-md"
                          placeholder="Task title..."
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="px-3 py-1 text-sm text-white bg-blue-600 rounded">Add</button>
                          <button type="button" onClick={() => setAddingTaskToList(null)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => setAddingTaskToList(list._id)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
                      >
                        <Plus size={16} className="mr-2" /> Add a card
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="w-80 shrink-0">
              {isAddingList ? (
                <form onSubmit={handleAddList} className="p-3 bg-white rounded-xl shadow-sm border">
                  <input
                    autoFocus
                    type="text"
                    className="w-full px-3 py-2 mb-2 border rounded-md"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-1 text-white bg-blue-600 rounded">Add list</button>
                    <button type="button" onClick={() => setIsAddingList(false)} className="px-4 py-1 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAddingList(true)}
                  className="flex items-center w-full px-4 py-3 text-gray-600 bg-white/50 hover:bg-white rounded-xl border border-dashed border-gray-300"
                >
                  <Plus size={20} className="mr-2" /> Add another list
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </main>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          projectId={projectId}
        />
      )}
    </div>
  );
}
