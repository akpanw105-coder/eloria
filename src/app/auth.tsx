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
  const { signIn, signUp, authError } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSignUp) {
        const res = await signUp(cleanEmail, password, name);
        if (!res.success) {
          setLocalError(res.error || 'Failed to register account.');
        } else {
          Alert.alert(
            'Account Created',
            'Your account has been registered. If email confirmation is enabled on your Supabase project, please confirm your email.'
          );
          if (cleanEmail === 'admin@gmail.com') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        }
      } else {
        const res = await signIn(cleanEmail, password);
        if (!res.success) {
          setLocalError(res.error || 'Invalid credentials or email not confirmed.');
        } else {
          if (cleanEmail === 'admin@gmail.com') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        }
      }
    } catch (e: any) {
      setLocalError(e.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('');
    setIsSignUp(false);
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
            <Ionicons name="sparkles" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.brandTitle}>Eloria</Text>
          <Text style={styles.brandTagline}>Wellness Sanctuary & Massage Booking</Text>
        </View>

        {/* Account Type Selector helper */}
        <View style={styles.accountSelectorBox}>
          <Text style={styles.selectorTitle}>Select Account Type to Sign In:</Text>
          <View style={styles.selectorButtonsRow}>
            <TouchableOpacity
              style={[
                styles.accountChip,
                email.toLowerCase() === 'admin@gmail.com' && styles.accountChipActive,
              ]}
              onPress={() => fillQuickAccount('admin@gmail.com')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="shield-checkmark"
                size={16}
                color={email.toLowerCase() === 'admin@gmail.com' ? Colors.onPrimary : Colors.primary}
              />
              <Text
                style={[
                  styles.accountChipText,
                  email.toLowerCase() === 'admin@gmail.com' && styles.accountChipTextActive,
                ]}
              >
                Administrator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accountChip,
                email.toLowerCase() === 'useradmin@gmail.com' && styles.accountChipActive,
              ]}
              onPress={() => fillQuickAccount('useradmin@gmail.com')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person"
                size={16}
                color={email.toLowerCase() === 'useradmin@gmail.com' ? Colors.onPrimary : Colors.primary}
              />
              <Text
                style={[
                  styles.accountChipText,
                  email.toLowerCase() === 'useradmin@gmail.com' && styles.accountChipTextActive,
                ]}
              >
                Client Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Toggle: Sign In vs Register */}
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabButton, !isSignUp && styles.tabButtonActive]}
            onPress={() => {
              setIsSignUp(false);
              setLocalError(null);
            }}
          >
            <Text style={[styles.tabButtonText, !isSignUp && styles.tabButtonTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, isSignUp && styles.tabButtonActive]}
            onPress={() => {
              setIsSignUp(true);
              setLocalError(null);
            }}
          >
            <Text style={[styles.tabButtonText, isSignUp && styles.tabButtonTextActive]}>
              Create Client Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {isSignUp && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={18} color={Colors.mutedSlate} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.outline}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={18} color={Colors.mutedSlate} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="name@example.com"
                placeholderTextColor={Colors.outline}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.mutedSlate} style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your secure password"
                placeholderTextColor={Colors.outline}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {(localError || authError) && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorBannerText}>{localError || authError}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.primarySubmitBtn}
            onPress={handleAuthSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.primarySubmitBtnText}>
                {isSignUp ? 'Create Client Account' : 'Sign In to Eloria'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security & Role Enforcement Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
          <Text style={styles.securityNoteText}>
            Secure Supabase Authentication with Row-Level Security. Administrator privileges are granted exclusively to authorized credentials.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  brandHero: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoPill: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.aquaTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.charcoal,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.mutedSlate,
    marginTop: 4,
  },
  accountSelectorBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  selectorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.mutedSlate,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  selectorButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  accountChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.aquaMist,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  accountChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  accountChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  accountChipTextActive: {
    color: Colors.onPrimary,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.mutedSlate,
  },
  tabButtonTextActive: {
    fontWeight: '700',
    color: Colors.primary,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.aquaMist,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorContainer,
    padding: 10,
    borderRadius: 10,
    marginVertical: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500',
  },
  primarySubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primarySubmitBtnText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.mutedSlate,
    lineHeight: 18,
  },
});
