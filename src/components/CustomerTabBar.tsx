import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export const CustomerTabBar: React.FC = () => {
  const pathname = usePathname();
  const { notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs: Array<{
    route: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    badge?: number;
  }> = [
    { route: '/', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { route: '/services', label: 'Services', icon: 'leaf-outline', activeIcon: 'leaf' },
    { route: '/bookings', label: 'Bookings', icon: 'calendar-outline', activeIcon: 'calendar' },
    {
      route: '/notifications',
      label: 'Alerts',
      icon: 'notifications-outline',
      activeIcon: 'notifications',
      badge: unreadCount,
    },
    { route: '/profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive =
            tab.route === '/'
              ? pathname === '/'
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
                  size={22}
                  color={isActive ? Colors.primaryContainer : Colors.mutedSlate}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {tab.badge > 9 ? '9+' : tab.badge}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel,
                ]}
              >
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  tabBar: {
    flexDirection: 'row',
    height: 62,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    height: '100%',
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    height: 26,
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.primaryContainer,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primaryContainer,
    marginTop: 3,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 8,
    paddingHorizontal: 4,
    height: 14,
    minWidth: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.onPrimary,
    fontSize: 9,
    fontWeight: '700',
  },
});
