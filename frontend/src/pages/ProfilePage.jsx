import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-32 bg-primary"></div>
        <div className="px-6 pb-6 relative">
          <div className="absolute -top-12 w-24 h-24 rounded-full bg-white p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-3xl font-bold text-white uppercase">
              {user.name.charAt(0)}
            </div>
          </div>
          
          <div className="pt-16">
            <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-3 text-gray-400" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <span>Member since {joinDate}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Shield className="w-5 h-5 mr-3 text-gray-400" />
                <span>Account Status: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
