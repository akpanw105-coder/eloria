export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  memberSince: string;
  notes?: string;
}

export interface MassageService {
  id: string;
  name: string;
  tagline: string;
  description: string;
  durationMinutes: number;
  price: number; // in NGN (Nigerian Naira)
  iconName: string;
  badge: string;
  isActive: boolean;
}

export interface Therapist {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewsCount: number;
  avatarUrl?: string;
  specialties: string[];
  bio: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'card' | 'bank_transfer' | 'apple_pay' | 'cash';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
  therapistId: string | null;
  therapistName: string;
  therapistAvatar?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  location: string;
  notes?: string;
  createdAt: string;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface ClientReview {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  therapistName: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'booking' | 'reminder' | 'payment' | 'system';
  isRead: boolean;
  appointmentId?: string;
}

export interface NotificationSettings {
  emailReminders: boolean;
  smsAlerts: boolean;
  bookingUpdates: boolean;
  promotions: boolean;
  reminderHoursAhead: number;
}

export interface ClinicAvailabilitySettings {
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  daysOpen: string[];
  allowSameDayBooking: boolean;
  maxAdvanceDays: number;
}
