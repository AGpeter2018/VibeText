// import { useAppKit } from '@reown/appkit/react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login } = useAuth();
  // const { open } = useAppKit();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'google' | 'discord' | 'email' | null>(null);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(r => r.json());

        const res = await api.post('auth/google-token', {
          accessToken: tokenResponse.access_token,
          userInfo,
        });
        login(res.data.token, res.data);
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(null);
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.');
      setLoading(null);
    },
    flow: 'implicit',
  });

  const handleDiscordLogin = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    if (!clientId) {
      setError('Discord Client ID is missing from environment config.');
      return;
    }
    setLoading('discord');
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email&state=discord`;
  };

  if (!isOpen) return null;

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '13px 20px',
    borderRadius: 14,
    cursor: loading !== null ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    border: 'none',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
      <div
        className="relative w-full max-w-sm rounded-3xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(9, 15, 28, 0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)',
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-pointer">
          <X size={22} />
        </button>

        <div className="flex flex-col items-center mb-8 text-center pt-2">
          <div className="mb-5 shadow-2xl shadow-primary-500/20" style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', padding: 1 }}>
            <div style={{ width: '100%', height: '100%', background: '#080f1e', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 32, background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transform: 'translateY(1px)' }}>V</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to VibeText</h2>
          <p className="text-slate-400 text-sm mt-2 text-center max-w-[260px]">Sign in securely — only verified accounts accepted</p>
        </div>

        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Google */}
          <button
            onClick={() => { setError(''); setLoading('google'); handleGoogleLogin(); }}
            disabled={loading !== null}
            style={{
              ...btnBase,
              background: loading === 'google' ? 'rgba(255,255,255,0.05)' : '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              opacity: loading !== null && loading !== 'google' ? 0.5 : 1,
            }}
          >
            {loading === 'google' ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            )}
            <span style={{ color: loading === 'google' ? '#94a3b8' : '#1f2937', fontWeight: 600, fontSize: 15 }}>
              {loading === 'google' ? 'Opening Google…' : 'Continue with Google'}
            </span>
          </button>

          {/* Discord */}
          <button
            onClick={handleDiscordLogin}
            disabled={loading !== null}
            style={{
              ...btnBase,
              background: '#5865F2',
              border: '1px solid rgba(88,101,242,0.4)',
              opacity: loading !== null && loading !== 'discord' ? 0.5 : 1,
            }}
          >
            {loading === 'discord' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 127.14 96.36" fill="white">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96,46,95.89,53,91.08,65.69,84.69,65.69Z" />
              </svg>
            )}
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
              {loading === 'discord' ? 'Redirecting…' : 'Continue with Discord'}
            </span>
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6 leading-relaxed">
          By signing in, you agree to our Terms of Service.<br />
          Only verified OAuth accounts are accepted.
        </p>
      </div>
    </div>
  );
}
