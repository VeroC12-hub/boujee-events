# Boujee Events Platform - Setup Guide

## 🚀 Quick Start

This platform is designed to work with or without external services. You can start developing immediately with mock data, then progressively configure real services.

### 1. Basic Setup

```bash
# Clone and install dependencies
npm install

# Start development server
npm run dev
```

The platform will automatically use mock data for development when external services aren't configured.

### 2. Test Credentials

**Admin Account:**
- Email: `admin@test.com`
- Password: `TestAdmin2025`

**Organizer Account:**
- Email: `organizer@test.com`
- Password: `TestOrganizer2025`

**Member Account:**
- Email: `member@test.com`
- Password: `TestMember2025`

## 🔧 Service Configuration

### Supabase Database (Optional)

1. Create a [Supabase](https://supabase.com) project
2. Copy your project URL and anon key
3. Update `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

4. Apply database schema:
```sql
-- Run the SQL from database/media_schema.sql in your Supabase SQL editor
```

**Tables Created:**
- `profiles` - User profiles and roles
- `events` - Event management
- `bookings` - Ticket purchases
- `media_files` - Google Drive file metadata
- `event_media` - Event-media relationships
- `homepage_media` - Homepage content
- `google_drive_tokens` - OAuth tokens
- `google_drive_folders` - Drive folder structure

### Google Drive Integration (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:8080`
6. Add redirect URI: `http://localhost:8080/auth/google/callback`
7. Update `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret
VITE_GOOGLE_DRIVE_API_KEY=your-drive-api-key
```

### Stripe Payment Integration (Optional)

1. Create a [Stripe](https://stripe.com) account
2. Get your API keys from the dashboard
3. Update `.env` file:

```env
VITE_STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
VITE_STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
```

### Email Service (Optional)

1. Create a [Resend](https://resend.com) account
2. Get your API key
3. Update `.env` file:

```env
VITE_RESEND_API_KEY=your-resend-api-key
```

## 🎯 Features Status

### ✅ Working Features (No Setup Required)

- **Authentication**: Mock user system with roles
- **Admin Dashboard**: Full featured with mock data
- **Event Management**: Create, edit, delete events
- **User Management**: Role-based access control
- **Media Upload**: Local file handling
- **Analytics Dashboard**: Mock analytics data
- **Responsive Design**: Works on all devices

### 🔧 Enhanced Features (Requires Configuration)

- **Real Database**: Connect to Supabase for persistent data
- **Google Drive**: Cloud media storage and management
- **Payment Processing**: Stripe integration for ticket sales
- **Email Notifications**: Automated booking confirmations

## 📱 User Roles & Access

### Admin Dashboard (`/admin`)
- Full system control
- Event management
- User management
- Analytics and reporting
- Media management
- System settings

### Organizer Dashboard (`/organizer`)
- Event creation and management
- Media upload for events
- Booking analytics
- Event promotion tools

### Member Dashboard (`/member`)
- Event browsing and booking
- Ticket management
- Profile settings
- Booking history

## 🎨 Development Mode

The platform automatically detects missing configurations and provides:

- **Mock Authentication**: Test with predefined users
- **Sample Data**: Realistic data for all features
- **Service Fallbacks**: Local alternatives for external services
- **Development Warnings**: Clear indicators of missing services

## 🚀 Production Deployment

### Environment Variables

Ensure all required environment variables are set:

```env
# Required for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional but recommended
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_STRIPE_PUBLIC_KEY=pk_live_your-stripe-key
VITE_RESEND_API_KEY=your-resend-key
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The platform can be deployed to:
- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: Custom deployment
- **Any static hosting**: Built output in `dist/`

## 🛠️ Troubleshooting

### Common Issues

1. **Dashboard shows "Loading..."**
   - Check browser console for errors
   - Verify environment variables
   - Ensure mock mode is working

2. **Google Drive not connecting**
   - Check OAuth credentials
   - Verify authorized origins
   - Ensure API is enabled

3. **Payment processing fails**
   - Verify Stripe keys
   - Check test vs live mode
   - Review webhook configuration

### Support

- Check console warnings for configuration hints
- Review network tab for API errors
- Ensure all services are properly configured

## 📚 Architecture

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, App)
├── hooks/          # Custom React hooks
├── lib/            # Utility libraries (Supabase, etc.)
├── pages/          # Route components
├── services/       # External service integrations
├── styles/         # Global styles and themes
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Key Services

- **AuthContext**: Authentication and user management
- **GoogleDriveService**: File storage and media management
- **StripeService**: Payment processing
- **BookingService**: Event booking and ticketing

The platform follows a modular architecture where each service can work independently with fallbacks for development.