CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Contents

CREATE TABLE public.contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    type VARCHAR(10) NOT NULL
        CHECK (type IN ('image', 'video', 'url')),
    payload TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Devices

CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'offline'
        CHECK (status IN ('online', 'offline')),
    last_seen TIMESTAMPTZ,
    active_content_id UUID
        REFERENCES public.contents(id)
        ON DELETE SET NULL,
    token_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Profiles

CREATE TABLE public.admin_profiles (
    user_id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatic updated_at

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER devices_updated_at
BEFORE UPDATE ON public.devices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER contents_updated_at
BEFORE UPDATE ON public.contents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Row Level Security

ALTER TABLE public.devices
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.contents
ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admin_profiles
ENABLE ROW LEVEL SECURITY;
