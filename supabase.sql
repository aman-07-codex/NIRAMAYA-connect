-- Create donors table
create table public.donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  phone text not null,
  age integer not null,
  gender text not null,
  blood_group text not null,
  weight numeric not null,
  city text not null,
  area text not null,
  last_donation date,
  health_condition text not null,
  diseases text[] not null default '{}',
  available boolean not null default true,
  latitude numeric,
  longitude numeric,
  reliability_score integer not null default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table public.donors enable row level security;

-- Policies
create policy "Public donors are viewable by everyone." on public.donors for select using (true);
create policy "Users can insert their own donor record." on public.donors for insert with check (auth.uid() = user_id);
create policy "Users can update their own donor record." on public.donors for update using (auth.uid() = user_id);
