import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useApp } from '../context/AppProvider';
import { sendNotification } from '../utils/notifications';

/**
 * ProjectDetailScreen - Full project view
 * Shows detailed information and allows starting/tracking projects
 */
const ProjectDetailScreen = ({ route, navigation }) => {
  const { project } = route.params;
  const {
    favorites,
    toggleFavorite,
    progress,
    updateProjectProgress,
    addReview,
    reviews
  } = useApp();

  const [isStarted, setIsStarted] = useState(
    !!progress[project.id]?.status
  );
  const [projectProgress, setProjectProgress] = useState(
    progress[project.id] || { status: null, completionPercentage: 0 }
  );
  const [isFavorite, setIsFavorite] = useState(
    favorites.includes(project.id)
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressPercent, setProgressPercent] = useState(
    projectProgress.completionPercentage || 0
  );

  const projectReview = reviews[project.id];

  const handleStartProject = async () => {
    try {
      await updateProjectProgress(project.id, {
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        completionPercentage: 0
      });
      setIsStarted(true);
      setProjectProgress({ status: 'in-progress', completionPercentage: 0 });
      await sendNotification(
        'Project Started!',
        `You've started "${project.title}"`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start project');
    }
  };

  const handleCompleteProject = async () => {
    try {
      await updateProjectProgress(project.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        completionPercentage: 100
      });
      setProjectProgress({ status: 'completed', completionPercentage: 100 });
      await sendNotification(
        '🎉 Project Complete!',
        `Congratulations on completing "${project.title}"!`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete project');
    }
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(project.id);
    setIsFavorite(!isFavorite);
  };

  const handleUpdateProgress = async () => {
    try {
      await updateProjectProgress(project.id, {
        completionPercentage: Math.round(progressPercent)
      });
      setProjectProgress(prev => ({
        ...prev,
        completionPercentage: Math.round(progressPercent)
      }));
      setShowProgressModal(false);
      await sendNotification(
        'Progress Updated',
        `${project.title} is now ${Math.round(progressPercent)}% complete`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    try {
      await addReview(project.id, rating, reviewComment);
      setShowReviewModal(false);
      setRating(0);
      setReviewComment('');
      Alert.alert('Success', 'Review submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    }
  };

  const RatingStars = ({ value, onPress, interactive = true }) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && onPress(star)}
            disabled={!interactive}
          >
            <MaterialIcons
              name={star <= value ? 'star' : 'star-border'}
              size={32}
              color={star <= value ? '#ffc107' : '#ddd'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return '#2d6a4f';
      case 'completed':
        return '#27ae60';
      default:
        return '#999';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{project.title}</Text>
          <View style={styles.headerMeta}>
            <View
              style={[
                styles.difficultyBadge,
                styles[`difficulty${project.difficulty}`]
              ]}
            >
              <Text style={styles.difficultyText}>
                {project.difficulty.charAt(0).toUpperCase() +
                  project.difficulty.slice(1)}
              </Text>
            </View>
            <Text style={styles.category}>{project.category}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={28}
              color={isFavorite ? '#e74c3c' : '#bbb'}
            />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Project</Text>
          <Text style={styles.description}>{project.description}</Text>
        </View>

        {/* Key Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Facts</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <MaterialIcons name="schedule" size={24} color="#2d6a4f" />
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{project.timeWeeks} weeks</Text>
              <Text style={styles.infoSubtext}>{project.timePerWeek}</Text>
            </View>
            <View style={styles.infoBox}>
              <MaterialIcons name="attach-money" size={24} color="#2d6a4f" />
              <Text style={styles.infoLabel}>Budget</Text>
              <Text style={styles.infoValue}>${project.budget}</Text>
              <Text style={styles.infoSubtext}>{project.budgetRange}</Text>
            </View>
            <View style={styles.infoBox}>
              <MaterialIcons name="group" size={24} color="#2d6a4f" />
              <Text style={styles.infoLabel}>Team Size</Text>
              <Text style={styles.infoValue}>{project.teamSize}</Text>
            </View>
            <View style={styles.infoBox}>
              <MaterialIcons
                name={project.indoor ? 'home' : 'terrain'}
                size={24}
                color="#2d6a4f"
              />
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {project.indoor ? 'Indoor' : 'Outdoor'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        {isStarted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${projectProgress.completionPercentage}%`
                    }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {projectProgress.completionPercentage}% Complete
              </Text>
              <View style={styles.statusBadge}>
                <MaterialIcons
                  name={
                    projectProgress.status === 'completed'
                      ? 'check-circle'
                      : 'schedule'
                  }
                  size={16}
                  color="#fff"
                />
                <Text style={styles.statusText}>
                  {projectProgress.status === 'completed'
                    ? 'Completed'
                    : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Required Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills You'll Learn</Text>
          <View style={styles.skillsGrid}>
            {project.requiredSkills.map((skill, idx) => (
              <View key={idx} style={styles.skillItem}>
                <MaterialIcons
                  name="check-circle-outline"
                  size={16}
                  color="#2d6a4f"
                />
                <Text style={styles.skillName}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Parts/Materials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parts & Materials</Text>
          <View style={styles.partsList}>
            {project.partsNeeded.map((part, idx) => (
              <View key={idx} style={styles.partItem}>
                <MaterialIcons
                  name="bookmark-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.partName}>{part}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Why It's Great */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why It's Great</Text>
          <View style={styles.whyGreatBox}>
            <MaterialIcons name="lightbulb-outline" size={20} color="#2d6a4f" />
            <Text style={styles.whyGreatText}>{project.whyGreat}</Text>
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfect For</Text>
          <View style={styles.tagsContainer}>
            {project.interests.map((interest, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          {projectReview ? (
            <View style={styles.reviewBox}>
              <RatingStars value={projectReview.rating} interactive={false} />
              <Text style={styles.reviewComment}>{projectReview.comment}</Text>
            </View>
          ) : (
            <Text style={styles.noReviewText}>No review yet</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {!isStarted ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartProject}
            >
              <MaterialIcons name="play-arrow" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Start Project</Text>
            </TouchableOpacity>
          ) : projectProgress.status === 'completed' ? (
            <View style={styles.completedBox}>
              <MaterialIcons
                name="check-circle"
                size={32}
                color="#27ae60"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.completedText}>Project Completed!</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowProgressModal(true)}
              >
                <MaterialIcons name="edit" size={20} color="#2d6a4f" />
                <Text style={styles.secondaryButtonText}>
                  Update Progress
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCompleteProject}
              >
                <MaterialIcons name="check" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Mark Complete</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setShowReviewModal(true)}
          >
            <MaterialIcons name="rate-review" size={20} color="#2d6a4f" />
            <Text style={styles.secondaryButtonText}>
              {projectReview ? 'Edit Review' : 'Write Review'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <RatingStars value={rating} onPress={setRating} />

            <TextInput
              style={styles.reviewInput}
              placeholder="Share your experience with this project..."
              placeholderTextColor="#999"
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitReview}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Progress Modal */}
      <Modal
        visible={showProgressModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProgressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Progress</Text>
              <TouchableOpacity onPress={() => setShowProgressModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.progressLabel}>
              Completion: {Math.round(progressPercent)}%
            </Text>

            <View style={styles.sliderContainer}>
              <TextInput
                style={styles.progressInput}
                keyboardType="numeric"
                placeholder="Enter percentage (0-100)"
                value={progressPercent.toString()}
                onChangeText={value =>
                  setProgressPercent(Math.min(100, Math.max(0, parseInt(value) || 0)))
                }
              />
            </View>

            <View style={styles.progressPreset}>
              {[25, 50, 75, 100].map(val => (
                <TouchableOpacity
                  key={val}
                  style={styles.presetButton}
                  onPress={() => setProgressPercent(val)}
                >
                  <Text style={styles.presetButtonText}>{val}%</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleUpdateProgress}
            >
              <Text style={styles.submitButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    position: 'relative'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  difficultybeginner: {
    backgroundColor: '#d4edda'
  },
  difficultyintermediate: {
    backgroundColor: '#fff3cd'
  },
  difficultyadvanced: {
    backgroundColor: '#f8d7da'
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  category: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666'
  },
  favoriteButton: {
    position: 'absolute',
    right: 16,
    top: 16
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center'
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 4
  },
  infoSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2
  },
  progressSection: {
    gap: 12
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2d6a4f'
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6
  },
  skillsGrid: {
    gap: 8
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6
  },
  skillName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500'
  },
  partsList: {
    gap: 8
  },
  partItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6
  },
  partName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10
  },
  whyGreatBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f8f4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start'
  },
  whyGreatText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  tagText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500'
  },
  reviewBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    lineHeight: 18
  },
  noReviewText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic'
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16
  },
  actionButtonsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8
  },
  primaryButton: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2d6a4f'
  },
  secondaryButtonText: {
    color: '#2d6a4f',
    fontSize: 16,
    fontWeight: '700'
  },
  completedBox: {
    backgroundColor: '#d4edda',
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27ae60'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333'
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    textAlignVertical: 'top',
    color: '#333'
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center'
  },
  progressInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12
  },
  sliderContainer: {
    marginBottom: 16
  },
  progressPreset: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8
  },
  presetButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2d6a4f',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d6a4f'
  },
  submitButton: {
    backgroundColor: '#2d6a4f',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});

export default ProjectDetailScreen;
