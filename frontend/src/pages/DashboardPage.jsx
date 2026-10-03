import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats if API supports it, or derive from recent
        // We'll try to hit insights, but if user isn't faculty/admin it might 403.
        // As a fallback, we fetch standard tickets with small limit.
        const [statsRes, ticketsRes] = await Promise.allSettled([
          api.get('/insights'),
          api.get('/tickets?limit=5&sort=newest')
        ]);

        if (statsRes.status === 'fulfilled') {
          const raw = statsRes.value.data.data || statsRes.value.data.stats || statsRes.value.data;
          const statusMap = {};
          (raw.statuses || []).forEach(s => { statusMap[s.name] = s.count; });
          const priorityMap = {};
          (raw.priorities || []).forEach(p => { priorityMap[p.name] = p.count; });

          setStats({
            total: raw.totalTickets ?? raw.total ?? 0,
            open: raw.totalOpen ?? raw.open ?? 0,
            submitted: statusMap['Submitted'] || raw.open || 0,
            inProgress: statusMap['In Progress'] || statusMap['In Review'] || 0,
            resolved: statusMap['Resolved'] || 0,
            urgent: priorityMap['Urgent'] || 0,
            byStatus: statusMap,
            byPriority: priorityMap
          });
        } else {
          setStats({
            total: 0,
            open: 0,
            submitted: 0,
            inProgress: 0,
            resolved: 0,
            urgent: 0
          });
        }

        if (ticketsRes.status === 'fulfilled') {
          const list = ticketsRes.value.data.data || ticketsRes.value.data.tickets || (Array.isArray(ticketsRes.value.data) ? ticketsRes.value.data : []);
          setRecentComplaints(list);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Issues</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mr-4">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Submitted</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.open || stats?.byStatus?.['submitted'] || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full mr-4">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.inProgress || stats?.byStatus?.['in progress'] || 0}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
          <div className="p-3 bg-green-100 text-green-600 rounded-full mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Resolved</p>
            <p className="text-2xl font-bold text-gray-900">{stats?.resolved || stats?.byStatus?.['resolved'] || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 bg-red-50 flex items-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-full mr-4">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-red-800 font-medium">Urgent</p>
            <p className="text-2xl font-bold text-red-900">{stats?.urgent || stats?.byPriority?.['urgent'] || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recent Complaints</h3>
          <a href="/complaints" className="text-sm text-secondary hover:text-secondary-hover font-medium">View all</a>
        </div>
        
        {recentComplaints.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg border border-gray-200">
            <p className="text-gray-500">No complaints found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentComplaints.map(complaint => (
              <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
