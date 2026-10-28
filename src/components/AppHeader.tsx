import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: 'notifications' | 'admin' | 'none';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle = 'Serene',
  showBack = false,
  onBack,
  rightAction = 'notifications',
}) => {
  const { currentUser, notifications } = useApp();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoPill}>
            <Ionicons name="sparkles" size={18} color={Colors.primaryContainer} />
          </View>
        )}

        <View style={styles.titleBox}>
          <Text style={styles.brandBadge}>{subtitle.toUpperCase()}</Text>
          <Text style={styles.screenTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightAction === 'notifications' && (
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={20} color={Colors.onSurfaceVariant} />
            {unreadCount > 0 && <View style={styles.unreadBadgeDot} />}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={() => router.push(currentUser?.role === 'admin' ? '/admin' : '/profile')}
          activeOpacity={0.8}
          accessibilityLabel="Profile"
        >
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: 'rgba(239, 252, 254, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.hairlineBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 50,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  logoPill: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBox: {
    flexDirection: 'column',
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryContainer,
    letterSpacing: 1.2,
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    position: 'relative',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryContainer,
  },
  avatarButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primaryContainer,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
