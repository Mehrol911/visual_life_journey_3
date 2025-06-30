import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from the email link
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session error:', error);
            setStatus('error');
            setMessage('Failed to confirm email. Please try again.');
          } else if (data.user) {
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting to your dashboard...');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
              window.location.href = '/'; // Force a full page reload to ensure auth state is updated
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage('Invalid confirmation link. Please try again.');
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage('An error occurred during email confirmation.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full p-8 rounded-3xl backdrop-blur-lg border shadow-2xl text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        }}
      >
        <div className="mb-6">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
            >
              <Loader className="w-8 h-8 text-white" />
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-white" />
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4 text-white">
          {status === 'loading' && 'Confirming Your Email...'}
          {status === 'success' && 'Email Confirmed!'}
          {status === 'error' && 'Confirmation Failed'}
        </h2>

        <p className="text-gray-300 leading-relaxed">
          {message}
        </p>

        {status === 'error' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Return to Home
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};