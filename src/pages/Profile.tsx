import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { Camera, Edit2, MapPin, Heart, Briefcase, CheckCircle } from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  const fetchProfile = async () => {
    const res = await fetch(`/api/users/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
      setEditData(data);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(editData).forEach(key => {
      if (editData[key] !== null) formData.append(key, editData[key]);
    });
    if (profilePic) formData.append('profilePic', profilePic);
    if (coverPhoto) formData.append('coverPhoto', coverPhoto);

    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      body: formData
    });

    if (res.ok) {
      setIsEditing(false);
      fetchProfile();
      refreshUser();
    }
  };

  if (!profile) return <div className="pt-20 text-center">Loading profile...</div>;

  const isOwnProfile = currentUser?.id == profile.id;

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar />
      
      <div className="pt-14 bg-white shadow">
        <div className="max-w-[1100px] mx-auto relative">
          {/* Cover Photo */}
          <div className="h-[350px] w-full bg-gray-200 rounded-b-lg overflow-hidden relative group">
            <img src={profile.cover_photo} alt="" className="w-full h-full object-cover" />
            {isOwnProfile && (
              <label className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-md font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-md hover:bg-gray-100 transition">
                <Camera className="w-5 h-5" />
                Add Cover Photo
                <input type="file" className="hidden" onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          {/* Profile Header */}
          <div className="px-10 pb-4 flex flex-col md:flex-row items-end gap-4 -mt-10 md:-mt-16 relative z-10">
            <div className="relative group">
              <img 
                src={profile.profile_pic} 
                alt="" 
                className="w-40 h-40 rounded-full border-4 border-white object-cover bg-white" 
              />
              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300 transition shadow-md">
                  <Camera className="w-5 h-5" />
                  <input type="file" className="hidden" onChange={(e) => setProfilePic(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>
            
            <div className="flex-1 mb-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                {profile.is_verified && <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500" />}
              </div>
              <p className="text-gray-500 font-semibold">{profile.followersCount} followers • {profile.followingCount} following</p>
            </div>

            <div className="flex gap-2 mb-4">
              {isOwnProfile ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-200 px-4 py-2 rounded-md font-semibold text-sm flex items-center gap-2 hover:bg-gray-300 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <button className="bg-blue-600 text-white px-8 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 transition">
                  Follow
                </button>
              )}
            </div>
          </div>
          
          <hr className="mx-10" />
          
          <div className="px-10 flex gap-6 text-gray-500 font-semibold text-sm py-1">
            <button className="py-3 border-b-4 border-blue-600 text-blue-600">Posts</button>
            <button className="py-3 hover:bg-gray-100 px-4 rounded-md transition">About</button>
            <button className="py-3 hover:bg-gray-100 px-4 rounded-md transition">Friends</button>
            <button className="py-3 hover:bg-gray-100 px-4 rounded-md transition">Photos</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto mt-4 px-4 flex flex-col lg:flex-row gap-4">
        {/* Left Column - Intro */}
        <div className="w-full lg:w-[400px] space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Intro</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <span>Works at <strong>SocialSync</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>From <strong>{profile.location || 'Unknown'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Heart className="w-5 h-5 text-gray-500" />
                <span><strong>{profile.relationship_status || 'Single'}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold">Hobbies:</span>
                <span>{profile.hobbies || 'None listed'}</span>
              </div>
            </div>
            {isOwnProfile && (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full bg-gray-100 hover:bg-gray-200 transition py-2 rounded-md font-semibold text-sm mt-4"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Posts */}
        <div className="flex-1">
          <div className="bg-white p-4 rounded-lg shadow text-center py-20 text-gray-500">
            No posts to show yet.
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md outline-none"
                  value={editData.full_name}
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Age</label>
                  <input 
                    type="number" 
                    className="w-full p-2 border border-gray-300 rounded-md outline-none"
                    value={editData.age}
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Gender</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md outline-none"
                    value={editData.gender}
                    onChange={(e) => setEditData({...editData, gender: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Location</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md outline-none"
                  value={editData.location}
                  onChange={(e) => setEditData({...editData, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Relationship Status</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md outline-none"
                  value={editData.relationship_status}
                  onChange={(e) => setEditData({...editData, relationship_status: e.target.value})}
                >
                  <option value="Single">Single</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Married">Married</option>
                  <option value="It's complicated">It's complicated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Hobbies</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md outline-none"
                  rows={3}
                  value={editData.hobbies}
                  onChange={(e) => setEditData({...editData, hobbies: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
