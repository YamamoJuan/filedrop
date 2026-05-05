create extension if not exists "pgcrypto";

create table if not exists public.file_shares (
  id                uuid primary key default gen_random_uuid(),
  original_filename text not null,
  storage_path      text not null unique,
  mime_type         text not null default 'application/octet-stream',
  size_bytes        bigint not null default 0,
  share_slug        text not null unique,
  delete_token_hash text not null,
  expires_at        timestamptz not null,
  download_count    integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_file_shares_slug    on public.file_shares(share_slug);
create index if not exists idx_file_shares_expires on public.file_shares(expires_at);

alter table public.file_shares enable row level security;
