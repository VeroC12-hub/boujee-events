// Email and Ticketing Service
import QRCode from 'qrcode';
import { env } from '../config/environment';
import { db } from './database';
import type { Ticket, Event, User, EmailTemplate } from '../types/database';

export interface TicketData {
  eventId: string;
  userId: string;
  type: 'standard' | 'vip' | 'premium';
  quantity: number;
  price: number;
  currency: string;
}

export interface EmailData {
  to: string;
  subject: string;
  content: string;
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
}

export interface TicketGenerationResult {
  success: boolean;
  message: string;
  ticket?: Ticket;
  qrCode?: string;
}

export interface EmailSendResult {
  success: boolean;
  message: string;
  messageId?: string;
}

class EmailTicketingService {
  // Generate QR code for ticket
  async generateQRCode(ticketId: string, eventId: string, userId: string): Promise<string> {
    try {
      const qrData = {
        ticketId,
        eventId,
        userId,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        width: 256
      });
      
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Validate QR code
  async validateQRCode(qrData: string): Promise<{ valid: boolean; ticket?: Ticket; error?: string }> {
    try {
      const data = JSON.parse(qrData);
      
      if (!data.ticketId || !data.eventId || !data.userId) {
        return { valid: false, error: 'Invalid QR code format' };
      }
      
      const ticket = await db.getTicketById(data.ticketId);
      if (!ticket) {
        return { valid: false, error: 'Ticket not found' };
      }
      
      if (ticket.status !== 'confirmed') {
        return { valid: false, error: 'Ticket is not valid' };
      }
      
      // Check if ticket is still valid (within event timeframe)
      const now = new Date();
      if (now < ticket.validFrom || now > ticket.validTo) {
        return { valid: false, error: 'Ticket is not valid at this time' };
      }
      
      return { valid: true, ticket };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  // Generate ticket
  async generateTicket(ticketData: TicketData): Promise<TicketGenerationResult> {
    try {
      // Get event details
      const event = await db.getEventById(ticketData.eventId);
      if (!event) {
        return { success: false, message: 'Event not found' };
      }
      
      // Check availability
      if (event.ticketsSold + ticketData.quantity > event.capacity) {
        return { success: false, message: 'Not enough tickets available' };
      }
      
      // Create ticket
      const ticket = await db.createTicket({
        eventId: ticketData.eventId,
        userId: ticketData.userId,
        type: ticketData.type,
        price: ticketData.price,
        currency: ticketData.currency,
        quantity: ticketData.quantity,
        status: 'reserved', // Will be confirmed after payment
        validFrom: event.startDate,
        validTo: event.endDate,
        metadata: {}
      });
      
      // Generate QR code
      const qrCode = await this.generateQRCode(ticket.id, ticketData.eventId, ticketData.userId);
      
      return {
        success: true,
        message: 'Ticket generated successfully',
        ticket,
        qrCode
      };
    } catch (error) {
      console.error('Ticket generation error:', error);
      return { success: false, message: 'Failed to generate ticket' };
    }
  }

  // Confirm ticket (after successful payment)
  async confirmTicket(ticketId: string): Promise<{ success: boolean; message: string }> {
    try {
      const ticket = await db.getTicketById(ticketId);
      if (!ticket) {
        return { success: false, message: 'Ticket not found' };
      }
      
      // Update ticket status
      const updatedTicket = await db.updateTicket(ticketId, { status: 'confirmed' });
      if (!updatedTicket) {
        return { success: false, message: 'Failed to confirm ticket' };
      }
      
      // Update event sold count
      const event = await db.getEventById(ticket.eventId);
      if (event) {
        await db.updateEvent(event.id, { 
          ticketsSold: event.ticketsSold + ticket.quantity 
        });
      }
      
      return { success: true, message: 'Ticket confirmed successfully' };
    } catch (error) {
      console.error('Ticket confirmation error:', error);
      return { success: false, message: 'Failed to confirm ticket' };
    }
  }

  // Get email template by type
  async getEmailTemplate(type: EmailTemplate['type']): Promise<EmailTemplate | null> {
    // In a real implementation, this would query the database
    // For now, return a default template
    const defaultTemplates = {
      ticket_confirmation: {
        id: 'template-1',
        name: 'Ticket Confirmation',
        subject: '🎫 Your {{eventName}} Ticket Confirmation - Boujee Events',
        content: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8941F 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
              .ticket-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
              .qr-code { text-align: center; margin: 20px 0; }
              .button { background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎫 Ticket Confirmation</h1>
                <p>Your luxury event experience awaits</p>
              </div>
              <div class="content">
                <h2>Hello {{userName}},</h2>
                <p>Thank you for your purchase! Your ticket for <strong>{{eventName}}</strong> has been confirmed.</p>
                
                <div class="ticket-details">
                  <h3>Event Details</h3>
                  <p><strong>Event:</strong> {{eventName}}</p>
                  <p><strong>Date:</strong> {{eventDate}}</p>
                  <p><strong>Time:</strong> {{eventTime}}</p>
                  <p><strong>Venue:</strong> {{eventVenue}}</p>
                  <p><strong>Address:</strong> {{eventAddress}}</p>
                  <p><strong>Ticket Type:</strong> {{ticketType}}</p>
                  <p><strong>Quantity:</strong> {{ticketQuantity}}</p>
                </div>
                
                <div class="qr-code">
                  <h3>Your Ticket QR Code</h3>
                  <p>Present this QR code at the venue for entry:</p>
                  <img src="{{qrCodeDataUrl}}" alt="Ticket QR Code" style="max-width: 200px;" />
                </div>
                
                <h3>Important Information</h3>
                <ul>
                  <li>Please arrive 30 minutes before the event starts</li>
                  <li>Bring a valid ID that matches your booking</li>
                  <li>This QR code is unique to your ticket - do not share it</li>
                  <li>Screenshots of the QR code are acceptable</li>
                </ul>
                
                <p>If you have any questions, please contact our support team.</p>
                <p>Best regards,<br><strong>The Boujee Events Team</strong></p>
              </div>
              <div class="footer">
                <p>© 2024 Boujee Events. All rights reserved.</p>
                <p>For support, contact us at {{supportEmail}}</p>
              </div>
            </div>
          </body>
          </html>
        `,
        type: 'ticket_confirmation' as const,
        variables: ['userName', 'eventName', 'eventDate', 'eventTime', 'eventVenue', 'eventAddress', 'ticketType', 'ticketQuantity', 'qrCodeDataUrl', 'supportEmail'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      event_reminder: {
        id: 'template-2',
        name: 'Event Reminder',
        subject: '⏰ Reminder: {{eventName}} is tomorrow!',
        content: `
          <h1>Don't forget about {{eventName}}!</h1>
          <p>Hello {{userName}},</p>
          <p>This is a friendly reminder that <strong>{{eventName}}</strong> is happening tomorrow!</p>
          <p><strong>When:</strong> {{eventDate}} at {{eventTime}}</p>
          <p><strong>Where:</strong> {{eventVenue}}</p>
          <p>We can't wait to see you there!</p>
        `,
        type: 'event_reminder' as const,
        variables: ['userName', 'eventName', 'eventDate', 'eventTime', 'eventVenue'],
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
    
    return defaultTemplates[type] || null;
  }

  // Replace template variables with actual data
  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  // Send email (mock implementation - in production use Resend API)
  async sendEmail(emailData: EmailData): Promise<EmailSendResult> {
    try {
      // In production, this would use the Resend API
      console.log('📧 Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        hasAttachments: emailData.attachments ? emailData.attachments.length : 0
      });
      
      // Mock successful email send
      return {
        success: true,
        message: 'Email sent successfully',
        messageId: `mock-${Date.now()}`
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        message: 'Failed to send email'
      };
    }
  }

  // Send ticket confirmation email
  async sendTicketConfirmation(ticket: Ticket, qrCodeDataUrl: string): Promise<EmailSendResult> {
    try {
      // Get user and event details
      const user = await db.getUserById(ticket.userId);
      const event = await db.getEventById(ticket.eventId);
      
      if (!user || !event) {
        return { success: false, message: 'User or event not found' };
      }
      
      // Get email template
      const template = await this.getEmailTemplate('ticket_confirmation');
      if (!template) {
        return { success: false, message: 'Email template not found' };
      }
      
      // Prepare template variables
      const variables = {
        userName: user.name,
        eventName: event.title,
        eventDate: event.startDate.toLocaleDateString(),
        eventTime: event.startDate.toLocaleTimeString(),
        eventVenue: event.venue || event.location,
        eventAddress: event.address || event.location,
        ticketType: ticket.type,
        ticketQuantity: ticket.quantity.toString(),
        qrCodeDataUrl: qrCodeDataUrl,
        supportEmail: env.ADMIN_EMAIL
      };
      
      // Replace variables in template
      const subject = this.replaceTemplateVariables(template.subject, variables);
      const content = this.replaceTemplateVariables(template.content, variables);
      
      // Send email
      return this.sendEmail({
        to: user.email,
        subject,
        content,
        attachments: [{
          filename: 'ticket-qr-code.png',
          content: qrCodeDataUrl.split(',')[1], // Remove data:image/png;base64, prefix
          contentType: 'image/png'
        }]
      });
    } catch (error) {
      console.error('Ticket confirmation email error:', error);
      return { success: false, message: 'Failed to send ticket confirmation email' };
    }
  }

  // Send event reminder
  async sendEventReminder(eventId: string): Promise<{ success: boolean; message: string; sentCount: number }> {
    try {
      const event = await db.getEventById(eventId);
      if (!event) {
        return { success: false, message: 'Event not found', sentCount: 0 };
      }
      
      // Get all confirmed tickets for this event
      const tickets = await db.getEventTickets(eventId);
      const confirmedTickets = tickets.filter(t => t.status === 'confirmed');
      
      if (confirmedTickets.length === 0) {
        return { success: true, message: 'No confirmed tickets found', sentCount: 0 };
      }
      
      // Get email template
      const template = await this.getEmailTemplate('event_reminder');
      if (!template) {
        return { success: false, message: 'Email template not found', sentCount: 0 };
      }
      
      let sentCount = 0;
      
      // Send reminder to each ticket holder
      for (const ticket of confirmedTickets) {
        const user = await db.getUserById(ticket.userId);
        if (!user) continue;
        
        const variables = {
          userName: user.name,
          eventName: event.title,
          eventDate: event.startDate.toLocaleDateString(),
          eventTime: event.startDate.toLocaleTimeString(),
          eventVenue: event.venue || event.location
        };
        
        const subject = this.replaceTemplateVariables(template.subject, variables);
        const content = this.replaceTemplateVariables(template.content, variables);
        
        const result = await this.sendEmail({
          to: user.email,
          subject,
          content
        });
        
        if (result.success) {
          sentCount++;
        }
      }
      
      return {
        success: true,
        message: `Event reminders sent to ${sentCount} attendees`,
        sentCount
      };
    } catch (error) {
      console.error('Event reminder error:', error);
      return { success: false, message: 'Failed to send event reminders', sentCount: 0 };
    }
  }

  // Get ticket statistics
  async getTicketStats(eventId?: string): Promise<{
    totalTickets: number;
    confirmedTickets: number;
    reservedTickets: number;
    cancelledTickets: number;
    revenue: number;
  }> {
    try {
      let tickets: Ticket[];
      
      if (eventId) {
        tickets = await db.getEventTickets(eventId);
      } else {
        // Get all tickets - in a real implementation, this would be a database query
        const users = await db.getUsers();
        tickets = [];
        for (const user of users.data) {
          const userTickets = await db.getUserTickets(user.id);
          tickets.push(...userTickets);
        }
      }
      
      const totalTickets = tickets.length;
      const confirmedTickets = tickets.filter(t => t.status === 'confirmed').length;
      const reservedTickets = tickets.filter(t => t.status === 'reserved').length;
      const cancelledTickets = tickets.filter(t => t.status === 'cancelled').length;
      
      const revenue = tickets
        .filter(t => t.status === 'confirmed')
        .reduce((sum, ticket) => sum + (ticket.price * ticket.quantity), 0);
      
      return {
        totalTickets,
        confirmedTickets,
        reservedTickets,
        cancelledTickets,
        revenue
      };
    } catch (error) {
      console.error('Ticket stats error:', error);
      return {
        totalTickets: 0,
        confirmedTickets: 0,
        reservedTickets: 0,
        cancelledTickets: 0,
        revenue: 0
      };
    }
  }
}

// Export singleton instance
export const emailTicketingService = new EmailTicketingService();

// Export types
export type { TicketData, EmailData, TicketGenerationResult, EmailSendResult };