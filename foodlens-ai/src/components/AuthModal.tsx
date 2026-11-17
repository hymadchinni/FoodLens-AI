import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const { signInWithGoogle, enterDemoSession, authError } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setSubmitting(true);
    const ok = await signInWithGoogle();
    setSubmitting(false);
    if (ok) {
      onAuthenticated();
      onClose();
    }
  };

  const handleDemoStart = () => {
    enterDemoSession();
    onAuthenticated();
    onClose();
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes('@')) return;
    setResetSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Segmented mode selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6 w-fit">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setResetSent(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setResetSent(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setResetSent(false);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              mode === 'reset'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Account Recovery
          </button>
        </div>

        {mode === 'reset' ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Account & Password Recovery
            </h2>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              FoodLens AI uses federated Google OAuth 2.0 via Firebase Authentication for zero-password security. Enter your email to check your linked identity provider or recovery instructions.
            </p>
            {resetSent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-900 mb-4">
                Recovery guidance sent for <span className="font-semibold">{resetEmail}</span>. Please sign in directly with your linked Google Workspace or Gmail account below.
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  Send Recovery Check
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-xs font-medium text-emerald-800 hover:underline"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {mode === 'login'
                ? 'Sign in to FoodLens AI'
                : 'Create your FoodLens AI Profile'}
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {mode === 'login'
                ? 'Access your personalized PostgreSQL nutrition logs, verified Indian & global meal scans, and TDEE macro targets.'
                : 'Register with Google Sign-In to calibrate your BMR/TDEE profile and start logging AI-verified meals.'}
            </p>

            {authError && (
              <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Authentication Notice</p>
                  <p>{authError}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Connecting with Google...'
                    : mode === 'login'
                    ? 'Continue with Google Account'
                    : 'Register with Google Account'}
                </span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs text-slate-400 whitespace-nowrap">
                  or evaluate immediately
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <button
                type="button"
                onClick={handleDemoStart}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Interactive Demo Profile (PostgreSQL Backed)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-6 text-xs text-slate-500 leading-relaxed">
              Your personal nutrition logs and scans are isolated per account in Cloud SQL PostgreSQL. Nutrition estimates are for informational guidance only, not medical diagnosis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
