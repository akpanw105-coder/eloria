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
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { AuthGuard } from '../../components/AuthGuard';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { formatNaira } from '../../mock/initialData';
import { PaymentStatus } from '../../types';

export default function AdminPaymentsScreen() {
  const { appointments, refreshAll, isLoading } = useApp();
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all');

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.paymentStatus === filter;
  });

  const totalCaptured = appointments
    .filter((a) => a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.paidAmount || a.price || 0), 0);

  const pendingAmount = appointments
    .filter((a) => a.paymentStatus === 'pending')
    .reduce((sum, a) => sum + (a.price || 0), 0);

  return (
    <AuthGuard requiredRole="admin">
      <ScreenContainer>
      <AppHeader
        title="Ledger & Payments"
        subtitle="Financial Overview"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>PAID REVENUE</Text>
            <Text style={[styles.kpiValue, { color: Colors.success }]}>
              {formatNaira(totalCaptured)}
            </Text>
            <Text style={styles.kpiSub}>Verified receipts</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>PENDING PAYMENT</Text>
            <Text style={[styles.kpiValue, { color: Colors.warning }]}>
              {formatNaira(pendingAmount)}
            </Text>
            <Text style={styles.kpiSub}>Awaiting settlement</Text>
          </View>
        </View>

        {/* Notice Banner */}
        <View style={styles.noticeBanner}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
          <Text style={styles.noticeText}>
            Payments are registered with status pending until transaction verification or cash collection is settled.
          </Text>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'pending', 'paid', 'failed'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filter === status && styles.filterChipActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterChipText, filter === status && styles.filterChipTextActive]}>
                {status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          Transactions ({filteredAppointments.length})
        </Text>

        {filteredAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={36} color={Colors.tertiary} />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySub}>No bookings match the selected status.</Text>
          </View>
        ) : (
          filteredAppointments.map((apt) => {
            const isPaid = apt.paymentStatus === 'paid';
            const isFailed = apt.paymentStatus === 'failed';

            return (
              <View key={apt.id} style={styles.txCard}>
                <View style={styles.txTopRow}>
                  <View style={styles.txIcon}>
                    <Ionicons
                      name={
                        apt.paymentMethod === 'card'
                          ? 'card-outline'
                          : apt.paymentMethod === 'bank_transfer'
                          ? 'business-outline'
                          : 'cash-outline'
                      }
                      size={18}
                      color={Colors.primary}
                    />
                  </View>

                  <View style={styles.txClientCol}>
                    <Text style={styles.txClientName}>{apt.customerName || 'Guest Client'}</Text>
                    <Text style={styles.txServiceSub}>
                      {apt.serviceName} • Specialist: {apt.therapistName || 'Unassigned'}
                    </Text>
                  </View>

                  <View style={styles.txPriceCol}>
                    <Text style={styles.txPrice}>{formatNaira(apt.price)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        isPaid
                          ? styles.statusPaid
                          : isFailed
                          ? styles.statusFailed
                          : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isPaid
                            ? { color: Colors.success }
                            : isFailed
                            ? { color: Colors.error }
                            : { color: Colors.warning },
                        ]}
                      >
                        {apt.paymentStatus.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.txMetaFooter}>
                  <Text style={styles.txDate}>
                    {apt.date} at {apt.timeSlot}
                  </Text>
                  <Text style={styles.txMethod}>
                    Method: {apt.paymentMethod ? apt.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}
                  </Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.mutedSlate,
    letterSpacing: 0.8,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.aquaMist,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.mutedSlate,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.mutedSlate,
  },
  txCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
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
    backgroundColor: Colors.aquaMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txClientCol: {
    flex: 1,
  },
  txClientName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  txServiceSub: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  txPriceCol: {
    alignItems: 'flex-end',
  },
  txPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusPaid: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF8E1',
  },
  statusFailed: {
    backgroundColor: '#FFEBEE',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  txMetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  txDate: {
    fontSize: 11,
    color: Colors.mutedSlate,
  },
  txMethod: {
    fontSize: 11,
    color: Colors.mutedSlate,
    fontWeight: '600',
  },
});
