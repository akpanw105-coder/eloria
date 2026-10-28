import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { formatNaira } from '../../mock/initialData';

export default function AdminDashboard() {
  const { currentUser, appointments, services, therapists, allUsers, updateBookingStatus, refreshAll, isLoading, logout } = useApp();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Redirect non-admins
  if (currentUser && currentUser.role !== 'admin') {
    router.replace('/');
    return null;
  }

  if (!currentUser) {
    return (
      <ScreenContainer>
        <View style={styles.unauthBox}>
          <Ionicons name="shield-outline" size={48} color={Colors.error} />
          <Text style={styles.unauthTitle}>Admin Access Required</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.replace('/auth')}>
            <Text style={styles.signInBtnText}>Sign In as Administrator</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  const pendingApts = appointments.filter((a) => a.status === 'pending');
  const confirmedApts = appointments.filter((a) => a.status === 'confirmed');
  const completedApts = appointments.filter((a) => a.status === 'completed');
  const cancelledApts = appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected');
  const totalRevenue = appointments
    .filter((a) => a.status === 'completed' && a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + a.price, 0);

  const handleConfirm = async (apt: Appointment) => {
    Alert.alert(
      'Confirm Booking',
      `Confirm ${apt.customerName}'s ${apt.serviceName} on ${apt.date} at ${apt.timeSlot}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setProcessingId(apt.id);
            try {
              await updateBookingStatus(apt.id, 'confirmed');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to confirm appointment');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (apt: Appointment) => {
    Alert.alert(
      'Decline Booking',
      `Decline ${apt.customerName}'s request for ${apt.serviceName} on ${apt.date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(apt.id);
            try {
              await updateBookingStatus(apt.id, 'rejected');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to reject appointment');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'rejected':
      case 'cancelled': return Colors.error;
      case 'completed': return Colors.primary;
      default: return Colors.mutedSlate;
    }
  };

  return (
    <ScreenContainer>
      {/* Admin Header */}
      <View style={styles.adminHeader}>
        <View style={styles.adminHeaderLeft}>
          <View style={styles.adminShieldBadge}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.onPrimary} />
          </View>
          <View>
            <Text style={styles.adminHeaderSub}>ADMIN DASHBOARD</Text>
            <Text style={styles.adminHeaderTitle}>Eloria Management</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            router.replace('/auth');
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {/* KPI Overview Cards */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { backgroundColor: Colors.warning + '18' }]}>
            <Ionicons name="time-outline" size={22} color={Colors.warning} />
            <Text style={styles.kpiNumber}>{pendingApts.length}</Text>
            <Text style={styles.kpiLabel}>Pending</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: Colors.success + '18' }]}>
            <Ionicons name="checkmark-circle-outline" size={22} color={Colors.success} />
            <Text style={styles.kpiNumber}>{confirmedApts.length}</Text>
            <Text style={styles.kpiLabel}>Confirmed</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: Colors.primary + '18' }]}>
            <Ionicons name="star-outline" size={22} color={Colors.primary} />
            <Text style={styles.kpiNumber}>{completedApts.length}</Text>
            <Text style={styles.kpiLabel}>Completed</Text>
          </View>
          <View style={[styles.kpiCard, { backgroundColor: Colors.error + '18' }]}>
            <Ionicons name="close-circle-outline" size={22} color={Colors.error} />
            <Text style={styles.kpiNumber}>{cancelledApts.length}</Text>
            <Text style={styles.kpiLabel}>Cancelled</Text>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View>
            <Text style={styles.revenueLabel}>Total Confirmed Revenue</Text>
            <Text style={styles.revenueValue}>{formatNaira(totalRevenue)}</Text>
            <Text style={styles.revenueSub}>From {completedApts.length} completed paid sessions</Text>
          </View>
          <Ionicons name="trending-up-outline" size={36} color={Colors.primary} />
        </View>

        {/* Business Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
            <Text style={styles.statChipText}>{services.length} Services</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="people-outline" size={14} color={Colors.primary} />
            <Text style={styles.statChipText}>{therapists.length} Therapists</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="person-outline" size={14} color={Colors.primary} />
            <Text style={styles.statChipText}>{allUsers.length} Clients</Text>
          </View>
        </View>

        {/* Pending Requests – Action Required */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Approval</Text>
          {pendingApts.length > 0 && (
            <View style={styles.pendingCountBadge}>
              <Text style={styles.pendingCountText}>{pendingApts.length}</Text>
            </View>
          )}
        </View>

        {pendingApts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color={Colors.success} />
            <Text style={styles.emptyCardText}>No pending appointments. All requests have been processed.</Text>
          </View>
        ) : (
          pendingApts.map((apt) => (
            <View key={apt.id} style={styles.pendingCard}>
              <View style={styles.pendingCardHeader}>
                <View>
                  <Text style={styles.pendingClientName}>{apt.customerName}</Text>
                  <Text style={styles.pendingClientEmail}>{apt.customerEmail}</Text>
                </View>
                <View style={styles.pendingPriceBadge}>
                  <Text style={styles.pendingPriceText}>{formatNaira(apt.price)}</Text>
                </View>
              </View>

              <View style={styles.pendingDetailRow}>
                <Ionicons name="sparkles-outline" size={13} color={Colors.primary} />
                <Text style={styles.pendingDetailText}>{apt.serviceName}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
                <Text style={styles.pendingDetailText}>{apt.date} at {apt.timeSlot}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Ionicons name="person-outline" size={13} color={Colors.primary} />
                <Text style={styles.pendingDetailText}>Preferred: {apt.therapistName}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Ionicons name="card-outline" size={13} color={Colors.primary} />
                <Text style={styles.pendingDetailText}>
                  Payment: {apt.paymentStatus.toUpperCase()} via {apt.paymentMethod.replace('_', ' ')}
                </Text>
              </View>

              <View style={styles.pendingActionsRow}>
                <TouchableOpacity
                  style={[styles.rejectBtn, processingId === apt.id && { opacity: 0.5 }]}
                  onPress={() => handleReject(apt)}
                  disabled={processingId === apt.id}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close" size={15} color={Colors.error} />
                  <Text style={styles.rejectBtnText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.approveBtn, processingId === apt.id && { opacity: 0.5 }]}
                  onPress={() => handleConfirm(apt)}
                  disabled={processingId === apt.id}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={15} color={Colors.onPrimary} />
                  <Text style={styles.approveBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* All Recent Appointments */}
        {appointments.filter((a) => a.status !== 'pending').length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Bookings</Text>
              <TouchableOpacity onPress={() => router.push('/admin/calendar')}>
                <Text style={styles.seeAllText}>View Full Calendar →</Text>
              </TouchableOpacity>
            </View>

            {appointments
              .filter((a) => a.status !== 'pending')
              .slice(0, 8)
              .map((apt) => (
                <View key={apt.id} style={styles.bookingListItem}>
                  <View style={[styles.bookingStatusDot, { backgroundColor: getStatusColor(apt.status) }]} />
                  <View style={styles.bookingListInfo}>
                    <Text style={styles.bookingListClientName}>{apt.customerName}</Text>
                    <Text style={styles.bookingListMeta}>
                      {apt.serviceName} • {apt.date} {apt.timeSlot}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.bookingListPrice}>{formatNaira(apt.price)}</Text>
                    <Text style={[styles.bookingListStatus, { color: getStatusColor(apt.status) }]}>
                      {apt.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
          </>
        )}
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  adminHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  adminHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminShieldBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminHeaderSub: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  adminHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  logoutBtn: {
    padding: 6,
  },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  unauthBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  unauthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  signInBtnText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  kpiNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
  },
  revenueCard: {
    backgroundColor: Colors.aquaMist,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.aquaTint,
    marginBottom: 12,
  },
  revenueLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  revenueValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    marginVertical: 4,
  },
  revenueSub: {
    fontSize: 11,
    color: Colors.mutedSlate,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  pendingCountBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pendingCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  emptyCardText: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
  },
  pendingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.warning + '60',
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  pendingCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pendingClientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  pendingClientEmail: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  pendingPriceBadge: {
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  pendingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pendingDetailText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  pendingActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    paddingTop: 12,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.errorContainer,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  approveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  bookingListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
  },
  bookingStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bookingListInfo: { flex: 1 },
  bookingListClientName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  bookingListMeta: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  bookingListPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'right',
  },
  bookingListStatus: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 2,
  },
});
