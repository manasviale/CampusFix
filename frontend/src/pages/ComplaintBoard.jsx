import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ComplaintBoard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sort
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (priority) params.append('priority', priority);
      if (status) params.append('status', status);

      const response = await api.get(`/tickets?${params.toString()}`);
      const list = response.data.data || response.data.tickets || (Array.isArray(response.data) ? response.data : []);
      setComplaints(list);
      setTotalPages(response.data.pagination?.pages || response.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchComplaints();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, priority, status, sort, page]);

  // Handle filter changes (reset page to 1)
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Complaint Board</h2>
        
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-secondary focus:border-secondary"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500 mr-2">
          <Filter size={18} className="mr-2" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <select 
          className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
          value={category}
          onChange={(e) => handleFilterChange(setCategory, e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Electrical">Electrical</option>
          <option value="Internet">Internet & Wi-Fi</option>
          <option value="Cleanliness">Cleanliness</option>
          <option value="Water">Water</option>
          <option value="Hostel">Hostel</option>
          <option value="Security">Security</option>
          <option value="Laboratory">Laboratory</option>
          <option value="Library">Library</option>
          <option value="Other">Other</option>
        </select>

        <select 
          className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
          value={priority}
          onChange={(e) => handleFilterChange(setPriority, e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <select 
          className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
          value={status}
          onChange={(e) => handleFilterChange(setStatus, e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Submitted">Submitted</option>
          <option value="In Review">In Review</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Sort:</span>
          <select 
            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary"
            value={sort}
            onChange={(e) => handleFilterChange(setSort, e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="mostAffected">Most Affected</option>
            <option value="highestPriority">Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">No complaints found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearch(''); setCategory(''); setPriority(''); setStatus('');
            }}
            className="text-secondary font-medium hover:underline"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {complaints.map(complaint => (
              <ComplaintCard key={complaint._id || complaint.id} complaint={complaint} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ComplaintBoard;
