import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, complaint: null });
  
  // Edit form state
  const [editForm, setEditForm] = useState({ status: '', priority: '', category: '', department: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/tickets?limit=100');
      const list = response.data.data || response.data.tickets || (Array.isArray(response.data) ? response.data : []);
      setComplaints(list);
    } catch (error) {
      console.error('Failed to fetch', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tickets/${deleteDialog.id}`);
      setComplaints(complaints.filter(c => (c._id || c.id) !== deleteDialog.id));
      setDeleteDialog({ isOpen: false, id: null });
    } catch (error) {
      console.error('Failed to delete', error);
      alert('Failed to delete ticket');
    }
  };

  const openEdit = (complaint) => {
    setEditModal({ isOpen: true, complaint });
    setEditForm({
      status: complaint.status || 'Submitted',
      priority: complaint.priority || 'Medium',
      category: complaint.category || 'Other',
      department: complaint.department || 'Maintenance'
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const id = editModal.complaint._id || editModal.complaint.id;
      const res = await api.patch(`/tickets/${id}`, editForm);
      
      // Update local state
      setComplaints(complaints.map(c => 
        (c._id || c.id) === id ? { ...c, ...editForm } : c
      ));
      
      setEditModal({ isOpen: false, complaint: null });
    } catch (error) {
      console.error('Failed to update', error);
      alert('Failed to update ticket');
    } finally {
      setSaving(false);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-primary"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title / Dept</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComplaints.map((complaint) => (
                <tr key={complaint._id || complaint.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{complaint.title}</div>
                    <div className="text-sm text-gray-500">{complaint.department || 'Unassigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link to={`/complaints/${complaint._id || complaint.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded">
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => openEdit(complaint)} className="text-amber-600 hover:text-amber-900 bg-amber-50 p-1.5 rounded">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => setDeleteDialog({ isOpen: true, id: complaint._id || complaint.id })} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, id: null })}
      />

      {/* Edit Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Edit Ticket</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In Review">In Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select 
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={editForm.priority} onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2" value={editForm.department} onChange={(e) => setEditForm({...editForm, department: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setEditModal({isOpen: false, complaint: null})} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-primary text-white rounded-md">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
