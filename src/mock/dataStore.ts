import AsyncStorage from '@react-native-async-storage/async-storage';
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
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_THERAPISTS,
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTIFICATION_SETTINGS,
  INITIAL_CLINIC_AVAILABILITY,
} from './initialData';

const STORAGE_KEYS = {
  CURRENT_USER: '@eloria_current_user',
  USERS: '@eloria_users',
  SERVICES: '@eloria_services',
  THERAPISTS: '@eloria_therapists',
  APPOINTMENTS: '@eloria_appointments',
  REVIEWS: '@eloria_reviews',
  NOTIFICATIONS: '@eloria_notifications',
  NOTIFICATION_SETTINGS: '@eloria_notification_settings',
  CLINIC_AVAILABILITY: '@eloria_clinic_availability',
};

export class EloriaDataStore {
  private static async getOrInitialize<T>(key: string, initialData: T): Promise<T> {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
      await AsyncStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    } catch {
      return initialData;
    }
  }

  // --- Auth / User ---
  static async getCurrentUser(): Promise<User> {
    const user = await this.getOrInitialize<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    return user;
  }

  static async setCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  static async getUsers(): Promise<User[]> {
    return this.getOrInitialize<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  // --- Services ---
  static async getServices(): Promise<MassageService[]> {
    return this.getOrInitialize<MassageService[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
  }

  static async addService(service: Omit<MassageService, 'id'>): Promise<MassageService> {
    const services = await this.getServices();
    const newService: MassageService = {
      ...service,
      id: `srv-${Date.now()}`,
    };
    const updated = [newService, ...services];
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    return newService;
  }

  static async updateService(id: string, updates: Partial<MassageService>): Promise<MassageService> {
    const services = await this.getServices();
    let updatedService: MassageService | null = null;
    const updated = services.map((s) => {
      if (s.id === id) {
        updatedService = { ...s, ...updates };
        return updatedService;
      }
      return s;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    if (!updatedService) throw new Error('Service not found');
    return updatedService;
  }

  static async toggleServiceActive(id: string): Promise<MassageService> {
    const services = await this.getServices();
    let result: MassageService | null = null;
    const updated = services.map((s) => {
      if (s.id === id) {
        result = { ...s, isActive: !s.isActive };
        return result;
      }
      return s;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    if (!result) throw new Error('Service not found');
    return result;
  }

  // --- Therapists ---
  static async getTherapists(): Promise<Therapist[]> {
    return this.getOrInitialize<Therapist[]>(STORAGE_KEYS.THERAPISTS, INITIAL_THERAPISTS);
  }

  // --- Appointments ---
  static async getAppointments(): Promise<Appointment[]> {
    return this.getOrInitialize<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }

  static async createAppointment(
    data: Omit<Appointment, 'id' | 'createdAt' | 'paymentStatus'> & {
      paymentStatus?: Appointment['paymentStatus'];
    }
  ): Promise<Appointment> {
    const list = await this.getAppointments();
    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
      paymentStatus: data.paymentStatus || 'paid',
    };
    const updated = [newAppointment, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));

    // Also add a notification
    await this.addNotification({
      title: 'Appointment Booked',
      message: `${newAppointment.serviceName} scheduled for ${newAppointment.date} at ${newAppointment.timeSlot}.`,
      timeAgo: 'Just now',
      type: 'booking',
      isRead: false,
      appointmentId: newAppointment.id,
    });

    return newAppointment;
  }

  static async updateAppointmentStatus(
    id: string,
    status: Appointment['status']
  ): Promise<Appointment> {
    const list = await this.getAppointments();
    let result: Appointment | null = null;
    const updated = list.map((a) => {
      if (a.id === id) {
        result = { ...a, status };
        return result;
      }
      return a;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
    if (!result) throw new Error('Appointment not found');

    if (status === 'cancelled') {
      await this.addNotification({
        title: 'Appointment Cancelled',
        message: `Your booking on ${(result as Appointment).date} has been cancelled.`,
        timeAgo: 'Just now',
        type: 'booking',
        isRead: false,
        appointmentId: id,
      });
    }
    return result;
  }

  static async rescheduleAppointment(
    id: string,
    newDate: string,
    newTimeSlot: string
  ): Promise<Appointment> {
    const list = await this.getAppointments();
    let result: Appointment | null = null;
    const updated = list.map((a) => {
      if (a.id === id) {
        result = { ...a, date: newDate, timeSlot: newTimeSlot, status: 'confirmed' as const };
        return result;
      }
      return a;
    });
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
    if (!result) throw new Error('Appointment not found');

    await this.addNotification({
      title: 'Appointment Rescheduled',
      message: `Updated to ${newDate} at ${newTimeSlot}.`,
      timeAgo: 'Just now',
      type: 'booking',
      isRead: false,
      appointmentId: id,
    });
    return result;
  }

  // --- Reviews ---
  static async getReviews(): Promise<ClientReview[]> {
    return this.getOrInitialize<ClientReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  }

  static async addReview(review: Omit<ClientReview, 'id' | 'createdAt'>): Promise<ClientReview> {
    const list = await this.getReviews();
    const newReview: ClientReview = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newReview, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
    return newReview;
  }

  // --- Notifications ---
  static async getNotifications(): Promise<NotificationItem[]> {
    return this.getOrInitialize<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static async addNotification(item: Omit<NotificationItem, 'id'>): Promise<NotificationItem> {
    const list = await this.getNotifications();
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
    };
    const updated = [newItem, ...list];
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    return newItem;
  }

  static async markNotificationRead(id: string): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  static async markAllNotificationsRead(): Promise<void> {
    const list = await this.getNotifications();
    const updated = list.map((n) => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  // --- Settings ---
  static async getNotificationSettings(): Promise<NotificationSettings> {
    return this.getOrInitialize<NotificationSettings>(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      INITIAL_NOTIFICATION_SETTINGS
    );
  }

  static async updateNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings> {
    const current = await this.getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(updated));
    return updated;
  }

  static async getClinicAvailability(): Promise<ClinicAvailabilitySettings> {
    return this.getOrInitialize<ClinicAvailabilitySettings>(
      STORAGE_KEYS.CLINIC_AVAILABILITY,
      INITIAL_CLINIC_AVAILABILITY
    );
  }

  static async updateClinicAvailability(
    settings: Partial<ClinicAvailabilitySettings>
  ): Promise<ClinicAvailabilitySettings> {
    const current = await this.getClinicAvailability();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.CLINIC_AVAILABILITY, JSON.stringify(updated));
    return updated;
  }

  // --- Reset demo data helper ---
  static async resetAllData(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    await AsyncStorage.setItem(STORAGE_KEYS.THERAPISTS, JSON.stringify(INITIAL_THERAPISTS));
    await AsyncStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    await AsyncStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(INITIAL_NOTIFICATION_SETTINGS));
    await AsyncStorage.setItem(STORAGE_KEYS.CLINIC_AVAILABILITY, JSON.stringify(INITIAL_CLINIC_AVAILABILITY));
  }
}
