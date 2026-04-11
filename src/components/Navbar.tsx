import { Mic2, Home, PlusCircle, Layers, User, Search, X, Bell, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function Navbar() {
  const {
    currentPage,
    setPage,
    searchQuery,
    setSearchQuery,
    currentUserAvatar,
    currentUserName,
    notifications,
    signOut,
  } = useStore();
  const [showSearch, setShowSearch] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const navItems = [
    { id: 'feed' as const, icon: Home, label: 'Feed' },
    { id: 'create' as const, icon: PlusCircle, label: 'Create' },
    { id: 'models' as const, icon: Layers, label: 'Models' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setPage('feed')}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
            VoxCover
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === id
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            {showSearch ? (
              <div className="flex items-center gap-2 bg-gray-900 border border-purple-700/50 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search covers, artists..."
                  className="bg-transparent text-white text-sm outline-none w-48 placeholder-gray-500"
                />
                <button onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Create button (desktop) */}
          <button
            onClick={() => setPage('create')}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Cover
          </button>

          {/* Avatar */}
          <button
            onClick={() => setPage('profile')}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/50 hover:border-purple-400 transition-all"
          >
            <img src={currentUserAvatar} alt={currentUserName} className="w-full h-full" />
          </button>

          <button
            onClick={() => void signOut()}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-gray-800">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-all ${
              currentPage === id ? 'text-purple-400' : 'text-gray-500'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
