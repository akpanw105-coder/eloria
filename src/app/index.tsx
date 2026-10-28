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
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { formatNaira } from '../mock/initialData';

export default function CustomerHomeScreen() {
  const { currentUser, services, appointments, refreshAll, isLoading } = useApp();

  // Next upcoming confirmed or pending appointment for this client
  const activeAppointment = appointments.find((a) => a.status === 'confirmed' || a.status === 'pending');

  return (
    <ScreenContainer>
      {/* Modern Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandTitleWrap}>
          <View style={styles.logoPill}>
            <Ionicons name="sparkles" size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.brandSub}>SANCTUARY & WELLNESS</Text>
            <Text style={styles.brandTitle}>Eloria</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push(currentUser?.role === 'admin' ? '/admin' : '/profile')}
          activeOpacity={0.8}
        >
          <Ionicons
            name={currentUser?.role === 'admin' ? 'shield-checkmark' : 'person-circle-outline'}
            size={28}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {/* Welcome Greeting */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingBadge}>
            <Text style={styles.greetingBadgeText}>Holistic Rejuvenation</Text>
            <View style={styles.pulsingDot} />
          </View>
          <Text style={styles.greetingName}>
            Welcome, {currentUser?.name || 'Valued Guest'}
          </Text>
          <Text style={styles.greetingSub}>
            Book your bespoke therapeutic massage session with certified specialists.
          </Text>
        </View>

        {/* Hero Booking CTA */}
        <TouchableOpacity
          style={styles.heroCtaCard}
          onPress={() => router.push('/book')}
          activeOpacity={0.9}
        >
          <View style={styles.heroCtaLeft}>
            <View style={styles.heroCtaIconBox}>
              <Ionicons name="calendar" size={24} color={Colors.onPrimary} />
            </View>
            <View>
              <Text style={styles.heroCtaTitle}>Book an Appointment</Text>
              <Text style={styles.heroCtaSub}>Choose massage, specialist & time</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color={Colors.onPrimary} />
        </TouchableOpacity>

        {/* Active Appointment Card (if any) */}
        {activeAppointment && (
          <View style={styles.appointmentBanner}>
            <View style={styles.appointmentBannerHeader}>
              <View style={styles.statusBadgeRow}>
                <Ionicons
                  name={activeAppointment.status === 'confirmed' ? 'checkmark-circle' : 'time-outline'}
                  size={16}
                  color={activeAppointment.status === 'confirmed' ? Colors.success : Colors.warning}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    { color: activeAppointment.status === 'confirmed' ? Colors.success : Colors.warning },
                  ]}
                >
                  {activeAppointment.status === 'confirmed' ? 'Confirmed Booking' : 'Pending Confirmation'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/bookings')}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.appointmentService}>{activeAppointment.serviceName}</Text>
            <Text style={styles.appointmentMeta}>
              {activeAppointment.date} • {activeAppointment.timeSlot} • Specialist: {activeAppointment.therapistName}
            </Text>
          </View>
        )}

        {/* Services Menu Section */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Our Massage Treatments</Text>
            <Text style={styles.sectionSub}>All prices displayed in Nigerian Naira (₦)</Text>
          </View>
        </View>

        <View style={styles.servicesGrid}>
          {services.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceTopRow}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgePillText}>{service.badge || 'Therapeutic'}</Text>
                </View>
                <Text style={styles.serviceDuration}>{service.durationMinutes} mins</Text>
              </View>

              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc} numberOfLines={2}>
                {service.description || service.tagline}
              </Text>

              <View style={styles.serviceFooter}>
                <View>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.servicePrice}>{formatNaira(service.price)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.bookSmallBtn}
                  onPress={() => router.push({ pathname: '/book', params: { serviceId: service.id } })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookSmallBtnText}>Book Now</Text>
                  <Ionicons name="chevron-forward" size={14} color={Colors.onPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Sanctuary Commitment Info */}
        <View style={styles.sanctuaryBanner}>
          <Ionicons name="leaf-outline" size={24} color={Colors.primary} />
          <View style={styles.sanctuaryTextWrap}>
            <Text style={styles.sanctuaryTitle}>The Eloria Experience</Text>
            <Text style={styles.sanctuaryDesc}>
              Organic essential oils, discreet private suites, and certified bodywork specialists tailored to your relaxation.
            </Text>
          </View>
        </View>
      </ScrollView>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.aquaMist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  brandSub: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  profileBtn: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greetingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 6,
  },
  greetingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  greetingSub: {
    fontSize: 13,
    color: Colors.mutedSlate,
    marginTop: 4,
    lineHeight: 18,
  },
  heroCtaCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCtaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaTitle: {
    color: Colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  heroCtaSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  appointmentBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    marginBottom: 20,
  },
  appointmentBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  appointmentService: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  appointmentMeta: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  serviceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgePill: {
    backgroundColor: Colors.aquaMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.primary,
  },
  serviceDuration: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.mutedSlate,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 13,
    color: Colors.mutedSlate,
    lineHeight: 18,
    marginBottom: 14,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  bookSmallBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  bookSmallBtnText: {
    color: Colors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  sanctuaryBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.aquaMist,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  sanctuaryTextWrap: {
    flex: 1,
  },
  sanctuaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  sanctuaryDesc: {
    fontSize: 12,
    color: Colors.mutedSlate,
    lineHeight: 18,
  },
});
