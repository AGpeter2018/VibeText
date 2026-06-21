import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import Avatar from 'boring-avatars';
import { Sparkles, TrendingUp, Heart, Share2, Flame, Plus, Clock, MessageCircle } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get('feed');
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleUpvote = async (id: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    
    // Optimistic UI update
    const isLiked = likedPosts.has(id);
    const newLiked = new Set(likedPosts);
    if (isLiked) {
      // For MVP, we only allow upvoting, not removing upvotes, but let's toggle UI state for effect
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedPosts(newLiked);

    try {
      await api.post(`feed/upvote/${id}`);
      setPosts(posts.map(p => p._id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
    } catch (err) {
      console.error('Failed to upvote', err);
      // Revert optimistic update
      const revertedLiked = new Set(likedPosts);
      isLiked ? revertedLiked.add(id) : revertedLiked.delete(id);
      setLikedPosts(revertedLiked);
    }
  };

  const trendingTags = ['Gen Z', 'Corporate', 'Shakespeare', 'Cyberpunk', 'Romantic'];

  return (
    <div className="flex justify-center gap-8 max-w-7xl mx-auto w-full relative">
      
      {/* Left Sidebar - Navigation / Filters */}
      <div className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)]">
        <div className="glassmorphism rounded-3xl p-6 flex flex-col gap-6">
          <Link to="/tune" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20">
            <Plus size={20} /> New Vibe
          </Link>
          
          <nav className="flex flex-col gap-2">
            <a href="#" className="flex items-center gap-3 text-white bg-white/10 px-4 py-3 rounded-xl font-medium transition-colors">
              <Sparkles size={20} className="text-primary-400" /> For You
            </a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
              <TrendingUp size={20} className="text-accent-400" /> Trending
            </a>
            <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white hover:bg-white/5 px-4 py-3 rounded-xl font-medium transition-colors">
              <Clock size={20} className="text-indigo-400" /> Recent
            </a>
          </nav>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map(tag => (
                <span key={tag} className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors border border-white/5">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed Column */}
      <div className="flex-1 max-w-2xl w-full flex flex-col gap-6 pb-20">
        
        {/* Mobile Tune Button */}
        <div className="lg:hidden w-full mb-2">
          <Link to="/tune" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20">
            <Plus size={20} /> Create a New Vibe
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-slate-500 py-20 glassmorphism rounded-3xl flex flex-col items-center">
            <Sparkles size={48} className="text-slate-700 mb-4" />
            <p className="text-lg">The wall is empty. Be the first to spark a vibe!</p>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div 
                key={post._id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glassmorphism p-6 rounded-3xl flex flex-col gap-5 hover:border-white/20 transition-colors"
              >
                {/* Post Header with Avatar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size={40}
                      name={post.authorId || post._id} // Use ID as seed for anon
                      variant="beam"
                      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                    />
                    <div>
                      <h4 className="text-white font-semibold text-sm">
                        {post.authorId ? 'CreativeViber' : 'Anonymous'}
                      </h4>
                      <p className="text-slate-500 text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary-500/10 text-primary-400 text-xs font-bold px-3 py-1 rounded-full border border-primary-500/20">
                      {post.vibe}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2 py-1 rounded-full border border-white/5">
                      Lvl {post.intensity}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex flex-col gap-3">
                  <div className="text-slate-400 text-sm italic border-l-2 border-slate-700 pl-3">
                    "{post.originalText}"
                  </div>
                  <div className="text-white text-xl leading-relaxed font-medium">
                    {post.tunedText}
                  </div>
                </div>
                
                {/* Post Actions */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-2">
                  <div className="flex gap-6">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleUpvote(post._id)}
                      className={`flex items-center gap-2 font-semibold transition-colors ${likedPosts.has(post._id) ? 'text-accent-400' : 'text-slate-400 hover:text-accent-400'}`}
                    >
                      <Heart size={20} className={likedPosts.has(post._id) ? 'fill-accent-400' : ''} />
                      <span>{post.upvotes}</span>
                    </motion.button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold">
                      <MessageCircle size={20} />
                      <span>Reply</span>
                    </button>
                  </div>
                  <button className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                    <Share2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Right Sidebar - Trending / Community */}
      <div className="hidden xl:block w-80 shrink-0 sticky top-24 h-[calc(100vh-6rem)]">
        <div className="glassmorphism rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Flame size={20} className="text-orange-500" />
            <h3 className="font-bold text-white text-lg">Trending Vibes</h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {[
              { title: 'Gen Z Corporate Email', posts: '2.4k' },
              { title: 'Cyberpunk Apology', posts: '1.1k' },
              { title: 'Shakespearean Resignation', posts: '856' }
            ].map((trend, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer">
                <div>
                  <p className="text-slate-500 text-xs mb-1">Trending #{i + 1}</p>
                  <p className="text-white font-semibold group-hover:text-primary-400 transition-colors">{trend.title}</p>
                </div>
                <span className="text-xs font-medium bg-white/5 px-2 py-1 rounded text-slate-400">{trend.posts} vibes</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glassmorphism rounded-3xl p-6 bg-gradient-to-br from-primary-900/40 to-transparent border border-primary-500/20">
          <h3 className="font-bold text-white mb-2">Join the Movement</h3>
          <p className="text-slate-400 text-sm mb-4">Sign in to publish your creations, upvote your favorites, and build your vibe profile.</p>
          {!isAuthenticated && (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="w-full bg-white text-slate-900 font-bold py-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Sign In Now
            </button>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
