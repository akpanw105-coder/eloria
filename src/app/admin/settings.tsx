import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminSettingsScreen() {
  const {
    clinicAvailability,
    updateClinicSettings,
    resetDemoData,
    currentUser,
    logout,
  } = useApp();

  const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (!clinicAvailability) return;
    const currentDays = clinicAvailability.daysOpen;
    const isPresent = currentDays.includes(day);
    const updated = isPresent
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    updateClinicSettings({ daysOpen: updated });
  };

  return (
    <ScreenContainer>
      <AppHeader title="Sanctuary Operations" subtitle="Clinic Ops" showBack onBack={() => {}} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Practice Hours */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardHeading}>Sanctuary Operating Hours</Text>

          <View style={styles.timingRow}>
            <View style={styles.timingBox}>
              <Text style={styles.timingLabel}>OPENING</Text>
              <Text style={styles.timingVal}>{clinicAvailability?.openTime || '08:30 AM'}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={Colors.tertiary} />
            <View style={styles.timingBox}>
              <Text style={styles.timingLabel}>CLOSING</Text>
              <Text style={styles.timingVal}>{clinicAvailability?.closeTime || '08:00 PM'}</Text>
            </View>
          </View>

          <Text style={[styles.cardHeading, { marginTop: 10 }]}>Open Days</Text>
          <View style={styles.daysGrid}>
            {daysList.map((day) => {
              const isOpen = clinicAvailability?.daysOpen.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayChip, isOpen && styles.dayChipActive]}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={[styles.dayChipText, isOpen && styles.dayChipTextActive]}>
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Booking Rules */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardHeading}>Booking & Scheduling Policies</Text>

          <View style={styles.settingToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Allow Same-Day Appointments</Text>
              <Text style={styles.toggleSub}>
                Allow clients to book available slots within current business day
              </Text>
            </View>
            <Switch
              value={clinicAvailability?.allowSameDayBooking ?? true}
              onValueChange={(val) => updateClinicSettings({ allowSameDayBooking: val })}
              trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingToggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Maximum Advance Booking Window</Text>
              <Text style={styles.toggleSub}>
                Slots open up to 30 calendar days in advance
              </Text>
            </View>
            <Text style={styles.windowVal}>30 Days</Text>
          </View>
        </View>

        {/* Demo Persistence & Diagnostics */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardHeading}>Demo Sandbox & Data Persistence</Text>
          <Text style={styles.cardSub}>
            Eloria operates with an in-browser local storage mock repository. Refreshing or
            navigating persists your booked sessions, new services, and status updates.
          </Text>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={async () => {
              await resetDemoData();
              Alert.alert('Sanctuary Reset', 'Initial catalog and appointments restored.');
            }}
          >
            <Ionicons name="refresh" size={16} color={Colors.error} />
            <Text style={styles.resetButtonText}>Restore Pristine Factory State</Text>
          </TouchableOpacity>
        </View>

        {/* Director Profile info */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardHeading}>Logged In Administrator</Text>
          <Text style={styles.directorName}>{currentUser?.name || 'Marcus Sterling'}</Text>
          <Text style={styles.directorEmail}>{currentUser?.email || 'admin@eloriawellness.com'}</Text>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              await logout();
              Alert.alert('Signed Out', 'Signed out of administrator session.');
            }}
          >
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
  },
  settingsCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 12,
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  cardSub: {
    fontSize: 12,
    color: Colors.tertiary,
    lineHeight: 18,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
  },
  timingBox: {
    alignItems: 'center',
    gap: 2,
  },
  timingLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
  },
  timingVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  dayChipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  dayChipTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  settingToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  toggleSub: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 2,
  },
  windowVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.hairlineBorder,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.3)',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  directorName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  directorEmail: {
    fontSize: 12,
    color: Colors.tertiary,
  },
  logoutBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
});
