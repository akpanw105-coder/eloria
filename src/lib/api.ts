import { supabase } from './supabase';
import {
  User,
  MassageService,
  Therapist,
  Appointment,
  ClientReview,
  NotificationItem,
  NotificationSettings,
  ClinicAvailabilitySettings,
} from '../types';
import { INITIAL_SERVICES, INITIAL_THERAPISTS } from '../mock/initialData';

// ==========================================
// Mappers: Database (snake_case) <-> Frontend (camelCase)
// ==========================================

export function mapProfileToUser(row: any): User {
  const memberDate = row.member_since ? new Date(row.member_since) : new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const memberSinceFormatted = `${monthNames[memberDate.getMonth()]} ${memberDate.getFullYear()}`;

  // Enforce admin role if email is admin@gmail.com
  const isDedicatedAdmin = row.email?.toLowerCase() === 'admin@gmail.com';
  const role = isDedicatedAdmin ? 'admin' : (row.role === 'admin' ? 'admin' : 'customer');

  return {
    id: row.id,
    name: row.full_name || (isDedicatedAdmin ? 'Eloria Administrator' : 'Sanctuary Client'),
    email: row.email || '',
    phone: row.phone || '',
    role,
    avatarUrl: '',
    memberSince: memberSinceFormatted,
    notes: row.notes || undefined,
  };
}

export function mapService(row: any): MassageService {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline || '',
    description: row.description || '',
    durationMinutes: row.duration_minutes || 60,
    price: Number(row.price) || 0,
    iconName: row.icon_name || 'sparkles-outline',
    badge: row.badge || '',
    isActive: row.is_active ?? true,
  };
}

export function mapTherapist(row: any): Therapist {
  return {
    id: row.id,
    name: row.name,
    title: row.title || 'Massage Therapist',
    rating: Number(row.rating) || 5.0,
    reviewsCount: row.reviews_count || 0,
    avatarUrl: '',
    specialties: Array.isArray(row.specialties) ? row.specialties : [],
    bio: row.bio || '',
  };
}

export function mapAppointment(row: any): Appointment {
  const service = row.services;
  const therapist = row.therapists;
  const profile = row.profiles;

  const appointmentDate = typeof row.appointment_date === 'string' ? row.appointment_date.split('T')[0] : '';

  return {
    id: row.id,
    customerId: row.customer_id || '',
    customerName: profile?.full_name || 'Client',
    customerEmail: profile?.email || '',
    customerPhone: profile?.phone || '',
    serviceId: row.service_id || '',
    serviceName: service?.name || 'Massage Therapy',
    durationMinutes: service?.duration_minutes || 60,
    price: Number(row.price) || (service ? Number(service.price) : 0),
    therapistId: row.therapist_id || null,
    therapistName: therapist?.name || (row.therapist_id ? 'Specialist' : 'Any Available Therapist'),
    therapistAvatar: '',
    date: appointmentDate,
    timeSlot: row.time_slot,
    status: row.status || 'pending',
    location: row.location || 'Eloria Wellness Suite A',
    notes: row.notes || undefined,
    createdAt: row.created_at,
    paidAmount: Number(row.paid_amount) || 0,
    paymentMethod: row.payment_method || 'card',
    paymentStatus: row.payment_status || 'pending',
  };
}

export function mapReview(row: any): ClientReview {
  return {
    id: row.id,
    appointmentId: row.appointment_id || '',
    customerId: row.customer_id,
    customerName: row.customer_name || 'Guest',
    therapistName: row.therapist_name || 'Specialist',
    serviceName: row.service_name || 'Treatment',
    rating: Number(row.rating) || 5,
    comment: row.comment || '',
    createdAt: row.created_at,
  };
}

