-- Create dinosaur_images table
create table if not exists public.dinosaur_images (
    id uuid default gen_random_uuid() primary key,
    dinosaur_id uuid references public.dinosaurs(id) on delete cascade,
    url text not null,
    description text,
    is_primary boolean default false,
    created_at timestamp with time zone default now()
);

-- Create RLS policies for dinosaur_images
alter table public.dinosaur_images enable row level security;

-- Create policies for public access (read-only)
create policy "Public can view dinosaur images"
    on public.dinosaur_images for select
    using (true);

-- Create policies for authenticated users (full access)
create policy "Authenticated users can manage dinosaur images"
    on public.dinosaur_images for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- Create policies for service role (full access)
create policy "Service role can manage dinosaur images"
    on public.dinosaur_images for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');