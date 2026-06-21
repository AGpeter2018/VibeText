import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import api from '../lib/api';

export function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { login } = useAuth();

  const onSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('auth/google', { credential: credentialResponse.credential });
      login(res.data.token, { name: res.data.name, email: res.data.email, picture: res.data.picture });
      onClose();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glassmorphism rounded-3xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Join VibeText</h2>
        <p className="text-slate-400 text-center mb-6">Sign in to publish your vibes and upvote others.</p>
        
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={onSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            theme="filled_black"
          />
        </div>
      </div>
    </div>
  );
}
