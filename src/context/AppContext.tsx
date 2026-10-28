import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
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
import { supabase } from '../lib/supabase';
import { EloriaApi } from '../lib/api';

interface AppContextType {
  currentUser: User | null;
  authUser: SupabaseAuthUser | null;
  allUsers: User[];
  services: MassageService[];
  therapists: Therapist[];
  appointments: Appointment[];
  reviews: ClientReview[];
  notifications: NotificationItem[];
  notificationSettings: NotificationSettings | null;
  clinicAvailability: ClinicAvailabilitySettings | null;
  isLoading: boolean;
  authError: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  loginAs: (role: 'customer' | 'admin', email?: string) => Promise<void>;
  logout: () => Promise<void>;
  createBooking: (
    data: Omit<Appointment, 'id' | 'createdAt' | 'paymentStatus'> & {
      paymentStatus?: Appointment['paymentStatus'];
    }
  ) => Promise<Appointment>;
  updateBookingStatus: (id: string, status: Appointment['status']) => Promise<void>;
  rescheduleBooking: (id: string, newDate: string, newTimeSlot: string) => Promise<void>;
  submitReview: (review: Omit<ClientReview, 'id' | 'createdAt'>) => Promise<void>;
  saveService: (service: Partial<MassageService> & { name: string; price: number; durationMinutes: number }) => Promise<void>;
  toggleService: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateNotificationPreferences: (settings: Partial<NotificationSettings>) => Promise<void>;
  updateClinicSettings: (settings: Partial<ClinicAvailabilitySettings>) => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [services, setServices] = useState<MassageService[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<ClientReview[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [clinicAvailability, setClinicAvailability] = useState<ClinicAvailabilitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Load public / common data
  const loadCommonData = useCallback(async () => {
    try {
      const [s, t, r, ca] = await Promise.all([
        EloriaApi.getServices(true),
        EloriaApi.getTherapists(),
        EloriaApi.getReviews(),
        EloriaApi.getBusinessSettings(),
      ]);
      setServices(s);
      setTherapists(t);
      setReviews(r);
      setClinicAvailability(ca);
    } catch (err) {
      console.warn('Error loading common Eloria data:', err);
    }
  }, []);

  // Load user-specific data (appointments, notifications, settings, or admin full data)
  const loadUserData = useCallback(async (user: User) => {
    try {
      const isAdmin = user.role === 'admin';
      const [apts, notifs, ns, profiles] = await Promise.all([
        EloriaApi.getAppointments(user.id, isAdmin),
        EloriaApi.getNotifications(user.id),
        EloriaApi.getNotificationSettings(user.id),
        isAdmin ? EloriaApi.getAllProfiles() : Promise.resolve([user]),
      ]);

      setAppointments(apts);
      setNotifications(notifs);
      setNotificationSettings(ns);
      if (isAdmin) {
        setAllUsers(profiles);
      } else {
        setAllUsers([user]);
      }
    } catch (err) {
      console.warn('Error loading user data:', err);
    }
  }, []);

  // Fetch or construct profile for current session
  const syncSessionUser = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setAuthUser(null);
      setCurrentUser(null);
      setAppointments([]);
      setNotifications([]);
      return;
    }

    setAuthUser(session.user);
    const userId = session.user.id;

    // Fetch profile from database
    let profile = await EloriaApi.getProfile(userId);

    // If trigger hasn't finished yet or record not found, retry once or use metadata
    if (!profile) {
      await new Promise((r) => setTimeout(r, 600));
      profile = await EloriaApi.getProfile(userId);
    }

    if (!profile) {
      // Fallback constructed user
      profile = {
        id: userId,
        name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Sanctuary Client',
        email: session.user.email || '',
        phone: '',
        role: (session.user.user_metadata?.role as any) || 'customer',
        memberSince: 'Today',
      };
    }

    setCurrentUser(profile);
    await loadUserData(profile);
  }, [loadUserData]);

  // Initial mount: load public catalog and session
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setIsLoading(true);
      await loadCommonData();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          await syncSessionUser(session);
        }
      } catch (e) {
        console.warn('Session init error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    init();

    // Listen to Auth State Changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        await syncSessionUser(session);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadCommonData, syncSessionUser]);

  // Refresh everything
  const refreshAll = useCallback(async () => {
    await loadCommonData();
    if (currentUser) {
      const p = await EloriaApi.getProfile(currentUser.id);
      if (p) {
        setCurrentUser(p);
        await loadUserData(p);
      } else {
        await loadUserData(currentUser);
      }
    }
  }, [currentUser, loadCommonData, loadUserData]);

  // Sign In with email and password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.session) {
        await syncSessionUser(data.session);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Up with email, password, and full name
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || 'Sanctuary Client',
            role: 'customer',
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.session) {
        await syncSessionUser(data.session);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to create account';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setAuthUser(null);
    setCurrentUser(null);
    setAppointments([]);
    setNotifications([]);
  };

  // Legacy demo helper / role switcher
  const loginAs = async (role: 'customer' | 'admin', email?: string) => {
    const targetEmail = email || (role === 'admin' ? 'marcus.sterling@eloriawellness.com' : 'elena.vance@example.com');
    const demoPassword = 'Password123!';

    // Attempt sign in with demo credentials
    const res = await signIn(targetEmail, demoPassword);
    if (!res.success) {
      // If demo user doesn't exist yet, attempt automatic sign up
      const fullName = role === 'admin' ? 'Marcus Sterling' : 'Elena Vance';
      const upRes = await signUp(targetEmail, demoPassword, fullName);
      if (!upRes.success) {
        console.warn('Quick login signup note:', upRes.error);
      }
    }
  };

  // Appointments
  const createBooking = async (
    data: Omit<Appointment, 'id' | 'createdAt' | 'paymentStatus'> & {
      paymentStatus?: Appointment['paymentStatus'];
    }
  ): Promise<Appointment> => {
    const customerId = currentUser?.id || data.customerId;
    const newApt = await EloriaApi.createAppointment({
      ...data,
      customerId,
      customerName: currentUser?.name || data.customerName,
      customerEmail: currentUser?.email || data.customerEmail,
      customerPhone: currentUser?.phone || data.customerPhone,
    });
    await refreshAll();
    return newApt;
  };

  const updateBookingStatus = async (id: string, status: Appointment['status']) => {
    await EloriaApi.updateAppointmentStatus(id, status, currentUser?.id);
    await refreshAll();
  };

  const rescheduleBooking = async (id: string, newDate: string, newTimeSlot: string) => {
    const currentApt = appointments.find((a) => a.id === id);
    await EloriaApi.rescheduleAppointment(id, newDate, newTimeSlot, currentApt?.therapistId, currentUser?.id);
    await refreshAll();
  };

  // Reviews
  const submitReview = async (review: Omit<ClientReview, 'id' | 'createdAt'>) => {
    await EloriaApi.addReview({
      ...review,
      customerId: currentUser?.id || review.customerId,
      customerName: currentUser?.name || review.customerName,
    });
    await refreshAll();
  };

  // Services
  const saveService = async (
    service: Partial<MassageService> & { name: string; price: number; durationMinutes: number }
  ) => {
    await EloriaApi.saveService(service);
    await refreshAll();
  };

  const toggleService = async (id: string) => {
    await EloriaApi.toggleService(id);
    await refreshAll();
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await EloriaApi.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    await EloriaApi.markAllNotificationsRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // Settings
  const updateNotificationPreferences = async (settings: Partial<NotificationSettings>) => {
    if (!currentUser) return;
    await EloriaApi.updateNotificationSettings(currentUser.id, settings);
    setNotificationSettings((prev) => (prev ? { ...prev, ...settings } : (settings as NotificationSettings)));
  };

  const updateClinicSettings = async (settings: Partial<ClinicAvailabilitySettings>) => {
    await EloriaApi.updateBusinessSettings(settings);
    setClinicAvailability((prev) => (prev ? { ...prev, ...settings } : (settings as ClinicAvailabilitySettings)));
  };

  // Reset demo data
  const resetDemoData = async () => {
    await refreshAll();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authUser,
        allUsers,
        services,
        therapists,
        appointments,
        reviews,
        notifications,
        notificationSettings,
        clinicAvailability,
        isLoading,
        authError,
        signIn,
        signUp,
        loginAs,
        logout,
        createBooking,
        updateBookingStatus,
        rescheduleBooking,
        submitReview,
        saveService,
        toggleService,
        markNotificationRead,
        markAllNotificationsRead,
        updateNotificationPreferences,
        updateClinicSettings,
        resetDemoData,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
