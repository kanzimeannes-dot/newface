import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Bookmark, Clock, ChevronDown, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="fixed left-0 top-14 bottom-0 w-72 p-2 overflow-y-auto hidden xl:block">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition">
        <img src={user.profilePic} alt="" className="w-9 h-9 rounded-full object-cover" />
        <span className="font-medium text-sm">{user.fullName}</span>
      </Link>
      
      <SidebarItem icon={<Users className="text-blue-500" />} label="Friends" />
      <SidebarItem icon={<Clock className="text-blue-400" />} label="Memories" />
      <SidebarItem icon={<Bookmark className="text-purple-500" />} label="Saved" />
      <SidebarItem icon={<ChevronDown className="bg-gray-200 rounded-full p-1" />} label="See more" />
      
      <hr className="my-4 border-gray-300 mx-2" />
      
      <h3 className="px-2 text-gray-500 font-semibold text-base mb-2">Your shortcuts</h3>
      <SidebarItem icon={<div className="w-9 h-9 bg-gray-300 rounded-lg" />} label="SocialSync Group" />
    </div>
  );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded-lg transition cursor-pointer">
      <div className="w-9 h-9 flex items-center justify-center">
        {icon}
      </div>
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}
