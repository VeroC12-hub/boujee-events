# Google Drive Integration Setup Guide

## Overview
This guide explains how to set up Google Drive integration for the Boujee Events platform, enabling administrators and organizers to upload, manage, and organize event media through Google Drive.

## Prerequisites
- Google Cloud Console account
- Google Drive API access
- Supabase project configured
- Domain for OAuth redirect URIs

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your Project ID

### 1.2 Enable Google Drive API
1. Navigate to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click **Enable**

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Configure OAuth consent screen first if prompted:
   - Application name: "Boujee Events"
   - User support email: your email
   - Developer contact: your email
4. Create OAuth client ID:
   - Application type: **Web application**
   - Name: "Boujee Events Web Client"
   - Authorized redirect URIs:
     - `http://localhost:8080/auth/google/callback` (development)
     - `https://yourdomain.com/auth/google/callback` (production)

### 1.4 Get API Key
1. Click **Create Credentials** > **API Key**
2. Restrict the key:
   - Application restrictions: **HTTP referrers**
   - Add your domains (localhost:8080, yourdomain.com)
   - API restrictions: **Google Drive API**

## Step 2: Environment Configuration

### 2.1 Update Environment Variables
Add these variables to your environment:

```bash
# Google Drive API Configuration
VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
VITE_GOOGLE_CLIENT_SECRET=your_oauth_client_secret
VITE_GOOGLE_DRIVE_API_KEY=your_api_key
GOOGLE_DRIVE_CLIENT_ID=your_oauth_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_oauth_client_secret
GOOGLE_DRIVE_REDIRECT_URI=https://yourdomain.com/auth/google/callback

# Main Google Drive Folder ID (create manually)
VITE_GOOGLE_DRIVE_FOLDER_ID=your_main_folder_id
```

### 2.2 Create Main Google Drive Folder
1. Go to Google Drive
2. Create a folder named "Boujee Events Hub"
3. Copy the folder ID from the URL
4. Set it as `VITE_GOOGLE_DRIVE_FOLDER_ID`

## Step 3: Database Setup

### 3.1 Run Media Schema Migration
Execute the SQL schema in your Supabase database:

```sql
-- Run the contents of database/media_schema.sql
-- This creates all necessary tables for media management
```

### 3.2 Update Row Level Security
Ensure RLS policies are properly configured for your user roles.

## Step 4: Application Configuration

### 4.1 Google Drive Service Initialization
The Google Drive service will automatically:
- Create "Events" and "Archives" folders
- Set up proper folder structure
- Handle OAuth authentication

### 4.2 Testing the Integration
1. Start the application
2. Navigate to Admin Dashboard > Media
3. Click "Connect Google Drive"
4. Complete OAuth flow
5. Test file upload functionality

## Step 5: Production Deployment

### 5.1 Vercel Configuration
Add environment variables in Vercel dashboard:
- All Google Drive variables
- Supabase configuration
- Update redirect URIs to production domain

### 5.2 Domain Configuration
Update OAuth settings with production domain:
- Authorized JavaScript origins
- Authorized redirect URIs

## Folder Structure
The system creates this structure in Google Drive:

```
Boujee Events Hub/
├── Events/
│   ├── Event Name 1 (abc12345)/
│   │   ├── Photos/
│   │   └── Videos/
│   └── Event Name 2 (def67890)/
│       ├── Photos/
│       └── Videos/
└── Archives/
    └── (Archived events moved here)
```

## Features Enabled

### Media Upload
- Drag & drop interface
- Multiple file support
- Automatic file type detection
- Progress tracking

### Event Organization
- Automatic folder creation per event
- Separate photos and videos folders
- Organized by event ID

### Admin Dashboard
- Media overview statistics
- Upload management
- Google Drive connection status
- File browser and management

### Homepage Media
- Background video support
- Hero image management
- Gallery content organization

## Troubleshooting

### Common Issues

1. **OAuth Error**: Check redirect URIs match exactly
2. **API Key Error**: Verify API key restrictions
3. **Permission Error**: Ensure Drive API is enabled
4. **Upload Error**: Check file size limits and types

### Debug Information
The application logs Google Drive configuration status in browser console.

## Security Considerations

1. **API Key Restrictions**: Always restrict by domain and API
2. **OAuth Scopes**: Use minimal required scopes
3. **File Permissions**: Set appropriate public/private access
4. **Token Storage**: Tokens are encrypted in database

## Support
For technical support, check:
- Browser console for errors
- Network tab for API calls
- Supabase logs for database issues