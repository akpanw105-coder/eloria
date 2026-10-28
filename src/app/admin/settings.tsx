import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AuthGuard } from '../../components/AuthGuard';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const TIME_OPTIONS = [
  '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
  '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM',
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminSettingsScreen() {
  const { clinicAvailability, updateClinicSettings, currentUser, logout } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [allowSameDay, setAllowSameDay] = useState(clinicAvailability?.allowSameDayBooking ?? true);
  const [daysOpen, setDaysOpen] = useState<string[]>(
    clinicAvailability?.daysOpen ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );

  const toggleDay = (day: string) => {
    setDaysOpen((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await updateClinicSettings({
        allowSameDayBooking: allowSameDay,
        daysOpen,
      });
      Alert.alert('Settings Saved', 'Clinic settings have been updated successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clinic Operations</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Admin Identity Banner */}
        <View style={styles.adminIdentityBanner}>
          <View style={styles.adminIdentityLeft}>
            <View style={styles.shieldIcon}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.onPrimary} />
            </View>
            <View>
              <Text style={styles.adminIdentityName}>{currentUser?.name}</Text>
              <Text style={styles.adminIdentityEmail}>{currentUser?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={async () => {
              await logout();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={16} color={Colors.error} />
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Integration Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Payment Integration Status</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={18} color={Colors.warning} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Paystack / Flutterwave Integration</Text>
                <Text style={styles.infoDesc}>
                  Payment gateway SDK integration requires your secret key configured in a secure server-side environment variable. Currently, bookings are recorded as "pending" payment status. To enable live payment collection, configure your payment provider API keys via a secure backend or Supabase Edge Function.
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, { marginTop: 10 }]}>
              <Ionicons name="notifications-outline" size={18} color={Colors.warning} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>2-Hour Appointment Reminders</Text>
                <Text style={styles.infoDesc}>
                  Reminder notifications require a Supabase Edge Function with a pg_cron job scheduled to run every 15 minutes, querying confirmed appointments due in 2 hours. Push notification delivery additionally requires Expo Push Token registration from each client's device. The reminder schedule infrastructure is ready but requires deployment of the Edge Function.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Clinic Availability Days */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Operating Days</Text>
          <View style={styles.infoCard}>
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{day}</Text>
                <Switch
                  value={daysOpen.includes(day)}
                  onValueChange={() => toggleDay(day)}
                  trackColor={{ false: Colors.outlineVariant, true: Colors.primaryContainer }}
                  thumbColor={daysOpen.includes(day) ? Colors.primary : Colors.mutedSlate}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Same-Day Booking Toggle */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Booking Policy</Text>
          <View style={styles.infoCard}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Allow Same-Day Booking</Text>
                <Text style={styles.toggleDesc}>
                  Clients can book appointments on the current day.
                </Text>
              </View>
              <Switch
                value={allowSameDay}
                onValueChange={setAllowSameDay}
                trackColor={{ false: Colors.outlineVariant, true: Colors.primaryContainer }}
                thumbColor={allowSameDay ? Colors.primary : Colors.mutedSlate}
              />
            </View>
          </View>
        </View>

        {/* Database Migration / Setup Guide */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Database Configuration</Text>
          <View style={styles.migrationCard}>
            <View style={styles.migrationHeader}>
              <Ionicons name="server-outline" size={18} color={Colors.primary} />
              <Text style={styles.migrationTitle}>Supabase SQL Migration Required</Text>
            </View>
            <Text style={styles.migrationDesc}>
              Run <Text style={styles.monoText}>supabase_migration.sql</Text> in your Supabase SQL Editor to:
            </Text>
            <Text style={styles.migrationStep}>✓ Create the handle_new_user() trigger (auto-assigns roles)</Text>
            <Text style={styles.migrationStep}>✓ Seed 6 default massage services with ₦ prices</Text>
            <Text style={styles.migrationStep}>✓ Seed 3 default therapists</Text>
            <Text style={styles.migrationStep}>✓ Apply Row Level Security policies</Text>
            <Text style={styles.migrationStep}>✓ Enforce admin@gmail.com as the only admin account</Text>
            <Text style={styles.migrationStep}>✗ Confirm both accounts exist & set passwords in Supabase Auth dashboard</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.5 }]}
          onPress={saveSettings}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving…' : 'Save Settings'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 100 },
  adminIdentityBanner: {
    backgroundColor: Colors.aquaMist,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  adminIdentityLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  shieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminIdentityName: { fontSize: 14, fontWeight: '700', color: Colors.charcoal },
  adminIdentityEmail: { fontSize: 11, color: Colors.mutedSlate, marginTop: 1 },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.errorContainer,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  signOutBtnText: { fontSize: 12, fontWeight: '700', color: Colors.error },
  infoSection: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: Colors.charcoal, marginBottom: 4 },
  infoDesc: { fontSize: 12, color: Colors.mutedSlate, lineHeight: 18 },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  dayLabel: { fontSize: 14, color: Colors.charcoal, fontWeight: '500' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: Colors.charcoal },
  toggleDesc: { fontSize: 12, color: Colors.mutedSlate, marginTop: 2 },
  migrationCard: {
    backgroundColor: Colors.aquaMist,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  migrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  migrationTitle: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  migrationDesc: { fontSize: 12, color: Colors.charcoal, marginBottom: 8, lineHeight: 18 },
  migrationStep: { fontSize: 12, color: Colors.onSurfaceVariant, lineHeight: 20 },
  monoText: {
    fontFamily: 'monospace',
    backgroundColor: Colors.surfaceContainerHigh,
    color: Colors.primary,
    fontSize: 11,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.onPrimary, fontSize: 15, fontWeight: '700' },
});
