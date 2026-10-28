import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminClientsScreen() {
  const { allUsers, appointments } = useApp();
  const [search, setSearch] = useState('');

  const clients = allUsers.filter((u) => u.role === 'customer');

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    );
  });

  return (
    <ScreenContainer>
      <AppHeader title="Client Records" subtitle="Sanctuary" showBack onBack={() => {}} />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={Colors.tertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clients by name, email, or phone..."
          placeholderTextColor={Colors.tertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.listCount}>
          Registered Clients ({filteredClients.length})
        </Text>

        {filteredClients.map((client) => {
          const clientApts = appointments.filter((a) => a.customerId === client.id);
          const totalSpent = clientApts
            .filter((a) => a.paymentStatus === 'paid')
            .reduce((s, a) => s + (a.paidAmount || 0), 0);

          return (
            <View key={client.id} style={styles.clientCard}>
              <View style={styles.cardTop}>
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientInitialText}>
                    {client.name
                      ?.split(' ')
                      .map((p) => p[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'CL'}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientEmail}>{client.email}</Text>
                  <Text style={styles.clientPhone}>{client.phone || 'No phone recorded'}</Text>
                </View>

                <View style={styles.spendTag}>
                  <Text style={styles.spendVal}>${totalSpent}</Text>
                  <Text style={styles.spendLabel}>LTV (Demo)</Text>
                </View>
              </View>

              {client.notes ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesLabel}>THERAPIST & CLINIC NOTES:</Text>
                  <Text style={styles.notesText}>{client.notes}</Text>
                </View>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.memberSince}>Member since {client.memberSince}</Text>
                <Text style={styles.totalSessions}>
                  {clientApts.length} Total {clientApts.length === 1 ? 'Booking' : 'Bookings'}
                </Text>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurface,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  listCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clientCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
  },
  clientInitialText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  clientEmail: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 1,
  },
  clientPhone: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
  spendTag: {
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  spendVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  spendLabel: {
    fontSize: 9,
    color: Colors.tertiary,
    fontWeight: '600',
  },
  notesBox: {
    backgroundColor: Colors.aquaMist,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 166, 173, 0.2)',
    gap: 2,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  memberSince: {
    fontSize: 11,
    color: Colors.mutedSlate,
  },
  totalSessions: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.charcoal,
  },
});
