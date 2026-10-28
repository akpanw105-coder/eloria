import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { MassageService, Therapist } from '../types';
import { INITIAL_SERVICES, INITIAL_THERAPISTS } from '../mock/initialData';

export default function BookAppointmentScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId?: string }>();
  const { services, therapists, createBooking, currentUser } = useApp();

  const effectiveServices = services.length > 0 ? services : INITIAL_SERVICES;
  const effectiveTherapists = therapists.length > 0 ? therapists : INITIAL_THERAPISTS;

  // Booking form state
  const [selectedService, setSelectedService] = useState<MassageService>(() => {
    return (
      effectiveServices.find((s) => s.id === serviceId) ||
      effectiveServices[0] ||
      INITIAL_SERVICES[0]
    );
  });
  const [selectedDate, setSelectedDate] = useState<string>('Wed, 14 Aug');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist>(
    effectiveTherapists[0] || INITIAL_THERAPISTS[0]
  );
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAptId, setConfirmedAptId] = useState<string | null>(null);

  // Calendar dates
  const calendarDays = [
    { label: 'Mon', num: '12', dateStr: 'Mon, 12 Aug', available: true },
    { label: 'Tue', num: '13', dateStr: 'Tue, 13 Aug', available: false },
    { label: 'Wed', num: '14', dateStr: 'Wed, 14 Aug', available: true },
    { label: 'Thu', num: '15', dateStr: 'Thu, 15 Aug', available: false },
    { label: 'Fri', num: '16', dateStr: 'Fri, 16 Aug', available: true },
    { label: 'Sat', num: '17', dateStr: 'Sat, 17 Aug', available: true },
    { label: 'Sun', num: '18', dateStr: 'Sun, 18 Aug', available: false },
  ];

  const morningSlots = [
    { time: '09:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:45 AM', available: false },
  ];

  const afternoonSlots = [
    { time: '02:00 PM', available: true },
    { time: '03:30 PM', available: true },
    { time: '05:00 PM', available: true },
  ];

  const handleProceedToPayment = () => {
    setBookingStep('payment');
  };

  const handleConfirmBooking = async () => {
    try {
      setIsSubmitting(true);
      const newApt = await createBooking({
        customerId: currentUser?.id || 'usr-customer-1',
        customerName: currentUser?.name || 'Guest Client',
        customerEmail: currentUser?.email || 'guest@eloriawellness.com',
        customerPhone: currentUser?.phone || '+1 (555) 000-0000',
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        durationMinutes: selectedService.durationMinutes,
        price: selectedService.price,
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.name,
        therapistAvatar: selectedTherapist.avatarUrl,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        status: 'confirmed',
        location: 'Studio 4B, Eloria Wellness Sanctuary, Central Ave',
        paidAmount: selectedService.price,
        paymentMethod,
        paymentStatus: 'paid',
        notes: 'Client confirmed via Eloria Web/Mobile Booking Flow',
      });
      setConfirmedAptId(newApt.id);
      setBookingStep('confirmed');
    } catch {
      Alert.alert('Booking Notice', 'Unable to complete booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader
        title={
          bookingStep === 'payment'
            ? 'Demo Payment'
            : bookingStep === 'confirmed'
            ? 'Confirmed'
            : 'Book Session Flow'
        }
        subtitle="Eloria"
        showBack={bookingStep !== 'confirmed'}
        onBack={() => {
          if (bookingStep === 'payment') setBookingStep('details');
          else router.back();
        }}
      />

      {bookingStep === 'details' && (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Step indicator header */}
            <View style={styles.stepHeader}>
              <View style={styles.stepTextRow}>
                <Text style={styles.stepTag}>STEP 2 OF 4</Text>
                <Text style={styles.stepTitle}>Date & Time</Text>
              </View>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarFill, { width: '50%' }]} />
              </View>
            </View>

            {/* Selected Service Capsule Card */}
            <View style={styles.selectedServiceCard}>
              <View style={styles.selectedServiceLeft}>
                <View style={styles.serviceIconPill}>
                  <Ionicons name="sparkles" size={20} color={Colors.primaryContainer} />
                </View>
                <View style={styles.serviceCapsuleText}>
                  <Text style={styles.capsuleServiceName}>{selectedService.name}</Text>
                  <Text style={styles.capsuleServiceMeta}>
                    {selectedService.durationMinutes} min restorative session
                  </Text>
                </View>
              </View>
              <Text style={styles.capsulePrice}>${selectedService.price}</Text>
            </View>

            {/* Interactive Calendar Card */}
            <View style={styles.calendarCard}>
              <View style={styles.monthHeaderRow}>
                <TouchableOpacity style={styles.monthNavBtn}>
                  <Ionicons name="chevron-back" size={18} color={Colors.tertiary} />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>AUGUST 2024</Text>
                <TouchableOpacity style={styles.monthNavBtn}>
                  <Ionicons name="chevron-forward" size={18} color={Colors.tertiary} />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((item) => {
                  const isSelected = selectedDate === item.dateStr;
                  return (
                    <TouchableOpacity
                      key={item.dateStr}
                      style={[
                        styles.calendarDatePill,
                        isSelected && styles.calendarDatePillActive,
                        !item.available && styles.calendarDatePillDisabled,
                      ]}
                      onPress={() => item.available && setSelectedDate(item.dateStr)}
                      disabled={!item.available}
                    >
                      <Text
                        style={[
                          styles.calDayLabel,
                          isSelected && styles.calDayLabelActive,
                          !item.available && styles.calDayLabelDisabled,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text
                        style={[
                          styles.calDayNum,
                          isSelected && styles.calDayNumActive,
                          !item.available && styles.calDayNumDisabled,
                        ]}
                      >
                        {item.num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Available Time Slots Section */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeading}>Available Time Slots</Text>
                <View style={styles.timeZoneRow}>
                  <Ionicons name="time-outline" size={14} color={Colors.tertiary} />
                  <Text style={styles.timeZoneText}>GMT-4 (EDT)</Text>
                </View>
              </View>

              <Text style={styles.slotGroupLabel}>MORNING</Text>
              <View style={styles.slotGrid}>
                {morningSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.slotButton,
                        isSelected && styles.slotButtonActive,
                        !slot.available && styles.slotButtonDisabled,
                      ]}
                      onPress={() => slot.available && setSelectedTimeSlot(slot.time)}
                      disabled={!slot.available}
                    >
                      <Text
                        style={[
                          styles.slotButtonText,
                          isSelected && styles.slotButtonTextActive,
                          !slot.available && styles.slotButtonTextDisabled,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.slotGroupLabel, { marginTop: 12 }]}>AFTERNOON</Text>
              <View style={styles.slotGrid}>
                {afternoonSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.time;
                  return (
                    <TouchableOpacity
                      key={slot.time}
                      style={[
                        styles.slotButton,
                        isSelected && styles.slotButtonActive,
                        !slot.available && styles.slotButtonDisabled,
                      ]}
                      onPress={() => slot.available && setSelectedTimeSlot(slot.time)}
                      disabled={!slot.available}
                    >
                      <Text
                        style={[
                          styles.slotButtonText,
                          isSelected && styles.slotButtonTextActive,
                          !slot.available && styles.slotButtonTextDisabled,
                        ]}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Therapist Selection */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionHeading}>Therapist Selection</Text>
                <Text style={styles.therapistNote}>Any Specialist Available</Text>
              </View>

              <View style={styles.therapistsGrid}>
                {effectiveTherapists.map((therapist) => {
                  const isSelected = selectedTherapist?.id === therapist.id;
                  return (
                    <TouchableOpacity
                      key={therapist.id}
                      style={[
                        styles.therapistCard,
                        isSelected && styles.therapistCardActive,
                      ]}
                      onPress={() => setSelectedTherapist(therapist)}
                      activeOpacity={0.8}
                    >
                      {isSelected && <View style={styles.activeTherapistBar} />}
                      <View style={styles.therapistCardImg}>
                        <Text style={styles.therapistCardInitials}>
                          {therapist.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.therapistCardInfo}>
                        <Text style={styles.therapistCardName} numberOfLines={1}>
                          {therapist.name}
                        </Text>
                        <Text
                          style={[
                            styles.therapistCardTitle,
                            isSelected && styles.therapistCardTitleActive,
                          ]}
                          numberOfLines={1}
                        >
                          {therapist.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>

          {/* Sticky Bottom Summary & Payment Action Drawer */}
          <View style={styles.stickyFooterDrawer}>
            <View style={styles.drawerSummaryRow}>
              <View style={styles.drawerLeft}>
                <View style={styles.drawerCheckRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primaryContainer} />
                  <Text style={styles.drawerSelectedTime}>
                    {selectedDate} at {selectedTimeSlot}
                  </Text>
                </View>
                <Text style={styles.drawerSubText}>
                  {selectedService.name} • {selectedTherapist.name}
                </Text>
              </View>
              <View style={styles.drawerRight}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalPrice}>${selectedService.price}.00</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueToPaymentBtn}
              onPress={handleProceedToPayment}
              activeOpacity={0.9}
            >
              <Text style={styles.continueBtnText}>Continue to Payment</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Step 2: Demo Payment Screen */}
      {bookingStep === 'payment' && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Demo disclaimer banner */}
          <View style={styles.demoDisclaimerBox}>
            <Ionicons name="information-circle" size={20} color={Colors.primaryContainer} />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoDisclaimerTitle}>Demo Payment Flow</Text>
              <Text style={styles.demoDisclaimerText}>
                No real credit card will be charged. This environment stores bookings and local
                receipts in your browser's persistent mock storage.
              </Text>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.receiptBox}>
            <Text style={styles.receiptHeader}>Treatment Summary</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{selectedService.name}</Text>
              <Text style={styles.receiptVal}>${selectedService.price}.00</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Specialist: {selectedTherapist.name}</Text>
              <Text style={styles.receiptVal}>Included</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Schedule</Text>
              <Text style={styles.receiptVal}>
                {selectedDate}, {selectedTimeSlot}
              </Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptRow}>
              <Text style={styles.receiptTotalLabel}>Amount to Authorize</Text>
              <Text style={styles.receiptTotalVal}>${selectedService.price}.00</Text>
            </View>
          </View>

          {/* Payment Method Selector */}
          <View style={styles.paymentMethodsBox}>
            <Text style={styles.methodsTitle}>Select Payment Method</Text>

            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'card' && styles.methodOptionActive,
              ]}
              onPress={() => setPaymentMethod('card')}
            >
              <Ionicons
                name="card-outline"
                size={20}
                color={paymentMethod === 'card' ? Colors.primaryContainer : Colors.tertiary}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.methodName}>Credit / Debit Card (Demo)</Text>
                <Text style={styles.methodSub}>Ending in •••• 4242 (Pre-filled demo card)</Text>
              </View>
              {paymentMethod === 'card' && (
                <Ionicons name="checkmark" size={18} color={Colors.primaryContainer} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'apple_pay' && styles.methodOptionActive,
              ]}
              onPress={() => setPaymentMethod('apple_pay')}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={paymentMethod === 'apple_pay' ? Colors.primaryContainer : Colors.tertiary}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.methodName}>Apple Pay (Simulated)</Text>
                <Text style={styles.methodSub}>Fast one-touch checkout</Text>
              </View>
              {paymentMethod === 'apple_pay' && (
                <Ionicons name="checkmark" size={18} color={Colors.primaryContainer} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodOption,
                paymentMethod === 'cash' && styles.methodOptionActive,
              ]}
              onPress={() => setPaymentMethod('cash')}
            >
              <Ionicons
                name="cash-outline"
                size={20}
                color={paymentMethod === 'cash' ? Colors.primaryContainer : Colors.tertiary}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.methodName}>Pay at Sanctuary Desk</Text>
                <Text style={styles.methodSub}>Cash or card on arrival</Text>
              </View>
              {paymentMethod === 'cash' && (
                <Ionicons name="checkmark" size={18} color={Colors.primaryContainer} />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm and Pay Button */}
          <TouchableOpacity
            style={[styles.continueToPaymentBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleConfirmBooking}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            <Text style={styles.continueBtnText}>
              {isSubmitting ? 'Confirming Sanctuary Slot...' : `Authorize $${selectedService.price}.00 (Demo)`}
            </Text>
            <Ionicons name="shield-checkmark" size={18} color={Colors.onPrimary} />
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Step 3: Booking Confirmed Confirmation Screen */}
      {bookingStep === 'confirmed' && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { alignItems: 'center', paddingTop: 30 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.confirmedHeroCircle}>
            <Ionicons name="checkmark" size={38} color={Colors.onPrimary} />
          </View>

          <Text style={styles.successHeading}>Appointment Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            We have reserved your sanctuary time. A booking confirmation alert has been added to
            your notifications.
          </Text>

          <View style={styles.confirmedCard}>
            <View style={styles.confirmedCardHeader}>
              <Text style={styles.confirmedRefNum}>
                REF: {confirmedAptId || 'ELORIA-APT'}
              </Text>
              <Text style={styles.confirmedStatusTag}>PAID & RESERVED</Text>
            </View>

            <View style={styles.confirmedDetailsBody}>
              <Text style={styles.confirmedService}>{selectedService.name}</Text>
              <Text style={styles.confirmedTherapist}>With {selectedTherapist.name}</Text>

              <View style={styles.confirmedMetaRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.confirmedMetaText}>
                  {selectedDate} at {selectedTimeSlot}
                </Text>
              </View>

              <View style={styles.confirmedMetaRow}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Text style={styles.confirmedMetaText}>
                  Studio 4B, Eloria Wellness Sanctuary, Central Ave
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.confirmedActions}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => router.replace('/bookings')}
            >
              <Ionicons name="calendar" size={18} color={Colors.onPrimary} />
              <Text style={styles.primaryActionText}>View My Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.secondaryActionText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
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
    gap: 16,
  },
  stepHeader: {
    gap: 8,
  },
  stepTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryContainer,
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: 13,
    color: Colors.tertiary,
    fontWeight: '500',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.surfaceContainer,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryContainer,
    borderRadius: 3,
  },
  selectedServiceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  selectedServiceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceIconPill: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCapsuleText: {
    flex: 1,
  },
  capsuleServiceName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  capsuleServiceMeta: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 2,
  },
  capsulePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryContainer,
  },
  calendarCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  monthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  calendarDatePill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    minWidth: 40,
  },
  calendarDatePillActive: {
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarDatePillDisabled: {
    opacity: 0.35,
  },
  calDayLabel: {
    fontSize: 11,
    color: Colors.tertiary,
    fontWeight: '500',
  },
  calDayLabelActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  calDayLabelDisabled: {
    color: Colors.outlineVariant,
  },
  calDayNum: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: 4,
  },
  calDayNumActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  calDayNumDisabled: {
    color: Colors.outlineVariant,
  },
  sectionBox: {
    gap: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  timeZoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeZoneText: {
    fontSize: 11,
    color: Colors.tertiary,
  },
  slotGroupLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
  },
  slotGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  slotButton: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  slotButtonActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOpacity: 0.3,
  },
  slotButtonDisabled: {
    backgroundColor: Colors.surfaceContainerLow,
    opacity: 0.5,
  },
  slotButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  slotButtonTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  slotButtonTextDisabled: {
    color: Colors.tertiary,
    textDecorationLine: 'line-through',
  },
  therapistNote: {
    fontSize: 11,
    color: Colors.primaryContainer,
    fontWeight: '600',
  },
  therapistsGrid: {
    gap: 10,
  },
  therapistCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    position: 'relative',
    overflow: 'hidden',
  },
  therapistCardActive: {
    borderColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  activeTherapistBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primaryContainer,
  },
  therapistCardImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
  },
  therapistCardInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  therapistCardInfo: {
    flex: 1,
  },
  therapistCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  therapistCardTitle: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 2,
  },
  therapistCardTitleActive: {
    color: Colors.primaryContainer,
    fontWeight: '600',
  },
  stickyFooterDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
    gap: 12,
  },
  drawerSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerLeft: {
    flex: 1,
  },
  drawerCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawerSelectedTime: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryContainer,
  },
  drawerSubText: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 2,
  },
  drawerRight: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  continueToPaymentBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  continueBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  demoDisclaimerBox: {
    backgroundColor: Colors.aquaTint,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 166, 173, 0.25)',
  },
  demoDisclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  demoDisclaimerText: {
    fontSize: 12,
    color: Colors.onSecondaryContainer,
    lineHeight: 17,
    marginTop: 2,
  },
  receiptBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
  },
  receiptHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: 4,
  },
  receiptTotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  receiptTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentMethodsBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
  },
  methodsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  methodOptionActive: {
    backgroundColor: Colors.aquaTint,
    borderColor: Colors.primaryContainer,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  methodSub: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 1,
  },
  confirmedHeroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  successHeading: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: Colors.tertiary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    paddingHorizontal: 16,
  },
  confirmedCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    width: '100%',
    marginTop: 20,
    overflow: 'hidden',
  },
  confirmedCardHeader: {
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmedRefNum: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  confirmedStatusTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  confirmedDetailsBody: {
    padding: 16,
    gap: 8,
  },
  confirmedService: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  confirmedTherapist: {
    fontSize: 13,
    color: Colors.tertiary,
  },
  confirmedMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  confirmedMetaText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  confirmedActions: {
    width: '100%',
    gap: 12,
    marginTop: 24,
  },
  primaryActionButton: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  secondaryActionButton: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.charcoal,
  },
});
