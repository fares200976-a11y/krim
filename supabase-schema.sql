-- ============================================================================
-- Schéma Supabase pour le site Karim (robes de mariée / location)
-- À exécuter UNE FOIS dans : Supabase → SQL Editor → New query → Run
-- ============================================================================
-- Important : les noms de colonnes sont entre guillemets doubles pour
-- préserver exactement la casse (camelCase) utilisée par le code JavaScript.
-- Sans les guillemets, Postgres transformerait "pricePerDay" en "priceperday"
-- et l'application ne retrouverait plus les données.
-- ============================================================================

-- Table des robes
create table if not exists public.dresses (
  id text primary key,
  name text,
  description text,
  category text,
  "pricePerDay" numeric,
  "depositAmount" numeric,
  sizes jsonb,
  images jsonb,
  "videoUrl" text,
  available boolean
);

-- Table des réservations
create table if not exists public.bookings (
  id text primary key,
  "dressId" text,
  "dressName" text,
  "dressImage" text,
  "customerName" text,
  "customerPhone" text,
  "customerEmail" text,
  date text,
  "endDate" text,
  "fittingDate" text,
  size text,
  status text,
  "depositPaid" boolean,
  "depositAmount" numeric,
  "paymentMethod" text,
  notes text,
  "createdAt" text
);

-- Table de l'équipe
create table if not exists public.team (
  id text primary key,
  name text,
  role text,
  photo text,
  description text,
  "emailAlarm" text
);

-- Table des témoignages
create table if not exists public.testimonials (
  id text primary key,
  name text,
  rating numeric,
  comment text,
  date text,
  "dressCategory" text
);

-- Table des vidéos de défilé
create table if not exists public.videos (
  id text primary key,
  title text,
  category text,
  description text,
  "videoUrl" text,
  "coverImage" text,
  "aspectRatio" text
);

-- Table des paramètres du site (une seule ligne, id = 'app')
create table if not exists public.settings (
  id text primary key,
  "homepageBg" text,
  "backgroundMusicUrl" text,
  "musicTitle" text,
  "displayMode" text,
  "adminUsername" text,
  "adminPasswordHash" text,
  "notificationEmail" text,
  "notificationWhatsapp" text
);

-- ============================================================================
-- Sécurité (RLS) : ce site n'utilise pas l'authentification Supabase (il a son
-- propre système de connexion admin), donc on autorise l'accès complet en
-- lecture/écriture depuis le site — équivalent aux règles Firestore ouvertes
-- déjà utilisées avant. On active quand même RLS avec une politique explicite
-- plutôt que de le désactiver, pour rester propre côté tableau de bord Supabase.
-- ============================================================================
alter table public.dresses enable row level security;
alter table public.bookings enable row level security;
alter table public.team enable row level security;
alter table public.testimonials enable row level security;
alter table public.videos enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Accès complet public" on public.dresses;
create policy "Accès complet public" on public.dresses for all using (true) with check (true);

drop policy if exists "Accès complet public" on public.bookings;
create policy "Accès complet public" on public.bookings for all using (true) with check (true);

drop policy if exists "Accès complet public" on public.team;
create policy "Accès complet public" on public.team for all using (true) with check (true);

drop policy if exists "Accès complet public" on public.testimonials;
create policy "Accès complet public" on public.testimonials for all using (true) with check (true);

drop policy if exists "Accès complet public" on public.videos;
create policy "Accès complet public" on public.videos for all using (true) with check (true);

drop policy if exists "Accès complet public" on public.settings;
create policy "Accès complet public" on public.settings for all using (true) with check (true);

-- ============================================================================
-- Realtime : active la synchronisation en direct (équivalent à onSnapshot de
-- Firestore) pour que les changements apparaissent instantanément sans recharger.
-- ============================================================================
alter publication supabase_realtime add table public.dresses;
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.team;
alter publication supabase_realtime add table public.testimonials;
alter publication supabase_realtime add table public.videos;
alter publication supabase_realtime add table public.settings;

-- ============================================================================
-- Stockage des fichiers (photos, vidéos, audio) : bucket public "media"
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 52428800) -- 50 Mo max par fichier
on conflict (id) do nothing;

drop policy if exists "Lecture publique media" on storage.objects;
create policy "Lecture publique media" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "Envoi public media" on storage.objects;
create policy "Envoi public media" on storage.objects
  for insert with check (bucket_id = 'media');

drop policy if exists "Suppression publique media" on storage.objects;
create policy "Suppression publique media" on storage.objects
  for delete using (bucket_id = 'media');