export function mapNotification(row: any): NotificationItem {
  const created = new Date(row.created_at);
  const diffSec = Math.floor((Date.now() - created.getTime()) / 1000);
  let timeAgo = 'Just now';
  if (diffSec >= 86400) {
    const days = Math.floor(diffSec / 86400);
    timeAgo = `${days}d ago`;
  } else if (diffSec >= 3600) {
    const hrs = Math.floor(diffSec / 3600);
    timeAgo = `${hrs}h ago`;
  } else if (diffSec >= 60) {
    const mins = Math.floor(diffSec / 60);
    timeAgo = `${mins}m ago`;
  }

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    timeAgo,
    type: row.type || 'booking',
    isRead: row.is_read ?? false,
    appointmentId: row.appointment_id || undefined,
  };
}

export function mapNotificationSettings(row: any): NotificationSettings {
  if (!row) {
    return {
      emailReminders: true,
      smsAlerts: true,
      bookingUpdates: true,
      promotions: false,
      reminderHoursAhead: 2, // 2-hour reminder requirement
    };
  }
  return {
    emailReminders: row.email_reminders ?? true,
    smsAlerts: row.sms_alerts ?? true,
    bookingUpdates: row.booking_updates ?? true,
    promotions: row.promotions ?? false,
    reminderHoursAhead: row.reminder_hours_ahead ?? 2,
  };
}

export function mapBusinessSettings(row: any): ClinicAvailabilitySettings {
  if (!row) {
    return {
      openTime: '08:00 AM',
      closeTime: '08:00 PM',
      slotDurationMinutes: 60,
      daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      allowSameDayBooking: true,
      maxAdvanceDays: 30,
    };
  }
  return {
    openTime: row.open_time || '08:00 AM',
    closeTime: row.close_time || '08:00 PM',
    slotDurationMinutes: row.slot_duration_minutes || 60,
    daysOpen: Array.isArray(row.days_open) ? row.days_open : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    allowSameDayBooking: row.allow_same_day_booking ?? true,
    maxAdvanceDays: row.max_advance_days ?? 30,
  };
}

// ==========================================
// Data Access API
// ==========================================

