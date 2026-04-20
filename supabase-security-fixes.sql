-- Supabase Security Fixes
-- Run these SQL commands in the Supabase SQL Editor to fix security warnings

-- ============================================
-- 1. Fix Function Search Path Mutable (3 functions)
-- ============================================

-- Fix calculate_cancellation_fee (with argument types for unique identification)
ALTER FUNCTION public.calculate_cancellation_fee(timestamp with time zone, timestamp with time zone, numeric) SET search_path = '';

-- Fix calculate_cancellation_deadline
ALTER FUNCTION public.calculate_cancellation_deadline(timestamp with time zone) SET search_path = '';

-- Fix update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- ============================================
-- 2. Move btree_gist extension from public schema
-- ============================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extension to extensions schema
ALTER EXTENSION btree_gist SET SCHEMA extensions;

-- ============================================
-- 3. Fix RLS Policy Always True on vans table
-- ============================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to create vans" ON public.vans;
DROP POLICY IF EXISTS "Allow authenticated users to update vans" ON public.vans;
DROP POLICY IF EXISTS "Users can create vans" ON public.vans;
DROP POLICY IF EXISTS "Users can update their own vans" ON public.vans;

-- Create proper RLS policies that check ownership
-- Note: Cast host_id to UUID to match auth.uid() type
CREATE POLICY "Users can create vans" ON public.vans
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id::uuid);

CREATE POLICY "Users can update their own vans" ON public.vans
FOR UPDATE
TO authenticated
USING (auth.uid() = host_id::uuid)
WITH CHECK (auth.uid() = host_id::uuid);

-- ============================================
-- 4. Remove broad SELECT policy from van-images bucket
-- ============================================

-- Drop the broad SELECT policy that allows listing all files
DROP POLICY IF EXISTS "Allow all reads from van-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow read access to van-images" ON storage.objects;

-- Create a more restrictive policy that only allows reading specific files
CREATE POLICY "Allow read access to van-images" ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'van-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 5. Enable leaked password protection
-- ============================================

-- This must be done in Supabase Dashboard:
-- 1. Go to Authentication > Policies
-- 2. Find "Leaked Password Protection"
-- 3. Toggle it to "Enabled"

-- Or use the Supabase CLI:
-- supabase auth update --leaked-password-protection=true
