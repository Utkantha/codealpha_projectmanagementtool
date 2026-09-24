import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    const user = useAuthStore.getState().user;
    if (user) navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-3 py-2 mt-1 border rounded-md focus:ring-blue-500 focus:border-blue-500" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
