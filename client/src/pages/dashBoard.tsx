import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Users, Image as ImageIcon, Heart, Trash2,
  Sparkles, AlertCircle, LogOut, BarChart3, RefreshCw, Bookmark, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
import api from '../lib/api';
import { Navigate } from 'react-router-dom';

type TabId = 'vibes' | 'saved' | 'analytics' | 'admin_users' | 'admin_posts' | 'admin_vibe' | 'admin_contract';

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('vibes');

  const [userStats, setUserStats] = useState({ totalVibes: 0, totalUpvotes: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalPosts: 0, totalUpvotes: 0 });
  const [northStar, setNorthStar] = useState<any>(null);

  // Admin Weekly Vibe form state
  const [vibeName, setVibeName] = useState('');
  const [description, setDescription] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [submittingVibe, setSubmittingVibe] = useState(false);
  const [vibeSuccessMsg, setVibeSuccessMsg] = useState('');

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  // Smart Contract Admin State
  const [adminAddress, setAdminAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [contractActionLoading, setContractActionLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AppKit / Web3 Ownership State
  const { address } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider<any>('eip155');
  const [isContractOwner, setIsContractOwner] = useState(false);
  const contractAddress = "0x79047ED16d320cb0400Ab207e269558Ee9835748"; // VibeText contract address

  useEffect(() => {
    const checkOwner = async () => {
      if (!address || !walletProvider) return setIsContractOwner(false);
      try {
        const { BrowserProvider, Contract } = await import('ethers');
        const provider = new BrowserProvider(walletProvider);
        const contract = new Contract(contractAddress, ["function owner() view returns (address)"], provider);
        const ownerAddress = await contract.owner();
        setIsContractOwner(ownerAddress.toLowerCase() === address.toLowerCase());
      } catch (err) {
        console.warn("[Blockchain] Could not fetch contract owner:", err);
      }
    };
    checkOwner();
  }, [address, walletProvider]);

  const fetchData = async (tab: TabId) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === 'vibes') {
        const res = await api.get('/user/dashboard');
        setUserStats(res.data.stats ?? { totalVibes: 0, totalUpvotes: 0 });
        setUserPosts(res.data.posts ?? []);
      } else if (tab === 'saved') {
        const res = await api.get('/user/saved');
        setSavedPosts(res.data ?? []);
      } else if (tab === 'analytics') {
        const [statsRes, nsRes] = await Promise.all([
          api.get('/user/global-stats'),
          api.get('/user/north-star')
        ]);
        setGlobalStats(statsRes.data);
        setNorthStar(nsRes.data);
      } else if (tab === 'admin_users') {
        const res = await api.get('/admin/users');
        setAllUsers(res.data);
      } else if (tab === 'admin_posts') {
        const res = await api.get('/admin/posts');
        setAllPosts(res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to load data';
      setError(msg);
      console.error('[Dashboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  const handleDeletePersonalPost = async (id: string) => {
    if (!window.confirm('Delete this vibe?')) return;
    try {
      await api.delete(`/user/post/${id}`);
      setUserPosts(prev => prev.filter(p => p._id !== id));
      setUserStats(prev => ({ ...prev, totalVibes: prev.totalVibes - 1 }));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleAdminDeletePost = async (id: string) => {
    if (!window.confirm('Force delete this post?')) return;
    try {
      await api.delete(`/admin/post/${id}`);
      setAllPosts(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  const handleContractAction = async (action: 'addAdmin' | 'removeAdmin' | 'pause' | 'unpause' | 'withdraw') => {
    if (!walletProvider) return alert("Wallet not connected via AppKit!");
    setContractActionLoading(true);
    try {
      const { BrowserProvider, Contract, parseEther } = await import('ethers');
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();

      const abi = [
        "function addAdmin(address _admin)",
        "function removeAdmin(address _admin)",
        "function pause()",
        "function unpause()",
        "function withdraw(uint256 _amount)"
      ];
      const contract = new Contract(contractAddress, abi, signer);
      let tx;

      if (action === 'addAdmin') tx = await contract.addAdmin(adminAddress);
      else if (action === 'removeAdmin') tx = await contract.removeAdmin(adminAddress);
      else if (action === 'pause') tx = await contract.pause();
      else if (action === 'unpause') tx = await contract.unpause();
      else if (action === 'withdraw') tx = await contract.withdraw(parseEther(withdrawAmount));

      alert(`Transaction submitted! Hash: ${tx.hash}`);
    } catch (err: any) {
      console.error(err);
      alert("Action failed: " + err.message);
    } finally {
      setContractActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Column: Profile Card */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-6">
        <div className="glassmorphism p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-primary-900/40 to-transparent"></div>

          <div className="relative mt-4 mb-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-white text-3xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            {isAdmin && (
              <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1 border border-white/10">
                <span className="bg-accent-500/20 text-accent-400 text-xs uppercase font-bold px-3 py-1 rounded-full border border-accent-500/30 flex items-center gap-1 shadow-lg shadow-accent-500/20">
                  <Shield size={12} /> Admin
                </span>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white leading-tight">{user?.name}</h2>
          <p className="text-sm text-slate-400 mt-1">{user?.email}</p>

          <button
            onClick={logout}
            className="mt-8 flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors font-medium border border-red-500/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="glassmorphism rounded-3xl border border-white/5 overflow-hidden flex flex-col">
          {([
            { id: 'vibes', label: 'My Collection', icon: <Sparkles size={18} /> },
            { id: 'saved', label: 'Saved Vibes', icon: <Bookmark size={18} /> },
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
            ...(isAdmin ? [
              { id: 'admin_users', label: 'Manage Users', icon: <Users size={18} /> },
              { id: 'admin_posts', label: 'Moderation', icon: <Shield size={18} /> },
              { id: 'admin_vibe', label: 'Schedule Vibe', icon: <Sparkles size={18} /> },
            ] : []),
            ...(isContractOwner ? [
              { id: 'admin_contract', label: 'Smart Contract', icon: <Zap size={18} /> },
            ] : []),
          ] as { id: TabId; label: string; icon: React.ReactNode }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 p-4 text-sm font-medium transition-colors text-left border-l-4 ${activeTab === tab.id
                ? 'bg-white/5 border-primary-500 text-primary-400'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <div className={activeTab === tab.id ? 'text-primary-400' : 'text-slate-500'}>
                {tab.icon}
              </div>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Content Area */}
      <div className="flex-1 glassmorphism rounded-3xl border border-white/5 p-6 min-h-[600px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading your data...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <AlertCircle size={48} className="text-red-400" />
            <div>
              <p className="text-xl text-red-300 font-bold">Error loading data</p>
              <p className="text-slate-500 mt-2 max-w-md">{error}</p>
            </div>
            <button
              onClick={() => fetchData(activeTab)}
              className="flex items-center gap-2 mt-4 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-medium transition-colors border border-white/10"
            >
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1"
          >
            {/* MY VIBES */}
            {activeTab === 'vibes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">My Collection</h3>
                  <p className="text-slate-400 mt-1">Your generated vibes and upvotes</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex items-center gap-5">
                    <div className="p-4 bg-primary-500/20 rounded-2xl text-primary-400"><Sparkles size={28} /></div>
                    <div>
                      <h3 className="text-3xl font-black text-white">{userStats.totalVibes}</h3>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Vibes Created</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 flex items-center gap-5">
                    <div className="p-4 bg-pink-500/20 rounded-2xl text-pink-400"><Heart size={28} /></div>
                    <div>
                      <h3 className="text-3xl font-black text-white">{userStats.totalUpvotes}</h3>
                      <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Upvotes</p>
                    </div>
                  </div>
                </div>

                {userPosts.length === 0 ? (
                  <div className="text-center text-slate-500 py-20 bg-slate-900/30 rounded-2xl border border-white/5">
                    <ImageIcon size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-lg font-medium text-slate-400">No vibes created yet.</p>
                    <p className="text-sm mt-2">Head over to the Studio and create your first masterpiece!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {userPosts.map(post => (
                      <div
                        key={post._id}
                        className="bg-slate-900/80 rounded-2xl overflow-hidden relative group border border-white/5 transition-all hover:border-white/10"
                      >
                        <button
                          onClick={() => handleDeletePersonalPost(post._id)}
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 shadow-lg"
                          title="Delete vibe"
                        >
                          <Trash2 size={16} />
                        </button>
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt=""
                            className="w-full h-40 object-cover"
                            crossOrigin="anonymous"
                          />
                        )}
                        <div className="p-5">
                          <span className="bg-primary-500/20 text-primary-300 text-xs font-bold px-3 py-1 rounded-full border border-primary-500/30 mb-3 inline-block">
                            {post.vibe} Vibe
                          </span>
                          <p className="text-white text-base leading-relaxed line-clamp-3">{post.tunedText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SAVED VIBES */}
            {activeTab === 'saved' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Saved Vibes</h3>
                  <p className="text-slate-400 mt-1">Your bookmarked vibes for easy access</p>
                </div>

                {savedPosts.length === 0 ? (
                  <div className="text-center text-slate-500 py-20 bg-slate-900/30 rounded-2xl border border-white/5">
                    <Bookmark size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-lg font-medium text-slate-400">No saved vibes yet.</p>
                    <p className="text-sm mt-2">Bookmark vibes from the feed to see them here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {savedPosts.map(post => (
                      <div
                        key={post._id}
                        className="bg-slate-900/80 rounded-2xl overflow-hidden relative group border border-white/5 transition-all hover:border-white/10"
                      >
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt=""
                            className="w-full h-40 object-cover"
                            crossOrigin="anonymous"
                          />
                        )}
                        <div className="p-5">
                          <div className="flex justify-between items-center mb-3">
                            <span className="bg-primary-500/20 text-primary-300 text-xs font-bold px-3 py-1 rounded-full border border-primary-500/30 inline-block">
                              {post.vibe} Vibe
                            </span>
                            <span className="text-slate-500 text-xs">
                              by {post.authorId?.name || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-white text-base leading-relaxed line-clamp-3">{post.tunedText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Platform Analytics</h3>
                  <p className="text-slate-400 mt-1">Global statistics across VibeText</p>
                </div>

                {/* Render North Star Ratio prominently */}
                {northStar && (
                  <div className="bg-gradient-to-br from-primary-900/30 to-slate-900 border border-primary-500/15 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000" />
                    <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex flex-col gap-1.5 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 text-primary-400">
                          <Sparkles size={20} />
                          <h4 className="font-bold uppercase tracking-wider text-xs">North Star Engagement Metric</h4>
                        </div>
                        <p className="text-slate-300 text-sm max-w-md mt-1 leading-relaxed">
                          Ratio of meaningful user actions (publishes, shares, saves, copies) relative to total model generations.
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-slate-400 text-xs font-semibold">
                          <span>Publishes: {northStar.publishesCount}</span>
                          <span>Shares: {northStar.totalShares}</span>
                          <span>Saves: {northStar.totalSaves}</span>
                          <span>Copies: {northStar.totalCopies}</span>
                        </div>
                        <p className="text-slate-500 text-[10px] mt-1 font-mono">
                          Meaningful Actions: {northStar.totalMeaningfulActions} | Total Generations: {northStar.totalGenerations}
                        </p>
                      </div>
                      <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 bg-slate-950/80 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-3xl font-black text-white">{northStar.northStarRatio}%</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Ratio</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { icon: <Users size={28} className="text-primary-400" />, label: 'Registered Creators', value: globalStats.totalUsers, bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
                    { icon: <ImageIcon size={28} className="text-accent-400" />, label: 'Total Vibes Generated', value: globalStats.totalPosts, bg: 'bg-accent-500/10', border: 'border-accent-500/20' },
                    { icon: <Heart size={28} className="text-pink-400" />, label: 'Global Upvotes', value: globalStats.totalUpvotes, bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
                  ].map(stat => (
                    <div
                      key={stat.label}
                      className={`bg-slate-900/50 rounded-2xl border ${stat.border} p-6 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-4 ${stat.bg} rounded-2xl`}>{stat.icon}</div>
                        <span className="text-lg text-slate-300 font-medium">{stat.label}</span>
                      </div>
                      <span className="text-4xl font-black text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN: USERS */}
            {activeTab === 'admin_users' && isAdmin && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Manage Users</h3>
                  <p className="text-slate-400 mt-1">Directory of all registered accounts</p>
                </div>

                <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                  {allUsers.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <Users size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No users found in the database.</p>
                    </div>
                  )}

                  <div className="divide-y divide-white/5">
                    {allUsers.map(u => (
                      <div key={u._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          {u.picture
                            ? <img src={u.picture} className="w-12 h-12 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
                            : <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-lg font-bold">{u.name?.charAt(0)}</div>
                          }
                          <div>
                            <p className="text-white font-medium text-base flex items-center gap-2">
                              {u.name}
                              {u.role === 'admin' && <Shield size={14} className="text-accent-400" />}
                            </p>
                            <p className="text-slate-400 text-sm">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right bg-slate-950 px-4 py-2 rounded-xl border border-white/5">
                          <p className="text-white font-bold text-lg leading-none mb-1">{u.postCount ?? 0}</p>
                          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider leading-none">Vibes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN: POSTS */}
            {activeTab === 'admin_posts' && isAdmin && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Moderation Queue</h3>
                  <p className="text-slate-400 mt-1">Manage and moderate all platform content</p>
                </div>

                {allPosts.length === 0 && (
                  <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-white/5 text-slate-500">
                    <Shield size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No posts available for moderation.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  {allPosts.map(post => (
                    <div
                      key={post._id}
                      className="bg-slate-900/50 rounded-2xl border border-white/5 p-5 flex gap-5 relative group transition-all hover:border-white/10"
                    >
                      <button
                        onClick={() => handleAdminDeletePost(post._id)}
                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                        title="Force delete post"
                      >
                        <Trash2 size={16} />
                      </button>

                      {post.imageUrl && (
                        <div className="shrink-0 w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                          <img
                            src={post.imageUrl}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}

                      <div className="flex flex-col min-w-0 py-1 pr-12">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-slate-300">
                            {post.authorId?.name || 'Unknown User'}
                          </span>
                          <span className="text-slate-600 text-xs">•</span>
                          <span className="text-slate-500 text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="mb-3">
                          <span className="bg-primary-500/20 text-primary-300 text-xs font-bold px-3 py-1 rounded-full border border-primary-500/30 inline-block">
                            {post.vibe}
                          </span>
                        </div>

                        <p className="text-white text-base leading-relaxed line-clamp-2">{post.tunedText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ADMIN: WEEKLY VIBE DROP */}
            {activeTab === 'admin_vibe' && isAdmin && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Schedule Weekly Vibe Drop</h3>
                  <p className="text-slate-400 mt-1">Set a featured style/vibe for the community to try this week</p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!vibeName || !description || !weekStart || !weekEnd) {
                      alert('Please fill out all fields.');
                      return;
                    }
                    setSubmittingVibe(true);
                    setVibeSuccessMsg('');
                    try {
                      await api.post('/admin/weekly-vibe', {
                        vibeName,
                        description,
                        weekStart,
                        weekEnd
                      });
                      setVibeSuccessMsg('Weekly Vibe scheduled successfully!');
                      setVibeName('');
                      setDescription('');
                      setWeekStart('');
                      setWeekEnd('');
                    } catch (err: any) {
                      const msg = err?.response?.data?.error || err?.message || 'Failed to schedule weekly vibe';
                      alert(msg);
                    } finally {
                      setSubmittingVibe(false);
                    }
                  }}
                  className="glassmorphism p-6 rounded-3xl border border-white/5 flex flex-col gap-4 max-w-xl"
                >
                  {vibeSuccessMsg && (
                    <div className="bg-green-500/10 border border-green-500/35 text-green-400 p-4 rounded-2xl text-sm font-semibold">
                      {vibeSuccessMsg}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium">Vibe Name</label>
                    <input
                      type="text"
                      value={vibeName}
                      onChange={(e) => setVibeName(e.target.value)}
                      placeholder="e.g. Ibadan, Old School HipHop"
                      className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm font-medium">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the mood, origins, and how to write in this style..."
                      className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500 resize-none h-28 transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-300 text-sm font-medium">Week Start</label>
                      <input
                        type="date"
                        value={weekStart}
                        onChange={(e) => setWeekStart(e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 transition-colors"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-300 text-sm font-medium">Week End</label>
                      <input
                        type="date"
                        value={weekEnd}
                        onChange={(e) => setWeekEnd(e.target.value)}
                        className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingVibe}
                    className="w-full bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
                  >
                    {submittingVibe ? 'Scheduling...' : 'Schedule Vibe Drop'}
                  </button>
                </form>
              </div>
            )}

            {/* ADMIN: SMART CONTRACT */}
            {activeTab === 'admin_contract' && isContractOwner && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2"><Zap className="text-orange-400" /> Contract Admin Panel</h3>
                  <p className="text-slate-400 mt-1">Manage treasury, validators, and contract state directly on-chain</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Treasury & State Control */}
                  <div className="glassmorphism p-6 rounded-3xl border border-white/5 flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                    <h4 className="text-lg font-bold text-white mb-2">Fund Management</h4>

                    <div className="flex flex-col gap-2">
                      <label className="text-slate-300 text-sm font-medium">Withdraw Amount (BOT)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.0"
                          className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                        />
                        <button
                          onClick={() => handleContractAction('withdraw')}
                          disabled={contractActionLoading || !withdrawAmount}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/5 my-2" />

                    <h4 className="text-lg font-bold text-white mb-2">Emergency State</h4>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleContractAction('pause')}
                        disabled={contractActionLoading}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold py-3 px-4 rounded-xl border border-red-500/30 transition-colors disabled:opacity-50"
                      >
                        Pause Contract
                      </button>
                      <button
                        onClick={() => handleContractAction('unpause')}
                        disabled={contractActionLoading}
                        className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold py-3 px-4 rounded-xl border border-green-500/30 transition-colors disabled:opacity-50"
                      >
                        Unpause
                      </button>
                    </div>
                  </div>

                  {/* Oracle Access Control */}
                  <div className="glassmorphism p-6 rounded-3xl border border-white/5 flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    <h4 className="text-lg font-bold text-white mb-2">Oracle Whitelist</h4>

                    <div className="flex flex-col gap-2">
                      <label className="text-slate-300 text-sm font-medium">Node Backend Wallet Address</label>
                      <input
                        type="text"
                        value={adminAddress}
                        onChange={(e) => setAdminAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>

                    <div className="flex gap-4 mt-2">
                      <button
                        onClick={() => handleContractAction('addAdmin')}
                        disabled={contractActionLoading || !adminAddress}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
                      >
                        Add Admin
                      </button>
                      <button
                        onClick={() => handleContractAction('removeAdmin')}
                        disabled={contractActionLoading || !adminAddress}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
