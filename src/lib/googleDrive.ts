import { google, drive_v3 } from 'googleapis';
import sharp from 'sharp';
import { getDatabase } from './database';

export interface GoogleDriveConfig {
  id: string;
  accountEmail: string;
  credentials: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    access_token: string;
  };
  folderId?: string;
  isActive: boolean;
  createdBy: string;
}

export interface UploadedImage {
  id: string;
  title: string;
  originalUrl: string;
  watermarkedUrl: string;
  driveFileId: string;
  uploadedBy: string;
  createdAt: string;
}

export interface WatermarkOptions {
  text: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  opacity: number;
  fontSize: number;
  color: string;
}

class GoogleDriveService {
  private db = getDatabase();
  private drive: drive_v3.Drive | null = null;

  // Initialize Google Drive with credentials
  async initialize(credentials: GoogleDriveConfig['credentials']): Promise<boolean> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        'urn:ietf:wg:oauth:2.0:oob' // For installed applications
      );

      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token
      });

      this.drive = google.drive({ version: 'v3', auth: oauth2Client });

      // Test the connection
      await this.drive.about.get({ fields: 'user' });
      
      return true;
    } catch (error) {
      console.error('Google Drive initialization failed:', error);
      return false;
    }
  }

  // Save Google Drive configuration (admin function)
  async saveConfiguration(
    accountEmail: string,
    credentials: GoogleDriveConfig['credentials'],
    createdBy: string
  ): Promise<string> {
    const configId = `gdrive_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Encrypt credentials (simplified for demo)
    const encryptedCredentials = Buffer.from(JSON.stringify(credentials)).toString('base64');
    
    // Deactivate existing configurations
    this.db.prepare(`
      UPDATE google_drive_config 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
    `).run();
    
    // Create main Boujee Events folder if it doesn't exist
    let folderId = null;
    if (await this.initialize(credentials)) {
      folderId = await this.createMainFolder();
    }
    
    // Insert new configuration
    this.db.prepare(`
      INSERT INTO google_drive_config (id, account_email, credentials_encrypted, folder_id, is_active, created_by)
      VALUES (?, ?, ?, ?, 1, ?)
    `).run(configId, accountEmail, encryptedCredentials, folderId, createdBy);
    
    return configId;
  }

  // Get active Google Drive configuration
  async getActiveConfiguration(): Promise<GoogleDriveConfig | null> {
    const row = this.db.prepare(`
      SELECT * FROM google_drive_config WHERE is_active = 1 LIMIT 1
    `).get() as any;
    
    if (!row) {
      return null;
    }
    
    try {
      const credentials = JSON.parse(Buffer.from(row.credentials_encrypted, 'base64').toString());
      
      return {
        id: row.id,
        accountEmail: row.account_email,
        credentials,
        folderId: row.folder_id,
        isActive: Boolean(row.is_active),
        createdBy: row.created_by
      };
    } catch (error) {
      console.error('Failed to decrypt Google Drive credentials:', error);
      return null;
    }
  }

  // Create main Boujee Events folder
  private async createMainFolder(): Promise<string | null> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    try {
      // Check if folder already exists
      const existingFolders = await this.drive.files.list({
        q: "name='Boujee Events' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)'
      });

      if (existingFolders.data.files && existingFolders.data.files.length > 0) {
        return existingFolders.data.files[0].id!;
      }

      // Create new folder
      const folderMetadata = {
        name: 'Boujee Events',
        mimeType: 'application/vnd.google-apps.folder'
      };

      const folder = await this.drive.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });

      return folder.data.id!;
    } catch (error) {
      console.error('Failed to create main folder:', error);
      return null;
    }
  }

  // Create event-specific folder
  async createEventFolder(eventTitle: string, eventId: string): Promise<string | null> {
    const config = await this.getActiveConfiguration();
    if (!config || !await this.initialize(config.credentials)) {
      throw new Error('Google Drive not configured');
    }

    try {
      const folderName = `${eventTitle} (${eventId})`;
      
      // Check if folder already exists
      const existingFolders = await this.drive!.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and '${config.folderId}' in parents`,
        fields: 'files(id, name)'
      });

      if (existingFolders.data.files && existingFolders.data.files.length > 0) {
        return existingFolders.data.files[0].id!;
      }

      // Create new event folder
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: config.folderId ? [config.folderId] : undefined
      };

      const folder = await this.drive!.files.create({
        requestBody: folderMetadata,
        fields: 'id'
      });

      return folder.data.id!;
    } catch (error) {
      console.error('Failed to create event folder:', error);
      return null;
    }
  }

  // Apply watermark to image
  async applyWatermark(
    imageBuffer: Buffer,
    options: WatermarkOptions = {
      text: 'BOUJEE EVENTS',
      position: 'bottom-right',
      opacity: 0.7,
      fontSize: 24,
      color: '#FFFFFF'
    }
  ): Promise<Buffer> {
    try {
      const image = sharp(imageBuffer);
      const { width, height } = await image.metadata();
      
      if (!width || !height) {
        throw new Error('Could not get image dimensions');
      }

      // Create watermark text as SVG
      const watermarkSvg = this.createWatermarkSvg(options, width, height);
      
      // Apply watermark
      const watermarkedImage = await image
        .composite([{
          input: Buffer.from(watermarkSvg),
          gravity: this.getGravityFromPosition(options.position)
        }])
        .jpeg({ quality: 90 })
        .toBuffer();

      return watermarkedImage;
    } catch (error) {
      console.error('Watermarking failed:', error);
      throw new Error('Failed to apply watermark');
    }
  }

  // Create watermark SVG
  private createWatermarkSvg(options: WatermarkOptions, imageWidth: number, imageHeight: number): string {
    const { text, fontSize, color, opacity } = options;
    
    // Calculate text width (rough estimation)
    const textWidth = text.length * fontSize * 0.6;
    const textHeight = fontSize;
    
    // Calculate position
    let x = 0;
    let y = 0;
    
    switch (options.position) {
      case 'bottom-right':
        x = imageWidth - textWidth - 20;
        y = imageHeight - 20;
        break;
      case 'bottom-left':
        x = 20;
        y = imageHeight - 20;
        break;
      case 'top-right':
        x = imageWidth - textWidth - 20;
        y = textHeight + 20;
        break;
      case 'top-left':
        x = 20;
        y = textHeight + 20;
        break;
      case 'center':
        x = (imageWidth - textWidth) / 2;
        y = imageHeight / 2;
        break;
    }

    return `
      <svg width="${imageWidth}" height="${imageHeight}">
        <text
          x="${x}"
          y="${y}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}"
          font-weight="bold"
          fill="${color}"
          opacity="${opacity}"
          text-anchor="start"
        >${text}</text>
      </svg>
    `;
  }

  // Get Sharp gravity from position
  private getGravityFromPosition(position: WatermarkOptions['position']): string {
    switch (position) {
      case 'bottom-right': return 'southeast';
      case 'bottom-left': return 'southwest';
      case 'top-right': return 'northeast';
      case 'top-left': return 'northwest';
      case 'center': return 'center';
      default: return 'southeast';
    }
  }

  // Upload image with watermark to Google Drive
  async uploadImage(
    imageBuffer: Buffer,
    fileName: string,
    eventId?: string,
    uploadedBy: string = 'system',
    applyWatermarkToImage: boolean = true
  ): Promise<UploadedImage | null> {
    const config = await this.getActiveConfiguration();
    if (!config || !await this.initialize(config.credentials)) {
      throw new Error('Google Drive not configured');
    }

    try {
      // Apply watermark if requested
      let watermarkedBuffer = imageBuffer;
      if (applyWatermarkToImage) {
        watermarkedBuffer = await this.applyWatermark(imageBuffer);
      }

      // Determine parent folder
      let parentFolder = config.folderId;
      if (eventId) {
        const event = this.db.prepare('SELECT title FROM events WHERE id = ?').get(eventId) as any;
        if (event) {
          parentFolder = await this.createEventFolder(event.title, eventId);
        }
      }

      // Upload original image
      const originalFileMetadata = {
        name: `original_${fileName}`,
        parents: parentFolder ? [parentFolder] : undefined
      };

      const originalMedia = {
        mimeType: 'image/jpeg',
        body: require('stream').Readable.from(imageBuffer)
      };

      const originalFile = await this.drive!.files.create({
        requestBody: originalFileMetadata,
        media: originalMedia,
        fields: 'id, webViewLink'
      });

      // Upload watermarked image
      const watermarkedFileMetadata = {
        name: `watermarked_${fileName}`,
        parents: parentFolder ? [parentFolder] : undefined
      };

      const watermarkedMedia = {
        mimeType: 'image/jpeg',
        body: require('stream').Readable.from(watermarkedBuffer)
      };

      const watermarkedFile = await this.drive!.files.create({
        requestBody: watermarkedFileMetadata,
        media: watermarkedMedia,
        fields: 'id, webViewLink'
      });

      // Make files publicly viewable
      await this.makeFilePublic(originalFile.data.id!);
      await this.makeFilePublic(watermarkedFile.data.id!);

      // Save to database
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      this.db.prepare(`
        INSERT INTO homepage_images (id, title, image_url, drive_file_id, watermarked_url, uploaded_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        imageId,
        fileName.replace(/\.[^/.]+$/, ''), // Remove extension
        this.getPublicUrl(originalFile.data.id!),
        originalFile.data.id!,
        this.getPublicUrl(watermarkedFile.data.id!),
        uploadedBy
      );

      return {
        id: imageId,
        title: fileName.replace(/\.[^/.]+$/, ''),
        originalUrl: this.getPublicUrl(originalFile.data.id!),
        watermarkedUrl: this.getPublicUrl(watermarkedFile.data.id!),
        driveFileId: originalFile.data.id!,
        uploadedBy,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Image upload failed:', error);
      return null;
    }
  }

  // Make Google Drive file publicly viewable
  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      await this.drive!.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        }
      });
    } catch (error) {
      console.error('Failed to make file public:', error);
    }
  }

  // Get public URL for Google Drive file
  private getPublicUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}`;
  }

  // Get homepage images
  getHomepageImages(): UploadedImage[] {
    const images = this.db.prepare(`
      SELECT * FROM homepage_images 
      WHERE is_active = 1 
      ORDER BY order_index ASC, created_at DESC
    `).all() as any[];

    return images.map(img => ({
      id: img.id,
      title: img.title,
      originalUrl: img.image_url,
      watermarkedUrl: img.watermarked_url,
      driveFileId: img.drive_file_id,
      uploadedBy: img.uploaded_by,
      createdAt: img.created_at
    }));
  }

  // Update image order
  updateImageOrder(imageId: string, newOrder: number): boolean {
    try {
      const result = this.db.prepare(`
        UPDATE homepage_images 
        SET order_index = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newOrder, imageId);

      return result.changes > 0;
    } catch (error) {
      console.error('Failed to update image order:', error);
      return false;
    }
  }

  // Delete image
  async deleteImage(imageId: string): Promise<boolean> {
    try {
      const image = this.db.prepare(`
        SELECT drive_file_id FROM homepage_images WHERE id = ?
      `).get(imageId) as any;

      if (!image) {
        return false;
      }

      // Delete from Google Drive
      const config = await this.getActiveConfiguration();
      if (config && await this.initialize(config.credentials)) {
        try {
          await this.drive!.files.delete({ fileId: image.drive_file_id });
        } catch (error) {
          console.warn('Failed to delete file from Google Drive:', error);
        }
      }

      // Delete from database
      const result = this.db.prepare(`
        DELETE FROM homepage_images WHERE id = ?
      `).run(imageId);

      return result.changes > 0;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  // Bulk upload images
  async bulkUploadImages(
    images: Array<{ buffer: Buffer; fileName: string }>,
    eventId?: string,
    uploadedBy: string = 'system'
  ): Promise<UploadedImage[]> {
    const uploadedImages: UploadedImage[] = [];

    for (const { buffer, fileName } of images) {
      try {
        const uploadedImage = await this.uploadImage(buffer, fileName, eventId, uploadedBy);
        if (uploadedImage) {
          uploadedImages.push(uploadedImage);
        }
      } catch (error) {
        console.error(`Failed to upload image ${fileName}:`, error);
      }
    }

    return uploadedImages;
  }

  // Test Google Drive connection
  async testConnection(): Promise<boolean> {
    const config = await this.getActiveConfiguration();
    if (!config) {
      return false;
    }

    return await this.initialize(config.credentials);
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();

export default googleDriveService;