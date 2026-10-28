import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Appointment } from '../types';

export default function BookingsScreen() {
  const { appointments, updateBookingStatus, rescheduleBooking, submitReview } = useApp();
  const [filterTab, setFilterTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Modal states
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  // Reschedule form
  const [newDate, setNewDate] = useState('Fri, 16 Aug');
  const [newTime, setNewTime] = useState('02:00 PM');

  // Review form
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const filteredAppointments = appointments.filter((a) => {
    if (filterTab === 'upcoming') return a.status === 'confirmed';
    if (filterTab === 'completed') return a.status === 'completed';
    return a.status === 'cancelled';
  });

  const handleCancelBooking = (apt: Appointment) => {
    updateBookingStatus(apt.id, 'cancelled');
  };

  const handleRescheduleSubmit = async () => {
    if (!selectedApt) return;
    await rescheduleBooking(selectedApt.id, newDate, newTime);
    setRescheduleModalVisible(false);
    setSelectedApt(null);
  };

  const handleReviewSubmit = async () => {
    if (!selectedApt) return;
    await submitReview({
      appointmentId: selectedApt.id,
      customerId: selectedApt.customerId,
      customerName: selectedApt.customerName,
      therapistName: selectedApt.therapistName,
      serviceName: selectedApt.serviceName,
      rating,
      comment: reviewText || 'Wonderful and restorative session.',
    });
    setReviewModalVisible(false);
    setReviewText('');
    setSelectedApt(null);
    Alert.alert('Review Submitted', 'Thank you for your valuable feedback!');
  };

  return (
    <ScreenContainer>
      <AppHeader title="My Bookings" subtitle="Sanctuary" />

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => {
          const isActive = filterTab === tab;
          const count = appointments.filter((a) =>
            tab === 'upcoming'
              ? a.status === 'confirmed'
              : tab === 'completed'
              ? a.status === 'completed'
              : a.status === 'cancelled'
          ).length;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setFilterTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={42} color={Colors.mutedSlate} />
            <Text style={styles.emptyTitle}>No {filterTab} appointments</Text>
            <Text style={styles.emptySubtitle}>
              {filterTab === 'upcoming'
                ? "You don't have any sessions scheduled right now."
                : `No ${filterTab} sessions found in your history.`}
            </Text>
            {filterTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => router.push('/book')}
              >
                <Text style={styles.bookNowText}>Book a Session</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredAppointments.map((apt) => (
            <View key={apt.id} style={styles.aptCard}>
              {/* Header strip */}
              <View
                style={[
                  styles.aptCardHeader,
                  apt.status === 'completed'
                    ? { backgroundColor: Colors.secondary }
                    : apt.status === 'cancelled'
                    ? { backgroundColor: Colors.tertiary }
                    : { backgroundColor: Colors.primaryContainer },
                ]}
              >
                <View style={styles.aptHeaderLeft}>
                  <Ionicons name="calendar" size={14} color={Colors.onPrimary} />
                  <Text style={styles.aptHeaderDate}>{apt.date}</Text>
                </View>
                <Text style={styles.aptHeaderTime}>{apt.timeSlot}</Text>
              </View>

              {/* Card body */}
              <View style={styles.aptCardBody}>
                <View style={styles.aptMainRow}>
                  <View style={styles.therapistImg}>
                    <Text style={styles.therapistInitialText}>
                      {apt.therapistName
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'SP'}
                    </Text>
                  </View>
                  <View style={styles.aptInfo}>
                    <Text style={styles.aptServiceName}>{apt.serviceName}</Text>
                    <Text style={styles.aptTherapist}>Specialist: {apt.therapistName}</Text>
                    <Text style={styles.aptMeta}>
                      {apt.durationMinutes} min • ${apt.paidAmount} (Demo {apt.paymentMethod})
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      apt.status === 'confirmed' && styles.statusPillConfirmed,
                      apt.status === 'completed' && styles.statusPillCompleted,
                      apt.status === 'cancelled' && styles.statusPillCancelled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        apt.status === 'confirmed' && { color: Colors.primary },
                        apt.status === 'completed' && { color: Colors.success },
                        apt.status === 'cancelled' && { color: Colors.error },
                      ]}
                    >
                      {apt.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.primary} />
                  <Text style={styles.locationText}>{apt.location}</Text>
                </View>

                {/* Actions row depending on status */}
                <View style={styles.actionsRow}>
                  {apt.status === 'confirmed' && (
                    <>
                      <TouchableOpacity
                        style={styles.cancelActionBtn}
                        onPress={() => handleCancelBooking(apt)}
                      >
                        <Text style={styles.cancelActionText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rescheduleActionBtn}
                        onPress={() => {
                          setSelectedApt(apt);
                          setRescheduleModalVisible(true);
                        }}
                      >
                        <Ionicons name="repeat-outline" size={14} color={Colors.primary} />
                        <Text style={styles.rescheduleActionText}>Reschedule</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {apt.status === 'completed' && (
                    <>
                      <TouchableOpacity
                        style={styles.reviewActionBtn}
                        onPress={() => {
                          setSelectedApt(apt);
                          setReviewModalVisible(true);
                        }}
                      >
                        <Ionicons name="star-outline" size={14} color={Colors.primary} />
                        <Text style={styles.reviewActionText}>Leave Feedback</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.rebookActionBtn}
                        onPress={() => router.push(`/book?serviceId=${apt.serviceId}`)}
                      >
                        <Ionicons name="refresh" size={14} color={Colors.onPrimary} />
                        <Text style={styles.rebookActionText}>Book Again</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {apt.status === 'cancelled' && (
                    <TouchableOpacity
                      style={styles.rebookActionBtn}
                      onPress={() => router.push(`/book?serviceId=${apt.serviceId}`)}
                    >
                      <Ionicons name="refresh" size={14} color={Colors.onPrimary} />
                      <Text style={styles.rebookActionText}>Book New Slot</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal visible={rescheduleModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TouchableOpacity onPress={() => setRescheduleModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Change slot for {selectedApt?.serviceName} with {selectedApt?.therapistName}.
            </Text>

            <Text style={styles.inputLabel}>SELECT NEW DATE</Text>
            <View style={styles.slotChoiceGrid}>
              {['Wed, 14 Aug', 'Thu, 15 Aug', 'Fri, 16 Aug', 'Mon, 19 Aug'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.choiceBtn, newDate === d && styles.choiceBtnActive]}
                  onPress={() => setNewDate(d)}
                >
                  <Text style={[styles.choiceText, newDate === d && styles.choiceTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>SELECT NEW TIME</Text>
            <View style={styles.slotChoiceGrid}>
              {['09:00 AM', '11:00 AM', '02:00 PM', '04:30 PM'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.choiceBtn, newTime === t && styles.choiceBtnActive]}
                  onPress={() => setNewTime(t)}
                >
                  <Text style={[styles.choiceText, newTime === t && styles.choiceTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveModalBtn} onPress={handleRescheduleSubmit}>
              <Text style={styles.saveModalBtnText}>Confirm New Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Review & Feedback Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              How was your {selectedApt?.serviceName} session with {selectedApt?.therapistName}?
            </Text>

            {/* Star selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#D99A36"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              placeholder="Share what felt best, the ambiance, pressure, or therapist notes..."
              placeholderTextColor={Colors.tertiary}
              value={reviewText}
              onChangeText={setReviewText}
            />

            <TouchableOpacity style={styles.saveModalBtn} onPress={handleReviewSubmit}>
              <Text style={styles.saveModalBtnText}>Submit Client Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  tabButtonTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  tabBadgeTextActive: {
    color: Colors.onPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  aptCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  aptCardHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aptHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aptHeaderDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
    textTransform: 'uppercase',
  },
  aptHeaderTime: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  aptCardBody: {
    padding: 14,
    gap: 12,
  },
  aptMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  therapistImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
  },
  therapistInitialText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  aptInfo: {
    flex: 1,
  },
  aptServiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  aptTherapist: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  aptMeta: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer,
  },
  statusPillConfirmed: {
    backgroundColor: Colors.aquaTint,
  },
  statusPillCompleted: {
    backgroundColor: Colors.successContainer,
  },
  statusPillCancelled: {
    backgroundColor: Colors.errorContainer,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.tertiary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  cancelActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  cancelActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.error,
  },
  rescheduleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  rescheduleActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  reviewActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  reviewActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  rebookActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  rebookActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
    maxWidth: 280,
  },
  bookNowBtn: {
    marginTop: 10,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookNowText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 29, 31, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.tertiary,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
    marginTop: 6,
  },
  slotChoiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  choiceBtnActive: {
    backgroundColor: Colors.primaryContainer,
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  choiceTextActive: {
    color: Colors.onPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginVertical: 8,
  },
  reviewInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: Colors.onSurface,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveModalBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
