import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
