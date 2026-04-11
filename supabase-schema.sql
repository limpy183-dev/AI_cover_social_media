create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  avatar_url text,
  bio text not null default '',
  social_links text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voice_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  character text not null,
  type text not null check (type in ('RVC', 'Diff-SVC', 'VITS', 'Custom')),
  description text not null default '',
  tags text[] not null default '{}',
  is_public boolean not null default true,
  file_path text not null,
  avatar_path text,
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  source_audio_path text,
  source_url text,
  settings jsonb not null default '{}'::jsonb,
  segments jsonb not null default '[]'::jsonb,
  model_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  original_song text not null default '',
  artist text not null default '',
  description text not null default '',
  tags text[] not null default '{}',
  genre text,
  settings jsonb not null default '{}'::jsonb,
  segments jsonb not null default '[]'::jsonb,
  model_ids uuid[] not null default '{}',
  thumbnail_path text,
  audio_path text,
  source_credit text,
  visibility text not null default 'public' check (visibility in ('public', 'unlisted', 'private')),
  copied_from_post_id uuid references public.posts(id) on delete set null,
  views_count integer not null default 0,
  shares_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  text text not null,
  likes_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  post_id uuid references public.posts(id) on delete cascade,
  type text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  voice_model_id uuid references public.voice_models(id) on delete cascade,
  reason text not null,
  details text not null default '',
  created_at timestamptz not null default now(),
  check ((post_id is not null) or (voice_model_id is not null))
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'user'), '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, 'user'), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute procedure public.touch_updated_at();

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at before update on public.posts for each row execute procedure public.touch_updated_at();

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at before update on public.projects for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.voice_models enable row level security;
alter table public.projects enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.shares enable row level security;
alter table public.bookmarks enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create policy "profiles are viewable by everyone" on public.profiles for select using (true);
create policy "users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "public or own models selectable" on public.voice_models for select using (is_public or auth.uid() = user_id);
create policy "users can insert own models" on public.voice_models for insert with check (auth.uid() = user_id);
create policy "users can update own models" on public.voice_models for update using (auth.uid() = user_id);
create policy "users can delete own models" on public.voice_models for delete using (auth.uid() = user_id);

create policy "users can manage own projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public posts or owner selectable" on public.posts for select using (visibility in ('public', 'unlisted') or auth.uid() = user_id);
create policy "users can insert own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

create policy "likes selectable by everyone" on public.likes for select using (true);
create policy "users can insert own likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "users can delete own likes" on public.likes for delete using (auth.uid() = user_id);

create policy "comments selectable by everyone" on public.comments for select using (true);
create policy "users can insert own comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "users can update own comments" on public.comments for update using (auth.uid() = user_id);
create policy "users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

create policy "shares selectable by everyone" on public.shares for select using (true);
create policy "users can insert own shares" on public.shares for insert with check (auth.uid() = user_id);

create policy "users can manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "follows selectable by everyone" on public.follows for select using (true);
create policy "users can insert own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "users can delete own follows" on public.follows for delete using (auth.uid() = follower_id);

create policy "users can select own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

create policy "users can create reports" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "users can select own reports" on public.reports for select using (auth.uid() = reporter_id);

insert into storage.buckets (id, name, public)
values
  ('audio', 'audio', true),
  ('thumbnails', 'thumbnails', true),
  ('voice-models', 'voice-models', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public audio read" on storage.objects for select using (bucket_id = 'audio');
create policy "users upload audio" on storage.objects for insert with check (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update audio" on storage.objects for update using (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete audio" on storage.objects for delete using (bucket_id = 'audio' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "public thumbnails read" on storage.objects for select using (bucket_id = 'thumbnails');
create policy "users upload thumbnails" on storage.objects for insert with check (bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update thumbnails" on storage.objects for update using (bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete thumbnails" on storage.objects for delete using (bucket_id = 'thumbnails' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "model owners read private models" on storage.objects for select using (bucket_id = 'voice-models' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users upload models" on storage.objects for insert with check (bucket_id = 'voice-models' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update models" on storage.objects for update using (bucket_id = 'voice-models' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete models" on storage.objects for delete using (bucket_id = 'voice-models' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "public avatars read" on storage.objects for select using (bucket_id = 'avatars');
create policy "users upload avatars" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users update avatars" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "users delete avatars" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
