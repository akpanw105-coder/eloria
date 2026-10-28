-- ==============================================================================
-- ELORIA WELLNESS & MASSAGE SANCTUARY — SUPABASE DATABASE MIGRATION & SEED
-- Project ID: njtbrywvlnfoxsgmwxuc
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE / UPDATE SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price NUMERIC(12, 2) NOT NULL,
    icon_name TEXT DEFAULT 'sparkles',
    badge TEXT DEFAULT 'Therapeutic',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CREATE / UPDATE THERAPISTS TABLE
CREATE TABLE IF NOT EXISTS public.therapists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    title TEXT DEFAULT 'Certified Massage Therapist',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    specialties TEXT[] DEFAULT '{}',
    bio TEXT DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CREATE / UPDATE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    notes TEXT,
    member_since TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. CREATE / UPDATE APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE RESTRICT,
    therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'completed', 'cancelled')),
    price NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'card' CHECK (payment_method IN ('card', 'bank_transfer', 'apple_pay', 'cash')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    location TEXT DEFAULT 'Eloria Wellness Suite A',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. CREATE / UPDATE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT DEFAULT 'Guest',
    therapist_name TEXT,
    service_name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. CREATE / UPDATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'booking',
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.business_settings (
    id SERIAL PRIMARY KEY,
    open_time TEXT NOT NULL DEFAULT '08:00 AM',
    close_time TEXT NOT NULL DEFAULT '08:00 PM',
    slot_duration_minutes INTEGER NOT NULL DEFAULT 60,
    days_open TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    allow_same_day_booking BOOLEAN NOT NULL DEFAULT true,
    max_advance_days INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.business_settings (id, open_time, close_time, slot_duration_minutes, days_open, allow_same_day_booking, max_advance_days)
VALUES (1, '08:00 AM', '08:00 PM', 60, ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], true, 30)
ON CONFLICT (id) DO NOTHING;

-- 9. AUTH TRIGGER FOR PROFILES & SECURE ROLE ENFORCEMENT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Sanctuary Client'),
        -- Enforce admin@gmail.com as admin, all others as customer regardless of client input
        CASE WHEN LOWER(new.email) = 'admin@gmail.com' THEN 'admin' ELSE 'customer' END
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = CASE WHEN LOWER(EXCLUDED.email) = 'admin@gmail.com' THEN 'admin' ELSE public.profiles.role END;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sync existing auth users if any exist into profiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Sanctuary Client'),
    CASE WHEN LOWER(email) = 'admin@gmail.com' THEN 'admin' ELSE 'customer' END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    role = CASE WHEN LOWER(EXCLUDED.email) = 'admin@gmail.com' THEN 'admin' ELSE public.profiles.role END;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ) OR (
        -- Also check auth email directly for security
        auth.jwt() ->> 'email' = 'admin@gmail.com'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Services Policies: Anyone can view active services; Admins can do all
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services" ON public.services
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage services" ON public.services;
CREATE POLICY "Admins manage services" ON public.services
    FOR ALL USING (public.is_admin());

-- Therapists Policies: Anyone can view active therapists; Admins manage
DROP POLICY IF EXISTS "Public can view active therapists" ON public.therapists;
CREATE POLICY "Public can view active therapists" ON public.therapists
    FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage therapists" ON public.therapists;
CREATE POLICY "Admins manage therapists" ON public.therapists
    FOR ALL USING (public.is_admin());

-- Profiles Policies: Users can view & edit their own profile; Admins can view all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id 
        -- Prevent users from escalating their own role
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Appointments Policies:
-- Clients can view their own appointments; Admins can view all appointments
DROP POLICY IF EXISTS "Clients view own appointments" ON public.appointments;
CREATE POLICY "Clients view own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());

-- Clients can create appointments for themselves
DROP POLICY IF EXISTS "Clients create own appointments" ON public.appointments;
CREATE POLICY "Clients create own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = customer_id OR public.is_admin());

-- Clients can update (cancel/reschedule) their own pending/confirmed appointments
DROP POLICY IF EXISTS "Clients update own appointments" ON public.appointments;
CREATE POLICY "Clients update own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = customer_id OR public.is_admin());

-- Admins have full access to all appointments
DROP POLICY IF EXISTS "Admins manage all appointments" ON public.appointments;
CREATE POLICY "Admins manage all appointments" ON public.appointments
    FOR ALL USING (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Reviews Policies
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews" ON public.reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Clients can add reviews" ON public.reviews;
CREATE POLICY "Clients can add reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Business settings
DROP POLICY IF EXISTS "Public can view settings" ON public.business_settings;
CREATE POLICY "Public can view settings" ON public.business_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update settings" ON public.business_settings;
CREATE POLICY "Admins can update settings" ON public.business_settings
    FOR ALL USING (public.is_admin());

-- 11. SEED THE 6 EXACT DEFAULT MASSAGE SERVICES (Prices in NGN ₦)
INSERT INTO public.services (name, tagline, description, duration_minutes, price, icon_name, badge, is_active)
VALUES 
    (
        'Nuru Massage',
        '90 min authentic slippery seaweed ritual',
        'Exquisite full-body sensory gliding treatment using warm, authentic Nuru seaweed gel for profound relaxation and tension release.',
        90,
        40000.00,
        'water',
        'Signature Experience',
        true
    ),
    (
        'Erotic Massage',
        '75 min sensual touch & body harmony',
        'Intimate and relaxing whole-body sensory massage designed to awaken body awareness, relieve stress, and elevate total well-being.',
        75,
        40000.00,
        'flame',
        'Sensory Bodywork',
        true
    ),
    (
        'Swedish Massage',
        '60 min classic restorative relaxation',
        'Gentle rhythmic gliding strokes and kneading designed to stimulate circulation, ease mild muscle tension, and promote deep peace.',
        60,
        25000.00,
        'leaf',
        'Most Calming',
        true
    ),
    (
        'Deep Tissue Massage',
        '75 min intensive myofascial therapy',
        'Targeted neuromuscular pressure aimed at deep muscular layers to dissolve chronic tightness, knots, and postural strain.',
        75,
        25000.00,
        'barbell',
        'Therapeutic Focus',
        true
    ),
    (
        'VIP Massage',
        '120 min opulent all-inclusive sanctuary ritual',
        'The pinnacle of Eloria luxury: custom aromatherapy oils, heated basalt stones, extended therapeutic bodywork, and total restorative pampering.',
        120,
        85000.00,
        'star',
        'Ultimate Luxury',
        true
    ),
    (
        'Nuru/Erotic Massage',
        '105 min combined signature harmony experience',
        'A seamless fusion of warm Nuru gliding touch and therapeutic sensual bodywork for the ultimate immersive relaxation journey.',
        105,
        80000.00,
        'sparkles',
        'Premium Combination',
        true
    )
ON CONFLICT (name) DO UPDATE SET
    price = EXCLUDED.price,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes,
    icon_name = EXCLUDED.icon_name,
    badge = EXCLUDED.badge,
    is_active = EXCLUDED.is_active;

-- 12. SEED DEFAULT THERAPISTS
INSERT INTO public.therapists (name, title, rating, reviews_count, specialties, bio, is_active)
VALUES
    (
        'Chioma Adeleke',
        'Senior Holistic & Nuru Specialist',
        4.98,
        146,
        ARRAY['Nuru Massage', 'Sensory Touch', 'Swedish Relaxation'],
        'Over 7 years of specialized holistic therapy experience focusing on mindful sensory relaxation and deep nervous system recovery.',
        true
    ),
    (
        'Zainab Bello',
        'Licensed Neuromuscular Practitioner',
        4.95,
        182,
        ARRAY['Deep Tissue', 'Trigger Point Therapy', 'VIP Massage'],
        'Expert in myofascial release, relieving chronic neck and back tension, and bespoke VIP therapeutic experiences.',
        true
    ),
    (
        'Amara Okafor',
        'Certified Wellness & Bodywork Expert',
        4.92,
        119,
        ARRAY['Erotic Massage', 'Aromatherapy', 'Nuru/Erotic Fusion'],
        'Dedicated to creating a tranquil, deeply soothing sanctuary environment tailored to each client''s personal rejuvenation needs.',
        true
    )
ON CONFLICT DO NOTHING;

