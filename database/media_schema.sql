-- Media Management Database Schema
-- This file contains the SQL schema for Google Drive integration and media management

-- Table: media_files
-- Store metadata for all media files uploaded to Google Drive
CREATE TABLE IF NOT EXISTS media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT,
  google_drive_file_id VARCHAR(255) UNIQUE NOT NULL,
  google_drive_folder_id VARCHAR(255),
  thumbnail_url TEXT,
  download_url TEXT,
  web_view_link TEXT,
  file_type VARCHAR(20) CHECK (file_type IN ('image', 'video', 'document', 'other')),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Table: event_media
-- Link media files to specific events
CREATE TABLE IF NOT EXISTS event_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL, -- References events table
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, media_file_id)
);

-- Table: homepage_media
-- Manage homepage media content (background videos, images, etc.)
CREATE TABLE IF NOT EXISTS homepage_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  media_file_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  media_type VARCHAR(20) CHECK (media_type IN ('background_video', 'hero_image', 'gallery_image', 'banner')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  title VARCHAR(255),
  description TEXT,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: google_drive_tokens
-- Store OAuth tokens securely for Google Drive integration
CREATE TABLE IF NOT EXISTS google_drive_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: google_drive_folders
-- Track Google Drive folder structure for events
CREATE TABLE IF NOT EXISTS google_drive_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID, -- References events table, NULL for general folders
  folder_name VARCHAR(255) NOT NULL,
  google_drive_folder_id VARCHAR(255) UNIQUE NOT NULL,
  parent_folder_id VARCHAR(255),
  folder_type VARCHAR(50) CHECK (folder_type IN ('main', 'event', 'photos', 'videos', 'archive')),
  web_view_link TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_google_drive_file_id ON media_files(google_drive_file_id);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_event_media_media_file_id ON event_media(media_file_id);
CREATE INDEX IF NOT EXISTS idx_event_media_display_order ON event_media(display_order);

CREATE INDEX IF NOT EXISTS idx_homepage_media_media_type ON homepage_media(media_type);
CREATE INDEX IF NOT EXISTS idx_homepage_media_is_active ON homepage_media(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_media_display_order ON homepage_media(display_order);

CREATE INDEX IF NOT EXISTS idx_google_drive_tokens_user_id ON google_drive_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_drive_folders_event_id ON google_drive_folders(event_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_drive_folders ENABLE ROW LEVEL SECURITY;

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';