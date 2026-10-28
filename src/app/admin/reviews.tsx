import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminReviewsScreen() {
  const { reviews, refreshAll, isLoading } = useApp();

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

  return (
    <ScreenContainer>
      <AppHeader
        title="Client Feedback"
        subtitle="Quality & Ratings"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={Colors.primary} />}
      >
        {/* Rating Hero Card */}
        <View style={styles.heroRatingCard}>
          <Text style={styles.heroScore}>{averageRating}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={Number(averageRating) >= i ? 'star' : Number(averageRating) >= i - 0.5 ? 'star-half' : 'star-outline'}
                size={20}
                color="#E5A93C"
              />
            ))}
          </View>
          <Text style={styles.heroCount}>
            Based on {reviews.length} authentic client reviews
          </Text>
        </View>

        <Text style={styles.listHeading}>Reviews Feed ({reviews.length})</Text>

        {reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={36} color={Colors.mutedSlate} />
            <Text style={styles.emptyTitle}>No client reviews yet</Text>
            <Text style={styles.emptySub}>Client ratings will populate here as sessions complete.</Text>
          </View>
        ) : (
          reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.customerName}>{rev.customerName || 'Anonymous Client'}</Text>
                  <Text style={styles.therapyLine}>
                    {rev.serviceName} • Specialist: {rev.therapistName}
                  </Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color="#E5A93C" />
                  <Text style={styles.ratingBadgeText}>{rev.rating}</Text>
                </View>
              </View>

              <Text style={styles.commentBody}>"{rev.comment}"</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.reviewDate}>
                  {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Client'}
                </Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={Colors.primary} />
                  <Text style={styles.verifiedText}>Verified Session</Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  heroRatingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    alignItems: 'center',
    gap: 6,
  },
  heroScore: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  heroCount: {
    fontSize: 12,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  listHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.mutedSlate,
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  therapyLine: {
    fontSize: 11,
    color: Colors.mutedSlate,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.aquaMist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  commentBody: {
    fontSize: 13,
    color: Colors.charcoal,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.hairlineBorder,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.mutedSlate,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
});
