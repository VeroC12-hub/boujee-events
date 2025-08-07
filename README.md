# Boujee Events - Premium Event Management Platform

A comprehensive, production-ready event management system with advanced Google Drive media integration, built with React 18, TypeScript, and Supabase.

## 🌟 Features

### Core Platform
- **Modern Tech Stack**: React 18 + TypeScript + Vite + Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth integration
- **Database**: PostgreSQL with Row Level Security (RLS)
- **UI Components**: Radix UI + shadcn/ui components
- **Responsive Design**: Mobile-first approach with dark/light themes

### 🎬 Advanced Media Management
- **Google Drive Integration**: Seamless cloud storage with automatic organization
- **Drag & Drop Upload**: Intuitive file upload with progress tracking
- **Event Media Organization**: Automatic folder creation per event
- **Homepage Media Management**: Background videos, hero images, gallery content
- **Unlimited Storage**: Support for unlimited images and videos per event
- **Media Preview**: In-app preview with modal gallery
- **File Type Support**: Images, videos, documents with automatic categorization

### 🎪 Event Management
- **Event Creation & Management**: Full CRUD operations for events
- **Automatic Media Folders**: Each event gets organized Google Drive folders
- **Event Gallery**: Beautiful media galleries for each event
- **Media Organization**: Separate Photos and Videos folders per event

### 👑 Admin Dashboard
- **Comprehensive Analytics**: Event and user analytics dashboard
- **Media Management Panel**: Complete media file management interface
- **User Role Management**: Admin, Organizer, Member role system
- **System Monitoring**: Real-time status and health checks
- **Quick Actions**: Streamlined administrative workflows

### 🔒 Production Ready
- **Security**: Industry-standard authentication and authorization
- **Performance**: Optimized builds and efficient data loading
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Production Deployment**: Vercel-ready configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google Cloud Console account (for Drive API)

### 1. Installation
```bash
git clone <repository-url>
cd boujee-events
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Drive API
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_DRIVE_API_KEY=your_google_api_key
VITE_GOOGLE_DRIVE_FOLDER_ID=your_main_folder_id

# Payment Integration (Optional)
VITE_STRIPE_PUBLIC_KEY=your_stripe_key
VITE_PAYPAL_CLIENT_ID=your_paypal_id
```

### 3. Database Setup
```bash
# Run the database schema
# Execute the SQL in database/media_schema.sql in your Supabase SQL editor
```

### 4. Google Drive Setup
Follow the detailed [Google Drive Setup Guide](./docs/GOOGLE_DRIVE_SETUP.md) to configure:
- Google Cloud Console project
- OAuth 2.0 credentials
- API key restrictions
- Drive folder structure

### 5. Development Server
```bash
npm run dev
```

Visit `http://localhost:8080` to see the application.

### 6. Production Build
```bash
npm run build
npm run preview
```

## 📊 Database Schema

### Media Management Tables
- **media_files**: Store all media file metadata and Google Drive links
- **event_media**: Link media files to specific events with display settings
- **homepage_media**: Manage homepage media content and layout
- **google_drive_tokens**: Secure OAuth token storage
- **google_drive_folders**: Track Google Drive folder organization

### Security Features
- Row Level Security (RLS) policies
- Role-based access control
- Encrypted token storage
- Audit logging

## 🎨 Component Library

### Media Components
```tsx
import { MediaUpload, MediaGallery } from '../components/media';

// Drag & drop upload with progress
<MediaUpload
  onFilesSelected={handleUpload}
  maxFiles={10}
  maxFileSize={100}
  acceptedTypes={['image/*', 'video/*']}
/>

// Responsive media gallery
<MediaGallery
  mediaFiles={eventMedia}
  onDelete={handleDelete}
  onPreview={handlePreview}
  gridCols={3}
/>
```

### Admin Dashboard Integration
The admin dashboard includes a comprehensive Media Management section with:
- Overview and statistics
- File upload interface
- Homepage media management
- Event media organization
- Google Drive connection status

## 🔧 API Reference

### Google Drive Service
```typescript
import { googleDriveService } from './services/googleDriveService';

// Initialize service
await googleDriveService.initialize();

// Create event folder structure
const eventFolder = await googleDriveService.createEventFolder(
  'Summer Party 2025',
  'event-id-123'
);

// Upload files with progress tracking
const uploadedFile = await googleDriveService.uploadFile(
  file,
  eventFolder.photosFolderId,
  (progress) => console.log(`${progress.percentage}% complete`)
);
```

### Media Database Service
```typescript
import { mediaService } from './services/mediaService';

// Save media metadata
const mediaFile = await mediaService.createMediaFile({
  name: 'party-photo.jpg',
  google_drive_file_id: uploadedFile.id,
  file_type: 'image',
  is_public: true
});

// Link to event
await mediaService.createEventMedia({
  event_id: 'event-123',
  media_file_id: mediaFile.id,
  is_featured: true
});
```

For complete API documentation, see [API Reference](./docs/API_REFERENCE.md).

## 🗂️ Google Drive Folder Structure

The system automatically creates and maintains this organization:

```
Boujee Events Hub/
├── Events/
│   ├── Summer Party 2025 (abc12345)/
│   │   ├── Photos/
│   │   └── Videos/
│   ├── Corporate Gala (def67890)/
│   │   ├── Photos/
│   │   └── Videos/
│   └── Wedding Reception (ghi13579)/
│       ├── Photos/
│       └── Videos/
└── Archives/
    └── (Completed/archived events)
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Update Google OAuth redirect URIs for production domain
4. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Environment Variables for Production
Ensure all environment variables are set in your deployment platform:
- Supabase credentials
- Google Drive API credentials
- Payment processor keys (if used)
- Custom domain configurations

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   ├── media/           # Media management components
│   └── ui/              # Reusable UI components
├── pages/               # Page components
├── services/            # API services and integrations
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
└── types/               # TypeScript type definitions

database/                # SQL schema and migrations
docs/                    # Documentation files
```

### Key Technologies
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI primitives
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Cloud Storage**: Google Drive API
- **Payment**: Stripe, PayPal integration ready
- **Deployment**: Vercel optimized

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration
- Comprehensive error handling
- Performance optimizations
- Accessibility compliance

## 📚 Documentation

- [Google Drive Setup Guide](./docs/GOOGLE_DRIVE_SETUP.md) - Complete setup instructions
- [API Reference](./docs/API_REFERENCE.md) - Comprehensive API documentation
- [Component Library](./docs/COMPONENTS.md) - UI component documentation (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment guide (coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support and questions:
- Check the [documentation](./docs/)
- Review browser console for debugging information
- Check Supabase logs for database issues
- Verify Google Drive API quotas and permissions

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced video processing and compression
- [ ] Automated thumbnail generation
- [ ] Bulk media operations
- [ ] Enhanced analytics and reporting
- [ ] Mobile app companion
- [ ] Advanced user management
- [ ] Event templates and themes
- [ ] Social media integration
- [ ] Advanced booking system
- [ ] Multi-language support

---

**Boujee Events** - Creating magical luxury experiences with professional-grade event management technology.
