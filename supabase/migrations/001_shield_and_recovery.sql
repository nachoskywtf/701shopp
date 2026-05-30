-- ==========================================
-- EL MOTOR SQL: SHIELD & RECOVERY (1k/Week Protocol)
-- Instrucciones:
-- 1. Reemplaza 'TU_PROYECTO' por el ID real de tu proyecto Supabase.
-- 2. Reemplaza 'TU_ANON_KEY' por la anon key pública de tu entorno.
-- 3. Ejecuta todo en el SQL Editor de Supabase.
-- ==========================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. CREACIÓN DE LA TABLA webhook_events (QUEUE)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- Estados: 'pending', 'processed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en webhook_events para blindarla
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS: Solo el Service Role (Backend/Edge Functions) puede operar.
-- Bloquea acceso público no autorizado.
CREATE POLICY "Service Role gestiona webhook_events" 
    ON public.webhook_events 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. ALTERACIÓN Y OPTIMIZACIÓN DE LA TABLA orders
-- Asegurarnos de que el campo status exista (si la tabla se creó con TEXT)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';

-- Para recuperación eficiente de carritos, indexamos status y created_at
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
    ON public.orders (status, created_at);

-- 4. CONFIGURACIÓN DE TRIGGERS PG_CRON

-- A) Trigger cada 10 segundos para flow-engine
-- Nota técnica: pg_cron tiene una resolución mínima de 1 minuto (* * * * *). 
-- Para lograr la ejecución cada 10 segundos exactos en la base de datos, 
-- creamos 6 tareas desfasadas usando pg_sleep.
SELECT cron.schedule('flow-engine-00', '* * * * *', $$
    SELECT net.http_post(
        url:='https://TU_PROYECTO.supabase.co/functions/v1/flow-engine',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb
    );
$$);

SELECT cron.schedule('flow-engine-10', '* * * * *', $$
    SELECT pg_sleep(10);
    SELECT net.http_post(url:='https://TU_PROYECTO.supabase.co/functions/v1/flow-engine', headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb);
$$);

SELECT cron.schedule('flow-engine-20', '* * * * *', $$
    SELECT pg_sleep(20);
    SELECT net.http_post(url:='https://TU_PROYECTO.supabase.co/functions/v1/flow-engine', headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb);
$$);

SELECT cron.schedule('flow-engine-30', '* * * * *', $$
    SELECT pg_sleep(30);
    SELECT net.http_post(url:='https://TU_PROYECTO.supabase.co/functions/v1/flow-engine', headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb);
$$);

SELECT cron.schedule('flow-engine-40', '* * * * *', $$
    SELECT pg_sleep(40);
    SELECT net.http_post(url:='https://TU_PROYECTO.supabase.co/functions/v1/flow-engine', headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb);
$$);

SELECT cron.schedule('flow-engine-50', '* * * * *', $$
    SELECT pg_sleep(50);
    SELECT net.http_post(url:='https://TU_PROYECTO.supabase.co/functions/v1/flow-engine', headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb);
$$);


-- B) Trigger cada 30 minutos para cart-recovery
SELECT cron.schedule('cart-recovery-trigger', '*/30 * * * *', $$
    SELECT net.http_post(
        url:='https://TU_PROYECTO.supabase.co/functions/v1/cart-recovery',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb
    );
$$);


-- C) Trigger Domingos a las 23:59 para auto-pnl (Conciliación Financiera)
-- Sintaxis Cron: 59 23 * * 0 (minuto 59, hora 23, todos los días del mes, todos los meses, día 0 que es Domingo)
SELECT cron.schedule('auto-pnl-trigger', '59 23 * * 0', $$
    SELECT net.http_post(
        url:='https://TU_PROYECTO.supabase.co/functions/v1/auto-pnl',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb
    );
$$);
