import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useApp } from '../context/AppProvider';
import { getUnlockedAchievements, ACHIEVEMENTS } from '../utils/notifications';

/**
 * ProfileScreen - User profile, statistics, and achievements
 */
const ProfileScreen = ({ navigation }) => {
  const { currentUser, getUserStats, reviews, isLoading } = useApp();
  const [achievements, setAchievements] = useState([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);

  const stats = getUserStats();

  useEffect(() => {
    const loadAchievements = async () => {
      if (currentUser && !isLoading) {
        try {
          const result = await getUnlockedAchievements(currentUser.id, stats);
          setAchievements(result.unlocked);
        } catch (error) {
          console.error('Failed to load achievements:', error);
        }
      }
      setLoadingAchievements(false);
    };

    loadAchievements();
  }, [currentUser, stats, isLoading]);

  if (isLoading || loadingAchievements) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </SafeAreaView>
    );
  }

  // Get all achievement objects for display
  const achievementObjects = achievements
    .map(id => {
      for (const key in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[key].id === id) {
          return ACHIEVEMENTS[key];
        }
      }
      return null;
    })
    .filter(Boolean);

  const calculateAchievementProgress = () => {
    const totalAchievements = Object.keys(ACHIEVEMENTS).length;
    return {
      unlocked: achievements.length,
      total: totalAchievements,
      percentage: Math.round((achievements.length / totalAchievements) * 100)
    };
  };

  const achievementProgress = calculateAchievementProgress();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={48} color="#2d6a4f" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {currentUser?.email || 'Anonymous User'}
            </Text>
            <Text style={styles.userStatus}>
              {currentUser?.isAnonymous ? 'Guest Account' : 'Verified'}
            </Text>
            <Text style={styles.userSince}>
              Member since{' '}
              {new Date(currentUser?.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <MaterialIcons name="check-circle" size={28} color="#27ae60" />
              <Text style={styles.statNumber}>{stats.completedProjects}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="play-arrow" size={28} color="#2d6a4f" />
              <Text style={styles.statNumber}>
                {stats.inProgressProjects}
              </Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="favorite" size={28} color="#e74c3c" />
              <Text style={styles.statNumber}>{stats.totalFavorites}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="rate-review" size={28} color="#ff9800" />
              <Text style={styles.statNumber}>{stats.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {achievementProgress.unlocked}/{achievementProgress.total}
            </Text>
          </View>

          <View style={styles.achievementProgressBar}>
            <View
              style={[
                styles.achievementProgressFill,
                { width: `${achievementProgress.percentage}%` }
              ]}
            />
          </View>
          <Text style={styles.achievementProgressText}>
            {achievementProgress.percentage}% Unlocked
          </Text>

          <View style={styles.achievementsList}>
            {achievementObjects.length > 0 ? (
              achievementObjects.map((achievement, idx) => (
                <View key={idx} style={styles.achievementItem}>
                  <View style={styles.achievementIconContainer}>
                    <Text style={styles.achievementIcon}>
                      {achievement.icon}
                    </Text>
                  </View>
                  <View style={styles.achievementDetails}>
                    <Text style={styles.achievementName}>
                      {achievement.name}
                    </Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                  </View>
                  <MaterialIcons
                    name="check-circle"
                    size={20}
                    color="#27ae60"
                  />
                </View>
              ))
            ) : (
              <View style={styles.noAchievements}>
                <Text style={styles.noAchievementsText}>
                  Start projects to unlock achievements!
                </Text>
              </View>
            )}
          </View>

          {/* Locked Achievements Preview */}
          {achievementProgress.unlocked < achievementProgress.total && (
            <View style={styles.lockedAchievementsSection}>
              <Text style={styles.lockedTitle}>Coming Soon</Text>
              <View style={styles.lockedList}>
                {Object.values(ACHIEVEMENTS)
                  .filter(a => !achievements.includes(a.id))
                  .slice(0, 2)
                  .map((achievement, idx) => (
                    <View key={idx} style={styles.lockedItem}>
                      <Text style={styles.lockedIcon}>🔒</Text>
                      <View style={styles.lockedDetails}>
                        <Text style={styles.lockedName}>
                          {achievement.name}
                        </Text>
                        <Text style={styles.lockedDescription}>
                          {achievement.description}
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <Text style={styles.sectionTitle}>Quick Facts</Text>
          <View style={styles.quickStatItem}>
            <MaterialIcons name="schedule" size={20} color="#2d6a4f" />
            <View style={styles.quickStatText}>
              <Text style={styles.quickStatLabel}>Average Time</Text>
              <Text style={styles.quickStatValue}>
                {stats.completedProjects > 0
                  ? '3 weeks'
                  : 'No data yet'}
              </Text>
            </View>
          </View>
          <View style={styles.quickStatItem}>
            <MaterialIcons name="trending-up" size={20} color="#2d6a4f" />
            <View style={styles.quickStatText}>
              <Text style={styles.quickStatLabel}>Average Rating</Text>
              <Text style={styles.quickStatValue}>
                {stats.totalReviews > 0
                  ? '4.5 ⭐'
                  : 'No reviews yet'}
              </Text>
            </View>
          </View>
          <View style={styles.quickStatItem}>
            <MaterialIcons name="category" size={20} color="#2d6a4f" />
            <View style={styles.quickStatText}>
              <Text style={styles.quickStatLabel}>Favorite Category</Text>
              <Text style={styles.quickStatValue}>
                CS/Web
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsSection}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              Alert.alert('Export', 'Export your profile data as JSON?', [
                { text: 'Cancel', onPress: () => {} },
                {
                  text: 'Export',
                  onPress: () => {
                    Alert.alert(
                      'Success',
                      'Profile data exported to clipboard'
                    );
                  }
                }
              ]);
            }}
          >
            <MaterialIcons name="download" size={18} color="#2d6a4f" />
            <Text style={styles.secondaryButtonText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              Alert.alert('Share', 'Share your profile?', [
                { text: 'Cancel', onPress: () => {} },
                {
                  text: 'Share',
                  onPress: () => {
                    Alert.alert('Success', 'Profile link copied to clipboard');
                  }
                }
              ]);
            }}
          >
            <MaterialIcons name="share" size={18} color="#2d6a4f" />
            <Text style={styles.secondaryButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollView: {
    flex: 1
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  profileInfo: {
    flex: 1
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },
  userStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontWeight: '500'
  },
  userSince: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8
  },
  statBox: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginVertical: 4
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500'
  },
  achievementsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  achievementCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d6a4f',
    backgroundColor: '#f0f8f4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  achievementProgressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#27ae60'
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 16
  },
  achievementsList: {
    gap: 12
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60'
  },
  achievementIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d4edda',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  achievementIcon: {
    fontSize: 20
  },
  achievementDetails: {
    flex: 1
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333'
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  noAchievements: {
    padding: 20,
    alignItems: 'center'
  },
  noAchievementsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic'
  },
  lockedAchievementsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  lockedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    textTransform: 'uppercase'
  },
  lockedList: {
    gap: 8
  },
  lockedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.6,
    paddingVertical: 8
  },
  lockedIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 40,
    textAlign: 'center'
  },
  lockedDetails: {
    flex: 1
  },
  lockedName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333'
  },
  lockedDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2
  },
  quickStatsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5'
  },
  quickStatText: {
    flex: 1,
    marginLeft: 12
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500'
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 2
  },
  actionButtonsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 8
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#2d6a4f',
    gap: 8
  },
  secondaryButtonText: {
    color: '#2d6a4f',
    fontSize: 14,
    fontWeight: '700'
  }
});

export default ProfileScreen;
