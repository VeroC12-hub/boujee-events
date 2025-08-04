export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  preferences?: {
    events: boolean;
    vip: boolean;
    promotions: boolean;
  };
}

class NewsletterService {
  private static instance: NewsletterService;
  private subscribers: NewsletterSubscriber[] = [];

  private constructor() {
    this.loadSubscribersFromStorage();
  }

  public static getInstance(): NewsletterService {
    if (!NewsletterService.instance) {
      NewsletterService.instance = new NewsletterService();
    }
    return NewsletterService.instance;
  }

  private loadSubscribersFromStorage(): void {
    try {
      const savedSubscribers = localStorage.getItem('newsletterSubscribers');
      if (savedSubscribers) {
        this.subscribers = JSON.parse(savedSubscribers);
      }
    } catch (error) {
      console.error('Failed to load newsletter subscribers:', error);
      this.subscribers = [];
    }
  }

  private saveSubscribersToStorage(): void {
    try {
      localStorage.setItem('newsletterSubscribers', JSON.stringify(this.subscribers));
    } catch (error) {
      console.error('Failed to save newsletter subscribers:', error);
    }
  }

  public async subscribe(email: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, message: 'Please enter a valid email address' };
      }

      // Check if already subscribed
      const existingSubscriber = this.subscribers.find(sub => 
        sub.email.toLowerCase() === email.toLowerCase() && sub.status === 'active'
      );

      if (existingSubscriber) {
        return { success: false, message: 'This email is already subscribed to our newsletter' };
      }

      // Add new subscriber
      const newSubscriber: NewsletterSubscriber = {
        id: Date.now().toString(),
        email: email.toLowerCase(),
        subscribedAt: new Date().toISOString(),
        status: 'active',
        preferences: {
          events: true,
          vip: true,
          promotions: true
        }
      };

      this.subscribers.push(newSubscriber);
      this.saveSubscribersToStorage();

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return { 
        success: true, 
        message: 'Successfully subscribed! Welcome to Boujee Events newsletter.' 
      };
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      return { 
        success: false, 
        message: 'An error occurred. Please try again later.' 
      };
    }
  }

  public getActiveSubscriberCount(): number {
    return this.subscribers.filter(sub => sub.status === 'active').length;
  }

  public getAllSubscribers(): NewsletterSubscriber[] {
    return this.subscribers;
  }

  public unsubscribe(email: string): boolean {
    const subscriberIndex = this.subscribers.findIndex(sub => 
      sub.email.toLowerCase() === email.toLowerCase()
    );

    if (subscriberIndex !== -1) {
      this.subscribers[subscriberIndex].status = 'unsubscribed';
      this.saveSubscribersToStorage();
      return true;
    }

    return false;
  }

  public getSubscriberStats() {
    const active = this.subscribers.filter(sub => sub.status === 'active').length;
    const total = this.subscribers.length;
    const unsubscribed = total - active;

    return {
      activeSubscribers: active,
      totalSubscribers: total,
      unsubscribedCount: unsubscribed,
      subscriptionRate: total > 0 ? (active / total) * 100 : 0
    };
  }
}

export const newsletterService = NewsletterService.getInstance();