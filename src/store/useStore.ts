import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

export type VoiceModel = {
  id: string;
  name: string;
  character: string;
  avatar: string;
  uploadedAt: string;
  type: 'RVC' | 'Diff-SVC' | 'VITS' | 'Custom';
  tags: string[];
  usageCount: number;
  description?: string;
  creatorId?: string;
  creatorName?: string;
  isPublic?: boolean;
  storagePath?: string;
};

export type VoiceSegment = {
  id: string;
  modelId: string;
  startTime: number;
  endTime: number;
  pitchShift: number;
  volume: number;
  speed?: number;
  tone?: number;
  blend?: number;
};

export type CoverSettings = {
  pitchShift: number;
  indexRate: number;
  filterRadius: number;
  rmsMixRate: number;
  protect: number;
  reverbMix: number;
  pitchDetection: 'rmvpe' | 'crepe' | 'harvest' | 'pm';
  outputFormat: 'mp3' | 'wav' | 'flac';
  separateVocals: boolean;
  mainVocalVolume: number;
  backupVocalVolume: number;
  instrumentalVolume: number;
};

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  parentId?: string | null;
  replies?: Comment[];
};

export type CoverPost = {
  id: string;
  title: string;
  originalSong: string;
  artist: string;
  coverArtUrl: string;
  audioUrl: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  segments: VoiceSegment[];
  models: VoiceModel[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  shares: number;
  views: number;
  createdAt: string;
  tags: string[];
  description: string;
  settings: CoverSettings;
  visibility?: 'public' | 'unlisted' | 'private';
  thumbnailPath?: string | null;
  audioPath?: string | null;
  sourceCredit?: string | null;
  genre?: string | null;
  copiedFromPostId?: string | null;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  socialLinks: string[];
  followersCount: number;
  followingCount: number;
};

export type DashboardStats = {
  totalPosts: number;
  totalLikesReceived: number;
  totalPlays: number;
  mostPopularCover: string;
  mostUsedVoiceModel: string;
};

export type NotificationItem = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type Page = 'feed' | 'create' | 'models' | 'profile' | 'post';

type FeedMode = 'global' | 'following';
type SortOrder = 'top' | 'trending' | 'new' | 'old';

type CreatePostInput = {
  title: string;
  originalSong: string;
  artist: string;
  description: string;
  tags: string[];
  settings: CoverSettings;
  segments: VoiceSegment[];
  visibility: 'public' | 'unlisted' | 'private';
  sourceCredit?: string;
  genre?: string;
  audioFile?: File | null;
  coverArtFile?: File | null;
  fallbackCoverArtUrl?: string;
  copiedFromPostId?: string | null;
  modelIds: string[];
};

type CreateModelInput = {
  name: string;
  character: string;
  type: VoiceModel['type'];
  tags: string[];
  description?: string;
  isPublic: boolean;
  file: File;
};

type State = {
  currentPage: Page;
  currentPostId: string | null;
  sortOrder: SortOrder;
  searchQuery: string;
  activeTag: string;
  feedMode: FeedMode;
  posts: CoverPost[];
  models: VoiceModel[];
  bookmarks: string[];
  likedPostIds: string[];
  followingUserIds: string[];
  notifications: NotificationItem[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string;
  currentUserEmail: string;
  currentUserBio: string;
  currentUserSocialLinks: string[];
  followersCount: number;
  followingCount: number;
  authLoading: boolean;
  appLoading: boolean;
  actionLoading: boolean;
  initialized: boolean;
  error: string;
  authMode: 'signin' | 'signup';
  dashboardStats: DashboardStats;
  setPage: (page: Page, postId?: string) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setActiveTag: (tag: string) => void;
  setFeedMode: (mode: FeedMode) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  clearError: () => void;
  initializeApp: () => Promise<void>;
  refreshAppData: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (email: string, password: string, displayName: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'google' | 'discord') => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (input: { displayName: string; bio: string; socialLinks: string[]; avatarFile?: File | null }) => Promise<{ error?: string }>;
  toggleFollowUser: (userId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string, parentId?: string | null) => Promise<void>;
  sharePost: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  copyPostSettings: (postId: string) => void;
  incrementPostView: (postId: string) => Promise<void>;
  addPost: (input: CreatePostInput) => Promise<{ error?: string; postId?: string }>;
  updatePost: (postId: string, input: Partial<CreatePostInput>) => Promise<{ error?: string }>;
  deletePost: (postId: string) => Promise<void>;
  addModel: (input: CreateModelInput) => Promise<{ error?: string }>;
  deleteModel: (id: string) => Promise<void>;
  getSortedPosts: () => CoverPost[];
};

const defaultSettings: CoverSettings = {
  pitchShift: 0,
  indexRate: 0.75,
  filterRadius: 3,
  rmsMixRate: 0.25,
  protect: 0.33,
  reverbMix: 0.15,
  pitchDetection: 'rmvpe',
  outputFormat: 'mp3',
  separateVocals: true,
  mainVocalVolume: 100,
  backupVocalVolume: 60,
  instrumentalVolume: 80,
};

const emptyDashboard: DashboardStats = {
  totalPosts: 0,
  totalLikesReceived: 0,
  totalPlays: 0,
  mostPopularCover: 'None yet',
  mostUsedVoiceModel: 'None yet',
};

const FALLBACK_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=VoxCover';
const APP_REDIRECT_URL = 'https://limpy183-dev.github.io/AI_cover_social_media/';

function slugifyFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getPublicUrl(bucket: string, path?: string | null) {
  if (!path) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

function createAvatarFallback(seed: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed || 'VoxCover')}`;
}

function normalizeTags(tags: string[] | string | null | undefined) {
  if (!tags) return [] as string[];
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);
  return String(tags)
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function buildCommentTree(comments: Comment[]) {
  const byParent = new Map<string | null, Comment[]>();
  for (const comment of comments) {
    const key = comment.parentId ?? null;
    const list = byParent.get(key) ?? [];
    list.push({ ...comment, replies: [] });
    byParent.set(key, list);
  }
  const attach = (parentId: string | null): Comment[] => {
    const list = byParent.get(parentId) ?? [];
    return list.map((comment) => ({
      ...comment,
      replies: attach(comment.id),
    }));
  };
  return attach(null);
}

function flattenModelUsage(posts: CoverPost[], modelId: string) {
  return posts.reduce((count, post) => {
    const segmentMatches = post.segments.filter((segment) => segment.modelId === modelId).length;
    const modelMatch = post.models.some((model) => model.id === modelId) ? 1 : 0;
    return count + segmentMatches + modelMatch;
  }, 0);
}

async function ensureProfile(userId: string, email: string, displayName?: string) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from('profiles').insert({
    id: userId,
    email,
    display_name: displayName || email.split('@')[0],
    avatar_url: createAvatarFallback(displayName || email),
    bio: '',
    social_links: [],
  });
}

async function uploadFile(bucket: string, userId: string, folder: string, file: File) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeName = slugifyFileName(file.name.replace(/\.[^.]+$/, '')) || 'file';
  const path = `${userId}/${folder}/${Date.now()}-${safeName}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw error;
  return path;
}

async function loadAppData(userId: string) {
  const [
    profileResult,
    postsResult,
    modelsResult,
    likesResult,
    commentsResult,
    followsResult,
    bookmarksResult,
    notificationsResult,
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.from('voice_models').select('*').order('created_at', { ascending: false }),
    supabase.from('likes').select('*'),
    supabase.from('comments').select('*').order('created_at', { ascending: true }),
    supabase.from('follows').select('*'),
    supabase.from('bookmarks').select('*').eq('user_id', userId),
    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (postsResult.error) throw postsResult.error;
  if (modelsResult.error) throw modelsResult.error;
  if (likesResult.error) throw likesResult.error;
  if (commentsResult.error) throw commentsResult.error;
  if (followsResult.error) throw followsResult.error;
  if (bookmarksResult.error) throw bookmarksResult.error;
  if (notificationsResult.error) throw notificationsResult.error;

  const profilesToFetch = new Set<string>();
  for (const post of postsResult.data ?? []) profilesToFetch.add(post.user_id);
  for (const model of modelsResult.data ?? []) profilesToFetch.add(model.user_id);
  for (const comment of commentsResult.data ?? []) profilesToFetch.add(comment.user_id);
  for (const follow of followsResult.data ?? []) {
    profilesToFetch.add(follow.follower_id);
    profilesToFetch.add(follow.following_id);
  }

  const profileIds = Array.from(profilesToFetch);
  const profilesResult = profileIds.length
    ? await supabase.from('profiles').select('*').in('id', profileIds)
    : { data: [], error: null };

  if (profilesResult.error) throw profilesResult.error;

  const profileMap = new Map<string, Record<string, unknown>>((profilesResult.data ?? []).map((profile) => [profile.id as string, profile]));
  const likesByPost = new Map<string, string[]>();
  for (const like of likesResult.data ?? []) {
    const list = likesByPost.get(like.post_id as string) ?? [];
    list.push(like.user_id as string);
    likesByPost.set(like.post_id as string, list);
  }

  const flatComments: Comment[] = (commentsResult.data ?? []).map((comment) => {
    const author = profileMap.get(comment.user_id as string);
    return {
      id: comment.id as string,
      authorId: comment.user_id as string,
      authorName: (author?.display_name as string) || 'Unknown user',
      authorAvatar: (author?.avatar_url as string) || FALLBACK_AVATAR,
      text: comment.text as string,
      createdAt: comment.created_at as string,
      likes: Number(comment.likes_count ?? 0),
      parentId: (comment.parent_id as string | null) ?? null,
    };
  });
  const commentsByPost = new Map<string, Comment[]>();
  for (const row of commentsResult.data ?? []) {
    const list = commentsByPost.get(row.post_id as string) ?? [];
    const comment = flatComments.find((item) => item.id === row.id);
    if (comment) list.push(comment);
    commentsByPost.set(row.post_id as string, list);
  }

  const posts: CoverPost[] = (postsResult.data ?? []).map((post) => {
    const author = profileMap.get(post.user_id as string);
    const resolvedModels = (post.model_ids as string[] | null | undefined) ?? [];
    const models = (modelsResult.data ?? [])
      .filter((model) => resolvedModels.includes(model.id as string))
      .map((model) => ({
        id: model.id as string,
        name: model.name as string,
        character: model.character as string,
        avatar: getPublicUrl('avatars', model.avatar_path as string | null) || createAvatarFallback(model.character as string),
        uploadedAt: String(model.created_at).slice(0, 10),
        type: (model.type as VoiceModel['type']) || 'Custom',
        tags: normalizeTags(model.tags as string[]),
        usageCount: Number(model.usage_count ?? 0),
        description: (model.description as string) || '',
        creatorId: model.user_id as string,
        creatorName: (profileMap.get(model.user_id as string)?.display_name as string) || 'Unknown user',
        isPublic: Boolean(model.is_public),
        storagePath: (model.file_path as string) || '',
      }));

    return {
      id: post.id as string,
      title: post.title as string,
      originalSong: (post.original_song as string) || '',
      artist: (post.artist as string) || '',
      coverArtUrl: getPublicUrl('thumbnails', post.thumbnail_path as string | null) || '',
      audioUrl: getPublicUrl('audio', post.audio_path as string | null) || '',
      authorId: post.user_id as string,
      authorName: (author?.display_name as string) || 'Unknown user',
      authorAvatar: (author?.avatar_url as string) || FALLBACK_AVATAR,
      segments: Array.isArray(post.segments) ? (post.segments as VoiceSegment[]) : [],
      models,
      likes: (likesByPost.get(post.id as string) ?? []).length,
      likedBy: likesByPost.get(post.id as string) ?? [],
      comments: buildCommentTree(commentsByPost.get(post.id as string) ?? []),
      shares: Number(post.shares_count ?? 0),
      views: Number(post.views_count ?? 0),
      createdAt: post.created_at as string,
      tags: normalizeTags(post.tags as string[]),
      description: (post.description as string) || '',
      settings: (post.settings as CoverSettings) || defaultSettings,
      visibility: (post.visibility as CoverPost['visibility']) || 'public',
      thumbnailPath: (post.thumbnail_path as string | null) ?? null,
      audioPath: (post.audio_path as string | null) ?? null,
      sourceCredit: (post.source_credit as string | null) ?? null,
      genre: (post.genre as string | null) ?? null,
      copiedFromPostId: (post.copied_from_post_id as string | null) ?? null,
    };
  });

  const models: VoiceModel[] = (modelsResult.data ?? []).map((model) => {
    const creator = profileMap.get(model.user_id as string);
    return {
      id: model.id as string,
      name: model.name as string,
      character: model.character as string,
      avatar: getPublicUrl('avatars', model.avatar_path as string | null) || createAvatarFallback(model.character as string),
      uploadedAt: String(model.created_at).slice(0, 10),
      type: (model.type as VoiceModel['type']) || 'Custom',
      tags: normalizeTags(model.tags as string[]),
      usageCount: Number(model.usage_count ?? 0),
      description: (model.description as string) || '',
      creatorId: model.user_id as string,
      creatorName: (creator?.display_name as string) || 'Unknown user',
      isPublic: Boolean(model.is_public),
      storagePath: (model.file_path as string) || '',
    };
  });

  const followingRows = (followsResult.data ?? []).filter((follow) => follow.follower_id === userId);
  const followerRows = (followsResult.data ?? []).filter((follow) => follow.following_id === userId);
  const bookmarks = (bookmarksResult.data ?? []).map((bookmark) => bookmark.post_id as string);
  const likedPostIds = (likesResult.data ?? []).filter((like) => like.user_id === userId).map((like) => like.post_id as string);

  const dashboardStats: DashboardStats = {
    totalPosts: posts.filter((post) => post.authorId === userId).length,
    totalLikesReceived: posts.filter((post) => post.authorId === userId).reduce((sum, post) => sum + post.likes, 0),
    totalPlays: posts.filter((post) => post.authorId === userId).reduce((sum, post) => sum + post.views, 0),
    mostPopularCover:
      posts.filter((post) => post.authorId === userId).sort((a, b) => b.likes - a.likes)[0]?.title || 'None yet',
    mostUsedVoiceModel:
      models
        .filter((model) => model.creatorId === userId)
        .sort((a, b) => flattenModelUsage(posts, b.id) - flattenModelUsage(posts, a.id))[0]?.name || 'None yet',
  };

  return {
    profile: profileResult.data,
    posts,
    models,
    bookmarks,
    likedPostIds,
    followingUserIds: followingRows.map((row) => row.following_id as string),
    followersCount: followerRows.length,
    followingCount: followingRows.length,
    notifications: (notificationsResult.data ?? []).map((item) => ({
      id: item.id as string,
      type: item.type as string,
      message: item.message as string,
      createdAt: item.created_at as string,
      read: Boolean(item.read_at),
    })),
    dashboardStats,
  };
}

export const useStore = create<State>((set, get) => ({
  currentPage: 'feed',
  currentPostId: null,
  sortOrder: 'top',
  searchQuery: '',
  activeTag: '',
  feedMode: 'global',
  posts: [],
  models: [],
  bookmarks: [],
  likedPostIds: [],
  followingUserIds: [],
  notifications: [],
  currentUserId: '',
  currentUserName: '',
  currentUserAvatar: FALLBACK_AVATAR,
  currentUserEmail: '',
  currentUserBio: '',
  currentUserSocialLinks: [],
  followersCount: 0,
  followingCount: 0,
  authLoading: true,
  appLoading: false,
  actionLoading: false,
  initialized: false,
  error: '',
  authMode: 'signin',
  dashboardStats: emptyDashboard,

  setPage: (page, postId) => set({ currentPage: page, currentPostId: postId || null }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setActiveTag: (activeTag) => set({ activeTag }),
  setFeedMode: (feedMode) => set({ feedMode }),
  setAuthMode: (authMode) => set({ authMode }),
  clearError: () => set({ error: '' }),

  initializeApp: async () => {
    if (get().initialized) return;
    set({ authLoading: true, error: '' });

    const { data: sessionData, error } = await supabase.auth.getSession();
    if (error) {
      set({ authLoading: false, initialized: true, error: error.message });
      return;
    }

    const session = sessionData.session;
    if (session?.user) {
      await ensureProfile(
        session.user.id,
        session.user.email || '',
        (session.user.user_metadata?.display_name as string | undefined) || (session.user.user_metadata?.full_name as string | undefined),
      );
      set({
        currentUserId: session.user.id,
        currentUserEmail: session.user.email || '',
      });
      await get().refreshAppData();
    }

    supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      const user = nextSession?.user;
      if (!user) {
        set({
          currentUserId: '',
          currentUserName: '',
          currentUserAvatar: FALLBACK_AVATAR,
          currentUserEmail: '',
          currentUserBio: '',
          currentUserSocialLinks: [],
          followersCount: 0,
          followingCount: 0,
          posts: [],
          models: [],
          bookmarks: [],
          likedPostIds: [],
          followingUserIds: [],
          notifications: [],
          dashboardStats: emptyDashboard,
          authLoading: false,
        });
        return;
      }

      await ensureProfile(
        user.id,
        user.email || '',
        (user.user_metadata?.display_name as string | undefined) || (user.user_metadata?.full_name as string | undefined),
      );
      set({ currentUserId: user.id, currentUserEmail: user.email || '' });
      await get().refreshAppData();
    });

    const currentUserId = get().currentUserId;
    if (currentUserId) {
      supabase.channel('voxcover-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, () => {
          void get().refreshAppData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
          void get().refreshAppData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          void get().refreshAppData();
        })
        .subscribe();
    }

    set({ authLoading: false, initialized: true });
  },

  refreshAppData: async () => {
    const userId = get().currentUserId;
    if (!userId) {
      set({ authLoading: false, appLoading: false });
      return;
    }

    set({ appLoading: true, error: '' });
    try {
      const data = await loadAppData(userId);
      const profile = data.profile as Record<string, unknown> | null;
      set({
        posts: data.posts,
        models: data.models,
        bookmarks: data.bookmarks,
        likedPostIds: data.likedPostIds,
        followingUserIds: data.followingUserIds,
        followersCount: data.followersCount,
        followingCount: data.followingCount,
        notifications: data.notifications,
        dashboardStats: data.dashboardStats,
        currentUserName: (profile?.display_name as string) || (get().currentUserEmail || 'User').split('@')[0],
        currentUserAvatar: (profile?.avatar_url as string) || FALLBACK_AVATAR,
        currentUserBio: (profile?.bio as string) || '',
        currentUserSocialLinks: Array.isArray(profile?.social_links) ? (profile?.social_links as string[]) : [],
        authLoading: false,
        appLoading: false,
      });
    } catch (loadError) {
      set({
        authLoading: false,
        appLoading: false,
        error: loadError instanceof Error ? loadError.message : 'Failed to load app data.',
      });
    }
  },

  signInWithPassword: async (email, password) => {
    set({ actionLoading: true, error: '' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ actionLoading: false, error: error?.message || '' });
    return error ? { error: error.message } : {};
  },

  signUpWithPassword: async (email, password, displayName) => {
    set({ actionLoading: true, error: '' });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    set({ actionLoading: false, error: error?.message || '' });
    return error ? { error: error.message } : {};
  },

  signInWithOAuth: async (provider) => {
    set({ actionLoading: true, error: '' });
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: APP_REDIRECT_URL },
    });
    set({ actionLoading: false, error: error?.message || '' });
    return error ? { error: error.message } : {};
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  updateProfile: async ({ displayName, bio, socialLinks, avatarFile }) => {
    const userId = get().currentUserId;
    if (!userId) return { error: 'You must be signed in.' };

    set({ actionLoading: true, error: '' });
    try {
      let avatarUrl = get().currentUserAvatar;
      if (avatarFile) {
        const avatarPath = await uploadFile('avatars', userId, 'profile', avatarFile);
        avatarUrl = getPublicUrl('avatars', avatarPath);
      }

      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: get().currentUserEmail,
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        social_links: socialLinks,
      });
      if (error) throw error;
      await get().refreshAppData();
      set({ actionLoading: false });
      return {};
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Failed to update profile.';
      set({ actionLoading: false, error: message });
      return { error: message };
    }
  },

  toggleFollowUser: async (userId) => {
    const currentUserId = get().currentUserId;
    if (!currentUserId || userId === currentUserId) return;
    const isFollowing = get().followingUserIds.includes(userId);
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId);
    } else {
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: userId });
    }
    await get().refreshAppData();
  },

  likePost: async (postId) => {
    const userId = get().currentUserId;
    if (!userId) return;
    const liked = get().likedPostIds.includes(postId);
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('likes').insert({ post_id: postId, user_id: userId });
    }
    await get().refreshAppData();
  },

  addComment: async (postId, text, parentId = null) => {
    const userId = get().currentUserId;
    if (!userId || !text.trim()) return;
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: userId,
      text: text.trim(),
      parent_id: parentId,
      likes_count: 0,
    });
    await get().refreshAppData();
  },

  sharePost: async (postId) => {
    const userId = get().currentUserId;
    if (!userId) return;
    await supabase.from('shares').insert({ post_id: postId, user_id: userId });
    const post = get().posts.find((item) => item.id === postId);
    if (post) {
      await supabase.from('posts').update({ shares_count: post.shares + 1 }).eq('id', postId);
    }
    await get().refreshAppData();
  },

  toggleBookmark: async (postId) => {
    const userId = get().currentUserId;
    if (!userId) return;
    const hasBookmark = get().bookmarks.includes(postId);
    if (hasBookmark) {
      await supabase.from('bookmarks').delete().eq('post_id', postId).eq('user_id', userId);
    } else {
      await supabase.from('bookmarks').insert({ post_id: postId, user_id: userId });
    }
    await get().refreshAppData();
  },

  copyPostSettings: (postId) => {
    const post = get().posts.find((item) => item.id === postId);
    if (!post) return;
    set({ currentPage: 'create' });
    window.sessionStorage.setItem(
      'voxcover:create-template',
      JSON.stringify({
        copiedFromPostId: post.id,
        title: post.title,
        originalSong: post.originalSong,
        artist: post.artist,
        description: post.description,
        tags: post.tags,
        settings: post.settings,
        segments: post.segments,
        modelIds: post.models.map((model) => model.id),
        sourceCredit: post.sourceCredit || '',
        genre: post.genre || '',
      }),
    );
  },

  incrementPostView: async (postId) => {
    const post = get().posts.find((item) => item.id === postId);
    if (!post) return;
    await supabase.from('posts').update({ views_count: post.views + 1 }).eq('id', postId);
    set({ posts: get().posts.map((item) => (item.id === postId ? { ...item, views: item.views + 1 } : item)) });
  },

  addPost: async (input) => {
    const userId = get().currentUserId;
    if (!userId) return { error: 'You must be signed in.' };

    set({ actionLoading: true, error: '' });
    try {
      let audioPath: string | null = null;
      let thumbnailPath: string | null = null;

      if (input.audioFile) {
        audioPath = await uploadFile('audio', userId, 'covers', input.audioFile);
      }

      if (input.coverArtFile) {
        thumbnailPath = await uploadFile('thumbnails', userId, 'covers', input.coverArtFile);
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          title: input.title,
          original_song: input.originalSong,
          artist: input.artist,
          description: input.description,
          tags: input.tags,
          settings: input.settings,
          segments: input.segments,
          visibility: input.visibility,
          source_credit: input.sourceCredit || null,
          genre: input.genre || null,
          thumbnail_path: thumbnailPath,
          audio_path: audioPath,
          copied_from_post_id: input.copiedFromPostId || null,
          model_ids: input.modelIds,
          shares_count: 0,
          views_count: 0,
        })
        .select('id')
        .single();

      if (error) throw error;

      for (const modelId of input.modelIds) {
        const model = get().models.find((item) => item.id === modelId);
        if (model) {
          await supabase.from('voice_models').update({ usage_count: model.usageCount + 1 }).eq('id', modelId);
        }
      }

      await get().refreshAppData();
      set({ currentPage: 'feed', actionLoading: false });
      return { postId: data.id as string };
    } catch (postError) {
      const message = postError instanceof Error ? postError.message : 'Failed to publish post.';
      set({ actionLoading: false, error: message });
      return { error: message };
    }
  },

  updatePost: async (postId, input) => {
    const existing = get().posts.find((post) => post.id === postId);
    if (!existing) return { error: 'Post not found.' };

    const payload: Record<string, unknown> = {};
    if (input.title !== undefined) payload.title = input.title;
    if (input.originalSong !== undefined) payload.original_song = input.originalSong;
    if (input.artist !== undefined) payload.artist = input.artist;
    if (input.description !== undefined) payload.description = input.description;
    if (input.tags !== undefined) payload.tags = input.tags;
    if (input.settings !== undefined) payload.settings = input.settings;
    if (input.segments !== undefined) payload.segments = input.segments;
    if (input.visibility !== undefined) payload.visibility = input.visibility;
    if (input.sourceCredit !== undefined) payload.source_credit = input.sourceCredit || null;
    if (input.genre !== undefined) payload.genre = input.genre || null;
    if (input.modelIds !== undefined) payload.model_ids = input.modelIds;

    const { error } = await supabase.from('posts').update(payload).eq('id', postId);
    if (error) return { error: error.message };
    await get().refreshAppData();
    return {};
  },

  deletePost: async (postId) => {
    await supabase.from('posts').delete().eq('id', postId);
    await get().refreshAppData();
    set({ currentPage: 'feed', currentPostId: null });
  },

  addModel: async ({ name, character, type, tags, description, isPublic, file }) => {
    const userId = get().currentUserId;
    if (!userId) return { error: 'You must be signed in.' };

    set({ actionLoading: true, error: '' });
    try {
      const filePath = await uploadFile('voice-models', userId, 'models', file);
      const avatarPath = await uploadFile(
        'avatars',
        userId,
        'models',
        new File([character], `${slugifyFileName(character) || 'model'}.txt`, { type: 'text/plain' }),
      ).catch(() => null);

      const { error } = await supabase.from('voice_models').insert({
        user_id: userId,
        name,
        character,
        type,
        tags,
        description: description || '',
        is_public: isPublic,
        file_path: filePath,
        avatar_path: avatarPath,
        usage_count: 0,
      });
      if (error) throw error;

      await get().refreshAppData();
      set({ actionLoading: false });
      return {};
    } catch (modelError) {
      const message = modelError instanceof Error ? modelError.message : 'Failed to upload model.';
      set({ actionLoading: false, error: message });
      return { error: message };
    }
  },

  deleteModel: async (id) => {
    await supabase.from('voice_models').delete().eq('id', id);
    await get().refreshAppData();
  },

  getSortedPosts: () => {
    const { posts, sortOrder, searchQuery, activeTag, feedMode, followingUserIds } = get();
    let filtered = [...posts];

    if (feedMode === 'following') {
      filtered = filtered.filter((post) => followingUserIds.includes(post.authorId));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(query) ||
        post.originalSong.toLowerCase().includes(query) ||
        post.artist.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.includes(query)) ||
        post.models.some((model) => model.name.toLowerCase().includes(query) || model.character.toLowerCase().includes(query)),
      );
    }

    if (activeTag) {
      filtered = filtered.filter((post) => post.tags.includes(activeTag));
    }

    filtered = filtered.filter((post) => post.visibility !== 'private' || post.authorId === get().currentUserId);

    switch (sortOrder) {
      case 'top':
        return filtered.sort((a, b) => b.likes - a.likes);
      case 'trending':
        return filtered.sort((a, b) => {
          const recentA = Date.now() - new Date(a.createdAt).getTime() < 1000 * 60 * 60 * 72 ? 1 : 0.3;
          const recentB = Date.now() - new Date(b.createdAt).getTime() < 1000 * 60 * 60 * 72 ? 1 : 0.3;
          return b.likes * 4 * recentB + b.comments.length * 3 + b.views - (a.likes * 4 * recentA + a.comments.length * 3 + a.views);
        });
      case 'new':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'old':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      default:
        return filtered;
    }
  },
}));
