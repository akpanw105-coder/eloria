import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <View style={styles.root}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: Platform.OS === 'web' ? 'fade' : 'default',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="services" />
          <Stack.Screen name="book" />
          <Stack.Screen name="bookings" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="admin/index" />
          <Stack.Screen name="admin/services" />
          <Stack.Screen name="admin/calendar" />
          <Stack.Screen name="admin/clients" />
          <Stack.Screen name="admin/payments" />
          <Stack.Screen name="admin/reviews" />
          <Stack.Screen name="admin/settings" />
        </Stack>
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
