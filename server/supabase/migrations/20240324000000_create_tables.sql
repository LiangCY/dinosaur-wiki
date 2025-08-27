-- Create dinosaurs table
create table if not exists public.dinosaurs (
    id uuid default gen_random_uuid() primary key,
    name varchar(255) not null,
    scientific_name varchar(255) not null,
    period varchar(100) not null,
    diet varchar(100) not null,
    length_min_meters numeric(10,2),
    length_max_meters numeric(10,2),
    weight_min_tons numeric(10,2),
    weight_max_tons numeric(10,2),
    habitat varchar(255),
    region varchar(255),
    description text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);



-- Create dinosaur_fossils table
create table if not exists public.dinosaur_fossils (
    id uuid default gen_random_uuid() primary key,
    dinosaur_id uuid references public.dinosaurs(id) on delete cascade,
    discovery_location varchar(255) not null,
    discovery_date date,
    fossil_type varchar(100) not null,
    description text,
    image_url text,
    created_at timestamp with time zone default now()
);

-- Create RLS policies
alter table public.dinosaurs enable row level security;
alter table public.dinosaur_fossils enable row level security;

-- Create policies for public access (read-only)
create policy "Public can view dinosaurs"
    on public.dinosaurs for select
    using (true);



create policy "Public can view fossils"
    on public.dinosaur_fossils for select
    using (true);

-- Create policies for authenticated users (full access)
create policy "Authenticated users can manage dinosaurs"
    on public.dinosaurs for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');



create policy "Authenticated users can manage fossils"
    on public.dinosaur_fossils for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');