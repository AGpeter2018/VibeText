import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, Users, Image as ImageIcon, Heart, Trash2,
  Sparkles, AlertCircle, LogOut, BarChart3, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'vibes' | 'analytics' | 'admin_users' | 'admin_posts';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabId>('vibes');

  const [userStats, setUserStats] = useState({ totalVibes: 0, totalUpvotes: 0 });
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalPosts: 0, totalUpvotes: 0 });

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (tab: TabId) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === 'vibes') {
        const res = await api.get('/user/dashboard');
        setUserStats(res.data.stats ?? { totalVibes: 0, totalUpvotes: 0 });
        setUserPosts(res.data.posts ?? []);
      } else if (tab === 'analytics') {
        const res = await api.get('/user/global-stats');
        setGlobalStats(res.data);
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
      console.error('[Sidebar] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchData(activeTab);
    }
  }, [isOpen, activeTab, isAuthenticated]);

  // Reset to vibes tab when reopened
  useEffect(() => {
    if (!isOpen) setActiveTab('vibes');
  }, [isOpen]);

  // Prevent scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

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

  const isAdmin = user?.role === 'admin';

  if (!isAuthenticated) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-xl bg-slate-950 border-l border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-11 h-11 rounded-full border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-white text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">{user?.name}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-400">{user?.email}</p>
                    {isAdmin && (
                      <span className="bg-accent-500/20 text-accent-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-accent-500/30 flex items-center gap-1">
                        <Shield size={9} /> Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-5 border-b border-white/10 shrink-0 overflow-x-auto gap-5">
              {([
                { id: 'vibes', label: 'My Collection' },
                { id: 'analytics', label: 'Analytics' },
                ...(isAdmin ? [
                  { id: 'admin_users', label: 'Users' },
                  { id: 'admin_posts', label: 'Moderation' },
                ] : []),
              ] as { id: TabId; label: string }[]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 pt-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-400 text-primary-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                  <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading…</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <AlertCircle size={36} className="text-red-400" />
                  <p className="text-red-300 font-medium">Error loading data</p>
                  <p className="text-slate-500 text-sm">{error}</p>
                  <button
                    onClick={() => fetchData(activeTab)}
                    className="flex items-center gap-2 mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 text-sm transition-colors"
                  >
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* MY VIBES */}
                  {activeTab === 'vibes' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900 rounded-2xl p-4 border border-white/5 text-center">
                          <Sparkles className="mx-auto text-primary-400 mb-1" size={20} />
                          <h3 className="text-2xl font-bold text-white">{userStats.totalVibes}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">Vibes Created</p>
                        </div>
                        <div className="bg-slate-900 rounded-2xl p-4 border border-white/5 text-center">
                          <Heart className="mx-auto text-pink-400 mb-1" size={20} />
                          <h3 className="text-2xl font-bold text-white">{userStats.totalUpvotes}</h3>
                          <p className="text-slate-500 text-xs mt-0.5">Total Upvotes</p>
                        </div>
                      </div>

                      {userPosts.length === 0 ? (
                        <div className="text-center text-slate-500 py-12 bg-slate-900/30 rounded-2xl border border-white/5">
                          <AlertCircle size={30} className="mx-auto text-slate-700 mb-2" />
                          <p className="text-sm">No vibes created yet.</p>
                          <p className="text-xs text-slate-600 mt-1">Go to Studio and create your first vibe!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {userPosts.map(post => (
                            <div
                              key={post._id}
                              className="bg-slate-900 rounded-2xl overflow-hidden relative group border border-white/5"
                            >
                              <button
                                onClick={() => handleDeletePersonalPost(post._id)}
                                className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                              >
                                <Trash2 size={12} />
                              </button>
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt=""
                                  className="w-full h-28 object-cover"
                                  crossOrigin="anonymous"
                                />
                              )}
                              <div className="p-3">
                                <span className="bg-primary-500/20 text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-500/30 mb-2 inline-block">
                                  {post.vibe}
                                </span>
                                <p className="text-white text-sm line-clamp-3">{post.tunedText}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ANALYTICS */}
                  {activeTab === 'analytics' && (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <BarChart3 size={36} className="mx-auto text-pink-400 mb-2" />
                        <h3 className="text-xl font-bold text-white">Platform Analytics</h3>
                        <p className="text-slate-400 text-sm">Live platform-wide statistics</p>
                      </div>
                      {[
                        { icon: <Users size={22} className="text-primary-400" />, label: 'Registered Creators', value: globalStats.totalUsers, bg: 'bg-primary-500/10' },
                        { icon: <ImageIcon size={22} className="text-accent-400" />, label: 'Total Vibes Generated', value: globalStats.totalPosts, bg: 'bg-accent-500/10' },
                        { icon: <Heart size={22} className="text-pink-400" />, label: 'Global Upvotes', value: globalStats.totalUpvotes, bg: 'bg-pink-500/10' },
                      ].map(stat => (
                        <div
                          key={stat.label}
                          className="bg-slate-900 rounded-2xl border border-white/5 p-5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 ${stat.bg} rounded-xl`}>{stat.icon}</div>
                            <span className="text-slate-300 font-medium">{stat.label}</span>
                          </div>
                          <span className="text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ADMIN: USERS */}
                  {activeTab === 'admin_users' && isAdmin && (
                    <div className="space-y-3">
                      <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">All Users</p>
                      <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                        {allUsers.length === 0 && (
                          <p className="text-slate-500 text-sm text-center py-8">No users found</p>
                        )}
                        {allUsers.map(u => (
                          <div key={u._id} className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {u.picture
                                ? <img src={u.picture} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                                : <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">{u.name?.charAt(0)}</div>
                              }
                              <div>
                                <p className="text-white font-medium text-sm flex items-center gap-1.5">
                                  {u.name}
                                  {u.role === 'admin' && <Shield size={11} className="text-accent-400" />}
                                </p>
                                <p className="text-slate-500 text-xs">{u.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-bold">{u.postCount ?? 0}</p>
                              <p className="text-slate-500 text-[10px] uppercase">Vibes</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ADMIN: POSTS */}
                  {activeTab === 'admin_posts' && isAdmin && (
                    <div className="space-y-3">
                      <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">All Posts</p>
                      {allPosts.length === 0 && (
                        <p className="text-slate-500 text-sm text-center py-8">No posts found</p>
                      )}
                      {allPosts.map(post => (
                        <div
                          key={post._id}
                          className="bg-slate-900 rounded-2xl border border-white/5 p-4 flex gap-3 relative group"
                        >
                          <button
                            onClick={() => handleAdminDeletePost(post._id)}
                            className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              className="w-20 h-20 rounded-xl object-cover shrink-0"
                              crossOrigin="anonymous"
                            />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-slate-400 mb-1">
                              By {post.authorId?.name || 'Unknown'}
                            </span>
                            <span className="bg-primary-500/20 text-primary-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-500/30 w-fit mb-1.5">
                              {post.vibe}
                            </span>
                            <p className="text-white text-sm line-clamp-2">{post.tunedText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/10 shrink-0">
              <button
                onClick={() => { onClose(); logout(); }}
                className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium w-full"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
