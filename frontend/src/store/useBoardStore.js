import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/boards';
const PROJECT_API_URL = 'http://localhost:5000/api/projects';

const getConfig = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return {
    headers: { Authorization: `Bearer ${user?.token}` }
  };
};

const useBoardStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  lists: [],
  tasks: [],
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(PROJECT_API_URL, getConfig());
      set({ projects: res.data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  createProject: async (title, description) => {
    try {
      const res = await axios.post(PROJECT_API_URL, { title, description }, getConfig());
      set((state) => ({ projects: [...state.projects, res.data] }));
    } catch (error) {
      console.error(error);
    }
  },

  fetchBoard: async (projectId) => {
    set({ isLoading: true });
    try {
      const [projectRes, listsRes, tasksRes] = await Promise.all([
        axios.get(`${PROJECT_API_URL}/${projectId}`, getConfig()),
        axios.get(`${API_URL}/${projectId}/lists`, getConfig()),
        axios.get(`${API_URL}/${projectId}/tasks`, getConfig())
      ]);
      set({ 
        currentProject: projectRes.data,
        lists: listsRes.data,
        tasks: tasksRes.data,
        isLoading: false
      });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  createList: async (projectId, title) => {
    try {
      const res = await axios.post(`${API_URL}/${projectId}/lists`, { title }, getConfig());
      set((state) => ({ lists: [...state.lists, res.data] }));
    } catch (error) {
      console.error(error);
    }
  },

  createTask: async (projectId, listId, title, description) => {
    try {
      const res = await axios.post(`${API_URL}/${projectId}/tasks`, { title, description, listId }, getConfig());
      set((state) => ({ tasks: [...state.tasks, res.data] }));
    } catch (error) {
      console.error(error);
    }
  },

  updateTaskOrderState: (newTasks) => {
    set({ tasks: newTasks });
  },

  updateTaskOrderServer: async (projectId, tasks) => {
    try {
      await axios.put(`${API_URL}/${projectId}/tasks/order`, { tasks }, getConfig());
    } catch (error) {
      console.error('Failed to save order on server', error);
    }
  }
}));

export default useBoardStore;
