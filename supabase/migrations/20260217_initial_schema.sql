-- Create players table
create table public.players (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create leagues table (for future use)
create table public.leagues (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  player_a_id uuid not null references public.players(id) on delete cascade,
  player_b_id uuid not null references public.players(id) on delete cascade,
  games_a integer not null,
  games_b integer not null,
  surface text,
  league_id uuid references public.leagues(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index matches_player_a_id_idx on public.matches(player_a_id);
create index matches_player_b_id_idx on public.matches(player_b_id);
create index matches_date_idx on public.matches(date);
create index players_created_at_idx on public.players(created_at);

-- Enable RLS (Row Level Security)
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.leagues enable row level security;

-- Create RLS policies to allow all anonymous access (for public app)
create policy "Allow all access to players"
  on public.players
  for all
  using (true)
  with check (true);

create policy "Allow all access to matches"
  on public.matches
  for all
  using (true)
  with check (true);

create policy "Allow all access to leagues"
  on public.leagues
  for all
  using (true)
  with check (true);
