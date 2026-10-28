import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, markAllNotificationsRead, refreshAll, isLoading } = useApp();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const iconForType = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'payment': return 'card-outline';
      case 'reminder': return 'alarm-outline';
      case 'system': return 'settings-outline';
      default: return 'calendar-outline';
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllNotificationsRead}>
            <Text style={styles.markAllBtnText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {notifications.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.outlineVariant} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>Booking updates and reminders will appear here.</Text>
          </View>
        )}

        {notifications.map((notification) => (
          <TouchableOpacity
            key={notification.id}
            style={[styles.notifCard, !notification.isRead && styles.notifCardUnread]}
            onPress={() => !notification.isRead && markNotificationRead(notification.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, !notification.isRead && styles.iconBoxUnread]}>
              <Ionicons
                name={iconForType(notification.type)}
                size={18}
                color={!notification.isRead ? Colors.onPrimary : Colors.primary}
              />
            </View>
            <View style={styles.notifBody}>
              <View style={styles.notifTitleRow}>
                <Text style={styles.notifTitle}>{notification.title}</Text>
                {!notification.isRead && <View style={styles.unreadDot} />}
              </View>
              <Text style={styles.notifMessage}>{notification.message}</Text>
              <Text style={styles.notifTime}>{notification.timeAgo}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <CustomerTabBar />
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.charcoal },
  markAllBtn: {
    backgroundColor: Colors.aquaTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markAllBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  scrollView: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 90 },
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.charcoal },
  emptySub: { fontSize: 13, color: Colors.mutedSlate, textAlign: 'center' },
  notifCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  notifCardUnread: {
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.aquaMist,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.aquaTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: { backgroundColor: Colors.primary },
  notifBody: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: Colors.charcoal, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  notifMessage: { fontSize: 12, color: Colors.mutedSlate, marginTop: 4, lineHeight: 17 },
  notifTime: { fontSize: 11, color: Colors.outline, marginTop: 4 },
});
