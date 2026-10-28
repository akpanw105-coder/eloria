import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { currentUser, appointments, reviews, logout, resetDemoData } = useApp();

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const userReviewsCount = reviews.filter((r) => r.customerId === currentUser?.id).length;

  return (
    <ScreenContainer>
      <AppHeader title="Client Profile" subtitle="Account" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarImg}>
            <Text style={styles.avatarInitialsText}>
              {currentUser?.name
                ?.split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'VG'}
            </Text>
          </View>
          <Text style={styles.profileName}>{currentUser?.name || 'Valued Guest'}</Text>
          <Text style={styles.profileEmail}>{currentUser?.email || 'elena.vance@example.com'}</Text>
          <Text style={styles.memberSince}>Member since {currentUser?.memberSince || '2024'}</Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{confirmedCount}</Text>
              <Text style={styles.metricLabel}>Upcoming</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{completedCount}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricVal}>{userReviewsCount}</Text>
              <Text style={styles.metricLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Role Switch & Admin Gateway */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Account & Experience Role</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/auth')}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: Colors.secondaryContainer }]}>
                <Ionicons name="swap-horizontal" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Switch Demo Account / Role</Text>
                <Text style={styles.menuSubtitle}>
                  Current: {currentUser?.role === 'admin' ? 'Admin Director' : 'Client Profile'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
          </TouchableOpacity>

          {currentUser?.role === 'admin' && (
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/admin')}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconCircle, { backgroundColor: Colors.aquaTint }]}>
                  <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Launch Admin Management Suite</Text>
                  <Text style={styles.menuSubtitle}>Appointments, therapists, services & settings</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Preferences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="notifications-outline" size={18} color={Colors.primaryContainer} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Reminders & Alerts</Text>
                <Text style={styles.menuSubtitle}>SMS, email and pre-session notifications</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => router.push('/bookings')}
          >
            <View style={styles.menuRowLeft}>
              <View style={styles.menuIconCircle}>
                <Ionicons name="receipt-outline" size={18} color={Colors.primaryContainer} />
              </View>
              <View>
                <Text style={styles.menuTitle}>Invoices & Payment History</Text>
                <Text style={styles.menuSubtitle}>View past receipts & payment methods</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Demo Data Management */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sandbox Controls</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={async () => {
              await resetDemoData();
              alert('Demo data restored to initial pristine state.');
            }}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconCircle, { backgroundColor: Colors.errorContainer }]}>
                <Ionicons name="refresh" size={18} color={Colors.error} />
              </View>
              <View>
                <Text style={[styles.menuTitle, { color: Colors.error }]}>Reset Demo Data</Text>
                <Text style={styles.menuSubtitle}>Reload default services, clients, and bookings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            router.replace('/auth');
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.logoutText}>Sign Out / Change Profile</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomerTabBar />
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
  profileCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.primaryContainer,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialsText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.tertiary,
    marginTop: 2,
  },
  memberSince: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 4,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.hairlineBorder,
  },
  sectionCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  menuSubtitle: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 1,
  },
  logoutButton: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.2)',
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
});
