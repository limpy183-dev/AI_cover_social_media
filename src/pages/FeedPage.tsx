import { TrendingUp, Flame, Clock, ChevronUp, Hash, Users, Globe, Bookmark } from 'lucide-react';
import { useStore } from '../store/useStore';
import PostCard from '../components/PostCard';

export default function FeedPage() {
  const {
    sortOrder,
    setSortOrder,
    getSortedPosts,
    activeTag,
    setActiveTag,
    feedMode,
    setFeedMode,
    bookmarks,
    models,
  } = useStore();
  const posts = getSortedPosts();
  const popularTags = Array.from(new Set(posts.flatMap((post) => post.tags))).slice(0, 12);

  const sortOptions = [
    { id: 'top' as const, icon: ChevronUp, label: 'Top' },
    { id: 'trending' as const, icon: Flame, label: 'Trending' },
    { id: 'new' as const, icon: Clock, label: 'New' },
    { id: 'old' as const, icon: TrendingUp, label: 'Old' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="mb-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 p-8 border border-purple-700/30">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 20%, #db2777 0%, transparent 50%)`
        }} />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            🎤 AI Voice Cover Feed
          </h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Discover, create, and share AI-powered voice covers. Upload models once, use them forever.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-purple-600/30 border border-purple-500/40 text-purple-300 text-sm px-3 py-1 rounded-full">
              🤖 RVC Models
            </span>
            <span className="bg-pink-600/30 border border-pink-500/40 text-pink-300 text-sm px-3 py-1 rounded-full">
              🎵 Multi-Voice Timeline
            </span>
            <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-sm px-3 py-1 rounded-full">
              📤 Share & Discover
            </span>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setFeedMode('global')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              feedMode === 'global' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Global
          </button>
          <button
            onClick={() => setFeedMode('following')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              feedMode === 'following' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Following
          </button>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-800 rounded-xl p-1">
          {sortOptions.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setSortOrder(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortOrder === id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <button
            onClick={() => setActiveTag('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeTag === ''
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            All
          </button>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm transition-all ${
                activeTag === tag
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Published Covers</p>
          <p className="text-3xl font-black text-white">{posts.length}</p>
          <p className="text-sm text-gray-400 mt-1">Filtered in the active feed view</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Saved Posts</p>
          <p className="text-3xl font-black text-purple-300">{bookmarks.length}</p>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-2"><Bookmark className="w-4 h-4" />Private bookmark collection</p>
        </div>
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Public Models</p>
          <p className="text-3xl font-black text-pink-300">{models.filter((model) => model.isPublic).length}</p>
          <p className="text-sm text-gray-400 mt-1">Searchable community voice model library</p>
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <div className="text-5xl mb-4">🎵</div>
          <p className="text-xl font-semibold text-gray-400">No covers found</p>
          <p className="mt-2">Try a different search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post, idx) => (
            <PostCard key={post.id} post={post} featured={idx === 0 && sortOrder === 'trending'} />
          ))}
        </div>
      )}
    </div>
  );
}
