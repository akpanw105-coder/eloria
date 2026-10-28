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
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminDashboardScreen() {
  const { appointments, services, reviews, currentUser } = useApp();

  const totalRevenue = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.paidAmount || 0), 0);

  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const activeServicesCount = services.filter((s) => s.isActive).length;

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'confirmed')
    .slice(0, 3);

  return (
    <ScreenContainer>
      <AppHeader title="Clinic Director" subtitle="Operations" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Director Greeting & Mode Switcher */}
        <View style={styles.topDirectorRow}>
          <View>
            <Text style={styles.directorGreeting}>Welcome, {currentUser?.name || 'Marcus'}</Text>
            <Text style={styles.directorSub}>Eloria Central Sanctuary Operations</Text>
          </View>
          <TouchableOpacity
            style={styles.switchModePill}
            onPress={() => router.replace('/')}
          >
            <Ionicons name="eye-outline" size={14} color={Colors.primary} />
            <Text style={styles.switchModeText}>View Client Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Financial & Operational KPI Cards */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="cash-outline" size={18} color={Colors.primaryContainer} />
            </View>
            <Text style={styles.kpiVal}>${totalRevenue}</Text>
            <Text style={styles.kpiLabel}>Revenue (Demo)</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="calendar" size={18} color={Colors.primaryContainer} />
            </View>
            <Text style={styles.kpiVal}>{confirmedCount}</Text>
            <Text style={styles.kpiLabel}>Upcoming Slots</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="checkmark-done" size={18} color={Colors.primaryContainer} />
            </View>
            <Text style={styles.kpiVal}>{completedCount}</Text>
            <Text style={styles.kpiLabel}>Completed</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiIconBox}>
              <Ionicons name="sparkles" size={18} color={Colors.primaryContainer} />
            </View>
            <Text style={styles.kpiVal}>{activeServicesCount}</Text>
            <Text style={styles.kpiLabel}>Active Services</Text>
          </View>
        </View>

        {/* Quick Hub Navigation Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Operations Hub</Text>
        </View>

        <View style={styles.hubGrid}>
          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => router.push('/admin/calendar')}
          >
            <View style={[styles.hubTileIcon, { backgroundColor: Colors.secondaryContainer }]}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.hubTileTitle}>Schedule Matrix</Text>
            <Text style={styles.hubTileSub}>Manage slots & therapists</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => router.push('/admin/services')}
          >
            <View style={[styles.hubTileIcon, { backgroundColor: Colors.aquaTint }]}>
              <Ionicons name="sparkles-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.hubTileTitle}>Services Catalog</Text>
            <Text style={styles.hubTileSub}>Pricing, times & therapies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => router.push('/admin/clients')}
          >
            <View style={[styles.hubTileIcon, { backgroundColor: Colors.surfaceContainerLow }]}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.hubTileTitle}>Client Records</Text>
            <Text style={styles.hubTileSub}>History, notes & details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.hubTile}
            onPress={() => router.push('/admin/payments')}
          >
            <View style={[styles.hubTileIcon, { backgroundColor: Colors.successContainer }]}>
              <Ionicons name="receipt-outline" size={20} color={Colors.success} />
            </View>
            <Text style={styles.hubTileTitle}>Ledger & Payments</Text>
            <Text style={styles.hubTileSub}>Receipts & demo ledger</Text>
          </TouchableOpacity>
        </View>

        {/* Live Upcoming Bookings Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Upcoming Clinic Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/admin/calendar')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {upcomingAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No confirmed bookings at this moment.</Text>
          </View>
        ) : (
          upcomingAppointments.map((apt) => (
            <View key={apt.id} style={styles.adminAptCard}>
              <View style={styles.adminAptTop}>
                <View style={styles.clientCol}>
                  <Text style={styles.adminClientName}>{apt.customerName}</Text>
                  <Text style={styles.adminServiceTag}>
                    {apt.serviceName} • {apt.durationMinutes}m
                  </Text>
                </View>
                <View style={styles.timeTag}>
                  <Text style={styles.timeTagDate}>{apt.date}</Text>
                  <Text style={styles.timeTagSlot}>{apt.timeSlot}</Text>
                </View>
              </View>

              <View style={styles.adminAptBottom}>
                <View style={styles.therapistPill}>
                  <View style={styles.therapistAvatarMini}>
                    <Text style={styles.therapistMiniInitial}>
                      {apt.therapistName
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'SP'}
                    </Text>
                  </View>
                  <Text style={styles.therapistMiniName}>{apt.therapistName}</Text>
                </View>
                <Text style={styles.paidBadge}>
                  ${apt.paidAmount} ({apt.paymentMethod})
                </Text>
              </View>
            </View>
          ))
        )}

        {/* Recent Client Reviews Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeading}>Latest Client Feedback</Text>
          <TouchableOpacity onPress={() => router.push('/admin/reviews')}>
            <Text style={styles.viewAllText}>Manage</Text>
          </TouchableOpacity>
        </View>

        {reviews.slice(0, 2).map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.reviewHeaderRow}>
              <Text style={styles.reviewerName}>{rev.customerName}</Text>
              <View style={styles.starRow}>
                <Ionicons name="star" size={14} color="#D99A36" />
                <Text style={styles.starText}>{rev.rating}</Text>
              </View>
            </View>
            <Text style={styles.reviewServiceLine}>
              {rev.serviceName} • Specialist {rev.therapistName}
            </Text>
            <Text style={styles.reviewComment}>"{rev.comment}"</Text>
          </View>
        ))}

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
  topDirectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  directorGreeting: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  directorSub: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 2,
  },
  switchModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  switchModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    gap: 4,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  kpiLabel: {
    fontSize: 11,
    color: Colors.tertiary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hubTile: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 4,
  },
  hubTileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  hubTileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  hubTileSub: {
    fontSize: 11,
    color: Colors.tertiary,
  },
  adminAptCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  adminAptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientCol: {
    flex: 1,
  },
  adminClientName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  adminServiceTag: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 1,
  },
  timeTag: {
    alignItems: 'flex-end',
  },
  timeTagDate: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  timeTagSlot: {
    fontSize: 11,
    color: Colors.tertiary,
  },
  adminAptBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  therapistPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  therapistAvatarMini: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  therapistMiniInitial: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  therapistMiniName: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
  },
  paidBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 4,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D99A36',
  },
  reviewServiceLine: {
    fontSize: 11,
    color: Colors.tertiary,
  },
  reviewComment: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 17,
    marginTop: 2,
    fontStyle: 'italic',
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.mutedSlate,
  },
});
