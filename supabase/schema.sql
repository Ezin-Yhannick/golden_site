-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run

-- 1. Contenu du site (photo hero) — une seule ligne, id fixe = 1
create table if not exists site_content (
  id int primary key default 1,
  hero_photo_url text,
  updated_at timestamptz default now()
);
insert into site_content (id) values (1) on conflict (id) do nothing;

-- 2. Résultats des élèves (nombre illimité de photos)
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  created_at timestamptz default now()
);

-- 3. Événements analytics (vues de page + clics)
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  created_at timestamptz default now()
);

-- Sécurité (Row Level Security)
alter table site_content enable row level security;
alter table results enable row level security;
alter table analytics_events enable row level security;

-- Tout le monde peut LIRE le contenu du site (photo hero, résultats) — normal, c'est un site public
create policy "public read site_content" on site_content for select using (true);
create policy "public read results" on results for select using (true);

-- Seul un admin connecté (via Supabase Auth) peut modifier le contenu
create policy "admin update site_content" on site_content for update
  using (auth.role() = 'authenticated');
create policy "admin insert results" on results for insert
  with check (auth.role() = 'authenticated');
create policy "admin delete results" on results for delete
  using (auth.role() = 'authenticated');

-- Tout le monde peut ENVOYER un événement analytics (c'est le but : tracker les visiteurs)
create policy "public insert analytics" on analytics_events for insert
  with check (true);
-- Mais seul l'admin connecté peut LIRE les statistiques
create policy "admin read analytics" on analytics_events for select
  using (auth.role() = 'authenticated');

-- 4. Bucket de stockage pour les photos (à créer manuellement, voir SETUP-SUPABASE.md)
-- Dashboard > Storage > New bucket > nom "photos" > cocher "Public bucket"
