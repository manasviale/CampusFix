import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import UpvoteButton from './UpvoteButton';

const ComplaintCard = ({ complaint }) => {
  const formattedDate = new Date(complaint.createdAt || Date.now()).toLocaleDateString();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {(complaint.image || complaint.imageUrl) && (
        <div className="h-40 overflow-hidden">
          <img 
            src={`/uploads/${complaint.image || complaint.imageUrl}`} 
            alt={complaint.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
          <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded-md">
            {complaint.category || 'General'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {complaint.title}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {complaint.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-1 text-xs">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
          <UpvoteButton
            ticketId={complaint._id || complaint.id}
            initialUpvoteCount={complaint.upvoteCount}
            initialHasUpvoted={complaint.hasUpvoted}
            initialAffectedCount={complaint.affectedCount}
            initialIsAffected={complaint.isAffected}
            compact={true}
          />
        </div>
        
        <Link 
          to={`/complaints/${complaint._id || complaint.id}`}
          className="mt-4 w-full text-center py-2 bg-slate-50 hover:bg-slate-100 text-primary rounded-md text-sm font-medium transition-colors border border-gray-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
