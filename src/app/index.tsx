import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function CustomerHomeScreen() {
  const { currentUser, services, appointments, refreshAll, isLoading } = useApp();
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Wednesday default

  const daysOfWeek = [
    { day: 'Mon', num: '12' },
    { day: 'Tue', num: '13' },
    { day: 'Wed', num: '14' },
    { day: 'Thu', num: '15' },
    { day: 'Fri', num: '16' },
    { day: 'Sat', num: '17' },
    { day: 'Sun', num: '18' },
  ];

  // Next upcoming confirmed appointment
  const nextAppointment = appointments.find((a) => a.status === 'confirmed');
  // Past appointment for recent history
  const recentAppointment = appointments.find((a) => a.status === 'completed');

  return (
    <ScreenContainer>
      <AppHeader title="Home" subtitle="Serene" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {/* Top Personalized Greeting */}
        <View style={styles.greetingRow}>
          <View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>Good morning</Text>
              <View style={styles.pulsingDot} />
            </View>
            <Text style={styles.userName}>{currentUser?.name || 'Valued Guest'}</Text>
          </View>

          {/* Role quick switch banner */}
          <TouchableOpacity
            style={styles.roleChip}
            onPress={() => router.push('/auth')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={currentUser?.role === 'admin' ? 'shield-checkmark' : 'person'}
              size={14}
              color={Colors.primary}
            />
            <Text style={styles.roleChipText}>
              {currentUser?.role === 'admin' ? 'Admin Mode' : 'Client Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Book New Appointment Primary CTA Button */}
        <TouchableOpacity
          style={styles.bookCtaCard}
          onPress={() => router.push('/book')}
          activeOpacity={0.9}
        >
          <View style={styles.bookCtaLeft}>
            <View style={styles.bookCtaIconCircle}>
              <Ionicons name="calendar" size={22} color={Colors.onPrimary} />
            </View>
            <View style={styles.bookCtaTextBox}>
              <Text style={styles.bookCtaTitle}>Book New Appointment</Text>
              <Text style={styles.bookCtaSub}>Choose specialist, date & time</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color={Colors.onPrimary} />
        </TouchableOpacity>

        {/* Mini Calendar Week Preview Strip */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitleCap}>August 2024</Text>
          <TouchableOpacity onPress={() => router.push('/bookings')}>
            <Text style={styles.sectionActionText}>Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekStripGrid}>
          {daysOfWeek.map((item, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <TouchableOpacity
                key={item.day}
                style={[styles.weekDayPill, isSelected && styles.weekDayPillActive]}
                onPress={() => setSelectedDayIndex(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.weekDayLabel,
                    isSelected && styles.weekDayLabelActive,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.weekDayNum,
                    isSelected && styles.weekDayNumActive,
                  ]}
                >
                  {item.num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Upcoming Appointment Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Upcoming Appointment</Text>
          <View style={styles.nextBadge}>
            <Text style={styles.nextBadgeText}>NEXT UP</Text>
          </View>
        </View>

        {nextAppointment ? (
          <View style={styles.appointmentCard}>
            {/* Aqua strip with date & slot timing */}
            <View style={styles.cardHeaderStrip}>
              <Text style={styles.cardHeaderDate}>
                {nextAppointment.date.includes('2026') ? 'Wed, 14 Aug' : nextAppointment.date}
              </Text>
              <Text style={styles.cardHeaderTime}>{nextAppointment.timeSlot}</Text>
            </View>

            {/* Appointment Card Body */}
            <View style={styles.cardBody}>
              <View style={styles.cardMainRow}>
                <View style={styles.therapistAvatar}>
                  <Text style={styles.therapistInitial}>
                    {nextAppointment.therapistName
                      ?.split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'SP'}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.serviceNameTitle}>{nextAppointment.serviceName}</Text>
                  <Text style={styles.therapistLine}>
                    Therapist:{' '}
                    <Text style={styles.therapistLineBold}>{nextAppointment.therapistName}</Text>
                  </Text>
                </View>
                <View style={styles.confirmedStatusPill}>
                  <View style={styles.confirmedDot} />
                  <Text style={styles.confirmedText}>Confirmed</Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {nextAppointment.location}
                </Text>
              </View>

              <View style={styles.cardActionRow}>
                <TouchableOpacity
                  style={styles.detailsLink}
                  onPress={() => router.push('/bookings')}
                >
                  <Text style={styles.detailsLinkText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={15} color={Colors.primary} />
                </TouchableOpacity>

                <View style={styles.utilBtnsRow}>
                  <TouchableOpacity
                    style={styles.utilBtn}
                    onPress={() => router.push('/bookings')}
                  >
                    <Ionicons name="calendar-outline" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.utilBtnText}>Cal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.utilBtn}
                    onPress={() => router.push('/bookings')}
                  >
                    <Ionicons name="map-outline" size={14} color={Colors.onSurfaceVariant} />
                    <Text style={styles.utilBtnText}>Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="flower-outline" size={32} color={Colors.primaryContainer} />
            <Text style={styles.emptyTitle}>No scheduled appointments</Text>
            <Text style={styles.emptyDesc}>Treat yourself to renewal by booking a session today.</Text>
            <TouchableOpacity
              style={styles.emptyBookBtn}
              onPress={() => router.push('/book')}
            >
              <Text style={styles.emptyBookBtnText}>Browse Treatments</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Featured Massage Services Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>Featured Massage Services</Text>
          <TouchableOpacity onPress={() => router.push('/services')}>
            <Text style={styles.sectionActionText}>Explore all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesList}>
          {services.slice(0, 3).map((item) => (
            <View key={item.id} style={styles.serviceItemCard}>
              <View style={styles.serviceLeft}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons name="sparkles" size={22} color={Colors.primaryContainer} />
                </View>
                <View style={styles.serviceTextBox}>
                  <Text style={styles.serviceItemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.serviceMetaText}>
                    {item.durationMinutes} min •{' '}
                    <Text style={styles.servicePriceText}>${item.price}</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.serviceBookButton}
                onPress={() => router.push(`/book?serviceId=${item.id}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.serviceBookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Recent History */}
        {recentAppointment && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>Recent History</Text>
              <Text style={styles.sectionSubCap}>Past 30 days</Text>
            </View>

            <View style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIconCircle}>
                  <Ionicons name="leaf" size={18} color={Colors.secondary} />
                </View>
                <View style={styles.historyTextBox}>
                  <Text style={styles.historyName}>{recentAppointment.serviceName}</Text>
                  <Text style={styles.historySub}>
                    Completed • {recentAppointment.therapistName}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.rebookBtn}
                onPress={() => router.push(`/book?serviceId=${recentAppointment.serviceId}`)}
              >
                <Ionicons name="refresh" size={14} color={Colors.primary} />
                <Text style={styles.rebookBtnText}>Rebook</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Ambient Relaxation Tip Banner */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconCircle}>
            <Ionicons name="water" size={18} color={Colors.primaryContainer} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Hydration Reminder</Text>
            <Text style={styles.tipText}>
              Drink at least 500ml of room-temperature water before your session for enhanced
              muscle relaxation and optimal therapeutic recovery.
            </Text>
          </View>
        </View>

        {/* Bottom padding for floating customer tab bar */}
        <View style={{ height: 90 }} />
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
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusPillText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 2,
    letterSpacing: -0.3,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  bookCtaCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  bookCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookCtaIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCtaTextBox: {
    flexDirection: 'column',
  },
  bookCtaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  bookCtaSub: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitleCap: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  sectionSubCap: {
    fontSize: 12,
    color: Colors.mutedSlate,
  },
  nextBadge: {
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  weekStripGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 6,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  weekDayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  weekDayPillActive: {
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.mutedSlate,
  },
  weekDayLabelActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  weekDayNum: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: 3,
  },
  weekDayNumActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  appointmentCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },
  cardHeaderStrip: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderDate: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHeaderTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  cardBody: {
    backgroundColor: 'rgba(207, 231, 229, 0.35)',
    padding: 16,
    gap: 12,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  therapistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
  },
  therapistInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardInfo: {
    flex: 1,
  },
  serviceNameTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  therapistLine: {
    fontSize: 12,
    color: Colors.onSecondaryContainer,
    marginTop: 2,
  },
  therapistLineBold: {
    fontWeight: '700',
    color: Colors.charcoal,
  },
  confirmedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  confirmedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
  },
  confirmedText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: Colors.onSecondaryContainer,
    flex: 1,
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 166, 173, 0.12)',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  utilBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  utilBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  utilBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  servicesList: {
    gap: 10,
  },
  serviceItemCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTextBox: {
    flex: 1,
  },
  serviceItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  serviceMetaText: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  servicePriceText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  serviceBookButton: {
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  serviceBookButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  historyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTextBox: {
    flex: 1,
  },
  historyName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  historySub: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 1,
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rebookBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  tipCard: {
    backgroundColor: 'rgba(234, 246, 248, 0.7)',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  tipText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.mutedSlate,
    textAlign: 'center',
  },
  emptyBookBtn: {
    marginTop: 8,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyBookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