export const EloriaApi = {
  // Profiles
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('EloriaApi.getProfile error:', error.message);
      return null;
    }
    return data ? mapProfileToUser(data) : null;
  },

  async getAllProfiles(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('EloriaApi.getAllProfiles error:', error.message);
      return [];
    }
    return (data || []).map(mapProfileToUser);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.full_name = updates.name;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.notes !== undefined) dbPayload.notes = updates.notes;

    const { error } = await supabase
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId);

    if (error) throw error;
  },

  // Services
  async getServices(includeInactive = false): Promise<MassageService[]> {
    let query = supabase.from('services').select('*').order('name');
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    const { data, error } = await query;
    if (error) {
      console.warn('EloriaApi.getServices error:', error.message);
      return INITIAL_SERVICES;
    }
    if (!data || data.length === 0) {
      return INITIAL_SERVICES;
    }
    return data.map(mapService);
  },

  async saveService(service: Partial<MassageService> & { name: string; price: number; durationMinutes: number }): Promise<MassageService> {
    const payload: any = {
      name: service.name,
      tagline: service.tagline || `${service.durationMinutes} min therapy`,
      description: service.description || '',
      duration_minutes: service.durationMinutes,
      price: service.price,
      icon_name: service.iconName || 'sparkles-outline',
      badge: service.badge || 'Therapeutic',
      is_active: service.isActive ?? true,
    };

    if (service.id && !service.id.startsWith('srv-')) {
      const { data, error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', service.id)
        .select()
        .single();
      if (error) throw error;
      return mapService(data);
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return mapService(data);
    }
  },

  async toggleService(id: string): Promise<void> {
    const { data, error } = await supabase.from('services').select('is_active').eq('id', id).single();
    if (error) throw error;
    const { error: updateError } = await supabase
      .from('services')
      .update({ is_active: !data.is_active })
      .eq('id', id);
    if (updateError) throw updateError;
  },

  // Therapists
  async getTherapists(): Promise<Therapist[]> {
    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .eq('is_active', true)
      .order('rating', { ascending: false });

    if (error) {
      console.warn('EloriaApi.getTherapists error:', error.message);
      return INITIAL_THERAPISTS;
    }
    if (!data || data.length === 0) {
      return INITIAL_THERAPISTS;
    }
    return data.map(mapTherapist);
  },

  // Appointments
  async getAppointments(customerId?: string, isAdmin = false): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        services:service_id ( id, name, duration_minutes, price ),
        therapists:therapist_id ( id, name ),
        profiles:customer_id ( id, full_name, email, phone )
      `)
      .order('appointment_date', { ascending: false });

    if (!isAdmin && customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('EloriaApi.getAppointments error:', error.message);
      return [];
    }
    return (data || []).map(mapAppointment);
  },

  async createAppointment(data: {
    customerId: string;
    serviceId: string;
    therapistId: string | null;
    date: string; // YYYY-MM-DD
    timeSlot: string; // e.g. "10:30 AM"
    price: number;
    notes?: string;
    location?: string;
    paymentMethod: Appointment['paymentMethod'];
    paymentStatus?: Appointment['paymentStatus'];
    status?: Appointment['status'];
  }): Promise<Appointment> {
    // Check for double booking conflicts on the same therapist, date, and timeSlot
    if (data.therapistId && data.date && data.timeSlot) {
      const { data: conflicts, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('therapist_id', data.therapistId)
        .eq('appointment_date', data.date)
        .eq('time_slot', data.timeSlot)
        .neq('status', 'cancelled')
        .neq('status', 'rejected');

      if (!checkError && conflicts && conflicts.length > 0) {
        throw new Error('This specialist is already booked for that time slot. Please choose another time.');
      }
    }

    const dbPayload = {
      customer_id: data.customerId,
      service_id: data.serviceId,
      therapist_id: data.therapistId || null,
      appointment_date: data.date,
      time_slot: data.timeSlot,
      price: data.price,
      paid_amount: data.paymentStatus === 'paid' ? data.price : 0,
      payment_method: data.paymentMethod || 'card',
      payment_status: data.paymentStatus || 'pending',
      status: data.status || 'pending',
      location: data.location || 'Eloria Wellness Suite A',
      notes: data.notes || '',
    };

    const { data: inserted, error } = await supabase
      .from('appointments')
      .insert(dbPayload)
      .select(`
        *,
        services:service_id ( id, name, duration_minutes, price ),
        therapists:therapist_id ( id, name ),
        profiles:customer_id ( id, full_name, email, phone )
      `)
      .single();

    if (error) throw error;

    // Create a confirmation notification for the client
    await this.addNotification({
      userId: data.customerId,
      title: 'Booking Request Received',
      message: `Your appointment request for ${data.date} at ${data.timeSlot} has been submitted. Status: Pending confirmation.`,
      type: 'booking',
      appointmentId: inserted.id,
    }).catch((e) => console.warn('Failed to insert notification:', e));

    return mapAppointment(inserted);
  },

  async updateAppointmentStatus(
    id: string,
    status: Appointment['status'],
    adminNotes?: string,
    therapistId?: string | null
  ): Promise<void> {
    const payload: any = { status, updated_at: new Date().toISOString() };
    if (therapistId !== undefined) {
      payload.therapist_id = therapistId;
    }
    if (adminNotes !== undefined) {
      payload.notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select('customer_id, appointment_date, time_slot')
      .single();

    if (error) throw error;

    if (data?.customer_id) {
      let title = 'Booking Update';
      let message = `Your appointment on ${data.appointment_date} status has been updated to: ${status.toUpperCase()}.`;
      if (status === 'confirmed') {
        title = 'Appointment Confirmed!';
        message = `Your booking on ${data.appointment_date} at ${data.time_slot} is now confirmed. We look forward to welcoming you.`;
      } else if (status === 'rejected') {
        title = 'Appointment Request Declined';
        message = `Your booking request for ${data.appointment_date} could not be confirmed. Please contact us or select another time.`;
      } else if (status === 'cancelled') {
        title = 'Appointment Cancelled';
        message = `Your booking on ${data.appointment_date} has been cancelled.`;
      }

      await this.addNotification({
        userId: data.customer_id,
        title,
        message,
        type: 'booking',
        appointmentId: id,
      }).catch((e) => console.warn('Failed to insert status notification:', e));
    }
  },

  async rescheduleAppointment(
    id: string,
    newDate: string,
    newTimeSlot: string,
    therapistId?: string | null,
    customerId?: string
  ): Promise<void> {
    // Conflict check
    if (therapistId) {
      const { data: conflicts } = await supabase
        .from('appointments')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('appointment_date', newDate)
        .eq('time_slot', newTimeSlot)
        .neq('status', 'cancelled')
        .neq('status', 'rejected')
        .neq('id', id);

      if (conflicts && conflicts.length > 0) {
        throw new Error('This time slot is unavailable for the selected specialist. Please choose another time.');
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        time_slot: newTimeSlot,
        status: 'pending', // Re-enter pending verification upon reschedule
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('customer_id')
      .single();

    if (error) throw error;

    const targetUserId = customerId || data?.customer_id;
    if (targetUserId) {
      await this.addNotification({
        userId: targetUserId,
        title: 'Appointment Rescheduled',
        message: `Your booking has been updated to ${newDate} at ${newTimeSlot} (pending confirmation).`,
        type: 'booking',
        appointmentId: id,
      }).catch((e) => console.warn('Failed to insert reschedule notification:', e));
    }
  },

  // Reviews
  async getReviews(): Promise<ClientReview[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('EloriaApi.getReviews error:', error.message);
      return [];
    }
    return (data || []).map(mapReview);
  },

  async addReview(review: Omit<ClientReview, 'id' | 'createdAt'>): Promise<ClientReview> {
    const dbPayload = {
      appointment_id: review.appointmentId || null,
      customer_id: review.customerId,
      customer_name: review.customerName,
      therapist_name: review.therapistName,
      service_name: review.serviceName,
      rating: review.rating,
      comment: review.comment,
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return mapReview(data);
  },

  // Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('EloriaApi.getNotifications error:', error.message);
      return [];
    }
    return (data || []).map(mapNotification);
  },

  async addNotification(params: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    appointmentId?: string;
  }): Promise<void> {
    const { error } = await supabase.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'booking',
      appointment_id: params.appointmentId || null,
      is_read: false,
    });
    if (error) console.warn('addNotification error:', error.message);
  },

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw error;
  },

  async markAllNotificationsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
  },

  // Business Settings
  async getBusinessSettings(): Promise<ClinicAvailabilitySettings> {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) console.warn('getBusinessSettings error:', error.message);
    return mapBusinessSettings(data);
  },

  async updateBusinessSettings(settings: Partial<ClinicAvailabilitySettings>): Promise<void> {
    const dbPayload: any = {};
    if (settings.openTime !== undefined) dbPayload.open_time = settings.openTime;
    if (settings.closeTime !== undefined) dbPayload.close_time = settings.closeTime;
    if (settings.slotDurationMinutes !== undefined) dbPayload.slot_duration_minutes = settings.slotDurationMinutes;
    if (settings.daysOpen !== undefined) dbPayload.days_open = settings.daysOpen;
    if (settings.allowSameDayBooking !== undefined) dbPayload.allow_same_day_booking = settings.allowSameDayBooking;
    if (settings.maxAdvanceDays !== undefined) dbPayload.max_advance_days = settings.maxAdvanceDays;

    const { error } = await supabase
      .from('business_settings')
      .update(dbPayload)
      .eq('id', 1);

    if (error) throw error;
  },
};
