import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppKitProvider } from '@reown/appkit/react';
import { io } from 'socket.io-client';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import Avatar from 'boring-avatars';
import { Wand2, TrendingUp, Heart, Share2, Flame, Plus, Clock, MessageCircle, Copy, Check, Bookmark, Shield, Zap } from 'lucide-react';
import { Abi } from '../constant/Abi';
import toast from 'react-hot-toast';

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
  const [weeklyVibe, setWeeklyVibe] = useState<any>(null);
  const [ratingNotes, setRatingNotes] = useState<{ [key: string]: string }>({});
  const [trendingVibes, setTrendingVibes] = useState<any[]>([]);
  const [blockchainStats, setBlockchainStats] = useState<any>(null);
  const [fundingAmount, setFundingAmount] = useState('0.1');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const { isAuthenticated, token } = useAuth();
  const { walletProvider } = useAppKitProvider<any>('eip155');

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
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Derive filtered and sorted posts
  const displayedPosts = useMemo(() => {
    let result = [...posts];

    // Filter by search query across tunedText and vibe
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p =>
        p.tunedText?.toLowerCase().includes(q) ||
        p.vibe?.toLowerCase().includes(q) ||
        p.authorId?.name?.toLowerCase().includes(q)
      );
    }

    // Filter by tag if selected
    if (activeTag) {
      result = result.filter(p => p.vibe === activeTag);
    }

    // Sort by tab
    if (activeTab === 'for_you') {
      result = result.filter(p => p.upvotes > 0).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [posts, activeTab, activeTag, searchQuery]);

  // Reset pagination on tab/tag change
  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [activeTab, activeTag]);

  // Fetch the current feed tab dynamically
  useEffect(() => {
    const fetchCurrentFeed = async () => {
      let endpoint = 'feed';
      if (activeTab === 'trending') endpoint = 'feed/trending-posts';
      else if (activeTab === 'most_authentic') endpoint = 'feed/most-authentic';

      try {
        if (page === 1) setLoading(true);
        else setFetchingMore(true);

        const res = await api.get(`${endpoint}?page=${page}&limit=10`);

        if (page === 1) {
          setPosts(res.data.posts);
        } else {
          setPosts(prev => [...prev, ...res.data.posts]);
        }
        setHasMore(res.data.hasMore);

        // Fetch user liked/saved if authenticated and first page
        if (page === 1 && currentUserId && isAuthenticated) {
          const savedRes = await api.get('user/saved');
          const savedIds = savedRes.data.map((p: any) => typeof p === 'string' ? p : p._id);
          setSavedPosts(new Set(savedIds));

          const userLikes = res.data.posts
            .filter((p: any) => p.upvotedBy?.includes(currentUserId))
            .map((p: any) => p._id);
          setLikedPosts(new Set(userLikes));
        }
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    };
    fetchCurrentFeed();
  }, [activeTab, activeTag, page, isAuthenticated, currentUserId]);

  // Fetch static sidebars once
  useEffect(() => {
    const fetchSidebars = async () => {
      try {
        const [trendingVibesRes, weeklyVibeRes, statsRes] = await Promise.all([
          api.get('feed/trending'),
          api.get('feed/weekly-vibe'),
          api.get('feed/blockchain-stats').catch(() => ({ data: { available: false } }))
        ]);
        setTrendingVibes(trendingVibesRes.data);
        setWeeklyVibe(weeklyVibeRes.data);
        if (statsRes.data?.available) {
          setBlockchainStats(statsRes.data);
        }
      } catch (err) { }
    };

    fetchSidebars();
  }, []);

  const handleFundTreasury = async () => {
    if (!walletProvider) {
      toast.error("Please connect your Web3 wallet via the profile menu to fund the treasury!");
      return
    }
    try {
      const { BrowserProvider, Contract, parseEther } = await import('ethers');
      const provider = new BrowserProvider(walletProvider as any);
      const signer = await provider.getSigner();
      const contractAddress = import.meta.env.VITE_VIBETEXT_CONTRACT_ADDRESS;

      if (!contractAddress) {
        toast.error('Contract address is not configured.');
        return
      }

      const contract = new Contract(contractAddress, Abi, signer);
      const tx = await contract.fundTreasury({ value: parseEther(fundingAmount) });
      setFundingAmount(''); // Auto-clear amount on success
      toast.success(`Funding submitted! TxHash: ${tx.hash}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Funding failed: " + err.message);
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !fetchingMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, fetchingMore, loading]);

  // Real-Time WebSockets
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(socketUrl, { transports: ['polling', 'websocket'] });

    socket.on('new_post', (newPost) => {
      setPosts((prevPosts) => {
        // Deduplicate just in case
        if (prevPosts.some(p => p._id === newPost._id)) return prevPosts;
        // Unshift to the top of the feed beautifully
        return [newPost, ...prevPosts];
      });
    });

    return () => {
      socket.disconnect();
    };
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

  const handleSharePost = async (post: any) => {
    const shareData = {
      title: `VibeText — #${post.vibe} Vibe`,
      text: `"${post.tunedText}"\n\n— Tuned to '${post.vibe}' style on VibeText`,
      url: `${window.location.origin}/tune?vibe=${encodeURIComponent(post.vibe)}`,
    };

    try {
      // Record share count in DB
      await api.post(`feed/share/${post._id}`);

      // Optimistically update the UI post sharesCount
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p));

      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast.success('Vibe text and link copied to clipboard!');
      }
    } catch (err: any) {
      console.error('[Share] share error:', err);
    }
  };

  const handleRatePost = async (id: string, score: number) => {
    if (!isAuthenticated) return setIsAuthOpen(true);
    try {
      const note = ratingNotes[id] || '';
      const res = await api.post(`feed/rate/${id}`, { score, note });

      setPosts(posts.map(p => {
        if (p._id === id) {
          const existsIdx = p.authenticityRatings?.findIndex((r: any) => r.userId?._id === currentUserId || r.userId === currentUserId);
          let ratings = [...(p.authenticityRatings || [])];
          if (existsIdx >= 0) {
            ratings[existsIdx] = { ...ratings[existsIdx], score, note, userId: { _id: currentUserId, name: 'You' } };
          } else {
            ratings.push({ score, note, userId: { _id: currentUserId, name: 'You' } });
          }
          return {
            ...p,
            authenticityScore: res.data.authenticityScore,
            authenticityRatings: ratings,
            ...(res.data.txHash ? { txHash: res.data.txHash } : {})
          };
        }
        return p;
      }));
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
      toast.error('Failed to post reply.');
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
      setPosts(posts.map(p => p._id === id ? { ...p, copiesCount: (p.copiesCount || 0) + 1 } : p));
    } catch (err) {
      console.error('Failed to track copy', err);
    }
  };

  const navItems = [
    { id: 'for_you', label: 'For You', icon: Wand2, color: 'text-primary-400' },
    { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-accent-400' },
    { id: 'most_authentic', label: 'Most Authentic', icon: Shield, color: 'text-yellow-400' },
    { id: 'recent', label: 'Recent', icon: Clock, color: 'text-indigo-400' },
  ] as const;

  return (
    <div className="flex items-start justify-center gap-6 xl:gap-8 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 relative">

      {/* Left Sidebar - Navigation / Filters */}
      <div className="hidden lg:block w-56 xl:w-64 shrink-0 self-start sticky top-24">
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
      <div className="flex-1 min-w-0 max-w-2xl w-full flex flex-col gap-5 pb-20">

        {/* Mobile Tune Button */}
        <div className="lg:hidden w-full mb-2">
          <Link to="/tune" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-500/20">
            <Plus size={20} /> Create a New Vibe
          </Link>
        </div>

        {/* Mobile Feed Navigation (Only visible < lg) */}
        <div className="lg:hidden w-full overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setActiveTag(null); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'bg-slate-900/40 text-slate-400 border border-transparent hover:bg-slate-800'
                    }`}
                >
                  <Icon size={16} className={isActive ? item.color : ''} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Trending & Weekly Drop (Only visible < xl) */}
        <div className="xl:hidden w-full flex flex-col gap-3 mb-2 overflow-hidden">
          <div className="flex items-center gap-2 px-1">
            <Flame size={16} className="text-orange-500" />
            <h3 className="font-bold text-slate-300 text-sm">Trending & Events</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
            {/* Mobile Weekly Vibe Drop */}
            {weeklyVibe && (
              <div className="shrink-0 w-64 glassmorphism rounded-2xl p-4 bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/20 relative snap-center">
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 size={14} className="text-indigo-400" />
                  <h3 className="font-bold text-white text-xs">Weekly Drop</h3>
                </div>
                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mb-2 inline-block">
                  #{weeklyVibe.vibeName}
                </span>
                <Link
                  to={`/tune?vibe=${encodeURIComponent(weeklyVibe.vibeName)}`}
                  className="mt-1 text-center bg-indigo-600/80 hover:bg-indigo-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs block"
                >
                  Tune This
                </Link>
              </div>
            )}

            {/* Mobile Trending Items */}
            {trendingVibes.slice(0, 4).map((trend, i) => (
              <div key={i} className="shrink-0 w-48 glassmorphism rounded-2xl p-4 flex flex-col justify-between border border-white/5 snap-center" onClick={() => { setActiveTag(trend.title); setActiveTab('recent'); }}>
                <div>
                  <p className="text-slate-500 text-[10px] mb-1">Trending #{i + 1}</p>
                  <p className="text-white font-semibold text-sm truncate">#{trend.title}</p>
                </div>
                <span className="text-[10px] font-medium bg-white/5 px-2 py-1 rounded text-slate-400 self-start mt-2">
                  {trend.posts} vibes
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile BOT Chain Web3 Features (Only visible < lg) */}
        {blockchainStats && (
          <div className="lg:hidden w-full flex flex-col gap-3 mb-2 overflow-hidden">
            <div className="flex items-center gap-2 px-1">
              <Zap size={16} className="text-orange-500" />
              <h3 className="font-bold text-slate-300 text-sm">Treasury & Validators</h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
              {/* Mobile Treasury Card */}
              <div className="shrink-0 w-64 glassmorphism rounded-2xl p-4 border border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent snap-center relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-xs">BOT Chain Treasury</h3>
                  <span className="text-[10px] px-1.5 py-0.5 bg-orange-500/20 text-orange-400 rounded-full font-bold">Active</span>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-2xl font-black text-white">{blockchainStats.balanceBOT}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">BOT</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    className="w-14 bg-slate-900 border border-white/10 rounded-lg px-2 text-xs text-white text-center focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={handleFundTreasury}
                    className="flex-1 bg-gradient-to-r from-orange-600 flex items-center justify-center to-orange-500 hover:from-orange-500 text-white font-bold py-1.5 px-2 rounded-lg text-xs transition-all"
                  >
                    Fund
                  </button>
                </div>
              </div>

              {/* Mobile Validator Leaderboard */}
              {blockchainStats.leaderboard?.length > 0 && (
                <div className="shrink-0 w-72 glassmorphism rounded-2xl p-4 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent snap-center">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={14} className="text-purple-400" />
                    <h3 className="font-bold text-white text-xs">Top Validators</h3>
                  </div>

                  <div className="flex flex-col gap-2">
                    {blockchainStats.leaderboard.slice(0, 3).map((val: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 flex items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-slate-300">
                            {i + 1}
                          </div>
                          <span className="text-[10px] font-mono text-slate-300">
                            {val.address.substring(0, 6)}..{val.address.substring(38)}
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-orange-400">
                          {val.totalBOT} BOT
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search results banner */}
        {searchQuery && (
          <div className="flex items-center justify-between px-4 py-2.5 glassmorphism rounded-2xl border border-primary-500/20">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Results for</span>
              <span className="font-semibold text-white">&quot;{searchQuery}&quot;</span>
              <span className="text-slate-500">({displayedPosts.length} found)</span>
            </div>
            <Link to="/feed" className="text-xs text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Clear ✕
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="text-center text-slate-500 py-20 glassmorphism rounded-3xl flex flex-col items-center cursor-pointer">
            <Wand2 size={48} className="text-slate-700 mb-4" />
            <p className="text-lg">
              {searchQuery
                ? `No vibes found for "${searchQuery}". Try a different term!`
                : activeTag
                  ? `No vibes found for #${activeTag}.`
                  : 'The wall is empty. Be the first to spark a vibe!'}
            </p>
            {searchQuery && (
              <Link to="/feed" className="mt-4 text-sm text-primary-400 hover:underline">Clear search</Link>
            )}
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

                  {/* Star selector row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">Rate Authenticity:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRatingNotes(prev => ({ ...prev, [`${post._id}_star`]: String(star) }))}
                          className={`hover:scale-125 transition-transform text-xl ${Number(ratingNotes[`${post._id}_star`] || 0) >= star
                            ? 'text-yellow-400'
                            : post.authenticityScore >= star
                              ? 'text-yellow-600/50'
                              : 'text-slate-700 hover:text-yellow-400/60'
                            }`}
                          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    {post.authenticityScore > 0 && (
                      <span className="text-xs text-slate-500">avg {post.authenticityScore.toFixed(1)} / 5</span>
                    )}
                  </div>

                  {/* Note input + Submit button */}
                  <div className="flex gap-2 items-stretch">
                    <input
                      type="text"
                      placeholder="Add a community note (required to earn BOT rewards)..."
                      value={ratingNotes[post._id] || ''}
                      onChange={(e) => setRatingNotes(prev => ({ ...prev, [post._id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && ratingNotes[`${post._id}_star`]) {
                          handleRatePost(post._id, Number(ratingNotes[`${post._id}_star`]));
                        }
                      }}
                      className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                    />
                    <button
                      onClick={() => {
                        const pendingStar = Number(ratingNotes[`${post._id}_star`]);
                        if (!pendingStar) return toast.error('Please select a star rating first!');
                        handleRatePost(post._id, pendingStar);
                        setRatingNotes(prev => ({ ...prev, [`${post._id}_star`]: '' }));
                      }}
                      disabled={!ratingNotes[`${post._id}_star`]}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: ratingNotes[`${post._id}_star`]
                          ? 'linear-gradient(135deg, #f6851b, #7c3aed)'
                          : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(246,133,27,0.4)',
                        color: ratingNotes[`${post._id}_star`] ? '#fff' : '#475569',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Zap size={12} /> Rate{ratingNotes[post._id]?.trim() ? ' + Earn ⚡' : ''}
                    </button>
                  </div>

                  {/* Display existing community notes */}
                  {post.authenticityRatings?.some((r: any) => r.note) && (
                    <div className="pl-3 border-l-2 border-primary-500/30 flex flex-col gap-1.5 py-1 bg-white/[0.01] rounded-r-xl">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Community Notes</div>
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

                  {/* BOT Chain Reward Indicator */}
                  {post.txHash && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-xl w-fit hover:bg-orange-500/20 transition-all">
                      <Zap size={14} className="text-orange-400" />
                      <a href={`https://scan.botchain.ai/tx/${post.txHash}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange-400 hover:underline">
                        Validator Rewarded on BOT Chain! View Tx ↗
                      </a>
                    </motion.div>
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
                      onClick={() => handleSharePost(post)}
                      className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 flex items-center gap-1.5"
                      title="Share Vibe"
                    >
                      <Share2 size={18} />
                      {post.sharesCount > 0 && <span className="text-xs font-semibold">{post.sharesCount}</span>}
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

        {/* Intersection Observer Target */}
        {displayedPosts.length > 0 && !loading && (
          <div ref={observerTarget} className="w-full py-8 flex justify-center items-center">
            {fetchingMore ? (
              <div className="flex items-center gap-2 text-primary-400 font-medium">
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                Loading more vibes...
              </div>
            ) : hasMore ? (
              <div className="text-slate-500 text-sm">Scroll for more</div>
            ) : (
              <div className="text-slate-500 text-sm flex items-center gap-2">
                {/* <Sparkles size={14} className="text-primary-400" /> */}
                You've hit the end of the wall.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar - Trending / Community */}
      <div className="hidden xl:block w-72 shrink-0 self-start sticky top-24">
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
                {/* <Sparkles size={18} className="text-indigo-400" /> */}
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

        {/* --- BOT Chain Web3 Features (Progressive Enhancement) --- */}
        {blockchainStats && (
          <>
            {/* Treasury Card */}
            <div className="glassmorphism rounded-3xl p-6 mb-6 border border-orange-500/20 relative overflow-hidden bg-gradient-to-b from-orange-500/5 to-transparent">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-orange-500" />
                  <h3 className="font-bold text-white text-md">Treasury</h3>
                </div>
                <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full font-bold">BOT Chain</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-black/20 rounded-2xl mb-4 border border-white/5">
                <span className="text-2xl font-black text-white">{blockchainStats.balanceBOT}</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">BOT Available</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  className="w-16 bg-slate-900 border border-white/10 rounded-xl px-2 text-xs text-white text-center focus:outline-none"
                />
                <button
                  onClick={handleFundTreasury}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold py-2 px-2 rounded-xl text-[11px] transition-all"
                >
                  Fund Treasury
                </button>
              </div>
            </div>

            {/* Validator Leaderboard */}
            {blockchainStats.leaderboard?.length > 0 && (
              <div className="glassmorphism rounded-3xl p-6 mb-6 border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-purple-400" />
                  <h3 className="font-bold text-white text-md">Top Validators</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {blockchainStats.leaderboard.map((val: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 shadow-sm shadow-purple-900/10">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                          {i + 1}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-slate-300">
                            {val.address.substring(0, 6)}..{val.address.substring(38)}
                          </span>
                          <span className="text-[10px] text-slate-500">{val.count} validations</span>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-orange-400">
                        {val.totalBOT} BOT
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
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
