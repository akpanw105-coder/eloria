import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function AuthScreen() {
  const { signIn, signUp, loginAs, authError } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleQuickLogin = async (role: 'customer' | 'admin') => {
    setLoading(true);
    setLocalError(null);
    try {
      await loginAs(role);
      if (role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please provide both email and password.');
      return;
    }
    if (isSignUp && !name.trim()) {
      Alert.alert('Full Name', 'Please enter your full name for your sanctuary profile.');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      if (isSignUp) {
        const res = await signUp(email, password, name);
        if (!res.success) {
          setLocalError(res.error || 'Failed to register account.');
        } else {
          Alert.alert('Sanctuary Account Ready', 'Your profile has been created successfully!');
          router.replace('/');
        }
      } else {
        const res = await signIn(email, password);
        if (!res.success) {
          setLocalError(res.error || 'Invalid email or password.');
        } else {
          router.replace('/');
        }
      }
    } catch (e: any) {
      setLocalError(e.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHero}>
          <View style={styles.logoPill}>
            <Ionicons name="sparkles" size={30} color={Colors.primaryContainer} />
          </View>
          <Text style={styles.brandTitle}>Eloria</Text>
          <Text style={styles.brandTagline}>Massage Sanctuary & Client Management</Text>
        </View>

        {/* Demo Fast Login Pills */}
        <View style={styles.quickAccessCard}>
          <Text style={styles.quickAccessTitle}>Instant Demo Sign-In</Text>
          <Text style={styles.quickAccessSubtitle}>
            Switch roles seamlessly using live Supabase authentication:
          </Text>

          <View style={styles.quickButtonsCol}>
            <TouchableOpacity
              style={styles.customerQuickBtn}
              onPress={() => handleQuickLogin('customer')}
              activeOpacity={0.85}
              disabled={loading}
            >
              <View style={styles.btnIconCircle}>
                <Ionicons name="person" size={18} color={Colors.onPrimary} />
              </View>
              <View style={styles.btnTextBox}>
                <Text style={styles.btnTitle}>Enter as Client (Elena Vance)</Text>
                <Text style={styles.btnSub}>Browse treatments, book appointments & pay</Text>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <Ionicons name="arrow-forward" size={18} color={Colors.onPrimary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminQuickBtn}
              onPress={() => handleQuickLogin('admin')}
              activeOpacity={0.85}
              disabled={loading}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: Colors.surfaceContainerLowest }]}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              </View>
              <View style={styles.btnTextBox}>
                <Text style={[styles.btnTitle, { color: Colors.primary }]}>
                  Enter as Clinic Director (Marcus Sterling)
                </Text>
                <Text style={[styles.btnSub, { color: Colors.tertiary }]}>
                  Admin dashboard, calendar, services & clients
                </Text>
              </View>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Traditional Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isSignUp ? 'Create Sanctuary Account' : 'Sign In With Credentials'}
          </Text>

          {(localError || authError) && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#D32F2F" />
              <Text style={styles.errorBannerText}>{localError || authError}</Text>
            </View>
          )}

          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Elena Vance"
                placeholderTextColor={Colors.tertiary}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="elena.vance@example.com"
              placeholderTextColor={Colors.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.tertiary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitFormBtn, loading && { opacity: 0.7 }]}
            onPress={handleAuthSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.submitFormBtnText}>
                {isSignUp ? 'Register & Continue' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setLocalError(null);
            }}
            disabled={loading}
          >
            <Text style={styles.switchModeText}>
              {isSignUp
                ? 'Already have an account? Sign in'
                : "New to Eloria? Create a client profile"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Guest fallback button */}
        <TouchableOpacity
          style={styles.guestLink}
          onPress={() => router.replace('/')}
          disabled={loading}
        >
          <Text style={styles.guestLinkText}>Continue as Guest Visitor</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 20,
  },
  brandHero: {
    alignItems: 'center',
    gap: 6,
  },
  logoPill: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.onSurface,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.tertiary,
    textAlign: 'center',
  },
  quickAccessCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 10,
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: Colors.tertiary,
    lineHeight: 17,
  },
  quickButtonsCol: {
    gap: 10,
    marginTop: 4,
  },
  customerQuickBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  adminQuickBtn: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 166, 173, 0.3)',
  },
  btnIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextBox: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  btnSub: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },
  formCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 12,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    padding: 10,
    borderRadius: 8,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#D32F2F',
    flex: 1,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  submitFormBtn: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitFormBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  switchModeBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  switchModeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestLinkText: {
    fontSize: 13,
    color: Colors.tertiary,
    textDecorationLine: 'underline',
  },
});
