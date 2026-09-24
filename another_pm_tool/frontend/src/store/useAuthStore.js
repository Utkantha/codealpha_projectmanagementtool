import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      localStorage.setItem('user', JSON.stringify(res.data));
      set({ user: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore;
