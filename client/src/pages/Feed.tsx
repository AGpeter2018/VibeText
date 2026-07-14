import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import Avatar from 'boring-avatars';
import { Sparkles, TrendingUp, Heart, Share2, Flame, Plus, Clock, MessageCircle, Copy, Check, Bookmark, Star, Shield } from 'lucide-react';

function timeAgo(dateInput: string) {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval >= 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval >= 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval >= 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval >= 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval >= 1) return Math.floor(interval) + "m ago";
  return "Just now";
}

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [trendingPostsData, setTrendingPostsData] = useState<any[]>([]);
  const [mostAuthenticPostsData, setMostAuthenticPostsData] = useState<any[]>([]);
  const [weeklyVibe, setWeeklyVibe] = useState<any>(null);
  const [ratingNotes, setRatingNotes] = useState<{ [key: string]: string }>({});
  const [trendingVibes, setTrendingVibes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, token } = useAuth();

  // Helper to extract userId from JWT locally
  const currentUserId = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (e) {
      return null;
    }
  }, [token]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'trending' | 'for_you' | 'most_authentic'>('recent');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Derive filtered and sorted posts
  const displayedPosts = useMemo(() => {
    let result = activeTab === 'trending'
      ? [...trendingPostsData]
      : activeTab === 'most_authentic'
        ? [...mostAuthenticPostsData]
        : [...posts];

    // Filter by tag if selected
    if (activeTag) {
      result = result.filter(p => p.vibe === activeTag);
    }

    // Sort by tab
    if (activeTab === 'recent') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (activeTab === 'for_you') {
      // Simple MVP algorithm: mix of upvotes and recency
      result = result.filter(p => p.upvotes > 0).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (result.length === 0) result = [...posts];
    }

    return result;
  }, [posts, trendingPostsData, mostAuthenticPostsData, activeTab, activeTag]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const [feedRes, trendingVibesRes, trendingPostsRes, mostAuthenticRes, weeklyVibeRes] = await Promise.all([
          api.get('feed'),
          api.get('feed/trending'),
          api.get('feed/trending-posts'),
          api.get('feed/most-authentic'),
          api.get('feed/weekly-vibe')
        ]);
        setPosts(feedRes.data);
        setTrendingVibes(trendingVibesRes.data);
        setTrendingPostsData(trendingPostsRes.data);
        setMostAuthenticPostsData(mostAuthenticRes.data);
        setWeeklyVibe(weeklyVibeRes.data);

        if (currentUserId && isAuthenticated) {
          try {
            const savedRes = await api.get('user/saved');
            const savedIds = savedRes.data.map((p: any) => typeof p === 'string' ? p : p._id);
            setSavedPosts(new Set(savedIds));
          } catch (e) {
            console.error('Failed to fetch saved posts', e);
          }

          const userLikes = feedRes.data
            .filter((p: any) => p.upvotedBy?.includes(currentUserId))
            .map((p: any) => p._id);
          setLikedPosts(new Set(userLikes));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [isAuthenticated, currentUserId]);

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

  const handleSavePost = async (id: string) => {
    if (!isAuthenticated) return setIsAuthOpen(true);
    const isSaved = savedPosts.has(id);
    const newSaved = new Set(savedPosts);
    isSaved ? newSaved.delete(id) : newSaved.add(id);
    setSavedPosts(newSaved);

    try {
      await api.post(`feed/save/${id}`);
    } catch {
      isSaved ? newSaved.add(id) : newSaved.delete(id);
      setSavedPosts(newSaved);
    }
  };

  const handleSharePost = async (id: string) => {
    try {
      await api.post(`feed/share/${id}`);
      // Usually would open a share dialog or copy link here
      // For now, we just increment the share count in DB
      alert('Thanks for sharing!');
    } catch {
      // ignore
    }
  };

  const handleRatePost = async (id: string, score: number) => {
    if (!isAuthenticated) return setIsAuthOpen(true);
    try {
      const note = ratingNotes[id] || '';
      const res = await api.post(`feed/rate/${id}`, { score, note });

      const updatePostList = (list: any[]) =>
        list.map(p => {
          if (p._id === id) {
            const existsIdx = p.authenticityRatings?.findIndex((r: any) => r.userId?._id === currentUserId || r.userId === currentUserId);
            let ratings = [...(p.authenticityRatings || [])];
            if (existsIdx >= 0) {
              ratings[existsIdx] = { ...ratings[existsIdx], score, note, userId: { _id: currentUserId, name: 'You' } };
            } else {
              ratings.push({ score, note, userId: { _id: currentUserId, name: 'You' } });
            }
            return { ...p, authenticityScore: res.data.authenticityScore, authenticityRatings: ratings };
          }
          return p;
        });

      setPosts(updatePostList(posts));
      setTrendingPostsData(updatePostList(trendingPostsData));
      setMostAuthenticPostsData(updatePostList(mostAuthenticPostsData));
      setRatingNotes(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error('Failed to rate', err);
    }
  };

  const handleReplySubmit = async (postId: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await api.post(`feed/reply/${postId}`, { text: replyText });
      setPosts(posts.map(p => {
        if (p._id === postId) {
          return { ...p, replies: [...(p.replies || []), res.data] };
        }
        return p;
      }));
      setReplyText('');
      setActiveReplyId(null);
    } catch (err) {
      console.error('Failed to reply', err);
      alert('Failed to post reply.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPostId(id);
    setTimeout(() => setCopiedPostId(null), 2000);
    try {
      await api.post(`feed/copy/${id}`);
      const updateCopies = (list: any[]) =>
        list.map(p => p._id === id ? { ...p, copiesCount: (p.copiesCount || 0) + 1 } : p);
      setPosts(updateCopies(posts));
      setTrendingPostsData(updateCopies(trendingPostsData));
      setMostAuthenticPostsData(updateCopies(mostAuthenticPostsData));
    } catch (err) {
      console.error('Failed to track copy', err);
    }
  };

  const navItems = [
    { id: 'for_you', label: 'For You', icon: Sparkles, color: 'text-primary-400' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-accent-400' },
    { id: 'most_authentic', label: 'Most Authentic', icon: Shield, color: 'text-yellow-400' },
    { id: 'recent', label: 'Recent', icon: Clock, color: 'text-indigo-400' },
  ] as const;

  return (
    <div className="flex justify-center gap-8 max-w-7xl mx-auto w-full relative">

      {/* Left Sidebar - Navigation / Filters */}
      <div className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-6rem)]">
        <div className="glassmorphism rounded-3xl p-6 flex flex-col gap-6">
          <Link to="/tune" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20">
            <Plus size={20} /> New Vibe
          </Link>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setActiveTag(null); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors w-full text-left ${isActive ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={20} className={isActive ? item.color : ''} /> {item.label}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-white/5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {trendingVibes.map((trend) => (
                <button
                  key={trend.title}
                  onClick={() => { setActiveTag(activeTag === trend.title ? null : trend.title); setActiveTab('recent'); }}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-colors border ${activeTag === trend.title
                    ? 'bg-primary-600 border-primary-500 text-white shadow-md'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border-white/5'
                    }`}
                >
                  #{trend.title}
                </button>
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
        ) : displayedPosts.length === 0 ? (
          <div className="text-center text-slate-500 py-20 glassmorphism rounded-3xl flex flex-col items-center">
            <Sparkles size={48} className="text-slate-700 mb-4" />
            <p className="text-lg">
              {activeTag ? `No vibes found for #${activeTag}.` : 'The wall is empty. Be the first to spark a vibe!'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedPosts.map((post, index) => (
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
                    {post.authorId?.picture ? (
                      <img src={post.authorId.picture} alt="avatar" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <Avatar
                        size={40}
                        name={post.authorId?._id || post._id} // Use ID as seed for anon
                        variant="beam"
                        colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                      />
                    )}
                    <div>
                      <h4 className="text-white font-semibold text-sm">
                        {post.authorId?.name || 'CreativeViber'}
                      </h4>
                      <p className="text-slate-500 text-xs">{timeAgo(post.createdAt)}</p>
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

                {/* Image Content (if generated) */}
                {post.imageUrl && (
                  <div className="w-full h-48 sm:h-64 mt-2 rounded-xl overflow-hidden border border-white/10 relative shrink-0">
                    <img
                      src={post.imageUrl}
                      alt="Vibe AI Art"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <div className="text-slate-400 text-sm italic border-l-2 border-slate-700 pl-3">
                    "{post.originalText}"
                  </div>
                  <div className="text-white text-xl leading-relaxed font-medium">
                    {post.tunedText}
                  </div>
                </div>

                {/* Authenticity Rating UI */}
                <div className="mt-2 pt-3 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Authenticity:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRatePost(post._id, star)}
                            className={`hover:scale-110 transition-transform ${post.authenticityScore >= star ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400/50'}`}
                          >
                            <Star size={16} className={post.authenticityScore >= star ? 'fill-yellow-400' : ''} />
                          </button>
                        ))}
                      </div>
                      {post.authenticityScore > 0 && (
                        <span className="text-xs text-slate-500 ml-1">({post.authenticityScore.toFixed(1)})</span>
                      )}
                    </div>

                    {/* Simple Note Input */}
                    <input
                      type="text"
                      placeholder="Add explain note..."
                      value={ratingNotes[post._id] || ''}
                      onChange={(e) => setRatingNotes({ ...ratingNotes, [post._id]: e.target.value })}
                      className="bg-slate-900/50 border border-white/10 rounded-xl px-3 py-1 text-xs text-white focus:outline-none focus:border-primary-500 w-44 transition-colors"
                    />
                  </div>

                  {/* Display existing community notes */}
                  {post.authenticityRatings?.some((r: any) => r.note) && (
                    <div className="pl-3 border-l-2 border-primary-500/30 flex flex-col gap-1.5 py-1 bg-white/[0.01] rounded-r-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Community Explanation Notes</div>
                      {post.authenticityRatings
                        .filter((r: any) => r.note)
                        .map((r: any, idx: number) => (
                          <div key={idx} className="text-xs text-slate-350 italic flex items-center gap-1.5 flex-wrap">
                            <span className="text-yellow-500/80 font-semibold">★{r.score}</span>
                            <span>"{r.note}"</span>
                            <span className="text-slate-500 text-[10px]">— {r.userId?.name || 'Viber'}</span>
                          </div>
                        ))}
                    </div>
                  )}
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
                    <button
                      onClick={() => setActiveReplyId(activeReplyId === post._id ? null : post._id)}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-semibold"
                    >
                      <MessageCircle size={20} />
                      <span>{post.replies?.length || 0} Replies</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSavePost(post._id)}
                      className={`transition-colors p-2 rounded-full hover:bg-white/5 ${savedPosts.has(post._id) ? 'text-primary-400' : 'text-slate-400 hover:text-white'}`}
                      title="Save Vibe"
                    >
                      <Bookmark size={18} className={savedPosts.has(post._id) ? 'fill-primary-400' : ''} />
                    </button>
                    <button
                      onClick={() => handleCopyText(post._id, post.tunedText)}
                      className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                      title="Copy Vibe"
                    >
                      {copiedPostId === post._id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                    <button
                      onClick={() => handleSharePost(post._id)}
                      className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                      title="Share Vibe"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Replies Section */}
                {(post.replies?.length > 0 || activeReplyId === post._id) && (
                  <div className="mt-2 pt-4 border-t border-white/5 flex flex-col gap-4">
                    {/* List of Replies */}
                    {post.replies?.map((reply: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        {reply.authorId?.picture ? (
                          <img src={reply.authorId.picture} alt="avatar" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <Avatar
                            size={28}
                            name={reply.authorId?._id || reply._id}
                            variant="beam"
                            colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                          />
                        )}
                        <div className="flex-1 bg-slate-800/40 rounded-2xl px-4 py-3 border border-white/5">
                          <p className="text-xs font-semibold text-slate-300 mb-1">
                            {reply.authorId?.name || 'CreativeViber'}
                          </p>
                          <p className="text-sm text-slate-200">{reply.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Inline Reply Input */}
                    <AnimatePresence>
                      {activeReplyId === post._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-3 mt-2 items-start"
                        >
                          <Avatar size={32} name="CurrentUser" variant="beam" colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']} />
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Add a reply..."
                              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                              onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit(post._id)}
                            />
                            <button
                              onClick={() => handleReplySubmit(post._id)}
                              disabled={isReplying || !replyText.trim()}
                              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              {isReplying ? '...' : 'Send'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
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
            {trendingVibes.length > 0 ? (
              trendingVibes.map((trend, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Trending #{i + 1}</p>
                    <p className="text-white font-semibold group-hover:text-primary-400 transition-colors">{trend.title}</p>
                  </div>
                  <span className="text-xs font-medium bg-white/5 px-2 py-1 rounded text-slate-400">{trend.posts} vibes</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">Not enough data yet to show trends.</p>
            )}
          </div>
        </div>

        {/* Weekly Vibe Drop Card */}
        {weeklyVibe && (
          <div className="glassmorphism rounded-3xl p-6 mb-6 bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/20 relative group overflow-hidden">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="font-bold text-white text-md">Weekly Vibe Drop</h3>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    #{weeklyVibe.vibeName}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{weeklyVibe.description}</p>
                <Link
                  to={`/tune?vibe=${encodeURIComponent(weeklyVibe.vibeName)}`}
                  className="mt-1 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 block"
                >
                  Tune this Vibe Drop
                </Link>
              </div>
            </div>
          </div>
        )}

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
