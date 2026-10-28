import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../components/AppHeader';
import { AdminTabBar } from '../../components/AdminTabBar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Colors } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function AdminReviewsScreen() {
  const { reviews } = useApp();

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
      : '5.00';

  return (
    <ScreenContainer>
      <AppHeader title="Client Feedback" subtitle="Quality" showBack onBack={() => {}} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating Hero Card */}
        <View style={styles.heroRatingCard}>
          <Text style={styles.heroScore}>{averageRating}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name="star" size={18} color="#D99A36" />
            ))}
          </View>
          <Text style={styles.heroCount}>Based on {reviews.length} authentic client reviews</Text>
        </View>

        <Text style={styles.listHeading}>Reviews Feed ({reviews.length})</Text>

        {reviews.map((rev) => (
          <View key={rev.id} style={styles.reviewCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.customerName}>{rev.customerName}</Text>
                <Text style={styles.therapyLine}>
                  {rev.serviceName} • Specialist {rev.therapistName}
                </Text>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#D99A36" />
                <Text style={styles.ratingBadgeText}>{rev.rating}</Text>
              </View>
            </View>

            <Text style={styles.commentBody}>"{rev.comment}"</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.reviewDate}>Verified Treatment Client</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      <AdminTabBar />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  heroRatingCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.hairlineBorder,
    alignItems: 'center',
    gap: 6,
  },
  heroScore: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  heroCount: {
    fontSize: 12,
    color: Colors.tertiary,
    marginTop: 2,
  },
  listHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginTop: 6,
  },
  reviewCard: {
    backgroundColor: Colors.surfaceContainerLowest,
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
    color: Colors.onSurface,
  },
  therapyLine: {
    fontSize: 11,
    color: Colors.tertiary,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  commentBody: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
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
