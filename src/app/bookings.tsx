import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';
import { formatNaira } from '../mock/initialData';

export default function BookingsScreen() {
  const { appointments, updateBookingStatus, rescheduleBooking, refreshAll, isLoading, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Reschedule Modal State
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('10:30 AM');

  const todayIso = new Date().toISOString().split('T')[0];

  const upcomingAppointments = appointments.filter((a) => {
    return (
      (a.status === 'pending' || a.status === 'confirmed') &&
      (!a.date || a.date >= todayIso)
    );
  });

  const pastAppointments = appointments.filter((a) => {
    return (
      a.status === 'completed' ||
      a.status === 'cancelled' ||
      a.status === 'rejected' ||
      (a.date && a.date < todayIso && a.status !== 'pending')
    );
  });

  const handleCancel = (apt: Appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your ${apt.serviceName} session on ${apt.date}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateBookingStatus(apt.id, 'cancelled');
              Alert.alert('Booking Cancelled', 'Your appointment has been cancelled.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel appointment.');
            }
          },
        },
      ]
    );
  };

  const openRescheduleModal = (apt: Appointment) => {
    setSelectedApt(apt);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setNewDate(tomorrow.toISOString().split('T')[0]);
    setNewTime(apt.timeSlot || '10:30 AM');
    setRescheduleModalVisible(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedApt) return;
    try {
      await rescheduleBooking(selectedApt.id, newDate, newTime, selectedApt.therapistId);
      setRescheduleModalVisible(false);
      Alert.alert(
        'Reschedule Request Sent',
        `Your session has been updated to ${newDate} at ${newTime} and is pending administrator confirmation.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reschedule appointment.');
    }
  };

  const displayedList = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'rejected':
      case 'cancelled':
        return Colors.error;
      case 'completed':
        return Colors.primary;
      default:
        return Colors.mutedSlate;
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.newBookingBtn} onPress={() => router.push('/book')}>
          <Ionicons name="add" size={18} color={Colors.onPrimary} />
          <Text style={styles.newBookingBtnText}>Book Session</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'upcoming' && styles.tabItemActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabItemText, activeTab === 'upcoming' && styles.tabItemTextActive]}>
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'past' && styles.tabItemActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabItemText, activeTab === 'past' && styles.tabItemTextActive]}>
            History ({pastAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {!currentUser && (
          <View style={styles.authNotice}>
            <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
            <Text style={styles.authNoticeTitle}>Sign In to View Your Appointments</Text>
            <Text style={styles.authNoticeSub}>Access your real-time booking status and appointment history.</Text>
            <TouchableOpacity style={styles.authBtn} onPress={() => router.push('/auth')}>
              <Text style={styles.authBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentUser && displayedList.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Booking History'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'upcoming'
                ? 'Your scheduled sanctuary sessions will appear here.'
                : 'Completed and past appointments will be displayed here.'}
            </Text>
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => router.push('/book')}>
              <Text style={styles.bookNowBtnText}>Book a Massage</Text>
            </TouchableOpacity>
          </View>
        )}

        {displayedList.map((apt) => {
          const statusColor = getStatusColor(apt.status);
          const canModify = apt.status === 'pending' || apt.status === 'confirmed';

          return (
            <View key={apt.id} style={styles.appointmentCard}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceNameWrap}>
                  <Text style={styles.serviceName}>{apt.serviceName}</Text>
                  <Text style={styles.servicePrice}>{formatNaira(apt.price)}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    {apt.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardMetaGrid}>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                  <Text style={styles.metaText}>
                    {apt.date} at {apt.timeSlot}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="person-outline" size={15} color={Colors.primary} />
                  <Text style={styles.metaText}>Specialist: {apt.therapistName}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="card-outline" size={15} color={Colors.primary} />
                  <Text style={styles.metaText}>
                    Payment: {apt.paymentStatus.toUpperCase()} ({apt.paymentMethod.replace('_', ' ')})
                  </Text>
                </View>
              </View>

              {/* 2-Hour Reminder Pill Notice */}
              {canModify && (
                <View style={styles.reminderNoticeBox}>
                  <Ionicons name="notifications-outline" size={14} color={Colors.primary} />
                  <Text style={styles.reminderNoticeText}>
                    Automated appointment reminder scheduled 2 hours before session.
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              {canModify && (
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => openRescheduleModal(apt)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar" size={14} color={Colors.primary} />
                    <Text style={styles.actionBtnOutlineText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDestructive}
                    onPress={() => handleCancel(apt)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={14} color={Colors.error} />
                    <Text style={styles.actionBtnDestructiveText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={rescheduleModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <Text style={styles.modalSub}>
              Select your updated preferred date and time for {selectedApt?.serviceName}.
            </Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Selected Date (YYYY-MM-DD):</Text>
              <View style={styles.modalDateOptions}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i + 1);
                  const iso = d.toISOString().split('T')[0];
                  const isSel = newDate === iso;
                  return (
                    <TouchableOpacity
                      key={iso}
                      style={[styles.modalDateChip, isSel && styles.modalDateChipActive]}
                      onPress={() => setNewDate(iso)}
                    >
                      <Text style={[styles.modalDateChipText, isSel && styles.modalDateChipTextActive]}>
                        {iso}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Time Slot:</Text>
              <View style={styles.modalTimeGrid}>
                {['09:00 AM', '11:00 AM', '01:30 PM', '04:00 PM', '06:30 PM'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.modalTimeChip, newTime === t && styles.modalTimeChipActive]}
                    onPress={() => setNewTime(t)}
                  >
                    <Text style={[styles.modalTimeChipText, newTime === t && styles.modalTimeChipTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRescheduleModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmReschedule}>
                <Text style={styles.modalConfirmBtnText}>Save Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  newBookingBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newBookingBtnText: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mutedSlate,
  },
  tabItemTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  authNotice: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  authNoticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 10,
  },
  authNoticeSub: {
    fontSize: 12,
    color: Colors.mutedSlate,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  authBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  authBtnText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.mutedSlate,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bookNowBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookNowBtnText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceNameWrap: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardMetaGrid: {
    gap: 6,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  reminderNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.aquaMist,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  reminderNoticeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    paddingTop: 12,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionBtnOutlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  actionBtnDestructive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.errorContainer,
  },
  actionBtnDestructiveText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: 6,
  },
  modalDateOptions: {
    gap: 6,
  },
  modalDateChip: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.aquaMist,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  modalDateChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalDateChipText: {
    fontSize: 12,
    color: Colors.charcoal,
  },
  modalDateChipTextActive: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  modalTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalTimeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.aquaMist,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  modalTimeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalTimeChipText: {
    fontSize: 11,
    color: Colors.charcoal,
  },
  modalTimeChipTextActive: {
    color: Colors.onPrimary,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mutedSlate,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
