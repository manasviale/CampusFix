import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Shield, User } from 'lucide-react';
import api from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const VolunteerManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, student, volunteer
  
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, 
    userId: null, 
    newRole: '', 
    userName: '' 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const list = response.data.data || response.data.users || (Array.isArray(response.data) ? response.data : []);
      setUsers(list);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    try {
      await api.patch(`/users/${confirmDialog.userId}/role`, { role: confirmDialog.newRole });
      setUsers(users.map(u => 
        (u._id || u.id) === confirmDialog.userId ? { ...u, role: confirmDialog.newRole } : u
      ));
      setConfirmDialog({ isOpen: false, userId: null, newRole: '', userName: '' });
    } catch (error) {
      console.error('Failed to change role', error);
      alert('Failed to update user role');
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'all') return true;
    return u.role === filter;
  });

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">Admin</span>;
      case 'faculty': return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Faculty</span>;
      case 'volunteer': return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Volunteer</span>;
      default: return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-bold">Student</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        
        <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          {['all', 'student', 'volunteer'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize ${
                filter === f ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((u) => {
              const id = u._id || u.id;
              // Don't allow self-editing or editing admins unless user is admin
              const canEdit = id !== (currentUser._id || currentUser.id) && 
                             (currentUser.role === 'admin' || u.role === 'student' || u.role === 'volunteer');
                             
              return (
                <tr key={id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(u.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(u.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canEdit && u.role === 'student' && (
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, userId: id, newRole: 'volunteer', userName: u.name })}
                        className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded flex items-center gap-1 ml-auto"
                      >
                        <UserCheck size={16} /> Promote
                      </button>
                    )}
                    {canEdit && u.role === 'volunteer' && (
                      <button
                        onClick={() => setConfirmDialog({ isOpen: true, userId: id, newRole: 'student', userName: u.name })}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded flex items-center gap-1 ml-auto"
                      >
                        <UserX size={16} /> Demote
                      </button>
                    )}
                    {/* Admin only options could go here */}
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={`Change Role: ${confirmDialog.userName}`}
        message={`Are you sure you want to change this user's role to ${confirmDialog.newRole}?`}
        confirmText="Confirm Change"
        variant={confirmDialog.newRole === 'student' ? 'danger' : 'primary'}
        onConfirm={handleRoleChange}
        onCancel={() => setConfirmDialog({ isOpen: false, userId: null, newRole: '', userName: '' })}
      />
    </div>
  );
};

export default VolunteerManagement;
