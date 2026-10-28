import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from './ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'customer';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { currentUser, isLoading } = useApp();

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centerBox}>
          <Ionicons name="sparkles" size={32} color={Colors.primary} />
          <Text style={styles.loadingText}>Loading sanctuary session...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!currentUser) {
    return (
      <ScreenContainer>
        <View style={styles.centerBox}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.subtitle}>
            Please sign in to access your appointments and sanctuary profile.
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.replace('/auth')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Sign In to Eloria</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  if (requiredRole === 'admin' && currentUser.role !== 'admin') {
    return (
      <ScreenContainer>
        <View style={styles.centerBox}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.errorContainer }]}>
            <Ionicons name="shield-outline" size={36} color={Colors.error} />
          </View>
          <Text style={styles.title}>Admin Access Required</Text>
          <Text style={styles.subtitle}>
            This management zone is reserved exclusively for the Eloria administrator.
          </Text>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.replace('/')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Return to Client Sanctuary</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.aquaMist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.aquaTint,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.charcoal,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.mutedSlate,
    marginTop: 8,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionBtnText: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
