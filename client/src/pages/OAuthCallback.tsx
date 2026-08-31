import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('state'); // We pass the provider name in the state param

    if (!code || !provider) {
      setError('Invalid authentication parameters returned from provider.');
      return;
    }

    const verifyCode = async () => {
      try {
        const res = await api.post('auth/oauth/verify', { code, provider });
        login(res.data);
        navigate('/dashboard');
      } catch (err: any) {
        console.error('OAuth verification failed:', err);
        setError(err.response?.data?.error || 'Authentication failed');
      }
    };

    verifyCode();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080f1e] text-white">
      {error ? (
        <div className="glassmorphism p-8 rounded-2xl border border-red-500/20 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Authentication Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="bg-primary-600 px-6 py-2 rounded-xl text-white font-medium hover:bg-primary-500 transition-colors">
            Return Home
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
          <p className="text-slate-400 font-medium">Verifying social login...</p>
        </div>
      )}
    </div>
  );
}
