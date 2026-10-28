import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminPaymentsScreen() {
  const { appointments } = useApp();

  const totalCaptured = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.paidAmount || 0), 0);

  return (
    <ScreenContainer>
      <AppHeader title="Ledger & Payments" subtitle="Treasury" showBack onBack={() => {}} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Captured Hero Card */}
        <View style={styles.revenueHeroCard}>
          <Text style={styles.heroSub}>TOTAL CAPTURED REVENUE (DEMO)</Text>
          <Text style={styles.heroAmount}>${totalCaptured}.00</Text>
          <View style={styles.demoNotice}>
            <Ionicons name="information-circle" size={14} color={Colors.primary} />
            <Text style={styles.demoNoticeText}>
              All transactions are simulated frontend records for sanctuary testing.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transaction History ({appointments.length})</Text>

        {appointments.map((apt) => (
          <View key={apt.id} style={styles.txCard}>
            <View style={styles.txTopRow}>
              <View style={styles.txIcon}>
                <Ionicons
                  name={apt.paymentMethod === 'apple_pay' ? 'logo-apple' : 'card-outline'}
                  size={18}
                  color={Colors.primaryContainer}
                />
              </View>

              <View style={styles.txClientCol}>
                <Text style={styles.txClientName}>{apt.customerName}</Text>
                <Text style={styles.txServiceSub}>
                  {apt.serviceName} • {apt.therapistName}
                </Text>
              </View>

              <View style={styles.txPriceCol}>
                <Text style={styles.txPrice}>+${apt.paidAmount}.00</Text>
                <Text
                  style={[
                    styles.txStatus,
                    apt.paymentStatus === 'paid' ? { color: Colors.success } : { color: Colors.error },
                  ]}
                >
                  {apt.paymentStatus.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.txMetaFooter}>
              <Text style={styles.txDate}>
                {apt.date} • {apt.timeSlot}
              </Text>
              <Text style={styles.txRef}>REF: {apt.id}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
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
    gap: 12,
  },
  revenueHeroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    alignItems: 'center',
    gap: 6,
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  demoNoticeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 6,
  },
  txCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  txTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  txIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txClientCol: {
    flex: 1,
  },
  txClientName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  txServiceSub: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 1,
  },
  txPriceCol: {
    alignItems: 'flex-end',
  },
  txPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  txStatus: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  txMetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  txDate: {
    fontSize: 11,
    color: Colors.mutedSlate,
  },
  txRef: {
    fontSize: 10,
    color: Colors.tertiary,
    fontWeight: '600',
  },
});
