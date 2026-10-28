import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import {
  User,
  MassageService,
  Therapist,
  Appointment,
  ClientReview,
  NotificationItem,
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
  clinicAvailability: ClinicAvailabilitySettings | null;
  isLoading: boolean;
  authError: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: User['role'] }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; role?: User['role'] }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  createBooking: (data: {
    serviceId: string;
    therapistId: string | null;
    date: string;
    timeSlot: string;
    price: number;
    notes?: string;
    paymentMethod: Appointment['paymentMethod'];
    paymentStatus?: Appointment['paymentStatus'];
    status?: Appointment['status'];
  }) => Promise<Appointment>;
  updateBookingStatus: (id: string, status: Appointment['status'], adminNotes?: string, therapistId?: string | null) => Promise<void>;
  rescheduleBooking: (id: string, newDate: string, newTimeSlot: string, therapistId?: string | null) => Promise<void>;
  submitReview: (review: Omit<ClientReview, 'id' | 'createdAt'>) => Promise<void>;
  saveService: (service: Partial<MassageService> & { name: string; price: number; durationMinutes: number }) => Promise<void>;
  toggleService: (id: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  updateClinicSettings: (settings: Partial<ClinicAvailabilitySettings>) => Promise<void>;
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

  // Load user-specific data (appointments, notifications, or admin full data)
  const loadUserData = useCallback(async (user: User) => {
    try {
      const isAdmin = user.role === 'admin';
      const [apts, notifs, profiles] = await Promise.all([
        EloriaApi.getAppointments(user.id, isAdmin),
        EloriaApi.getNotifications(user.id),
        isAdmin ? EloriaApi.getAllProfiles() : Promise.resolve([user]),
      ]);

      setAppointments(apts);
      setNotifications(notifs);

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
  const syncSessionUser = useCallback(async (session: Session | null): Promise<User | null> => {
    if (!session?.user) {
      setAuthUser(null);
      setCurrentUser(null);
      setAppointments([]);
      setNotifications([]);
      return null;
    }

    setAuthUser(session.user);
    const userId = session.user.id;
    const userEmail = session.user.email || '';

    // Enforce role: admin@gmail.com is strictly admin
    const isDedicatedAdmin = userEmail.toLowerCase() === 'admin@gmail.com';

    // Fetch profile from database, or ensure it exists
    let profile = await EloriaApi.getProfile(userId);

    if (!profile) {
      profile = await EloriaApi.ensureProfile({
        id: userId,
        email: userEmail,
        fullName: session.user.user_metadata?.full_name,
      });
    }

    if (isDedicatedAdmin && profile.role !== 'admin') {
      profile.role = 'admin';
    }

    setCurrentUser(profile);
    await loadUserData(profile);
    return profile;
  }, [loadUserData]);

  // Initial mount: load catalog and session
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
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; role?: User['role'] }> => {
    setAuthError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      let role: User['role'] = cleanEmail === 'admin@gmail.com' ? 'admin' : 'customer';
      if (data.session) {
        const profile = await syncSessionUser(data.session);
        if (profile) {
          role = profile.role;
        }
      }
      return { success: true, role };
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
  ): Promise<{ success: boolean; error?: string; role?: User['role'] }> => {
    setAuthError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const isDedicatedAdmin = cleanEmail === 'admin@gmail.com';
      const role: User['role'] = isDedicatedAdmin ? 'admin' : 'customer';

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim() || 'Sanctuary Client',
            role,
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
      return { success: true, role };
    } catch (err: any) {
      const msg = err.message || 'Failed to create account';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Password reset request
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send password reset email' };
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

  // Appointments
  const createBooking = async (data: {
    serviceId: string;
    therapistId: string | null;
    date: string;
    timeSlot: string;
    price: number;
    notes?: string;
    paymentMethod: Appointment['paymentMethod'];
    paymentStatus?: Appointment['paymentStatus'];
    status?: Appointment['status'];
  }): Promise<Appointment> => {
    if (!currentUser) {
      throw new Error('Please sign in to complete your booking.');
    }

    const newApt = await EloriaApi.createAppointment({
      ...data,
      customerId: currentUser.id,
    });
    await refreshAll();
    return newApt;
  };

  const updateBookingStatus = async (
    id: string,
    status: Appointment['status'],
    adminNotes?: string,
    therapistId?: string | null
  ) => {
    await EloriaApi.updateAppointmentStatus(id, status, adminNotes, therapistId);
    await refreshAll();
  };

  const rescheduleBooking = async (id: string, newDate: string, newTimeSlot: string, therapistId?: string | null) => {
    await EloriaApi.rescheduleAppointment(id, newDate, newTimeSlot, therapistId, currentUser?.id);
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

  // Clinic Operations Settings
  const updateClinicSettings = async (settings: Partial<ClinicAvailabilitySettings>) => {
    await EloriaApi.updateBusinessSettings(settings);
    setClinicAvailability((prev) => (prev ? { ...prev, ...settings } : (settings as ClinicAvailabilitySettings)));
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
        clinicAvailability,
        isLoading,
        authError,
        signIn,
        signUp,
        resetPassword,
        logout,
        createBooking,
        updateBookingStatus,
        rescheduleBooking,
        submitReview,
        saveService,
        toggleService,
        markNotificationRead,
        markAllNotificationsRead,
        updateClinicSettings,
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
