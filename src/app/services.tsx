import React from 'react';
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

export default function ServicesScreen() {
  const { services, refreshAll, isLoading } = useApp();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
        <Text style={styles.headerSub}>All prices in ₦ (Nigerian Naira)</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceTopRow}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{service.badge || 'Therapeutic'}</Text>
              </View>
              <Text style={styles.serviceDuration}>{service.durationMinutes} mins</Text>
            </View>

            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceTagline}>{service.tagline}</Text>

            {service.description ? (
              <Text style={styles.serviceDesc}>{service.description}</Text>
            ) : null}

            <View style={styles.serviceFooter}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.servicePrice}>{formatNaira(service.price)}</Text>
              </View>

              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() =>
                  router.push({
                    pathname: '/book',
                    params: { serviceId: service.id },
                  })
                }
                activeOpacity={0.8}
              >
                <Text style={styles.bookBtnText}>Book Now</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.onPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.footerNote}>
          <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
          <Text style={styles.footerNoteText}>
            Prices are inclusive of all materials, premium products, and sanctuary ambiance.
            Payment may be made by card, bank transfer, or upon arrival.
          </Text>
        </View>
      </ScrollView>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.charcoal },
  headerSub: { fontSize: 12, color: Colors.mutedSlate, marginTop: 2 },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  serviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
  badgePillText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  serviceDuration: { fontSize: 12, fontWeight: '600', color: Colors.mutedSlate },
  serviceName: { fontSize: 18, fontWeight: '800', color: Colors.charcoal, marginBottom: 4 },
  serviceTagline: { fontSize: 12, fontWeight: '600', color: Colors.secondary, marginBottom: 6 },
  serviceDesc: {
    fontSize: 13,
    color: Colors.mutedSlate,
    lineHeight: 19,
    marginBottom: 14,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    paddingTop: 12,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  servicePrice: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  bookBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  bookBtnText: { color: Colors.onPrimary, fontSize: 13, fontWeight: '700' },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.aquaMist,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  footerNoteText: { flex: 1, fontSize: 12, color: Colors.mutedSlate, lineHeight: 18 },
});
