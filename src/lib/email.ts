import { Resend } from 'resend';
import { getSystemSetting } from './init';
import { getDatabase } from './database';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: 'booking' | 'payment' | 'reminder' | 'admin' | 'general';
  variables: string[]; // List of template variables like {{user_name}}, {{event_title}}
}

export interface EmailData {
  to: string | string[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private resend: Resend | null = null;
  private db = getDatabase();

  constructor() {
    this.initializeResend();
  }

  private initializeResend() {
    const apiKey = getSystemSetting('resend_api_key');
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  // Configure Resend API key (admin function)
  configureResend(apiKey: string): boolean {
    try {
      this.resend = new Resend(apiKey);
      // Test the connection
      return true;
    } catch (error) {
      console.error('Failed to configure Resend:', error);
      return false;
    }
  }

  // Send email
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    if (!this.resend) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await this.resend.emails.send({
        from: 'noreply@boujeeevents.com', // Use your verified domain
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.htmlContent,
        text: emailData.textContent,
        attachments: emailData.attachments
      });

      return {
        success: true,
        messageId: result.data?.id
      };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    bookingReference: string,
    qrCode?: string
  ): Promise<EmailResult> {
    const template = await this.getEmailTemplate('booking_confirmation');
    
    if (!template) {
      // Use default template
      const htmlContent = this.generateBookingConfirmationHTML(
        userName,
        eventTitle,
        eventDate,
        eventLocation,
        bookingReference,
        qrCode
      );

      return this.sendEmail({
        to: userEmail,
        subject: `Booking Confirmed: ${eventTitle}`,
        htmlContent,
        textContent: `Hi ${userName},\n\nYour booking for ${eventTitle} has been confirmed.\n\nEvent Details:\n- Date: ${eventDate}\n- Location: ${eventLocation}\n- Booking Reference: ${bookingReference}\n\nThank you for choosing Boujee Events!`
      });
    }

    // Use custom template with variable substitution
    const htmlContent = this.substituteVariables(template.htmlContent, {
      user_name: userName,
      event_title: eventTitle,
      event_date: eventDate,
      event_location: eventLocation,
      booking_reference: bookingReference
    });

    const textContent = template.textContent ? this.substituteVariables(template.textContent, {
      user_name: userName,
      event_title: eventTitle,
      event_date: eventDate,
      event_location: eventLocation,
      booking_reference: bookingReference
    }) : undefined;

    const attachments = qrCode ? [{
      filename: 'ticket-qr.png',
      content: qrCode,
      contentType: 'image/png'
    }] : undefined;

    return this.sendEmail({
      to: userEmail,
      subject: this.substituteVariables(template.subject, { event_title: eventTitle }),
      htmlContent,
      textContent,
      attachments
    });
  }

  // Send payment receipt email
  async sendPaymentReceipt(
    userEmail: string,
    userName: string,
    eventTitle: string,
    amount: number,
    currency: string,
    paymentId: string,
    bookingReference: string
  ): Promise<EmailResult> {
    const template = await this.getEmailTemplate('payment_receipt');
    
    if (!template) {
      const htmlContent = this.generatePaymentReceiptHTML(
        userName,
        eventTitle,
        amount,
        currency,
        paymentId,
        bookingReference
      );

      return this.sendEmail({
        to: userEmail,
        subject: `Payment Receipt - ${eventTitle}`,
        htmlContent,
        textContent: `Hi ${userName},\n\nWe have received your payment for ${eventTitle}.\n\nPayment Details:\n- Amount: ${currency} ${amount}\n- Payment ID: ${paymentId}\n- Booking Reference: ${bookingReference}\n\nThank you for your payment!`
      });
    }

    const variables = {
      user_name: userName,
      event_title: eventTitle,
      amount: amount.toString(),
      currency: currency,
      payment_id: paymentId,
      booking_reference: bookingReference
    };

    const htmlContent = this.substituteVariables(template.htmlContent, variables);
    const textContent = template.textContent ? this.substituteVariables(template.textContent, variables) : undefined;

    return this.sendEmail({
      to: userEmail,
      subject: this.substituteVariables(template.subject, variables),
      htmlContent,
      textContent
    });
  }

  // Send event reminder email
  async sendEventReminder(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    hoursUntilEvent: number
  ): Promise<EmailResult> {
    const template = await this.getEmailTemplate('event_reminder');
    
    if (!template) {
      const htmlContent = this.generateEventReminderHTML(
        userName,
        eventTitle,
        eventDate,
        eventLocation,
        hoursUntilEvent
      );

      return this.sendEmail({
        to: userEmail,
        subject: `Reminder: ${eventTitle} is tomorrow!`,
        htmlContent,
        textContent: `Hi ${userName},\n\nThis is a reminder that ${eventTitle} is happening in ${hoursUntilEvent} hours.\n\nEvent Details:\n- Date: ${eventDate}\n- Location: ${eventLocation}\n\nWe look forward to seeing you there!`
      });
    }

    const variables = {
      user_name: userName,
      event_title: eventTitle,
      event_date: eventDate,
      event_location: eventLocation,
      hours_until_event: hoursUntilEvent.toString()
    };

    const htmlContent = this.substituteVariables(template.htmlContent, variables);
    const textContent = template.textContent ? this.substituteVariables(template.textContent, variables) : undefined;

    return this.sendEmail({
      to: userEmail,
      subject: this.substituteVariables(template.subject, variables),
      htmlContent,
      textContent
    });
  }

  // Get email template
  private async getEmailTemplate(name: string): Promise<EmailTemplate | null> {
    // In a future enhancement, we'll store templates in the database
    // For now, return null to use default templates
    return null;
  }

  // Variable substitution
  private substituteVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  // Generate default booking confirmation HTML
  private generateBookingConfirmationHTML(
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    bookingReference: string,
    qrCode?: string
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 28px; font-weight: bold; color: #ffd700; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
        .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .qr-code { text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .cta-button { display: inline-block; background: #ffd700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">BOUJEE EVENTS</div>
        <h1>Booking Confirmed!</h1>
    </div>
    
    <div class="content">
        <h2>Hi ${userName},</h2>
        <p>Thank you for your booking! We're excited to see you at this exclusive event.</p>
        
        <div class="event-details">
            <h3>Event Details</h3>
            <div class="detail-item">
                <span class="label">Event:</span> <span class="value">${eventTitle}</span>
            </div>
            <div class="detail-item">
                <span class="label">Date:</span> <span class="value">${eventDate}</span>
            </div>
            <div class="detail-item">
                <span class="label">Location:</span> <span class="value">${eventLocation}</span>
            </div>
            <div class="detail-item">
                <span class="label">Booking Reference:</span> <span class="value">${bookingReference}</span>
            </div>
        </div>
        
        ${qrCode ? `
        <div class="qr-code">
            <h3>Your Ticket</h3>
            <p>Please present this QR code at the event entrance:</p>
            <img src="cid:ticket-qr.png" alt="Ticket QR Code" style="max-width: 200px;">
        </div>
        ` : ''}
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <div style="text-align: center;">
            <a href="#" class="cta-button">View Event Details</a>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2025 Boujee Events. All rights reserved.</p>
        <p>Luxury experiences for discerning tastes.</p>
    </div>
</body>
</html>`;
  }

  // Generate default payment receipt HTML
  private generatePaymentReceiptHTML(
    userName: string,
    eventTitle: string,
    amount: number,
    currency: string,
    paymentId: string,
    bookingReference: string
  ): string {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 28px; font-weight: bold; color: #ffd700; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
        .receipt-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 10px 0; display: flex; justify-content: space-between; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .total { font-size: 18px; font-weight: bold; border-top: 2px solid #ffd700; padding-top: 10px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">BOUJEE EVENTS</div>
        <h1>Payment Receipt</h1>
    </div>
    
    <div class="content">
        <h2>Hi ${userName},</h2>
        <p>Thank you for your payment! Your transaction has been processed successfully.</p>
        
        <div class="receipt-details">
            <h3>Payment Details</h3>
            <div class="detail-item">
                <span class="label">Event:</span>
                <span class="value">${eventTitle}</span>
            </div>
            <div class="detail-item">
                <span class="label">Payment ID:</span>
                <span class="value">${paymentId}</span>
            </div>
            <div class="detail-item">
                <span class="label">Booking Reference:</span>
                <span class="value">${bookingReference}</span>
            </div>
            <div class="detail-item">
                <span class="label">Date:</span>
                <span class="value">${new Date().toLocaleDateString()}</span>
            </div>
            <div class="detail-item total">
                <span class="label">Total Paid:</span>
                <span class="value">${formattedAmount}</span>
            </div>
        </div>
        
        <p>This receipt serves as confirmation of your payment. Please keep it for your records.</p>
    </div>
    
    <div class="footer">
        <p>© 2025 Boujee Events. All rights reserved.</p>
        <p>For support, please contact us at support@boujeeevents.com</p>
    </div>
</body>
</html>`;
  }

  // Generate default event reminder HTML
  private generateEventReminderHTML(
    userName: string,
    eventTitle: string,
    eventDate: string,
    eventLocation: string,
    hoursUntilEvent: number
  ): string {
    const timeText = hoursUntilEvent <= 24 ? 
      (hoursUntilEvent <= 1 ? 'very soon' : `in ${hoursUntilEvent} hours`) :
      `in ${Math.floor(hoursUntilEvent / 24)} days`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Event Reminder</title>
    <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 28px; font-weight: bold; color: #ffd700; margin-bottom: 10px; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
        .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-item { margin: 10px 0; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .countdown { text-align: center; background: #ffd700; color: #000; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .cta-button { display: inline-block; background: #ffd700; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">BOUJEE EVENTS</div>
        <h1>Event Reminder</h1>
    </div>
    
    <div class="content">
        <h2>Hi ${userName},</h2>
        <p>This is a friendly reminder about your upcoming event!</p>
        
        <div class="countdown">
            <h3>${eventTitle}</h3>
            <p style="font-size: 18px; margin: 0;">Happening ${timeText}!</p>
        </div>
        
        <div class="event-details">
            <h3>Event Details</h3>
            <div class="detail-item">
                <span class="label">Date & Time:</span> <span class="value">${eventDate}</span>
            </div>
            <div class="detail-item">
                <span class="label">Location:</span> <span class="value">${eventLocation}</span>
            </div>
        </div>
        
        <p>We're looking forward to seeing you there! Please arrive 15 minutes early for check-in.</p>
        
        <div style="text-align: center;">
            <a href="#" class="cta-button">View Your Ticket</a>
        </div>
    </div>
    
    <div class="footer">
        <p>© 2025 Boujee Events. All rights reserved.</p>
        <p>Questions? Contact us at support@boujeeevents.com</p>
    </div>
</body>
</html>`;
  }
}

// Export singleton instance
export const emailService = new EmailService();

export default emailService;