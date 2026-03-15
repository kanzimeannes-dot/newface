import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      login(data.user);
      navigate('/');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 p-6">
      <div className="max-w-md text-center lg:text-left">
        <h1 className="text-blue-600 text-6xl font-bold tracking-tighter mb-4">SocialSync</h1>
        <p className="text-2xl font-medium leading-tight">Connect with friends and the world around you on SocialSync.</p>
      </div>
      
      <div className="w-full max-w-[400px] bg-white p-4 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-gray-300 rounded-md focus:border-blue-500 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md font-bold text-xl hover:bg-blue-700 transition">
            Log In
          </button>
          <div className="text-center">
            <a href="#" className="text-blue-600 text-sm hover:underline">Forgotten password?</a>
          </div>
          <hr />
          <div className="text-center pt-2">
            <Link to="/register" className="bg-green-500 text-white px-6 py-3 rounded-md font-bold text-lg hover:bg-green-600 transition inline-block">
              Create new account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
