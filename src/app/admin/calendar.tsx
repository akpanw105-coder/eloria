import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';

export default function AdminCalendarScreen() {
  const { appointments, therapists, updateBookingStatus } = useApp();
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const filteredAppointments = appointments.filter((a) => {
    const matchesTherapist =
      selectedTherapistId === 'all' || a.therapistId === selectedTherapistId;
    const matchesStatus =
      selectedStatusFilter === 'all' || a.status === selectedStatusFilter;
    return matchesTherapist && matchesStatus;
  });

  const handleStatusChange = (apt: Appointment, newStatus: Appointment['status']) => {
    updateBookingStatus(apt.id, newStatus);
    Alert.alert('Status Updated', `Appointment marked as ${newStatus}.`);
  };

  return (
    <ScreenContainer>
      <AppHeader title="Schedule & Matrix" subtitle="Operations" showBack onBack={() => {}} />

      {/* Filter Row 1: Therapist Filter Chips */}
      <View style={styles.filterBar}>
        <Text style={styles.filterTitle}>PRACTITIONER</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChipsRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedTherapistId === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedTherapistId('all')}
          >
            <Text style={[styles.filterChipText, selectedTherapistId === 'all' && styles.filterChipTextActive]}>
              All Specialists
            </Text>
          </TouchableOpacity>
          {therapists.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.filterChip, selectedTherapistId === t.id && styles.filterChipActive]}
              onPress={() => setSelectedTherapistId(t.id)}
            >
              <View style={styles.therapistChipAvatar}>
                <Text style={styles.therapistChipInitial}>
                  {t.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.filterChipText, selectedTherapistId === t.id && styles.filterChipTextActive]}>
                {t.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Row 2: Status */}
        <View style={styles.statusFilters}>
          {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.statusBtn, selectedStatusFilter === st && styles.statusBtnActive]}
              onPress={() => setSelectedStatusFilter(st)}
            >
              <Text style={[styles.statusBtnText, selectedStatusFilter === st && styles.statusBtnTextActive]}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Showing {filteredAppointments.length} appointment slots
          </Text>
        </View>

        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-clear-outline" size={36} color={Colors.mutedSlate} />
            <Text style={styles.emptyTitle}>No matching appointments</Text>
            <Text style={styles.emptySub}>No slots found with current therapist/status filters.</Text>
          </View>
        ) : (
          filteredAppointments.map((apt) => (
            <View key={apt.id} style={styles.slotCard}>
              <View style={styles.slotTopRow}>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeSlot}>{apt.timeSlot}</Text>
                  <Text style={styles.timeBadgeDate}>{apt.date}</Text>
                </View>

                <View style={styles.slotClientBox}>
                  <Text style={styles.clientName}>{apt.customerName}</Text>
                  <Text style={styles.clientContact}>{apt.customerPhone || apt.customerEmail}</Text>
                  <Text style={styles.serviceName}>
                    {apt.serviceName} ({apt.durationMinutes}m)
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    apt.status === 'confirmed' && styles.statusConfirmed,
                    apt.status === 'completed' && styles.statusCompleted,
                    apt.status === 'cancelled' && styles.statusCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      apt.status === 'confirmed' && { color: Colors.primary },
                      apt.status === 'completed' && { color: Colors.success },
                      apt.status === 'cancelled' && { color: Colors.error },
                    ]}
                  >
                    {apt.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Therapist assignment and room */}
              <View style={styles.therapistRoomRow}>
                <View style={styles.assignedTherapist}>
                  <View style={styles.assignedAvatar}>
                    <Text style={styles.assignedInitial}>
                      {apt.therapistName
                        ?.split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'SP'}
                    </Text>
                  </View>
                  <Text style={styles.assignedName}>Therapist: {apt.therapistName}</Text>
                </View>
                <Text style={styles.roomText}>{apt.location.split(',')[0]}</Text>
              </View>

              {/* Director actions: check-in, complete, cancel */}
              <View style={styles.actionsBar}>
                {apt.status === 'confirmed' && (
                  <>
                    <TouchableOpacity
                      style={styles.actionBtnComplete}
                      onPress={() => handleStatusChange(apt, 'completed')}
                    >
                      <Ionicons name="checkmark-done" size={14} color={Colors.onPrimary} />
                      <Text style={styles.actionBtnCompleteText}>Check In & Complete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnCancel}
                      onPress={() => handleStatusChange(apt, 'cancelled')}
                    >
                      <Ionicons name="close-circle-outline" size={14} color={Colors.error} />
                      <Text style={styles.actionBtnCancelText}>Cancel Slot</Text>
                    </TouchableOpacity>
                  </>
                )}

                {apt.status === 'completed' && (
                  <View style={styles.completedNoticeRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.completedNoticeText}>
                      Session concluded • Paid ${apt.paidAmount} via {apt.paymentMethod}
                    </Text>
                  </View>
                )}

                {apt.status === 'cancelled' && (
                  <TouchableOpacity
                    style={styles.actionBtnReopen}
                    onPress={() => handleStatusChange(apt, 'confirmed')}
                  >
                    <Ionicons name="refresh" size={14} color={Colors.primary} />
                    <Text style={styles.actionBtnReopenText}>Re-open & Confirm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    gap: 8,
  },
  filterTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  therapistChipAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  therapistChipInitial: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  statusFilters: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  statusBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  statusBtnActive: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.primaryContainer,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  statusBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 24,
    gap: 12,
  },
  resultsHeader: {
    paddingVertical: 2,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.tertiary,
  },
  slotCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
  },
  slotTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeBadge: {
    backgroundColor: Colors.aquaTint,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 70,
  },
  timeBadgeSlot: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  timeBadgeDate: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 2,
  },
  slotClientBox: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  clientContact: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 1,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainer,
  },
  statusConfirmed: {
    backgroundColor: Colors.aquaTint,
  },
  statusCompleted: {
    backgroundColor: Colors.successContainer,
  },
  statusCancelled: {
    backgroundColor: Colors.errorContainer,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  therapistRoomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerLow,
  },
  assignedTherapist: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  assignedInitial: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.primary,
  },
  assignedName: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  roomText: {
    fontSize: 11,
    color: Colors.tertiary,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 4,
  },
  actionBtnComplete: {
    backgroundColor: Colors.success,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnCompleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  actionBtnCancel: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(186, 26, 26, 0.3)',
  },
  actionBtnCancelText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.error,
  },
  completedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedNoticeText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  actionBtnReopen: {
    backgroundColor: Colors.aquaTint,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnReopenText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.mutedSlate,
  },
});
