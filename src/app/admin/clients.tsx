import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminClientsScreen() {
  const { allUsers, appointments, refreshAll, isLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientAppointmentCount = (clientId: string) =>
    appointments.filter((a) => a.customerId === clientId).length;

  const getClientTotalSpend = (clientId: string) =>
    appointments
      .filter((a) => a.customerId === clientId && a.paymentStatus === 'paid')
      .reduce((sum, a) => sum + a.price, 0);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client Records</Text>
        <Text style={styles.headerCount}>{allUsers.length} clients</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.mutedSlate} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search clients by name or email…"
          placeholderTextColor={Colors.outline}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.mutedSlate} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {filteredClients.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={40} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No clients match your search.' : 'No client records found. Clients appear here after they register and sign in.'}
            </Text>
          </View>
        )}

        {filteredClients.map((client) => {
          const aptCount = getClientAppointmentCount(client.id);
          const totalSpend = getClientTotalSpend(client.id);
          const initials = client.name
            .split(' ')
            .map((n) => n.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);

          return (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.clientCardTop}>
                <View
                  style={[
                    styles.avatarCircle,
                    client.role === 'admin' && styles.avatarCircleAdmin,
                  ]}
                >
                  <Text style={styles.avatarInitials}>{initials}</Text>
                </View>

                <View style={styles.clientInfo}>
                  <View style={styles.clientNameRow}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    {client.role === 'admin' && (
                      <View style={styles.adminChip}>
                        <Ionicons name="shield-checkmark" size={10} color={Colors.primary} />
                        <Text style={styles.adminChipText}>Admin</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.clientEmail}>{client.email}</Text>
                  {client.phone ? (
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.clientStatsRow}>
                <View style={styles.clientStat}>
                  <Text style={styles.clientStatNum}>{aptCount}</Text>
                  <Text style={styles.clientStatLabel}>Total Bookings</Text>
                </View>
                <View style={styles.clientStatDivider} />
                <View style={styles.clientStat}>
                  <Text style={styles.clientStatNum}>
                    ₦{Number(totalSpend).toLocaleString('en-NG')}
                  </Text>
                  <Text style={styles.clientStatLabel}>Total Paid</Text>
                </View>
                <View style={styles.clientStatDivider} />
                <View style={styles.clientStat}>
                  <Text style={styles.clientStatNum}>{client.memberSince}</Text>
                  <Text style={styles.clientStatLabel}>Member Since</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  headerCount: { fontSize: 13, color: Colors.mutedSlate, fontWeight: '600' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    paddingVertical: 6,
  },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
    lineHeight: 20,
  },
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  clientCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleAdmin: { backgroundColor: Colors.primary },
  avatarInitials: { fontSize: 16, fontWeight: '800', color: Colors.onPrimary },
  clientInfo: { flex: 1 },
  clientNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientName: { fontSize: 14, fontWeight: '700', color: Colors.charcoal },
  adminChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminChipText: { fontSize: 9, fontWeight: '700', color: Colors.primary },
  clientEmail: { fontSize: 12, color: Colors.mutedSlate, marginTop: 2 },
  clientPhone: { fontSize: 12, color: Colors.mutedSlate, marginTop: 1 },
  clientStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    paddingTop: 10,
  },
  clientStat: { flex: 1, alignItems: 'center' },
  clientStatNum: { fontSize: 13, fontWeight: '700', color: Colors.charcoal },
  clientStatLabel: { fontSize: 10, color: Colors.mutedSlate, marginTop: 2, textAlign: 'center' },
  clientStatDivider: { width: 1, height: 28, backgroundColor: Colors.hairlineBorder },
});
