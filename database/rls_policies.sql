-- Row Level Security Policies for media tables
-- Apply these in Supabase SQL editor after creating the tables

-- MEDIA FILES --------------------------------------------------------------
-- Allow public read of files explicitly marked as public, and owners to read their own
CREATE POLICY IF NOT EXISTS "media_files_select_public_or_owner"
ON public.media_files
FOR SELECT
USING (
  is_public = true OR uploaded_by = auth.uid()
);

-- Allow authenticated users to insert media they own
CREATE POLICY IF NOT EXISTS "media_files_insert_owner"
ON public.media_files
FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid()
);

-- Allow owners to update their media rows
CREATE POLICY IF NOT EXISTS "media_files_update_owner"
ON public.media_files
FOR UPDATE
USING (
  uploaded_by = auth.uid()
)
WITH CHECK (
  uploaded_by = auth.uid()
);

-- HOMEPAGE MEDIA -----------------------------------------------------------
-- Allow anyone to read homepage media (homepage is public)
CREATE POLICY IF NOT EXISTS "homepage_media_select_public"
ON public.homepage_media
FOR SELECT
USING (true);

-- Allow admins and organizers to insert homepage media
CREATE POLICY IF NOT EXISTS "homepage_media_insert_admins"
ON public.homepage_media
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','organizer')
  )
);

-- Allow admins and organizers to update homepage media
CREATE POLICY IF NOT EXISTS "homepage_media_update_admins"
ON public.homepage_media
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','organizer')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','organizer')
  )
);

-- Allow admins and organizers to delete homepage media
CREATE POLICY IF NOT EXISTS "homepage_media_delete_admins"
ON public.homepage_media
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role IN ('admin','organizer')
  )
);