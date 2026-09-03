import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Brain, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

interface LandingPageProps {
  onAuthSuccess?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = () => {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign-in failure:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in popup was closed before completing. Please try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setAuthError('Popup request was replaced. Please try again.');
      } else {
        setAuthError(err?.message || 'Authentication failed. Please verify your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#050505] text-[#e0e0e0] flex flex-col justify-between">
      {/* Top Navbar */}
      <header id="landing-header" className="w-full border-b border-[#1f1f1f] bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#262626] text-amber-300 flex items-center justify-center font-semibold shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#f5f5f5]">ReflectAI</span>
              <span className="hidden sm:inline-block ml-2 text-xs uppercase tracking-wider text-neutral-400 bg-[#161616] px-2 py-0.5 rounded border border-[#262626]">
                Gemini 3.6 Flash + Firestore
              </span>
            </div>
          </div>

          <button
            id="nav-signin-button"
            onClick={handleSignIn}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-neutral-200 bg-[#141414] border border-[#2c2c2c] hover:bg-[#1f1f1f] hover:text-white transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Lock className="w-4 h-4 text-neutral-400" />
            )}
            Sign In with Google
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main id="landing-main" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        {authError && (
          <div 
            id="auth-error-alert" 
            className="w-full max-w-xl mb-8 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm flex items-start gap-3 text-left"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Sign-In Notice</p>
              <p className="text-red-300 mt-0.5">{authError}</p>
            </div>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121212] border border-[#242424] text-xs font-medium text-neutral-300 mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Zero-Knowledge User Isolation on Cloud Firestore
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#f5f5f5] max-w-3xl leading-tight">
          A private sanctuary for your thoughts, deepened by AI.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-2xl leading-relaxed">
          Write multi-turn journal reflections, uncover blind spots, and brainstorm perspectives with <span className="font-semibold text-neutral-200">Gemini 3.6 Flash</span>. Your entries are cryptographically isolated to your Google account.
        </p>

        {/* Primary CTA button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <button
            id="hero-signin-button"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 text-base font-semibold rounded-xl text-[#050505] bg-[#f5f5f5] hover:bg-white active:bg-neutral-200 transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            Sign In with Google to Enter
            <ArrowRight className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Feature Grid */}
        <div id="feature-grid" className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div id="feature-card-1" className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#161616] border border-[#262626] text-amber-400 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#f5f5f5] text-base mb-2">Gemini 3.6 Flash Engine</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Explore your reflections through structured deepening, objective summaries, or lateral perspective brainstorming with multi-turn context.
            </p>
          </div>

          <div id="feature-card-2" className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#161616] border border-[#262626] text-emerald-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#f5f5f5] text-base mb-2">Private Firestore Storage</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Each user’s reflections are saved strictly under <code className="text-xs bg-[#161616] px-1 py-0.5 rounded text-neutral-300 font-mono border border-[#262626]">/users/{'{uid}'}/interactions</code>, guarded by Firestore Security Rules.
            </p>
          </div>

          <div id="feature-card-3" className="p-6 rounded-2xl bg-[#0d0d0d] border border-[#1f1f1f] shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#161616] border border-[#262626] text-blue-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-[#f5f5f5] text-base mb-2">Server-Side Secret Hygiene</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Gemini API keys and credentials reside strictly server-side with automated multi-model fallback ladders for high availability.
            </p>
          </div>
        </div>

        {/* Security Assurance list */}
        <div id="security-assurance-card" className="mt-12 w-full max-w-3xl p-6 rounded-2xl bg-[#0e0e0e] border border-[#1f1f1f] text-left">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            Security & Authentication Guarantees
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No passwords stored or handled in custom code</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full user data isolation by authenticated UID</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Resilient fallback ladder for uninterrupted AI responses</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time persistence with automatic sync indicator</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Footer */}
      <footer id="landing-footer" className="w-full border-t border-[#1a1a1a] py-6 text-center text-xs text-neutral-500">
        <p>Built with Google Gemini 3.6 Flash, Cloud Firestore & Firebase Authentication.</p>
      </footer>
    </div>
  );
};
