-- Habilitar extensión vectorial
create extension if not exists vector;

-- Tabla principal de Swipe File
create table swipe_files (
  id uuid primary key default uuid_generate_v4(),
  source_url text not null,
  platform text not null, -- 'tiktok', 'instagram', 'youtube'
  transcript text,
  visual_hook_analysis text,
  value_story_analysis text,
  cta_analysis text,
  -- Vector de embedding para búsqueda por similitud (ej. 768 dimensiones para Gemini text-embedding-004)
  embedding vector(768),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Índice para búsqueda de similitud rápida
create index on swipe_files using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Función RPC para similarity search (Módulo 11 RAG)
create or replace function match_swipe_files (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  source_url text,
  visual_hook_analysis text,
  value_story_analysis text,
  cta_analysis text,
  similarity float
)
language sql stable
as $$
  select
    swipe_files.id,
    swipe_files.source_url,
    swipe_files.visual_hook_analysis,
    swipe_files.value_story_analysis,
    swipe_files.cta_analysis,
    1 - (swipe_files.embedding <=> query_embedding) as similarity
  from swipe_files
  where 1 - (swipe_files.embedding <=> query_embedding) > match_threshold
  order by swipe_files.embedding <=> query_embedding
  limit match_count;
$$;
