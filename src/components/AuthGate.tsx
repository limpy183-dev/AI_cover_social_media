import { FormEvent, useState } from 'react';
import { Disc3, LoaderCircle, Mail, Lock, UserRound } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function AuthGate() {
  const {
    authMode,
    actionLoading,
    error,
    setAuthMode,
    signInWithPassword,
    signUpWithPassword,
    signInWithOAuth,
    clearError,
  } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearError();
    if (authMode === 'signin') {
      await signInWithPassword(email, password);
      return;
    }
    await signUpWithPassword(email, password, displayName);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top left, rgba(124,58,237,0.18) 0%, transparent 45%), radial-gradient(ellipse at top right, rgba(219,39,119,0.16) 0%, transparent 40%), radial-gradient(ellipse at bottom, rgba(29,78,216,0.12) 0%, transparent 50%)',
        }}
      />
      <div className="max-w-6xl mx-auto px-4 py-10 relative z-10 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center w-full">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-200 mb-6">
              <Disc3 className="w-4 h-4" />
              Browser-native AI voice cover platform
            </div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
              Create, publish, and discover AI voice covers with real accounts and synced data.
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mb-8">
              Sign in to upload voice models, build layered voice timelines, publish covers, follow creators, and keep every action tied to your Supabase account.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                'Supabase Auth with email/password, Google, and Discord',
                'Persistent post, model, like, bookmark, comment, and follow data',
                'Studio workflow for segment-based multi-voice cover creation',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 text-sm text-gray-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-gray-800 bg-gray-900/80 backdrop-blur p-6 md:p-8 shadow-2xl shadow-purple-950/30">
            <div className="flex gap-2 mb-6 rounded-2xl bg-gray-950/80 border border-gray-800 p-1">
              <button
                onClick={() => setAuthMode('signin')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  authMode === 'signin' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  authMode === 'signup' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <label className="block">
                  <span className="text-xs text-gray-400 mb-1.5 block">Display name</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-800/70 px-4 py-3">
                    <UserRound className="w-4 h-4 text-gray-500" />
                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm"
                      placeholder="Your creator name"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="text-xs text-gray-400 mb-1.5 block">Email</span>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-800/70 px-4 py-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs text-gray-400 mb-1.5 block">Password</span>
                <div className="flex items-center gap-3 rounded-2xl border border-gray-700 bg-gray-800/70 px-4 py-3">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3.5 font-semibold text-white transition-opacity disabled:opacity-60"
              >
                {actionLoading ? 'Working...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-gray-500">
              <div className="h-px flex-1 bg-gray-800" />
              Or continue with
              <div className="h-px flex-1 bg-gray-800" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => void signInWithOAuth('google')}
                disabled={actionLoading}
                className="rounded-2xl border border-gray-700 bg-gray-800/70 px-4 py-3 text-sm font-semibold text-white hover:border-purple-500/40 transition-colors disabled:opacity-60"
              >
                Google
              </button>
              <button
                onClick={() => void signInWithOAuth('discord')}
                disabled={actionLoading}
                className="rounded-2xl border border-gray-700 bg-gray-800/70 px-4 py-3 text-sm font-semibold text-white hover:border-purple-500/40 transition-colors disabled:opacity-60"
              >
                Discord
              </button>
            </div>
          </section>
        </div>
      </div>
      {actionLoading && (
        <div className="fixed inset-0 z-50 bg-black/30 pointer-events-none flex items-center justify-center">
          <LoaderCircle className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      )}
    </div>
  );
}
