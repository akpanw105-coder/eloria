import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export const AdminTabBar: React.FC = () => {
  const pathname = usePathname();

  const tabs: Array<{
    route: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }> = [
    { route: '/admin', label: 'Overview', icon: 'grid-outline', activeIcon: 'grid' },
    { route: '/admin/calendar', label: 'Calendar', icon: 'calendar-outline', activeIcon: 'calendar' },
    { route: '/admin/services', label: 'Services', icon: 'sparkles-outline', activeIcon: 'sparkles' },
    { route: '/admin/clients', label: 'Clients', icon: 'people-outline', activeIcon: 'people' },
    { route: '/admin/settings', label: 'Clinic Ops', icon: 'settings-outline', activeIcon: 'settings' },
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
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                color={isActive ? Colors.primaryContainer : Colors.mutedSlate}
              />
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
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
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
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
    height: '100%',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
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
    marginTop: 2,
  },
});
