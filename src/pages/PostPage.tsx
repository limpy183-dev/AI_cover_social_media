import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, Clock, Copy, Eye, Heart, MessageCircle, Music, Pause, Play, Send, Settings2, Share2, Trash2 } from 'lucide-react';
import { CoverPost, Comment, useStore } from '../store/useStore';

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
  return new Date(dateStr).toLocaleDateString();
}

function CommentItem({ comment, onReply }: { comment: Comment; onReply: (parentId: string, text: string) => void }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">{comment.authorName}</span>
            <span className="text-xs text-gray-600">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-gray-300">{comment.text}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-gray-600 flex items-center gap-1"><Heart className="w-3 h-3" /> {comment.likes}</span>
            <button onClick={() => setReplying((current) => !current)} className="text-xs text-gray-600 hover:text-blue-400 transition-colors">Reply</button>
          </div>
          {replying && (
            <div className="mt-3 flex gap-2">
              <input value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write a reply..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60" />
              <button
                onClick={() => {
                  if (!replyText.trim()) return;
                  onReply(comment.id, replyText.trim());
                  setReplyText('');
                  setReplying(false);
                }}
                className="p-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
      {(comment.replies || []).length > 0 && (
        <div className="pl-11 border-l border-gray-800 ml-4 space-y-3">
          {(comment.replies || []).map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostPage() {
  const {
    posts,
    currentPostId,
    currentUserId,
    currentUserAvatar,
    setPage,
    likePost,
    sharePost,
    addComment,
    copyPostSettings,
    toggleBookmark,
    bookmarks,
    incrementPostView,
    deletePost,
  } = useStore();
  const post = posts.find((item) => item.id === currentPostId);
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!post) return;
    void incrementPostView(post.id);
  }, [incrementPostView, post]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          setIsPlaying(false);
          return 0;
        }
        return current + 2;
      });
    }, 150);
    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const totalDuration = useMemo(() => (post?.segments.length ? Math.max(...post.segments.map((segment) => segment.endTime)) : 210), [post]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-400">
        <p className="text-xl">Post not found.</p>
        <button onClick={() => setPage('feed')} className="mt-4 text-purple-400 hover:underline">Back to feed</button>
      </div>
    );
  }

  const isOwner = post.authorId === currentUserId;
  const isLiked = post.likedBy.includes(currentUserId);
  const isBookmarked = bookmarks.includes(post.id);
  const modelColors = ['bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleReply = async (parentId: string, text: string) => {
    await addComment(post.id, text, parentId);
  };

  const handleCopySettings = () => {
    copyPostSettings(post.id);
    navigator.clipboard.writeText(JSON.stringify(post.settings, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <button onClick={() => setPage('feed')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </button>

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2">
          <div className="sticky top-24">
            <div className="relative rounded-2xl overflow-hidden aspect-square mb-4 group bg-gray-900">
              {post.coverArtUrl ? <img src={post.coverArtUrl} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900" />}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button onClick={() => setIsPlaying((current) => !current)} className="w-16 h-16 bg-white/20 backdrop-blur border border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                  {isPlaying ? <Pause className="w-7 h-7 text-white" fill="white" /> : <Play className="w-7 h-7 text-white ml-1" fill="white" />}
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{post.title}</span>
                <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {post.originalSong}</span>
              </div>
              <div className="flex items-center gap-0.5 h-12 mb-2 overflow-hidden">
                {Array.from({ length: 60 }).map((_, index) => {
                  const height = 20 + Math.sin(index * 0.8) * 15 + ((index % 7) * 2);
                  const filled = (index / 60) * 100 <= progress;
                  return <div key={index} className={`flex-1 rounded-full transition-colors ${filled ? 'bg-purple-500' : 'bg-gray-700'}`} style={{ height: `${height}%` }} />;
                })}
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => void likePost(post.id)} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${isLiked ? 'bg-pink-600/20 border border-pink-500/40 text-pink-400' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-pink-500/40 hover:text-pink-400'}`}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {formatNumber(post.likes)}
              </button>
              <button onClick={() => void sharePost(post.id)} className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-gray-800 border border-gray-700 text-gray-400 hover:border-green-500/40 hover:text-green-400 transition-all">
                <Share2 className="w-4 h-4" /> {formatNumber(post.shares)}
              </button>
              <button onClick={() => void toggleBookmark(post.id)} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${isBookmarked ? 'bg-yellow-600/20 border border-yellow-500/40 text-yellow-300' : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-yellow-500/40 hover:text-yellow-300'}`}>
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> Save
              </button>
              {isOwner ? (
                <button onClick={() => void deletePost(post.id)} className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-red-900/20 border border-red-700/30 text-red-300 hover:bg-red-900/30 transition-all">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : (
                <button onClick={handleCopySettings} className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${copied ? 'bg-green-600/20 border border-green-500/40 text-green-400' : 'bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30'}`}>
                  <Copy className="w-4 h-4" /> {copied ? 'Copied' : 'Copy Settings'}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl font-black text-white">{post.title}</h1>
              <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs text-gray-300 capitalize">{post.visibility || 'public'}</span>
            </div>
            <p className="text-purple-400 font-medium">{post.originalSong} · {post.artist}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5"><img src={post.authorAvatar} alt="" className="w-5 h-5 rounded-full" />{post.authorName}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatNumber(post.views)} views</span>
              <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" />{post.comments.length}</span>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">{post.description || 'No description added for this cover yet.'}</p>
            {(post.genre || post.sourceCredit) && (
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {post.genre && <div className="rounded-xl bg-gray-800/60 px-3 py-2 text-gray-300"><span className="text-gray-500">Genre:</span> {post.genre}</div>}
                {post.sourceCredit && <div className="rounded-xl bg-gray-800/60 px-3 py-2 text-gray-300"><span className="text-gray-500">Source:</span> {post.sourceCredit}</div>}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => <span key={tag} className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-700/30">#{tag}</span>)}
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Music className="w-4 h-4 text-purple-400" /> Voice Models Used ({post.models.length})</h3>
            <div className="space-y-2">
              {post.models.map((model, index) => (
                <div key={model.id} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${modelColors[index % modelColors.length]}`}>{model.character[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{model.name}</p>
                    <p className="text-xs text-gray-500">{model.type} · {model.tags.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {post.segments.length > 0 && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Music className="w-4 h-4 text-purple-400" /> Voice Timeline</h3>
              <div className="space-y-2">
                {post.models.map((model, modelIndex) => {
                  const segments = post.segments.filter((segment) => segment.modelId === model.id);
                  return (
                    <div key={model.id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-24 truncate">{model.character}</span>
                      <div className="flex-1 h-7 bg-gray-800 rounded-lg relative overflow-hidden">
                        {segments.map((segment) => (
                          <div key={segment.id} className={`absolute top-0.5 bottom-0.5 ${modelColors[modelIndex % modelColors.length]} rounded opacity-80`} style={{ left: `${(segment.startTime / totalDuration) * 100}%`, width: `${((segment.endTime - segment.startTime) / totalDuration) * 100}%` }} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Settings2 className="w-4 h-4 text-purple-400" /> Cover Settings</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Pitch Shift', `${post.settings.pitchShift > 0 ? '+' : ''}${post.settings.pitchShift} semitones`],
                ['Index Rate', post.settings.indexRate],
                ['Filter Radius', post.settings.filterRadius],
                ['RMS Mix Rate', post.settings.rmsMixRate],
                ['Protect', post.settings.protect],
                ['Reverb Mix', post.settings.reverbMix],
                ['Pitch Detection', post.settings.pitchDetection.toUpperCase()],
                ['Output Format', post.settings.outputFormat.toUpperCase()],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-white">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><MessageCircle className="w-4 h-4 text-purple-400" /> Comments</h3>
            <div className="flex items-start gap-3 mb-5">
              <img src={currentUserAvatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0 border border-purple-500/30" />
              <div className="flex-1 flex gap-2">
                <input value={commentText} onChange={(event) => setCommentText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void handleComment()} placeholder="Add a comment..." className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500/60 transition-colors" />
                <button onClick={() => void handleComment()} disabled={!commentText.trim()} className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 rounded-xl transition-all">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {post.comments.length === 0 && <p className="text-center text-gray-600 text-sm py-4">No comments yet. Be the first!</p>}
              {post.comments.map((comment) => <CommentItem key={comment.id} comment={comment} onReply={handleReply} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
