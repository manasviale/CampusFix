import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Building, Brain, User as UserIcon } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import UpvoteButton from '../components/UpvoteButton';
import LoadingSpinner from '../components/LoadingSpinner';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/tickets/${id}`);
        setComplaint(response.data.data || response.data.ticket || response.data);
      } catch (err) {
        setError('Failed to load complaint details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
  if (!complaint) return <div className="text-gray-500 text-center p-8">Complaint not found.</div>;

  const date = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to list
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {(complaint.image || complaint.imageUrl) && (
          <div className="w-full h-64 md:h-96 bg-gray-100 border-b border-gray-200">
            <img 
              src={`/uploads/${complaint.image || complaint.imageUrl}`} 
              alt={complaint.title}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
              {complaint.category || 'General'}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{complaint.title}</h1>

          <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap">
            {complaint.description}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-8">
            <div className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium text-gray-900">{complaint.location || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Building className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Department</p>
                <p className="text-sm font-medium text-gray-900">{complaint.department || 'Unassigned'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Reported On</p>
                <p className="text-sm font-medium text-gray-900">{date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserIcon className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Reporter</p>
                <p className="text-sm font-medium text-gray-900">{complaint.createdBy?.name || complaint.reportedBy?.name || 'Anonymous'}</p>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          {(complaint.aiSummary || complaint.aiSuggestedAction) && (
            <div className="mb-8 border border-secondary/30 rounded-lg overflow-hidden">
              <div className="bg-secondary/10 px-4 py-3 border-b border-secondary/20 flex items-center gap-2 text-secondary font-medium">
                <Brain size={18} />
                AI Analysis & Insights
              </div>
              <div className="p-4 bg-white space-y-4">
                {complaint.aiSummary && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Issue Summary</h4>
                    <p className="text-sm text-gray-700">{complaint.aiSummary}</p>
                  </div>
                )}
                {complaint.aiSuggestedAction && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Suggested Action</h4>
                    <p className="text-sm text-gray-700">{complaint.aiSuggestedAction}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600 mb-2 font-medium">Are you also affected by this issue?</p>
              <UpvoteButton 
                ticketId={complaint._id || complaint.id} 
                initialUpvoteCount={complaint.upvoteCount}
                initialHasUpvoted={complaint.hasUpvoted}
                initialAffectedCount={complaint.affectedCount}
                initialIsAffected={complaint.isAffected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
