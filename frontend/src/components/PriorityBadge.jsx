import React from 'react';

const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority?.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-red-600 text-white border-red-700 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyles()}`}>
      {priority || 'Not Set'}
    </span>
  );
};

export default PriorityBadge;
