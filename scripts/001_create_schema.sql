-- Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  category text,
  project_link text,
  tags text[] default '{}',
  share_link text unique not null,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.projects enable row level security;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null,
  content text not null,
  email text,
  rating integer,
  created_at timestamp default now()
);

alter table public.feedback enable row level security;

-- Anyone can submit feedback to a project
create policy "feedback_insert_public"
  on public.feedback for insert
  with check (true);

-- Project owners can view feedback for their projects
create policy "feedback_select_own"
  on public.feedback for select
  using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

-- Create feedback summaries table
create table if not exists public.feedback_summaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

alter table public.feedback_summaries enable row level security;

create policy "feedback_summaries_select_own"
  on public.feedback_summaries for select
  using (auth.uid() = user_id);

create policy "feedback_summaries_insert_own"
  on public.feedback_summaries for insert
  with check (auth.uid() = user_id);

create policy "feedback_summaries_update_own"
  on public.feedback_summaries for update
  using (auth.uid() = user_id);

-- Create trigger for profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
