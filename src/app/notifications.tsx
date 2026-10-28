import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function NotificationsScreen() {
  const {
    notifications,
    notificationSettings,
    markNotificationRead,
    markAllNotificationsRead,
    updateNotificationPreferences,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');

  return (
    <ScreenContainer>
      <AppHeader title="Notifications" subtitle="Alerts" />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'feed' && styles.tabButtonActive]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="notifications-outline"
            size={16}
            color={activeTab === 'feed' ? Colors.onPrimary : Colors.tertiary}
          />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
            Activity Feed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings-outline"
            size={16}
            color={activeTab === 'settings' ? Colors.onPrimary : Colors.tertiary}
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
            Reminder Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'feed' ? (
          <>
            {notifications.some((n) => !n.isRead) && (
              <View style={styles.markAllRow}>
                <TouchableOpacity onPress={markAllNotificationsRead}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              </View>
            )}

            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={38} color={Colors.mutedSlate} />
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptySub}>
                  You're all caught up with your sanctuary bookings.
                </Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, !notif.isRead && styles.notifCardUnread]}
                  onPress={() => markNotificationRead(notif.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.notifIconCircle}>
                    <Ionicons
                      name={
                        notif.type === 'booking'
                          ? 'calendar'
                          : notif.type === 'reminder'
                          ? 'water'
                          : notif.type === 'payment'
                          ? 'receipt-outline'
                          : 'information-circle-outline'
                      }
                      size={20}
                      color={Colors.primaryContainer}
                    />
                  </View>

                  <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                    <Text style={styles.notifTime}>{notif.timeAgo}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <View style={styles.settingsBox}>
            <View style={styles.demoNotice}>
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
              <Text style={styles.demoNoticeText}>
                Demo Notification Layer: Configured for in-app alert simulation. No external SMS/email
                gateways required.
              </Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Email Appointment Summaries</Text>
                <Text style={styles.settingSub}>Receive detailed receipts & therapist notes</Text>
              </View>
              <Switch
                value={notificationSettings?.emailReminders ?? true}
                onValueChange={(val) => updateNotificationPreferences({ emailReminders: val })}
                trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>SMS Arrival & Timing Alerts</Text>
                <Text style={styles.settingSub}>Short text alerts 2 hours before session</Text>
              </View>
              <Switch
                value={notificationSettings?.smsAlerts ?? true}
                onValueChange={(val) => updateNotificationPreferences({ smsAlerts: val })}
                trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Booking & Status Updates</Text>
                <Text style={styles.settingSub}>Immediate alerts for changes & re-bookings</Text>
              </View>
              <Switch
                value={notificationSettings?.bookingUpdates ?? true}
                onValueChange={(val) => updateNotificationPreferences({ bookingUpdates: val })}
                trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Seasonal Wellness Offers</Text>
                <Text style={styles.settingSub}>Exclusive member retreats & package pricing</Text>
              </View>
              <Switch
                value={notificationSettings?.promotions ?? false}
                onValueChange={(val) => updateNotificationPreferences({ promotions: val })}
                trackColor={{ false: Colors.surfaceContainer, true: Colors.primaryContainer }}
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: Colors.background,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  tabTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
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
  markAllRow: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  notifCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: Colors.aquaMist,
    borderColor: 'rgba(15, 166, 173, 0.3)',
  },
  notifIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
  },
  notifMessage: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    marginTop: 3,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 6,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.mutedSlate,
  },
  settingsBox: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 16,
  },
  demoNotice: {
    backgroundColor: Colors.aquaTint,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoNoticeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 2,
  },
});
