import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User as UserIcon } from 'lucide-react';
import api from '../lib/api';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [mode, setMode] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('auth/google', { credential: credentialResponse.credential });
      login(res.data.token, res.data);
      onClose();
    } catch (err) {
      console.error("Login failed", err);
      setError('Google authentication failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'email') {
        // Step 1: Send OTP to their email
        await api.post('auth/send-otp', { email });
        setMode('otp');
      } else {
        // Step 2: Verify the 6-digit code
        const res = await api.post('auth/verify-otp', { email, otp, name: isLogin ? undefined : name });
        login(res.data.token, res.data);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glassmorphism rounded-3xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2 text-center">
          {mode === 'otp' ? 'Check Your Email' : (isLogin ? 'Welcome Back' : 'Join VibeText')}
        </h2>
        <p className="text-slate-400 text-center mb-6">
          {mode === 'otp' ? `We sent a 6-digit code to ${email}` : (isLogin ? 'Sign in to continue vining' : 'Sign up to publish your vibes')}
        </p>

        {/* Tabs - Only show on email step */}
        {mode === 'email' && (
          <div className="flex bg-slate-900/50 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${isLogin ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${!isLogin ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {mode === 'email' ? (
            <>
              {!isLogin && (
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </>
          ) : (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="6-Digit OTP Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (mode === 'email' ? 'Send Verification Code' : 'Verify Code')}
          </button>

          {mode === 'otp' && (
            <button
              type="button"
              onClick={() => { setMode('email'); setOtp(''); }}
              className="w-full text-slate-400 hover:text-white text-sm py-2"
            >
              Back to Email
            </button>
          )}
        </form>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-white/10 w-full"></div>
          <span className="bg-slate-950 px-3 text-slate-500 text-sm absolute">or continue with</span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
            theme="filled_black"
          />

          <button
            onClick={() => {
              const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
              if (!clientId) {
                setError('Discord Client ID is missing in frontend .env');
                return;
              }
              const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
              const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email&state=discord`;
              window.location.href = discordLoginUrl;
            }}
            className="w-[200px] flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium py-[8px] px-[12px] rounded uppercase"
            style={{ fontSize: '14px', fontFamily: '"Roboto", sans-serif', letterSpacing: '0.25px', height: '40px', borderRadius: '4px' }}
          >
            <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="currentColor">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96,46,95.89,53,91.08,65.69,84.69,65.69Z" />
            </svg>
            <span className="font-normal normal-case" style={{ fontWeight: 500 }}>Sign in with Discord</span>
          </button>
        </div>
      </div>
    </div>
  );
}
