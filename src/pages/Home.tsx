import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Feed from '../components/Feed';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Users, Megaphone } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-14 flex justify-between">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Feed */}
        <main className="flex-1 xl:ml-72 xl:mr-72">
          <Feed />
        </main>

        {/* Right Sidebar */}
        <div className="fixed right-0 top-14 bottom-0 w-72 p-4 overflow-y-auto hidden xl:block">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-500">Sponsored</h3>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <img src="https://picsum.photos/seed/tech/200/200" alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">SocialSync Pro</p>
                  <p className="text-xs text-gray-500">socialsync.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-500">Announcements</h3>
              <Megaphone className="w-4 h-4 text-gray-500" />
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                Welcome to the new SocialSync platform!
              </p>
            </div>
          </div>
          
          <div className="mt-4 px-2">
            <div className="flex items-center justify-between text-gray-500 font-semibold mb-2">
              <span>Contacts</span>
              <div className="flex gap-2">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <ContactItem name="John Doe" />
              <ContactItem name="Jane Smith" />
              <ContactItem name="Admin User" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition cursor-pointer">
      <div className="relative">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-xs">
          {name[0]}
        </div>
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
      <span className="text-sm font-medium">{name}</span>
    </div>
  );
}
