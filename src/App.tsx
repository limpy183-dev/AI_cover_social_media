import Navbar from './components/Navbar';
import AuthGate from './components/AuthGate';
import FeedPage from './pages/FeedPage';
import CreatePage from './pages/CreatePage';
import ModelsPage from './pages/ModelsPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

export default function App() {
  const { currentPage, currentUserId, authLoading, appLoading, initializeApp } = useStore();

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  const renderPage = () => {
    switch (currentPage) {
      case 'feed':    return <FeedPage />;
      case 'create':  return <CreatePage />;
      case 'models':  return <ModelsPage />;
      case 'profile': return <ProfilePage />;
      case 'post':    return <PostPage />;
      default:        return <FeedPage />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400">Loading VoxCover...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse at 10% 0%, rgba(124, 58, 237, 0.12) 0%, transparent 60%),
          radial-gradient(ellipse at 90% 10%, rgba(219, 39, 119, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(29, 78, 216, 0.06) 0%, transparent 60%)
        `
      }} />

      <Navbar />

      {/* Page content with top padding for navbar */}
      <main className="pt-16 md:pt-16 pb-20 md:pb-10 min-h-screen relative z-10">
        {appLoading && (
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-200">
              Syncing your feed, models, and profile data from Supabase.
            </div>
          </div>
        )}
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-gray-900 py-6 text-center text-xs text-gray-700 relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-purple-600 font-bold text-sm">VoxCover</span>
          <span>·</span>
          <span>AI Voice Cover Platform</span>
        </div>
        <p>Upload voice models · Create multi-voice timelines · Share with the world</p>
      </footer>
    </div>
  );
}
