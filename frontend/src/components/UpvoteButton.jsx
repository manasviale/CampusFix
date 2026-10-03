import React, { useState, useEffect } from 'react';
import { Users, Check } from 'lucide-react';
import api from '../services/api';

const UpvoteButton = ({
  ticketId,
  initialUpvoteCount,
  initialHasUpvoted,
  initialAffectedCount,
  initialIsAffected,
  compact = false,
  onToggle
}) => {
  const initialCount = initialAffectedCount ?? initialUpvoteCount ?? 0;
  const initialStatus = initialIsAffected ?? initialHasUpvoted ?? false;

  const [count, setCount] = useState(initialCount);
  const [isAffected, setIsAffected] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCount(initialAffectedCount ?? initialUpvoteCount ?? 0);
  }, [initialAffectedCount, initialUpvoteCount]);

  useEffect(() => {
    setIsAffected(initialIsAffected ?? initialHasUpvoted ?? false);
  }, [initialIsAffected, initialHasUpvoted]);

  const handleToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoading || !ticketId) return;

    const prevIsAffected = isAffected;
    const prevCount = count;
    const nextIsAffected = !prevIsAffected;
    const nextCount = Math.max(0, prevCount + (nextIsAffected ? 1 : -1));

    setIsLoading(true);
    // Optimistic UI update
    setIsAffected(nextIsAffected);
    setCount(nextCount);

    try {
      // Use /affected route, compatible with /upvote
      const response = await api.post(`/tickets/${ticketId}/affected`);
      const serverCount = response.data.affectedCount ?? response.data.upvoteCount ?? nextCount;
      const serverStatus = response.data.isAffected ?? response.data.upvoted ?? nextIsAffected;

      setCount(serverCount);
      setIsAffected(serverStatus);
      if (onToggle) {
        onToggle({ isAffected: serverStatus, count: serverCount });
      }
    } catch (error) {
      console.error("Failed to toggle 'I'm Affected' status:", error);
      // Clean rollback on failure
      setIsAffected(prevIsAffected);
      setCount(prevCount);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        title={isAffected ? "You marked that you are affected. Click to remove." : "Click if you are affected by this issue too"}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
          isAffected
            ? 'bg-secondary text-white border-secondary hover:bg-secondary-hover shadow-xs'
            : 'bg-white text-gray-700 border-gray-300 hover:border-secondary hover:text-secondary hover:bg-teal-50/50'
        } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isAffected ? (
          <Check size={13} className="stroke-[2.5]" />
        ) : (
          <Users size={13} className="text-gray-500" />
        )}
        <span>{isAffected ? 'Affected' : "I'm Affected"}</span>
        <span
          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
            isAffected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {count}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      title={isAffected ? "You marked that you are affected. Click to remove." : "Click if you are affected by this issue too"}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all border text-sm shadow-xs ${
        isAffected
          ? 'bg-secondary text-white border-secondary hover:bg-secondary-hover'
          : 'bg-white text-gray-700 border-gray-300 hover:border-secondary hover:text-secondary hover:bg-teal-50/40'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isAffected ? (
        <Check size={18} className="stroke-[2.5]" />
      ) : (
        <Users size={18} className="text-gray-500" />
      )}
      <span>{isAffected ? "You're Affected" : "I'm Affected"}</span>
      <span
        className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          isAffected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {count}
      </span>
    </button>
  );
};

export default UpvoteButton;
