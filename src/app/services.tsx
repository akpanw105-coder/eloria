import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../components/AppHeader';
import { CustomerTabBar } from '../components/CustomerTabBar';
import { ScreenContainer } from '../components/ScreenContainer';
import { Colors } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function ServicesScreen() {
  const { services } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');

  const durationOptions = [
    { label: 'All Durations', value: 'all' },
    { label: '45 min', value: '45' },
    { label: '60 min', value: '60' },
    { label: '75 min', value: '75' },
    { label: '90 min', value: '90' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDuration =
        selectedDuration === 'all' || s.durationMinutes.toString() === selectedDuration;
      return matchesSearch && matchesDuration && s.isActive;
    });
  }, [services, searchQuery, selectedDuration]);

  return (
    <ScreenContainer>
      <AppHeader title="Services" subtitle="Treatments" />

      <View style={styles.topBar}>
        {/* Search input with icons */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search treatments, deep tissue, hot stone..."
            placeholderTextColor={Colors.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Ionicons name="close-circle" size={18} color={Colors.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Duration filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterStrip}
        >
          {durationOptions.map((opt) => {
            const isActive = selectedDuration === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setSelectedDuration(opt.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {opt.label}
                </Text>
                {opt.value === 'all' && (
                  <View style={[styles.filterCountBadge, isActive && styles.filterCountBadgeActive]}>
                    <Text
                      style={[
                        styles.filterCountText,
                        isActive && styles.filterCountTextActive,
                      ]}
                    >
                      {services.filter((s) => s.isActive).length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredServices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={36} color={Colors.mutedSlate} />
            <Text style={styles.emptyTitle}>No matching treatments</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your keywords or duration filters.</Text>
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedDuration('all');
              }}
            >
              <Text style={styles.resetFiltersText}>Reset filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              {/* Header banner with duration pill and price */}
              <View style={styles.serviceCardHeader}>
                <View style={styles.durationPill}>
                  <Ionicons name="time-outline" size={14} color={Colors.onPrimary} />
                  <Text style={styles.durationText}>{service.durationMinutes} MIN SESSION</Text>
                </View>
                <Text style={styles.servicePrice}>${service.price}</Text>
              </View>

              {/* Service details body */}
              <View style={styles.serviceCardBody}>
                <View style={styles.titleIconRow}>
                  <View style={styles.titleBox}>
                    <Text style={styles.serviceTitle}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                  <View style={styles.serviceIconContainer}>
                    <Ionicons name="sparkles" size={20} color={Colors.primaryContainer} />
                  </View>
                </View>

                {/* Badge and Select Button Row */}
                <View style={styles.footerRow}>
                  <View style={styles.badgeRow}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.primaryContainer} />
                    <Text style={styles.badgeText}>{service.badge}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => router.push(`/book?serviceId=${service.id}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.selectButtonText}>Select</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.onSecondaryContainer} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <CustomerTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
  },
  clearIcon: {
    padding: 4,
  },
  filterStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.tertiary,
  },
  filterChipTextActive: {
    color: Colors.onPrimary,
    fontWeight: '700',
  },
  filterCountBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.tertiary,
  },
  filterCountTextActive: {
    color: Colors.onPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    gap: 16,
  },
  serviceCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    shadowColor: Colors.charcoal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  serviceCardHeader: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimary,
    letterSpacing: 0.8,
  },
  servicePrice: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  serviceCardBody: {
    padding: 16,
    gap: 14,
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  titleBox: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  serviceDescription: {
    fontSize: 13,
    color: Colors.tertiary,
    lineHeight: 19,
    marginTop: 4,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainer,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.secondary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  selectButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSecondaryContainer,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.mutedSlate,
    textAlign: 'center',
  },
  resetFiltersBtn: {
    marginTop: 10,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
