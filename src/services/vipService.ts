import { supabase } from '../lib/supabase';
import type {
  VIPTier,
  EventVIPConfig,
  CreateEventVIPConfigRequest,
  UpdateEventVIPConfigRequest,
  VIPBooking,
  VIPService as VIPServiceType,
  VIPPackage,
  VIPReservation,
  VIPAnalytics,
  VIPMember
} from '../types/vip';
import { DEFAULT_VIP_TIERS } from '../types/vip';

export class VIPService {
  private static instance: VIPService;

  private constructor() {}

  public static getInstance(): VIPService {
    if (!VIPService.instance) {
      VIPService.instance = new VIPService();
    }
    return VIPService.instance;
  }

  // VIP Tier Management
  async getVIPTiers(): Promise<VIPTier[]> {
    try {
      if (!supabase) {
        // Return mock data when Supabase is not available
        return DEFAULT_VIP_TIERS.map((tier, index) => ({
          ...tier,
          id: `tier_${index + 1}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      }

      const { data, error } = await supabase
        .from('vip_tiers')
        .select('*')
        .eq('isActive', true)
        .order('priority');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VIP tiers:', error);
      return [];
    }
  }

  async createVIPTier(tierData: Omit<VIPTier, 'id' | 'created_at' | 'updated_at'>): Promise<VIPTier | null> {
    try {
      if (!supabase) {
        // Mock creation
        const newTier: VIPTier = {
          ...tierData,
          id: `tier_${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return newTier;
      }

      const { data, error } = await supabase
        .from('vip_tiers')
        .insert([tierData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating VIP tier:', error);
      return null;
    }
  }

  async updateVIPTier(tierId: string, updates: Partial<VIPTier>): Promise<VIPTier | null> {
    try {
      if (!supabase) {
        // Mock update
        return {
          id: tierId,
          ...updates,
          updated_at: new Date().toISOString()
        } as VIPTier;
      }

      const { data, error } = await supabase
        .from('vip_tiers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', tierId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating VIP tier:', error);
      return null;
    }
  }

  async deleteVIPTier(tierId: string): Promise<boolean> {
    try {
      if (!supabase) {
        return true; // Mock success
      }

      const { error } = await supabase
        .from('vip_tiers')
        .delete()
        .eq('id', tierId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting VIP tier:', error);
      return false;
    }
  }

  // Event VIP Configuration
  async getEventVIPConfig(eventId: string): Promise<EventVIPConfig[]> {
    try {
      if (!supabase) {
        // Mock event VIP config
        return [
          {
            id: `config_${eventId}_1`,
            eventId,
            tierName: 'VIP Gold',
            tierDescription: 'Premium experience with exclusive benefits',
            price: 299,
            maxCapacity: 50,
            currentBookings: 23,
            benefits: ['Priority entry', 'Complimentary drinks', 'VIP seating'],
            priority: 1,
            color: '#FFD700',
            icon: '🥇',
            isActive: true,
            earlyAccess: true,
            exclusiveContent: true,
            personalizedService: false,
            premiumLocation: true,
            giftPackage: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
      }

      const { data, error } = await supabase
        .from('event_vip_configs')
        .select('*')
        .eq('eventId', eventId)
        .eq('isActive', true)
        .order('priority');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching event VIP config:', error);
      return [];
    }
  }

  async createEventVIPConfig(configData: CreateEventVIPConfigRequest): Promise<EventVIPConfig | null> {
    try {
      if (!supabase) {
        // Mock creation
        const newConfig: EventVIPConfig = {
          id: `config_${Date.now()}`,
          ...configData,
          tierDescription: configData.tierDescription || '',
          currentBookings: 0,
          priority: configData.priority || 1,
          color: configData.color || '#FFD700',
          icon: configData.icon || '⭐',
          isActive: configData.isActive !== false,
          earlyAccess: configData.earlyAccess || false,
          exclusiveContent: configData.exclusiveContent || false,
          personalizedService: configData.personalizedService || false,
          premiumLocation: configData.premiumLocation || false,
          giftPackage: configData.giftPackage || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return newConfig;
      }

      const { data, error } = await supabase
        .from('event_vip_configs')
        .insert([{
          ...configData,
          currentBookings: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event VIP config:', error);
      return null;
    }
  }

  async updateEventVIPConfig(configId: string, updates: UpdateEventVIPConfigRequest): Promise<EventVIPConfig | null> {
    try {
      if (!supabase) {
        // Mock update
        return {
          id: configId,
          ...updates,
          updated_at: new Date().toISOString()
        } as EventVIPConfig;
      }

      const { data, error } = await supabase
        .from('event_vip_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event VIP config:', error);
      return null;
    }
  }

  async deleteEventVIPConfig(configId: string): Promise<boolean> {
    try {
      if (!supabase) {
        return true; // Mock success
      }

      const { error } = await supabase
        .from('event_vip_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event VIP config:', error);
      return false;
    }
  }

  // VIP Bookings
  async getVIPBookings(eventId?: string, userId?: string): Promise<VIPBooking[]> {
    try {
      if (!supabase) {
        return []; // Mock empty bookings
      }

      let query = supabase
        .from('vip_bookings')
        .select(`
          *,
          user:users(*),
          vipConfig:event_vip_configs(*)
        `);

      if (eventId) {
        query = query.eq('eventId', eventId);
      }

      if (userId) {
        query = query.eq('userId', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VIP bookings:', error);
      return [];
    }
  }

  async createVIPBooking(bookingData: Omit<VIPBooking, 'id' | 'created_at' | 'updated_at'>): Promise<VIPBooking | null> {
    try {
      if (!supabase) {
        // Mock booking creation
        const newBooking: VIPBooking = {
          ...bookingData,
          id: `booking_${Date.now()}`,
          bookingNumber: `VIP${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return newBooking;
      }

      const { data, error } = await supabase
        .from('vip_bookings')
        .insert([{
          ...bookingData,
          bookingNumber: `VIP${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating VIP booking:', error);
      return null;
    }
  }

  async updateVIPBooking(bookingId: string, updates: Partial<VIPBooking>): Promise<VIPBooking | null> {
    try {
      if (!supabase) {
        return {
          id: bookingId,
          ...updates,
          updated_at: new Date().toISOString()
        } as VIPBooking;
      }

      const { data, error } = await supabase
        .from('vip_bookings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating VIP booking:', error);
      return null;
    }
  }

  // VIP Services
  async getVIPServices(category?: string): Promise<VIPServiceType[]> {
    try {
      if (!supabase) {
        // Mock VIP services
        return [
          {
            id: 'service_1',
            name: 'Premium Dining',
            description: 'Gourmet dining experience',
            category: 'dining',
            price: 150,
            isIncluded: false,
            isOptional: true,
            maxQuantity: 4,
            icon: '🍽️',
            provider: 'Elite Catering',
            isActive: true
          },
          {
            id: 'service_2',
            name: 'Private Transportation',
            description: 'Luxury vehicle service',
            category: 'transportation',
            price: 200,
            isIncluded: true,
            isOptional: false,
            icon: '🚗',
            provider: 'Luxury Cars Inc',
            isActive: true
          }
        ];
      }

      let query = supabase
        .from('vip_services')
        .select('*')
        .eq('isActive', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VIP services:', error);
      return [];
    }
  }

  async createVIPService(serviceData: Omit<VIPServiceType, 'id'>): Promise<VIPServiceType | null> {
    try {
      if (!supabase) {
        const newService: VIPServiceType = {
          ...serviceData,
          id: `service_${Date.now()}`
        };
        return newService;
      }

      const { data, error } = await supabase
        .from('vip_services')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating VIP service:', error);
      return null;
    }
  }

  // VIP Packages
  async getVIPPackages(eventId?: string): Promise<VIPPackage[]> {
    try {
      if (!supabase) {
        return []; // Mock empty packages
      }

      let query = supabase
        .from('vip_packages')
        .select(`
          *,
          services:vip_services(*)
        `)
        .eq('isActive', true);

      if (eventId) {
        query = query.eq('eventId', eventId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VIP packages:', error);
      return [];
    }
  }

  // VIP Reservations
  async getVIPReservations(eventId: string): Promise<VIPReservation[]> {
    try {
      if (!supabase) {
        return []; // Mock empty reservations
      }

      const { data, error } = await supabase
        .from('vip_reservations')
        .select('*')
        .eq('eventId', eventId)
        .order('reservedAt');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VIP reservations:', error);
      return [];
    }
  }

  async createVIPReservation(reservationData: Omit<VIPReservation, 'id'>): Promise<VIPReservation | null> {
    try {
      if (!supabase) {
        const newReservation: VIPReservation = {
          ...reservationData,
          id: `reservation_${Date.now()}`
        };
        return newReservation;
      }

      const { data, error } = await supabase
        .from('vip_reservations')
        .insert([reservationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating VIP reservation:', error);
      return null;
    }
  }

  // VIP Analytics
  async getVIPAnalytics(eventId: string): Promise<VIPAnalytics | null> {
    try {
      if (!supabase) {
        // Mock analytics
        return {
          eventId,
          totalVIPRevenue: 45000,
          totalVIPBookings: 150,
          averageVIPSpend: 300,
          conversionRate: 0.15,
          tierPerformance: {
            'tier_1': {
              bookings: 75,
              revenue: 22500,
              occupancyRate: 0.85,
              averageRating: 4.7
            },
            'tier_2': {
              bookings: 50,
              revenue: 15000,
              occupancyRate: 0.70,
              averageRating: 4.5
            }
          },
          topServices: [
            {
              serviceId: 'service_1',
              serviceName: 'Premium Dining',
              bookingCount: 120,
              revenue: 18000
            }
          ],
          customerSatisfaction: {
            averageRating: 4.6,
            totalReviews: 145,
            ratingDistribution: {
              5: 89,
              4: 45,
              3: 8,
              2: 2,
              1: 1
            }
          }
        };
      }

      // Complex analytics query would go here
      // For now, return mock data
      return null;
    } catch (error) {
      console.error('Error fetching VIP analytics:', error);
      return null;
    }
  }

  // VIP Membership
  async getVIPMembers(): Promise<VIPMember[]> {
    try {
      if (!supabase) {
        return []; // Mock empty members
      }

      const { data, error } = await supabase
        .from('vip_members')
        .select('*')
        .eq('isActive', true)
        .order('totalSpent', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching VIP members:', error);
      return [];
    }
  }

  async createVIPMember(memberData: Omit<VIPMember, 'id'>): Promise<VIPMember | null> {
    try {
      if (!supabase) {
        const newMember: VIPMember = {
          ...memberData,
          id: `member_${Date.now()}`
        };
        return newMember;
      }

      const { data, error } = await supabase
        .from('vip_members')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating VIP member:', error);
      return null;
    }
  }

  async updateVIPMember(memberId: string, updates: Partial<VIPMember>): Promise<VIPMember | null> {
    try {
      if (!supabase) {
        return {
          id: memberId,
          ...updates
        } as VIPMember;
      }

      const { data, error } = await supabase
        .from('vip_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating VIP member:', error);
      return null;
    }
  }

  // Utility methods
  async checkVIPAvailability(eventId: string, tierName: string): Promise<{ available: boolean; remaining: number }> {
    try {
      const configs = await this.getEventVIPConfig(eventId);
      const config = configs.find(c => c.tierName === tierName);
      
      if (!config) {
        return { available: false, remaining: 0 };
      }

      const remaining = config.maxCapacity - config.currentBookings;
      return {
        available: remaining > 0,
        remaining: Math.max(0, remaining)
      };
    } catch (error) {
      console.error('Error checking VIP availability:', error);
      return { available: false, remaining: 0 };
    }
  }

  async calculateVIPPrice(eventId: string, tierName: string, quantity: number = 1): Promise<number> {
    try {
      const configs = await this.getEventVIPConfig(eventId);
      const config = configs.find(c => c.tierName === tierName);
      
      if (!config) {
        return 0;
      }

      return config.price * quantity;
    } catch (error) {
      console.error('Error calculating VIP price:', error);
      return 0;
    }
  }

  async getVIPBenefits(eventId: string, tierName: string): Promise<string[]> {
    try {
      const configs = await this.getEventVIPConfig(eventId);
      const config = configs.find(c => c.tierName === tierName);
      
      return config?.benefits || [];
    } catch (error) {
      console.error('Error fetching VIP benefits:', error);
      return [];
    }
  }
}

// Export singleton instance
export const vipService = VIPService.getInstance();
