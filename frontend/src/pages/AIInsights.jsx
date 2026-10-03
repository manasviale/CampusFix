import React, { useState, useEffect } from 'react';
import { Brain, FileText, Target, Loader2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AIInsights = () => {
  const [stats, setStats] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/insights');
      const raw = res.data.data || res.data.stats || res.data;
      const byCategory = {};
      (raw.categories || []).forEach(c => { byCategory[c.name] = c.count; });
      const byPriority = {};
      (raw.priorities || []).forEach(p => { byPriority[p.name] = p.count; });
      setStats({
        ...raw,
        total: raw.totalTickets ?? raw.total ?? 0,
        byCategory: Object.keys(byCategory).length > 0 ? byCategory : (raw.byCategory || {}),
        byPriority: Object.keys(byPriority).length > 0 ? byPriority : (raw.byPriority || {})
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const generateBriefing = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/insights/generate');
      const b = res.data.data || res.data.briefing || res.data;
      setBriefing({
        summary: b.summary || 'Summary unavailable',
        observations: b.keyObservations || b.observations || [],
        recommendations: b.recommendedActions || b.recommendations || []
      });
    } catch (err) {
      console.error(err);
      alert('Failed to generate briefing');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">AI Campus Insights</h2>
          <p className="text-gray-500 text-sm">Automated analysis of all campus issues</p>
        </div>
        <button
          onClick={generateBriefing}
          disabled={generating}
          className="bg-secondary hover:bg-secondary-hover text-white px-4 py-2 rounded-md font-medium flex items-center disabled:opacity-70"
        >
          {generating ? <Loader2 size={18} className="animate-spin mr-2" /> : <Brain size={18} className="mr-2" />}
          {generating ? 'Analyzing...' : 'Generate New Briefing'}
        </button>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>}

      {/* AI Briefing Report */}
      {briefing && (
        <div className="bg-white rounded-lg shadow-sm border border-secondary/30 overflow-hidden">
          <div className="bg-secondary/10 px-6 py-4 border-b border-secondary/20 flex justify-between items-center">
            <h3 className="font-bold text-secondary flex items-center">
              <FileText size={20} className="mr-2" />
              Executive AI Briefing
            </h3>
            <span className="text-xs text-secondary-hover">Generated just now</span>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Executive Summary</h4>
              <p className="text-gray-700 leading-relaxed">{briefing.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                  <Target size={16} className="mr-2 text-primary" /> Key Observations
                </h4>
                <ul className="space-y-2">
                  {(briefing.observations || []).map((obs, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2 flex-shrink-0"></span>
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                  <RefreshCw size={16} className="mr-2 text-green-600" /> Recommended Actions
                </h4>
                <ul className="space-y-2">
                  {(briefing.recommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 mr-2 flex-shrink-0"></span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats visualizations (Simple CSS bars) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4">Issues by Category</h3>
            <div className="space-y-4">
              {Object.entries(stats.byCategory || {}).map(([cat, count]) => {
                const percentage = Math.round((count / stats.total) * 100) || 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium">{cat}</span>
                      <span className="text-gray-900 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4">Issues by Priority</h3>
            <div className="space-y-4">
              {Object.entries(stats.byPriority || {}).map(([prio, count]) => {
                const percentage = Math.round((count / stats.total) * 100) || 0;
                const colors = {
                  'Low': 'bg-green-500',
                  'Medium': 'bg-yellow-400',
                  'High': 'bg-orange-500',
                  'Urgent': 'bg-red-600',
                  'low': 'bg-green-500',
                  'medium': 'bg-yellow-400',
                  'high': 'bg-orange-500',
                  'urgent': 'bg-red-600'
                };
                return (
                  <div key={prio}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 font-medium capitalize">{prio}</span>
                      <span className="text-gray-900 font-bold">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`${colors[prio] || 'bg-primary'} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
