'use client';

import { useState } from 'react';

interface EmailAuthProps {
  onLogin: (user: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export default function EmailAuth({ onLogin, isLoading, setIsLoading }: EmailAuthProps) {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('📧 Send code response:', data);

      if (data.success) {
        setStep('verify');
        setSuccess('Verification code sent to your email! Check the terminal/console for the code.');
      } else {
        setError(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      console.log('🔐 Verify code response:', data);

      if (data.success) {
        setSuccess('Email verified successfully!');
        onLogin(data.user);
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    setStep('email');
    setCode('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="max-w-md mx-auto">
      {step === 'email' ? (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Ignite! 🚀</h2>
            <p className="text-slate-400">Enter your email to get started</p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@gmail.com"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleSendCode}
            disabled={isLoading || !email}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <span>📧</span>
                <span>Send Verification Code</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 text-center">
            We'll send a verification code to your email
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email! 📧</h2>
            <p className="text-slate-400 mb-2">
              We sent a 6-digit code to <span className="text-blue-400 font-semibold">{email}</span>
            </p>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-sm">
                💡 <strong>For testing:</strong> Check your terminal/console where the dev server is running for the verification code!
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-slate-300 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-center text-2xl font-mono tracking-widest"
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          <button
            onClick={handleVerifyCode}
            disabled={isLoading || code.length !== 6}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>✅</span>
                <span>Verify & Continue</span>
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={handleResendCode}
              className="text-blue-400 hover:text-blue-300 text-sm underline"
            >
              Didn't receive the code? Resend
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Code expires in 10 minutes
          </p>
        </div>
      )}
    </div>
  );
}
