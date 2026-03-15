import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Home, Users, Play, Store, Menu, Bell, MessageCircle, LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Link to="/" className="text-blue-600 font-bold text-3xl tracking-tighter">SocialSync</Link>
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1.5 ml-2">
          <Search className="w-4 h-4 text-gray-500 mr-2" />
          <input 
            type="text" 
            placeholder="Search SocialSync" 
            className="bg-transparent border-none outline-none text-sm w-48"
          />
        </div>
      </div>

      {/* Center */}
      <div className="hidden lg:flex items-center gap-2 h-full">
        <NavItem icon={<Home />} active to="/" />
        <NavItem icon={<Users />} to="/friends" />
        <NavItem icon={<Play />} to="/watch" />
        <NavItem icon={<Store />} to="/marketplace" />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Link to={`/profile/${user.id}`} className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-full pr-3">
              <img src={user.profilePic} alt="" className="w-7 h-7 rounded-full object-cover" />
              <span className="text-sm font-medium hidden sm:block">{user.fullName.split(' ')[0]}</span>
            </Link>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                  <Link to={`/profile/${user.id}`} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
                    <img src={user.profilePic} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-sm">{user.fullName}</p>
                      <p className="text-xs text-gray-500">See your profile</p>
                    </div>
                  </Link>
                  <hr className="my-2" />
                  <Link to="/admin" className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md">
                    <div className="p-2 bg-gray-200 rounded-full"><ShieldCheck className="w-5 h-5" /></div>
                    <span className="text-sm font-medium">Admin Panel</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md text-left"
                  >
                    <div className="p-2 bg-gray-200 rounded-full"><LogOut className="w-5 h-5" /></div>
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm">Login</Link>
        )}
      </div>
    </nav>
  );
}

function NavItem({ icon, active, to }: { icon: React.ReactNode, active?: boolean, to: string }) {
  return (
    <Link 
      to={to}
      className={cn(
        "px-10 h-full flex items-center border-b-4 transition",
        active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:bg-gray-100"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
    </Link>
  );
}
