import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      navigate('/login');
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-blue-600 text-5xl font-bold tracking-tighter mb-8">SocialSync</h1>
      
      <div className="w-full max-w-[430px] bg-white p-4 rounded-lg shadow-xl">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Create a new account</h2>
          <p className="text-gray-500">It's quick and easy.</p>
        </div>
        <hr className="mb-4" />
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md outline-none"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
          />
          <input 
            type="text" 
            placeholder="Username" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md outline-none"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
          />
          <input 
            type="email" 
            placeholder="Email address" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md outline-none"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input 
            type="password" 
            placeholder="New password" 
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md outline-none"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          <p className="text-[11px] text-gray-500 leading-tight">
            By clicking Sign Up, you agree to our Terms, Data Policy and Cookie Policy. You may receive SMS notifications from us and can opt out at any time.
          </p>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md font-bold text-lg hover:bg-green-700 transition">
            Sign Up
          </button>
          <div className="text-center">
            <Link to="/login" className="text-blue-600 text-sm hover:underline">Already have an account?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
