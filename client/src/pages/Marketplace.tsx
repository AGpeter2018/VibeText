import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowUpCircle, Plus, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import Avatar from 'boring-avatars';

export default function Marketplace() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpvote = async (id: string) => {
    if (!isAuthenticated) return setIsAuthOpen(true);
    
    try {
      const res = await api.post(`/requests/${id}/upvote`);
      setRequests(requests.map(req => {
        if (req._id === id) {
          // Optimistic local update logic is handled by API response
          const upvotes = req.upvotes || [];
          const hasUpvoted = res.data.hasUpvoted;
          return {
            ...req,
            upvotes: hasUpvoted ? [...upvotes, user?._id] : upvotes.filter((uId: string) => uId !== user?._id)
          };
        }
        return req;
      }));
    } catch (err) {
      console.error('Failed to upvote', err);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return setIsAuthOpen(true);
    if (!newTitle.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/requests', { title: newTitle, description: newDescription });
      setShowNewRequest(false);
      setNewTitle('');
      setNewDescription('');
      fetchRequests(); // Reload
    } catch (err) {
      console.error('Failed to create request', err);
      alert('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-4 inline-flex items-center gap-3">
          <MessageSquare size={40} className="text-primary-500" />
          Vibe Request Marketplace
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Need a specific vibe but can't find it? Request it here. 
          The community will upvote the best requests, and creators can fulfill them!
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Top Requests</h2>
        <button 
          onClick={() => isAuthenticated ? setShowNewRequest(!showNewRequest) : setIsAuthOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
        >
          {showNewRequest ? 'Cancel' : <><Plus size={20} /> Request a Vibe</>}
        </button>
      </div>

      <AnimatePresence>
        {showNewRequest && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <form onSubmit={handleSubmitRequest} className="glassmorphism p-6 rounded-3xl border border-primary-500/30">
              <h3 className="text-xl font-bold text-white mb-4">What vibe do you need?</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Short Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Sales pitch for Lagos merchants"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1">Details</label>
                  <textarea 
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Describe exactly what you are looking for..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 min-h-[100px]"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 glassmorphism rounded-3xl border border-white/5">
          <Sparkles size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-lg text-slate-400 font-medium">No requests yet.</p>
          <p className="text-slate-500">Be the first to request a custom vibe!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req, index) => {
            const upvoteCount = req.upvotes?.length || 0;
            const hasUpvoted = req.upvotes?.includes(user?._id);

            return (
              <motion.div 
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glassmorphism p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-colors flex gap-6"
              >
                {/* Upvote Button Column */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <button 
                    onClick={() => handleUpvote(req._id)}
                    className={`flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all ${hasUpvoted ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5'}`}
                  >
                    <ArrowUpCircle size={24} className="mb-1" />
                    <span className="font-bold text-sm leading-none">{upvoteCount}</span>
                  </button>
                </div>

                {/* Content Column */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-white mb-2">{req.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{req.description}</p>
                  
                  <div className="flex items-center gap-2">
                    {req.authorId?.picture ? (
                      <img src={req.authorId.picture} alt="avatar" className="w-6 h-6 rounded-full" />
                    ) : (
                      <Avatar size={24} name={req.authorId?._id || req._id} variant="beam" />
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      Requested by {req.authorId?.name || 'Unknown'} • {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
