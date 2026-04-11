import { ChangeEvent, useMemo, useState } from 'react';
import { Edit3, Eye, Heart, Mic2, Music, Settings, Share2, Users, Bookmark } from 'lucide-react';
import { useStore } from '../store/useStore';
import PostCard from '../components/PostCard';

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export default function ProfilePage() {
  const {
    posts,
    models,
    bookmarks,
    currentUserId,
    currentUserName,
    currentUserAvatar,
    currentUserBio,
    currentUserSocialLinks,
    followersCount,
    followingCount,
    dashboardStats,
    setPage,
    updateProfile,
    actionLoading,
  } = useStore();
  const [activeTab, setActiveTab] = useState<'covers' | 'liked' | 'bookmarks'>('covers');
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUserName);
  const [bio, setBio] = useState(currentUserBio);
  const [socialLinksText, setSocialLinksText] = useState(currentUserSocialLinks.join('\n'));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const myPosts = posts.filter((post) => post.authorId === currentUserId);
  const likedPosts = posts.filter((post) => post.likedBy.includes(currentUserId));
  const bookmarkedPosts = posts.filter((post) => bookmarks.includes(post.id));
  const myModels = models.filter((model) => model.creatorId === currentUserId);

  const totalLikes = myPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalViews = myPosts.reduce((sum, post) => sum + post.views, 0);
  const totalShares = myPosts.reduce((sum, post) => sum + post.shares, 0);

  const displayPosts = useMemo(() => {
    switch (activeTab) {
      case 'liked':
        return likedPosts;
      case 'bookmarks':
        return bookmarkedPosts;
      default:
        return myPosts;
    }
  }, [activeTab, bookmarkedPosts, likedPosts, myPosts]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] || null);
  };

  const handleProfileSave = async () => {
    const result = await updateProfile({
      displayName,
      bio,
      socialLinks: socialLinksText.split('\n').map((item) => item.trim()).filter(Boolean),
      avatarFile,
    });
    if (!result.error) {
      setEditing(false);
      setAvatarFile(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="relative mb-8">
        <div className="h-40 rounded-2xl overflow-hidden mb-4" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #1d4ed8 100%)' }}>
          <div className="w-full h-full opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)' }} />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-4 px-2">
          <div className="-mt-14 relative">
            <img src={currentUserAvatar} alt={currentUserName} className="w-24 h-24 rounded-2xl border-4 border-gray-950 bg-gray-800 shadow-xl object-cover" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-950" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{currentUserName}</h1>
            <p className="text-gray-400 text-sm">@{currentUserName.toLowerCase().replace(/\s/g, '_')} · AI Cover Creator</p>
            <p className="text-sm text-gray-300 mt-3 max-w-2xl">{currentUserBio || 'Add a bio to tell people what kind of AI covers and models you create.'}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-gray-300">
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-700/30 bg-purple-900/40 px-3 py-1"><Users className="w-3 h-3" />{followersCount} followers</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-700/30 bg-blue-900/40 px-3 py-1"><Users className="w-3 h-3" />{followingCount} following</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-pink-700/30 bg-pink-900/40 px-3 py-1"><Music className="w-3 h-3" />{myModels.length} models</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setEditing((current) => !current)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <Edit3 className="w-4 h-4" /> {editing ? 'Close Editor' : 'Edit Profile'}
            </button>
            <button className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 rounded-xl transition-all">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 mb-8 space-y-4">
          <h2 className="text-lg font-bold text-white">Profile Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Display Name</label>
              <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Avatar</label>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-1.5 file:text-white" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Bio</label>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Social Links (one per line)</label>
            <textarea value={socialLinksText} onChange={(event) => setSocialLinksText(event.target.value)} rows={3} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/60 resize-none" />
          </div>
          <div className="flex justify-end">
            <button onClick={() => void handleProfileSave()} disabled={actionLoading} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-semibold">
              {actionLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Mic2, label: 'Covers', value: dashboardStats.totalPosts || myPosts.length, color: 'text-purple-400', bg: 'bg-purple-900/20' },
          { icon: Heart, label: 'Likes', value: formatNumber(dashboardStats.totalLikesReceived || totalLikes), color: 'text-pink-400', bg: 'bg-pink-900/20' },
          { icon: Eye, label: 'Plays', value: formatNumber(dashboardStats.totalPlays || totalViews), color: 'text-blue-400', bg: 'bg-blue-900/20' },
          { icon: Share2, label: 'Shares', value: formatNumber(totalShares), color: 'text-green-400', bg: 'bg-green-900/20' },
          { icon: Bookmark, label: 'Bookmarks', value: formatNumber(bookmarkedPosts.length), color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-800/50 rounded-xl p-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-lg bg-gray-900/50 flex items-center justify-center flex-shrink-0">
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6 mb-8">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-400" /> My Voice Models ({myModels.length})
            </h3>
            <button onClick={() => setPage('models')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Manage →</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {myModels.slice(0, 8).map((model) => (
              <div key={model.id} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                <img src={model.avatar} alt="" className="w-10 h-10 rounded-full bg-gray-700 border border-purple-500/30" />
                <span className="text-xs text-gray-400 text-center leading-tight max-w-[80px] truncate">{model.character}</span>
              </div>
            ))}
            <button onClick={() => setPage('models')} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-purple-900/40 border border-purple-700/30 flex items-center justify-center">
                <span className="text-purple-400 text-lg font-bold">+</span>
              </div>
              <span className="text-xs text-gray-500">Add</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
          <h3 className="font-bold text-white text-sm mb-3">Dashboard Highlights</h3>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-gray-800/60 p-3">
              <p className="text-xs text-gray-500 mb-1">Most Popular Cover</p>
              <p className="text-white font-semibold">{dashboardStats.mostPopularCover}</p>
            </div>
            <div className="rounded-xl bg-gray-800/60 p-3">
              <p className="text-xs text-gray-500 mb-1">Most Used Voice Model</p>
              <p className="text-white font-semibold">{dashboardStats.mostUsedVoiceModel}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800 rounded-xl p-1">
          <button onClick={() => setActiveTab('covers')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'covers' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>My Covers ({myPosts.length})</button>
          <button onClick={() => setActiveTab('liked')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'liked' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Liked ({likedPosts.length})</button>
          <button onClick={() => setActiveTab('bookmarks')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'bookmarks' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Bookmarks ({bookmarkedPosts.length})</button>
        </div>
      </div>

      {displayPosts.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Mic2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold text-gray-400">{activeTab === 'covers' ? 'No covers yet' : activeTab === 'liked' ? 'No liked covers yet' : 'No bookmarks yet'}</p>
          {activeTab === 'covers' && <button onClick={() => setPage('create')} className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Create Your First Cover →</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
