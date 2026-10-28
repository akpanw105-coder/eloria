import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

type AuthMode = 'sign_in' | 'sign_up' | 'forgot_password';

export default function AuthScreen() {
  const { signIn, signUp, resetPassword, authError } = useApp();

  const [mode, setMode] = useState<AuthMode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick preset autofill helper (for convenience without violating security)
  const applyPresetAccount = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('');
    setLocalError(null);
    setSuccessMessage(null);
    if (mode === 'forgot_password') {
      setMode('sign_in');
    }
  };

  const validateForm = (): boolean => {
    setLocalError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setLocalError('Please enter your email address.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }

    if (mode === 'forgot_password') {
      return true;
    }

    if (!password) {
      setLocalError('Please enter your password.');
      return false;
    }

    if (mode === 'sign_up') {
      if (!fullName.trim()) {
        setLocalError('Please enter your full name for your sanctuary profile.');
        return false;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match. Please re-enter.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLocalError(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (mode === 'forgot_password') {
        const res = await resetPassword(cleanEmail);
        if (!res.success) {
          setLocalError(res.error || 'Failed to send recovery link. Please try again.');
        } else {
          setSuccessMessage(
            `Password reset link dispatched to ${cleanEmail}. Please inspect your inbox.`
          );
        }
      } else if (mode === 'sign_up') {
        const res = await signUp(cleanEmail, password, fullName);
        if (!res.success) {
          setLocalError(res.error || 'Failed to create account.');
        } else {
          setSuccessMessage(
            'Account successfully created! Please check your email for confirmation if required.'
          );
          if (res.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        }
      } else {
        const res = await signIn(cleanEmail, password);
        if (!res.success) {
          setLocalError(res.error || 'Invalid email or password.');
        } else {
          if (res.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
        }
      }
    } catch (e: any) {
      setLocalError(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandHero}>
            <View style={styles.logoPill}>
              <Ionicons name="sparkles" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.brandSubtitle}>SANCTUARY & WELLNESS</Text>
            <Text style={styles.brandTitle}>Eloria</Text>
            <Text style={styles.brandTagline}>
              {mode === 'forgot_password'
                ? 'Recover access to your wellness account'
                : mode === 'sign_up'
                ? 'Create your personal sanctuary membership'
                : 'Sign in to access your appointments & profile'}
            </Text>
          </View>

          {/* Quick Account Fill Pills */}
          <View style={styles.presetBox}>
            <Text style={styles.presetLabel}>QUICK ACCOUNT SELECTION</Text>
            <View style={styles.presetButtonsRow}>
              <TouchableOpacity
                style={[
                  styles.presetChip,
                  email.toLowerCase() === 'admin@gmail.com' && styles.presetChipActive,
                ]}
                onPress={() => applyPresetAccount('admin@gmail.com')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={email.toLowerCase() === 'admin@gmail.com' ? Colors.onPrimary : Colors.primary}
                />
                <Text
                  style={[
                    styles.presetChipText,
                    email.toLowerCase() === 'admin@gmail.com' && styles.presetChipTextActive,
                  ]}
                >
                  Admin Portal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.presetChip,
                  email.toLowerCase() === 'useradmin@gmail.com' && styles.presetChipActive,
                ]}
                onPress={() => applyPresetAccount('useradmin@gmail.com')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person"
                  size={14}
                  color={email.toLowerCase() === 'useradmin@gmail.com' ? Colors.onPrimary : Colors.primary}
                />
                <Text
                  style={[
                    styles.presetChipText,
                    email.toLowerCase() === 'useradmin@gmail.com' && styles.presetChipTextActive,
                  ]}
                >
                  Client Account
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Auth Navigation Mode Segment */}
          {mode !== 'forgot_password' && (
            <View style={styles.segmentContainer}>
              <TouchableOpacity
                style={[styles.segmentBtn, mode === 'sign_in' && styles.segmentBtnActive]}
                onPress={() => {
                  setMode('sign_in');
                  setLocalError(null);
                  setSuccessMessage(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, mode === 'sign_in' && styles.segmentTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentBtn, mode === 'sign_up' && styles.segmentBtnActive]}
                onPress={() => {
                  setMode('sign_up');
                  setLocalError(null);
                  setSuccessMessage(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, mode === 'sign_up' && styles.segmentTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Full Name for Sign Up */}
            {mode === 'sign_up' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={18} color={Colors.mutedSlate} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Elena Vance"
                    placeholderTextColor={Colors.outline}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>
            )}

            {/* Email Field */}
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
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Field (only for sign in & sign up) */}
            {mode !== 'forgot_password' && (
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Password</Text>
                  {mode === 'sign_in' && (
                    <TouchableOpacity
                      onPress={() => {
                        setMode('forgot_password');
                        setLocalError(null);
                        setSuccessMessage(null);
                      }}
                    >
                      <Text style={styles.forgotLink}>Forgot Password?</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.inputWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={Colors.mutedSlate} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter password"
                    placeholderTextColor={Colors.outline}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.mutedSlate}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Confirm Password for Sign Up */}
            {mode === 'sign_up' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrap}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.mutedSlate} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Re-enter password"
                    placeholderTextColor={Colors.outline}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color={Colors.mutedSlate}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Error Message */}
            {(localError || authError) && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.errorBannerText}>{localError || authError}</Text>
              </View>
            )}

            {/* Success Message */}
            {successMessage && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primarySubmitBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.onPrimary} />
              ) : (
                <Text style={styles.primarySubmitBtnText}>
                  {mode === 'sign_in'
                    ? 'Sign In to Eloria'
                    : mode === 'sign_up'
                    ? 'Create Client Account'
                    : 'Send Password Reset Link'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Return to Sign In if on Forgot Password */}
            {mode === 'forgot_password' && (
              <TouchableOpacity
                style={styles.backToSignInBtn}
                onPress={() => {
                  setMode('sign_in');
                  setLocalError(null);
                  setSuccessMessage(null);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={16} color={Colors.primary} />
                <Text style={styles.backToSignInText}>Return to Sign In</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Trust and Role Policy Notice */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>Secure Sanctuary Authentication</Text>
              <Text style={styles.securityBody}>
                Accounts and sessions are authenticated via Supabase. Roles are validated server-side.
                New client signups receive standard client privileges automatically.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.aquaMist,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.aquaTint,
    marginBottom: 10,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.charcoal,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.mutedSlate,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 290,
  },
  presetBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  presetLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.mutedSlate,
    letterSpacing: 0.8,
    marginBottom: 8,
    textAlign: 'center',
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.aquaMist,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  presetChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  presetChipTextActive: {
    color: Colors.onPrimary,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.mutedSlate,
  },
  segmentTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 6,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.aquaMist,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.charcoal,
  },
  eyeBtn: {
    padding: 6,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorContainer,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.error,
    fontWeight: '600',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successContainer,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  successBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
  },
  primarySubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primarySubmitBtnText: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  backToSignInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 10,
  },
  backToSignInText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 20,
    backgroundColor: Colors.aquaMist,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.aquaTint,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  securityBody: {
    fontSize: 11,
    color: Colors.mutedSlate,
    lineHeight: 16,
  },
});