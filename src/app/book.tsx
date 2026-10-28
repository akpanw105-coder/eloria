import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { MassageService, Therapist } from '../types';
import { INITIAL_SERVICES, INITIAL_THERAPISTS, formatNaira } from '../mock/initialData';

export default function BookAppointmentScreen() {
  const params = useLocalSearchParams<{ serviceId?: string }>();
  const { services, therapists, appointments, createBooking, currentUser } = useApp();

  const availableServices = services.length > 0 ? services : INITIAL_SERVICES;
  const availableTherapists = therapists.length > 0 ? therapists : INITIAL_THERAPISTS;

  // Selected Service
  const [selectedService, setSelectedService] = useState<MassageService>(() => {
    return (
      availableServices.find((s) => s.id === params.serviceId) ||
      availableServices[0] ||
      INITIAL_SERVICES[0]
    );
  });

  // Therapist preference: null means "Any Available Therapist"
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

  // Date selection
  const today = new Date();
  const dateOptions = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const iso = d.toISOString().split('T')[0];
    return {
      iso,
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate(),
      month: monthNames[d.getMonth()],
      formatted: `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]}`,
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].iso);

  // Time Slots
  const timeSlots = [
    '09:00 AM',
    '10:30 AM',
    '12:00 PM',
    '01:30 PM',
    '03:00 PM',
    '04:30 PM',
    '06:00 PM',
    '07:30 PM',
  ];

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(timeSlots[0]);

  // Flow Steps: 'details' -> 'review_payment' -> 'success'
  const [bookingStep, setBookingStep] = useState<'details' | 'review_payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer' | 'cash'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Check if slot is booked by the selected therapist
  const isSlotBooked = (slot: string) => {
    if (!selectedTherapist) return false;
    return appointments.some(
      (a) =>
        a.therapistId === selectedTherapist.id &&
        a.date === selectedDate &&
        a.timeSlot === slot &&
        a.status !== 'cancelled' &&
        a.status !== 'rejected'
    );
  };

  const handleProceedToReview = () => {
    if (!currentUser) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to proceed with booking your appointment.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }

    if (isSlotBooked(selectedTimeSlot)) {
      Alert.alert('Slot Unavailable', 'This time slot is already booked for the selected specialist. Please choose another slot.');
      return;
    }

    setBookingStep('review_payment');
  };

  const handleConfirmAndPay = async () => {
    try {
      setIsSubmitting(true);

      // Determine therapist assignment: if 'any', assign first therapist or store preference
      const assignedTherapistId = selectedTherapist ? selectedTherapist.id : (availableTherapists[0]?.id || null);

      const newBooking = await createBooking({
        serviceId: selectedService.id,
        therapistId: assignedTherapistId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        price: selectedService.price,
        paymentMethod,
        paymentStatus: 'pending', // Payment pending provider completion / transfer verification
        status: 'pending', // Pending admin confirmation
        notes: selectedTherapist ? `Requested: ${selectedTherapist.name}` : 'Client selected Any Available Therapist',
      });

      setConfirmedBookingId(newBooking.id);
      setBookingStep('success');
    } catch (err: any) {
      Alert.alert('Booking Error', err.message || 'Could not complete your booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (bookingStep === 'review_payment') {
              setBookingStep('details');
            } else if (bookingStep === 'success') {
              router.replace('/bookings');
            } else {
              router.back();
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {bookingStep === 'details' && 'Book Massage Session'}
          {bookingStep === 'review_payment' && 'Review & Payment'}
          {bookingStep === 'success' && 'Booking Confirmed'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {bookingStep === 'details' && (
          <>
            {/* Step 1: Select Massage Service */}
            <View style={styles.stepSection}>
              <View style={styles.stepTitleRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepTitle}>Select Massage Service</Text>
              </View>

              <View style={styles.servicesList}>
                {availableServices.map((svc) => {
                  const isSelected = selectedService.id === svc.id;
                  return (
                    <TouchableOpacity
                      key={svc.id}
                      style={[styles.serviceOptionCard, isSelected && styles.serviceOptionCardSelected]}
                      onPress={() => setSelectedService(svc)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.serviceOptionRadio}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={isSelected ? Colors.primary : Colors.outline}
                        />
                      </View>
                      <View style={styles.serviceOptionInfo}>
                        <View style={styles.serviceNameRow}>
                          <Text style={[styles.serviceOptionName, isSelected && styles.serviceOptionNameSelected]}>
                            {svc.name}
                          </Text>
                          <Text style={styles.serviceOptionPrice}>{formatNaira(svc.price)}</Text>
                        </View>
                        <Text style={styles.serviceOptionMeta}>
                          {svc.durationMinutes} mins • {svc.badge || 'Therapeutic'}
                        </Text>
                        <Text style={styles.serviceOptionTagline}>{svc.tagline}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 2: Choose Therapist */}
            <View style={styles.stepSection}>
              <View style={styles.stepTitleRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepTitle}>Choose Specialist</Text>
              </View>

              <View style={styles.therapistGrid}>
                {/* Option: Any Available Therapist */}
                <TouchableOpacity
                  style={[
                    styles.therapistOptionCard,
                    selectedTherapist === null && styles.therapistOptionCardSelected,
                  ]}
                  onPress={() => setSelectedTherapist(null)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.avatarCircle, selectedTherapist === null && styles.avatarCircleSelected]}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={selectedTherapist === null ? Colors.onPrimary : Colors.primary}
                    />
                  </View>
                  <View style={styles.therapistInfo}>
                    <Text style={styles.therapistName}>Any Available Specialist</Text>
                    <Text style={styles.therapistRole}>Fastest confirmation</Text>
                  </View>
                  <Ionicons
                    name={selectedTherapist === null ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={selectedTherapist === null ? Colors.primary : Colors.outline}
                  />
                </TouchableOpacity>

                {/* Named Specialists */}
                {availableTherapists.map((th) => {
                  const isSelected = selectedTherapist?.id === th.id;
                  return (
                    <TouchableOpacity
                      key={th.id}
                      style={[styles.therapistOptionCard, isSelected && styles.therapistOptionCardSelected]}
                      onPress={() => setSelectedTherapist(th)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.avatarCircle, isSelected && styles.avatarCircleSelected]}>
                        <Ionicons
                          name="person"
                          size={18}
                          color={isSelected ? Colors.onPrimary : Colors.primary}
                        />
                      </View>
                      <View style={styles.therapistInfo}>
                        <Text style={styles.therapistName}>{th.name}</Text>
                        <Text style={styles.therapistRole}>
                          ⭐ {th.rating} • {th.title}
                        </Text>
                      </View>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={isSelected ? Colors.primary : Colors.outline}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Step 3: Choose Date & Time */}
            <View style={styles.stepSection}>
              <View style={styles.stepTitleRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepTitle}>Select Date & Time</Text>
              </View>

              {/* Date Scroll Strip */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
                {dateOptions.map((opt) => {
                  const isSelected = selectedDate === opt.iso;
                  return (
                    <TouchableOpacity
                      key={opt.iso}
                      style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                      onPress={() => setSelectedDate(opt.iso)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.dateCardDay, isSelected && styles.dateCardTextSelected]}>
                        {opt.dayName}
                      </Text>
                      <Text style={[styles.dateCardNum, isSelected && styles.dateCardTextSelected]}>
                        {opt.dayNum}
                      </Text>
                      <Text style={[styles.dateCardMonth, isSelected && styles.dateCardTextSelected]}>
                        {opt.month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Time Slots Grid */}
              <Text style={styles.slotsHeader}>Available Time Slots</Text>
              <View style={styles.slotsGrid}>
                {timeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  const booked = isSlotBooked(slot);
                  return (
                    <TouchableOpacity
                      key={slot}
                      disabled={booked}
                      style={[
                        styles.slotCard,
                        isSelected && styles.slotCardSelected,
                        booked && styles.slotCardBooked,
                      ]}
                      onPress={() => setSelectedTimeSlot(slot)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.slotCardText,
                          isSelected && styles.slotCardTextSelected,
                          booked && styles.slotCardTextBooked,
                        ]}
                      >
                        {slot}
                      </Text>
                      {booked && <Text style={styles.bookedLabel}>Booked</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Proceed CTA Button */}
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleProceedToReview}
              activeOpacity={0.85}
            >
              <View>
                <Text style={styles.primaryActionBtnSub}>Total: {formatNaira(selectedService.price)}</Text>
                <Text style={styles.primaryActionBtnText}>Review & Proceed to Payment</Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color={Colors.onPrimary} />
            </TouchableOpacity>
          </>
        )}

        {/* Step 4 & 5: Review Booking Details & Payment Provider Selection */}
        {bookingStep === 'review_payment' && (
          <View style={styles.reviewContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Appointment Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Treatment</Text>
                <Text style={styles.summaryValueBold}>{selectedService.name}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{selectedService.durationMinutes} minutes</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Specialist</Text>
                <Text style={styles.summaryValue}>
                  {selectedTherapist ? selectedTherapist.name : 'Any Available Specialist'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date & Time</Text>
                <Text style={styles.summaryValue}>
                  {selectedDate} at {selectedTimeSlot}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>Eloria Sanctuary, Private Suite</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>{formatNaira(selectedService.price)}</Text>
              </View>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.paymentSection}>
              <Text style={styles.paymentSectionTitle}>Select Payment Method</Text>

              <TouchableOpacity
                style={[styles.paymentMethodCard, paymentMethod === 'card' && styles.paymentMethodCardSelected]}
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.8}
              >
                <Ionicons name="card-outline" size={24} color={Colors.primary} />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Debit / Credit Card</Text>
                  <Text style={styles.paymentMethodDesc}>Paystack / Flutterwave secure gateway</Text>
                </View>
                <Ionicons
                  name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={paymentMethod === 'card' ? Colors.primary : Colors.outline}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentMethodCard, paymentMethod === 'bank_transfer' && styles.paymentMethodCardSelected]}
                onPress={() => setPaymentMethod('bank_transfer')}
                activeOpacity={0.8}
              >
                <Ionicons name="business-outline" size={24} color={Colors.primary} />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Direct Bank Transfer</Text>
                  <Text style={styles.paymentMethodDesc}>Instant Nigerian bank account transfer</Text>
                </View>
                <Ionicons
                  name={paymentMethod === 'bank_transfer' ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={paymentMethod === 'bank_transfer' ? Colors.primary : Colors.outline}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentMethodCard, paymentMethod === 'cash' && styles.paymentMethodCardSelected]}
                onPress={() => setPaymentMethod('cash')}
                activeOpacity={0.8}
              >
                <Ionicons name="cash-outline" size={24} color={Colors.primary} />
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Pay at Sanctuary</Text>
                  <Text style={styles.paymentMethodDesc}>Pay upon arrival prior to session</Text>
                </View>
                <Ionicons
                  name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={paymentMethod === 'cash' ? Colors.primary : Colors.outline}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={handleConfirmAndPay}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <>
                  <View>
                    <Text style={styles.primaryActionBtnSub}>Pay {formatNaira(selectedService.price)}</Text>
                    <Text style={styles.primaryActionBtnText}>Confirm Booking Request</Text>
                  </View>
                  <Ionicons name="shield-checkmark" size={22} color={Colors.onPrimary} />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Step 6: Booking Result & Confirmation */}
        {bookingStep === 'success' && (
          <View style={styles.successContainer}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            </View>

            <Text style={styles.successTitle}>Booking Request Submitted!</Text>
            <Text style={styles.successSubtitle}>
              Your appointment request has been securely recorded in the Eloria system. Our administrator will review and confirm your session.
            </Text>

            <View style={styles.successDetailsCard}>
              <Text style={styles.successDetailsHeader}>Booking Reference Details</Text>
              <Text style={styles.successLine}>• Treatment: {selectedService.name}</Text>
              <Text style={styles.successLine}>• Date & Time: {selectedDate} at {selectedTimeSlot}</Text>
              <Text style={styles.successLine}>• Specialist: {selectedTherapist ? selectedTherapist.name : 'Any Available Specialist'}</Text>
              <Text style={styles.successLine}>• Total Price: {formatNaira(selectedService.price)}</Text>
              <Text style={styles.successLine}>• Status: Pending Admin Confirmation</Text>
              <Text style={styles.successLine}>• Reminder: Scheduled for 2 hours before session</Text>
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={() => router.replace('/bookings')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>View in My Bookings</Text>
              <Ionicons name="calendar-outline" size={20} color={Colors.onPrimary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  stepSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  servicesList: {
    gap: 10,
  },
  serviceOptionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.aquaMist,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.aquaTint,
  },
  serviceOptionCardSelected: {
    backgroundColor: '#ffffff',
    borderColor: Colors.primary,
  },
  serviceOptionRadio: {
    marginRight: 10,
    marginTop: 2,
  },
  serviceOptionInfo: {
    flex: 1,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  serviceOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  serviceOptionNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  serviceOptionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  serviceOptionMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.mutedSlate,
    marginBottom: 2,
  },
  serviceOptionTagline: {
    fontSize: 12,
    color: Colors.mutedSlate,
  },
  therapistGrid: {
    gap: 10,
  },
  therapistOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.aquaMist,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.aquaTint,
  },
  therapistOptionCardSelected: {
    backgroundColor: '#ffffff',
    borderColor: Colors.primary,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.aquaTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarCircleSelected: {
    backgroundColor: Colors.primary,
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  therapistRole: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  dateScroll: {
    marginBottom: 16,
  },
  dateCard: {
    width: 60,
    height: 70,
    backgroundColor: Colors.aquaMist,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.aquaTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateCardDay: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.mutedSlate,
  },
  dateCardNum: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginVertical: 2,
  },
  dateCardMonth: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.mutedSlate,
  },
  dateCardTextSelected: {
    color: Colors.onPrimary,
  },
  slotsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    width: '31%',
    backgroundColor: Colors.aquaMist,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.aquaTint,
  },
  slotCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotCardBooked: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderColor: Colors.hairlineBorder,
    opacity: 0.5,
  },
  slotCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  slotCardTextSelected: {
    color: Colors.onPrimary,
  },
  slotCardTextBooked: {
    color: Colors.mutedSlate,
  },
  bookedLabel: {
    fontSize: 9,
    color: Colors.error,
    fontWeight: '600',
  },
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryActionBtnSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  primaryActionBtnText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  reviewContainer: {
    gap: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.mutedSlate,
  },
  summaryValue: {
    fontSize: 13,
    color: Colors.charcoal,
    fontWeight: '500',
  },
  summaryValueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.hairlineBorder,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  paymentSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  paymentSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 12,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.aquaMist,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.aquaTint,
    marginBottom: 10,
  },
  paymentMethodCardSelected: {
    backgroundColor: '#ffffff',
    borderColor: Colors.primary,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  successContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  successIconCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  successDetailsCard: {
    width: '100%',
    backgroundColor: Colors.aquaMist,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
    marginBottom: 20,
  },
  successDetailsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  successLine: {
    fontSize: 12,
    color: Colors.charcoal,
    lineHeight: 20,
  },
});
