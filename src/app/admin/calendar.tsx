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
import { Ionicons } from '@expo/vector-icons';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { formatNaira } from '../../mock/initialData';

const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'rejected'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AdminCalendarScreen() {
  const { appointments, updateBookingStatus, refreshAll, isLoading, therapists } = useApp();
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered =
    activeStatus === 'all'
      ? appointments
      : appointments.filter((a) => a.status === activeStatus);

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

  const handleStatusChange = (apt: Appointment, newStatus: Appointment['status']) => {
    const actionLabels: Record<string, string> = {
      confirmed: 'Confirm',
      rejected: 'Decline',
      completed: 'Mark Completed',
      cancelled: 'Cancel',
    };

    Alert.alert(
      `${actionLabels[newStatus]} Appointment`,
      `Set this ${apt.serviceName} booking to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabels[newStatus],
          style: newStatus === 'rejected' || newStatus === 'cancelled' ? 'destructive' : 'default',
          onPress: async () => {
            setProcessingId(apt.id);
            try {
              await updateBookingStatus(apt.id, newStatus);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to update appointment');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Bookings</Text>
        <Text style={styles.headerCount}>{filtered.length} records</Text>
      </View>

      {/* Status Filter Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((status) => {
          const count = status === 'all' ? appointments.length : appointments.filter((a) => a.status === status).length;
          const isActive = activeStatus === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setActiveStatus(status)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={40} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>No appointments found for this filter.</Text>
          </View>
        )}

        {filtered.map((apt) => {
          const statusColor = getStatusColor(apt.status);
          const isProcessing = processingId === apt.id;

          return (
            <View key={apt.id} style={[styles.aptCard, { borderLeftColor: statusColor }]}>
              {/* Card Header */}
              <View style={styles.aptCardTop}>
                <View style={styles.aptClientInfo}>
                  <Text style={styles.aptClientName}>{apt.customerName}</Text>
                  <Text style={styles.aptClientEmail}>{apt.customerEmail}</Text>
                </View>
                <View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {apt.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.aptPrice}>{formatNaira(apt.price)}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.aptDetailsGrid}>
                <View style={styles.aptDetailRow}>
                  <Ionicons name="sparkles-outline" size={13} color={Colors.primary} />
                  <Text style={styles.aptDetailText}>{apt.serviceName}</Text>
                </View>
                <View style={styles.aptDetailRow}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
                  <Text style={styles.aptDetailText}>{apt.date} at {apt.timeSlot}</Text>
                </View>
                <View style={styles.aptDetailRow}>
                  <Ionicons name="person-outline" size={13} color={Colors.primary} />
                  <Text style={styles.aptDetailText}>Therapist: {apt.therapistName}</Text>
                </View>
                <View style={styles.aptDetailRow}>
                  <Ionicons name="card-outline" size={13} color={Colors.primary} />
                  <Text style={styles.aptDetailText}>
                    Payment: {apt.paymentStatus.toUpperCase()} ({apt.paymentMethod.replace('_', ' ')})
                  </Text>
                </View>
                {apt.notes && (
                  <View style={styles.aptDetailRow}>
                    <Ionicons name="document-text-outline" size={13} color={Colors.primary} />
                    <Text style={styles.aptDetailText}>{apt.notes}</Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              {!isProcessing && (
                <View style={styles.aptActionsRow}>
                  {apt.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleStatusChange(apt, 'rejected')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.rejectBtnText}>Decline</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={() => handleStatusChange(apt, 'confirmed')}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="checkmark" size={14} color={Colors.onPrimary} />
                        <Text style={styles.confirmBtnText}>Confirm</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {apt.status === 'confirmed' && (
                    <TouchableOpacity
                      style={styles.completeBtn}
                      onPress={() => handleStatusChange(apt, 'completed')}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-done" size={14} color={Colors.onPrimary} />
                      <Text style={styles.completeBtnText}>Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {isProcessing && (
                <View style={styles.processingBanner}>
                  <Text style={styles.processingText}>Updating…</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  headerCount: { fontSize: 13, fontWeight: '600', color: Colors.mutedSlate },
  filterScroll: { maxHeight: 50, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: Colors.hairlineBorder },
  filterContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: Colors.mutedSlate },
  filterChipTextActive: { color: Colors.onPrimary },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: { fontSize: 13, color: Colors.mutedSlate },
  aptCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    borderLeftWidth: 4,
  },
  aptCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  aptClientInfo: { flex: 1 },
  aptClientName: { fontSize: 14, fontWeight: '700', color: Colors.charcoal },
  aptClientEmail: { fontSize: 11, color: Colors.mutedSlate, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  statusBadgeText: { fontSize: 9, fontWeight: '800' },
  aptPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'right',
  },
  aptDetailsGrid: { gap: 4, marginBottom: 10 },
  aptDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aptDetailText: { fontSize: 12, color: Colors.onSurfaceVariant },
  aptActionsRow: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.errorContainer,
  },
  rejectBtnText: { fontSize: 12, fontWeight: '700', color: Colors.error },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  confirmBtnText: { fontSize: 12, fontWeight: '700', color: Colors.onPrimary },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  completeBtnText: { fontSize: 12, fontWeight: '700', color: Colors.onPrimary },
  processingBanner: {
    backgroundColor: Colors.aquaMist,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  processingText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
});
