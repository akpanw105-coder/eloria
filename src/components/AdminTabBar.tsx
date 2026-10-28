import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const AdminTabBar: React.FC = () => {
  const pathname = usePathname();
  const { appointments } = useApp();
  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  const tabs: Array<{
    route: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    badge?: number;
  }> = [
      { route: '/admin', label: 'Overview', icon: 'grid-outline', activeIcon: 'grid', badge: pendingCount },
      { route: '/admin/calendar', label: 'Bookings', icon: 'calendar-outline', activeIcon: 'calendar' },
      { route: '/admin/services', label: 'Services', icon: 'sparkles-outline', activeIcon: 'sparkles' },
      { route: '/admin/clients', label: 'Clients', icon: 'people-outline', activeIcon: 'people' },
      { route: '/admin/settings', label: 'Operations', icon: 'settings-outline', activeIcon: 'settings' },
    ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive =
            tab.route === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(tab.route);

          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tabItem}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={20}
                  color={isActive ? Colors.primary : Colors.mutedSlate}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge > 9 ? '9+' : tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
});
