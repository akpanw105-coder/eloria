import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function ProfileScreen() {
  const { currentUser, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Eloria?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  if (!currentUser) {
    return (
      <ScreenContainer>
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        <View style={styles.unauthContainer}>
          <Ionicons name="person-circle-outline" size={64} color={Colors.outlineVariant} />
          <Text style={styles.unauthTitle}>Not Signed In</Text>
          <Text style={styles.unauthSub}>
            Sign in to access your profile, booking history, and personalised Eloria experience.
          </Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth')}>
            <Text style={styles.signInBtnText}>Sign In / Register</Text>
          </TouchableOpacity>
        </View>
        <CustomerTabBar />
      </ScreenContainer>
    );
  }

  const initials = currentUser.name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  return (
    <ScreenContainer>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>My Profile</Text>
        {currentUser.role === 'admin' && (
          <TouchableOpacity
            style={styles.adminAccessBtn}
            onPress={() => router.replace('/admin')}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={14} color={Colors.onPrimary} />
            <Text style={styles.adminAccessText}>Admin Panel</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Identity */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{currentUser.name}</Text>
          <Text style={styles.emailText}>{currentUser.email}</Text>
          <View
            style={[
              styles.roleBadge,
              currentUser.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeClient,
            ]}
          >
            <Ionicons
              name={currentUser.role === 'admin' ? 'shield-checkmark' : 'person'}
              size={12}
              color={currentUser.role === 'admin' ? Colors.primary : Colors.secondary}
            />
            <Text
              style={[
                styles.roleBadgeText,
                currentUser.role === 'admin' ? styles.roleBadgeTextAdmin : styles.roleBadgeTextClient,
              ]}
            >
              {currentUser.role === 'admin' ? 'Administrator' : 'Sanctuary Client'}
            </Text>
          </View>
        </View>

        {/* Membership Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Membership Details</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{currentUser.memberSince}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="mail-outline" size={16} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue}>{currentUser.email}</Text>
            </View>
          </View>
          {currentUser.phone && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{currentUser.phone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/bookings')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>My Appointments</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedSlate} />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => router.push('/book')}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Book a Massage</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.mutedSlate} />
          </TouchableOpacity>

          {currentUser.role === 'admin' && (
            <>
              <View style={styles.actionDivider} />
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => router.replace('/admin')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: Colors.aquaTint }]}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.actionLabel}>Admin Dashboard</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.mutedSlate} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out of Eloria</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  adminAccessBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adminAccessText: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  unauthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unauthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 12,
  },
  unauthSub: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 20,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signInBtnText: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.onPrimary,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  emailText: {
    fontSize: 13,
    color: Colors.mutedSlate,
    marginTop: 2,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeAdmin: {
    backgroundColor: Colors.aquaTint,
  },
  roleBadgeClient: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleBadgeTextAdmin: { color: Colors.primary },
  roleBadgeTextClient: { color: Colors.secondary },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.aquaMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.mutedSlate,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.charcoal,
    fontWeight: '600',
    marginTop: 1,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.aquaMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  actionDivider: {
    height: 1,
    backgroundColor: Colors.hairlineBorder,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.errorContainer,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
});
