// src/services/bookingStats.ts
import { supabase } from '../lib/supabase';

export type BookingPoint = {
  created_at: string;
  total_amount: number;
};

export async function fetchBookingStatsSince(dateISO?: string) {
  // Always select columns we know are real: amount, quantity, created_at.
  // We’ll compute total_amount in the app.
  let query = supabase
    .from('bookings')
    .select('amount, quantity, created_at', { head: false });

  if (dateISO) {
    query = query.gte('created_at', dateISO);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch bookings:', error);
    throw error;
  }

  const points: BookingPoint[] = (data || []).map((row: any) => ({
    created_at: row.created_at,
    total_amount: Number(row.quantity ?? 0) * Number(row.amount ?? 0),
  }));

  // Example aggregates you might need for cards/charts:
  const totalRevenue = points.reduce((sum, p) => sum + p.total_amount, 0);
  const totalBookings = points.length;

  return { points, totalRevenue, totalBookings };
}
