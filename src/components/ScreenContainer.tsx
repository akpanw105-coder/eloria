import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: any;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, style }) => {
  return (
    <View style={styles.outer}>
      <View style={[styles.inner, style]}>{children}</View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: isWeb ? 540 : '100%',
    backgroundColor: Colors.background,
    position: 'relative',
    ...(isWeb && width > 540
      ? {
          shadowColor: '#00696e',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: Colors.hairlineBorder,
        }
      : {}),
  },
});
