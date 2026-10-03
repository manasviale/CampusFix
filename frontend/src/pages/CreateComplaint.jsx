import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, X, Loader2, Brain, AlertCircle, MapPin, ExternalLink, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import UpvoteButton from '../components/UpvoteButton';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [userMarkedAffected, setUserMarkedAffected] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (duplicateData) {
      setDuplicateData(null);
      setUserMarkedAffected(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image must be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e, forceSubmit = false) => {
    if (e) e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields (title, location, and description).');
      return;
    }

    // Step 1: AI Duplicate Check (before submitting, unless user explicitly clicked "Create New Issue")
    if (!forceSubmit) {
      setCheckingDuplicate(true);
      try {
        const checkRes = await api.post('/tickets/check-duplicate', {
          title: formData.title,
          description: formData.description,
          location: formData.location,
          category: formData.category || undefined
        });

        if (checkRes.data && checkRes.data.isDuplicate && checkRes.data.duplicateTicket) {
          setDuplicateData(checkRes.data);
          setCheckingDuplicate(false);
          return; // Pause submission and present the similar issue
        }
      } catch (checkErr) {
        console.warn('AI duplicate detection check failed, proceeding normally:', checkErr);
      } finally {
        setCheckingDuplicate(false);
      }
    }

    // Step 2: Proceed with Complaint Creation
    setLoading(true);
    setDuplicateData(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('location', formData.location);
      if (formData.category) data.append('category', formData.category);
      if (image) data.append('image', image);

      // Backend processes with Claude/fallback AI and returns the classified ticket
      const response = await api.post('/tickets', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newTicket = response.data.data || response.data.ticket || response.data;
      
      // Show AI results momentarily before redirecting
      setAiResult(newTicket);
      
      setTimeout(() => {
        navigate(`/complaints/${newTicket._id || newTicket.id}`);
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
      setLoading(false);
    }
  };

  if (aiResult) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Analyzed Successfully!</h2>
        <p className="text-gray-600 mb-8">Our AI has categorized and routed your submission.</p>
        
        <div className="grid grid-cols-3 gap-4 mb-8 text-left">
          <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Category</span>
            <span className="font-medium text-gray-900">{aiResult.category}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Priority</span>
            <span className="font-medium text-gray-900 capitalize">{aiResult.priority}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
            <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Department</span>
            <span className="font-medium text-gray-900">{aiResult.department}</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500">Redirecting to details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h2>
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm border border-red-100">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="Brief summary of the issue (e.g., Water cooler leaking near library)"
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location Details</label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Lab Block B, Room 204"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-xs text-gray-400 font-normal">(Optional - AI will classify if empty)</span>
            </label>
            <select
              name="category"
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Auto-Detect with AI</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Electrical">Electrical</option>
              <option value="Internet">Internet & Wi-Fi</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Water">Water & Plumbing</option>
              <option value="Hostel">Hostel</option>
              <option value="Security">Security</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Library">Library</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
          <textarea
            name="description"
            required
            rows="5"
            placeholder="Provide as much detail as possible to help maintenance locate and fix the issue..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo Evidence</label>
          
          {!preview ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={40} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">Click to upload image</p>
              <p className="text-xs text-gray-500">JPG, PNG, WebP up to 5MB</p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 inline-block">
              <img src={preview} alt="Preview" className="max-h-64 object-contain bg-gray-50" />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || checkingDuplicate}
            className="px-6 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary-hover flex items-center disabled:opacity-70 disabled:cursor-not-allowed text-sm transition-colors shadow-xs"
          >
            {checkingDuplicate ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Checking for similar issues with AI...
              </>
            ) : loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Analyzing & Submitting...
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
        </div>
      </form>

      {/* AI Duplicate Detection Modal */}
      {duplicateData && duplicateData.duplicateTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Header */}
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl flex-shrink-0">
                <AlertCircle size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">Similar Issue Already Reported</h3>
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                    <Sparkles size={12} />
                    AI Match ({Math.round((duplicateData.confidence || 0.8) * 100)}%)
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5">
                  {duplicateData.reason || 'We detected an open issue that reports a very similar problem at this location. Review it below to avoid duplicate reports.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateData(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Similar Existing Issue Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <div className="flex gap-2 items-center flex-wrap">
                  <StatusBadge status={duplicateData.duplicateTicket.status} />
                  <PriorityBadge priority={duplicateData.duplicateTicket.priority} />
                  <span className="text-xs font-medium text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded">
                    {duplicateData.duplicateTicket.category || 'General'}
                  </span>
                </div>
                {duplicateData.duplicateTicket.location && (
                  <div className="flex items-center text-xs text-gray-700 gap-1 font-medium bg-white px-2.5 py-1 rounded-md border border-gray-200 shadow-2xs">
                    <MapPin size={13} className="text-secondary" />
                    <span>{duplicateData.duplicateTicket.location}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 leading-snug">
                  {duplicateData.duplicateTicket.title}
                </h4>
                <p className="text-sm text-gray-700 mt-1.5 line-clamp-3 leading-relaxed">
                  {duplicateData.duplicateTicket.description}
                </p>
              </div>

              {/* Action Area: Affected Count, View Issue, I'm Affected */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span>Affected Count:</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {duplicateData.duplicateTicket.affectedCount ?? duplicateData.duplicateTicket.upvoteCount ?? 0}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Issue Button */}
                  <a
                    href={`/complaints/${duplicateData.duplicateTicket._id || duplicateData.duplicateTicket.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    <ExternalLink size={13} />
                    View Issue
                  </a>

                  {/* I'm Affected Button */}
                  <UpvoteButton
                    ticketId={duplicateData.duplicateTicket._id || duplicateData.duplicateTicket.id}
                    initialUpvoteCount={duplicateData.duplicateTicket.upvoteCount}
                    initialHasUpvoted={duplicateData.duplicateTicket.hasUpvoted}
                    initialAffectedCount={duplicateData.duplicateTicket.affectedCount}
                    initialIsAffected={duplicateData.duplicateTicket.isAffected}
                    onToggle={({ isAffected }) => {
                      if (isAffected) {
                        setUserMarkedAffected(true);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Acknowledgment if user marked affected */}
            {userMarkedAffected && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-900 text-sm animate-in fade-in">
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-emerald-900">You're marked as affected by this issue!</p>
                  <p className="text-emerald-700 text-xs mt-0.5">
                    Your support increases its priority for campus maintenance. You do not need to create a duplicate complaint.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Return to Dashboard
                    </button>
                    <a
                      href={`/complaints/${duplicateData.duplicateTicket._id || duplicateData.duplicateTicket.id}`}
                      className="px-3 py-1 bg-white text-emerald-800 border border-emerald-300 rounded text-xs font-medium hover:bg-emerald-50 transition-colors"
                    >
                      Open Complaint
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Additional similar tickets if any */}
            {duplicateData.similarTickets && duplicateData.similarTickets.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Other potentially related tickets:</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {duplicateData.similarTickets.map(sim => (
                    <div key={sim._id || sim.id} className="text-xs text-gray-700 flex justify-between items-center py-1.5 px-3 rounded-md bg-gray-50 border border-gray-200">
                      <span className="font-medium truncate max-w-sm">
                        {sim.title} <span className="text-gray-400">({sim.location || 'Campus'})</span>
                      </span>
                      <a
                        href={`/complaints/${sim._id || sim.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-secondary hover:underline ml-2 font-medium flex items-center gap-1"
                      >
                        View <ArrowRight size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Decision Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setDuplicateData(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back to Edit Complaint
              </button>

              <button
                type="button"
                onClick={() => handleSubmit(null, true)}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting New Issue...
                  </>
                ) : (
                  'My Issue is Different — Create New Issue'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateComplaint;
