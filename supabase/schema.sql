-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  website text,

  primary key (id),
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create a table for alloy recipes
create table recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  created_at timestamp with time zone default now(),
  alloy_name text not null,
  code_name text,
  description text,
  composition jsonb,
  properties jsonb,
  feasibility jsonb,
  manufacturing jsonb,
  cost_analysis jsonb,
  applications jsonb,
  deep_applications jsonb,
  similar_alloys jsonb,
  original_requirements jsonb
);

alter table recipes enable row level security;

create policy "Recipes are viewable by their owners." on recipes for select using (auth.uid() = user_id);
create policy "Users can insert their own recipes." on recipes for insert with check (auth.uid() = user_id);
create policy "Users can update their own recipes." on recipes for update using (auth.uid() = user_id);
create policy "Users can delete their own recipes." on recipes for delete using (auth.uid() = user_id);
