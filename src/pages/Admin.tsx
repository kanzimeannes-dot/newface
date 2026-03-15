import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart2, Shield, Trash2, CheckCircle, Ban } from 'lucide-react';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('stats');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      setIsLoggedIn(true);
      fetchStats();
      fetchUsers();
    } else {
      alert('Invalid admin credentials');
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    if (res.ok) setStats(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) setUsers(await res.json());
  };

  const handleVerify = async (id: number) => {
    await fetch(`/api/admin/users/${id}/verify`, { method: 'POST' });
    fetchUsers();
  };

  const handleBan = async (id: number) => {
    await fetch(`/api/admin/users/${id}/ban`, { method: 'POST' });
    fetchUsers();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-10 h-10 text-red-600" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Username</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 rounded-md outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input 
                type="password" 
                className="w-full p-2 border border-gray-300 rounded-md outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-md font-bold hover:bg-red-700 transition">
              Login to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-8 h-8 text-red-500" />
          <h1 className="text-xl font-bold">SocialSync Admin</h1>
        </div>
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'stats' ? 'bg-red-600' : 'hover:bg-gray-800'}`}
          >
            <BarChart2 className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'users' ? 'bg-red-600' : 'hover:bg-gray-800'}`}
          >
            <Users className="w-5 h-5" />
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${activeTab === 'posts' ? 'bg-red-600' : 'hover:bg-gray-800'}`}
          >
            <FileText className="w-5 h-5" />
            Content Control
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'stats' && stats && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Total Users" value={stats.totalUsers} color="bg-blue-500" />
              <StatCard label="Total Posts" value={stats.totalPosts} color="bg-green-500" />
              <StatCard label="Total Comments" value={stats.totalComments} color="bg-purple-500" />
              <StatCard label="Total Likes" value={stats.totalLikes} color="bg-red-500" />
            </div>
            <div className="mt-10 bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">New Users Today</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.newUsersToday}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold text-sm">User</th>
                    <th className="p-4 font-semibold text-sm">Email</th>
                    <th className="p-4 font-semibold text-sm">Status</th>
                    <th className="p-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{user.full_name}</p>
                            <p className="text-xs text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{user.email}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {user.is_verified && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Verified</span>}
                          {user.is_banned && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Banned</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleVerify(user.id)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" title="Verify User">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleBan(user.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition" title="Ban User">
                            <Ban className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition" title="Delete User">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white font-bold text-xl`}>
        {label[0]}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
