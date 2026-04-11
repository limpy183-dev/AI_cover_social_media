import { Heart, MessageCircle, Share2, Play, Eye, Copy, ChevronRight, Music, Bookmark } from 'lucide-react';
import { CoverPost, useStore } from '../store/useStore';
import { useEffect, useState } from 'react';

function formatNumber(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

type Props = { post: CoverPost; featured?: boolean };

export default function PostCard({ post, featured = false }: Props) {
  const { likePost, sharePost, setPage, currentUserId, copyPostSettings, toggleBookmark, bookmarks, incrementPostView } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLiked = post.likedBy.includes(currentUserId);
  const isBookmarked = bookmarks.includes(post.id);

  useEffect(() => {
    if (!isPlaying) return;
    void incrementPostView(post.id);
  }, [incrementPostView, isPlaying, post.id]);

  const handleCopySettings = () => {
    copyPostSettings(post.id);
    navigator.clipboard.writeText(JSON.stringify(post.settings, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    sharePost(post.id);
    navigator.clipboard.writeText(`Check out this AI cover: "${post.title}" on VoxCover!`);
  };

  return (
    <div
      className={`group bg-gray-900/60 backdrop-blur border border-gray-800/50 rounded-2xl overflow-hidden hover:border-purple-700/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-900/20 ${
        featured ? 'col-span-2 md:flex' : ''
      }`}
    >
      {/* Cover Art */}
      <div
        className={`relative overflow-hidden cursor-pointer ${featured ? 'md:w-72 flex-shrink-0' : 'aspect-square'}`}
        onClick={() => setPage('post', post.id)}
      >
        <img
          src={post.coverArtUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </button>
        </div>

        {/* Multi-voice badge */}
        {post.models.length > 1 && (
          <div className="absolute top-3 left-3 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
            <Music className="w-3 h-3" />
            {post.models.length} Voices
          </div>
        )}

        {/* Views */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white/80 text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
          <Eye className="w-3 h-3" />
          {formatNumber(post.views)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full border border-purple-500/30" />
          <div>
            <p className="text-sm font-semibold text-white">{post.authorName}</p>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
          </div>
        </div>

        {/* Title */}
        <button
          onClick={() => setPage('post', post.id)}
          className="text-left mb-1"
        >
          <h3 className="font-bold text-white hover:text-purple-300 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
        </button>
        <p className="text-xs text-purple-400 mb-2">
          {post.originalSong} · {post.artist}
        </p>

        {/* Models used */}
        <div className="flex flex-wrap gap-1 mb-3">
          {post.models.slice(0, 3).map(m => (
            <span key={m.id} className="text-xs bg-purple-900/40 border border-purple-700/30 text-purple-300 px-2 py-0.5 rounded-full">
              {m.character}
            </span>
          ))}
        </div>

        {/* Description */}
        {featured && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.description}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 4).map(tag => (
            <span key={tag} className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800/50">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={() => likePost(post.id)}
              className={`flex items-center gap-1.5 text-sm transition-all ${
                isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{formatNumber(post.likes)}</span>
            </button>

            {/* Comment */}
            <button
              onClick={() => setPage('post', post.id)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{formatNumber(post.comments.length)}</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="font-medium">{formatNumber(post.shares)}</span>
            </button>

            <button
              onClick={() => void toggleBookmark(post.id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                isBookmarked ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Copy Settings */}
          <button
            onClick={handleCopySettings}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              copied
                ? 'bg-green-600/20 border-green-500/30 text-green-400'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-purple-500/40 hover:text-purple-300'
            }`}
          >
            <Copy className="w-3 h-3" />
            {copied ? 'Copied!' : 'Settings'}
          </button>
        </div>

        {/* View full post link */}
        <button
          onClick={() => setPage('post', post.id)}
          className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          View full post <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
