import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  SectionList
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useApp } from '../context/AppProvider';

/**
 * ProgressScreen - Track and manage project progress
 * Shows in-progress and completed projects with statistics
 */
const ProgressScreen = ({ navigation }) => {
  const { projects, progress, getUserStats } = useApp();
  const [selectedTab, setSelectedTab] = useState('all');

  const stats = getUserStats();

  // Organize projects by status
  const projectsByStatus = useMemo(() => {
    const userProjects = projects.filter(p => progress[p.id]);

    const inProgress = [];
    const completed = [];

    userProjects.forEach(project => {
      const projectProgress = progress[project.id];
      if (projectProgress.status === 'completed') {
        completed.push({ ...project, progress: projectProgress });
      } else {
        inProgress.push({ ...project, progress: projectProgress });
      }
    });

    return { inProgress, completed };
  }, [projects, progress]);

  const filteredProjects = useMemo(() => {
    switch (selectedTab) {
      case 'in-progress':
        return projectsByStatus.inProgress;
      case 'completed':
        return projectsByStatus.completed;
      default:
        return [
          ...projectsByStatus.inProgress,
          ...projectsByStatus.completed
        ];
    }
  }, [selectedTab, projectsByStatus]);

  const ProjectCard = ({ project }) => {
    const totalHoursEstimate = project.timeWeeks * parseInt(project.timePerWeek);
    const isCompleted = project.progress.status === 'completed';

    return (
      <TouchableOpacity
        style={[styles.projectCard, isCompleted && styles.completedCard]}
        onPress={() =>
          navigation.navigate('Home', {
            screen: 'ProjectDetail',
            params: { project }
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.projectCardHeader}>
          <View style={styles.projectCardTitle}>
            <Text
              style={[
                styles.projectCardName,
                isCompleted && styles.completedText
              ]}
              numberOfLines={2}
            >
              {project.title}
            </Text>
            <Text style={styles.projectCategory}>{project.category}</Text>
          </View>
          {isCompleted && (
            <MaterialIcons name="check-circle" size={24} color="#27ae60" />
          )}
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                isCompleted && styles.completedProgress,
                {
                  width: `${project.progress.completionPercentage}%`
                }
              ]}
            />
          </View>
          <Text style={styles.progressPercent}>
            {project.progress.completionPercentage}%
          </Text>
        </View>

        <View style={styles.projectCardFooter}>
          <View style={styles.cardMetaItem}>
            <MaterialIcons name="schedule" size={14} color="#666" />
            <Text style={styles.cardMetaText}>{project.timeWeeks}w</Text>
          </View>
          <View style={styles.cardMetaItem}>
            <MaterialIcons name="attach-money" size={14} color="#666" />
            <Text style={styles.cardMetaText}>${project.budget}</Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Completed</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#d4edda' }]}>
              <MaterialIcons name="play-arrow" size={20} color="#27ae60" />
            </View>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statValue}>
              {projectsByStatus.inProgress.length}
            </Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#d4f0f4' }]}>
              <MaterialIcons name="check-circle" size={20} color="#2d6a4f" />
            </View>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>
              {projectsByStatus.completed.length}
            </Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fff3cd' }]}>
              <MaterialIcons name="trending-up" size={20} color="#ff9800" />
            </View>
            <Text style={styles.statLabel}>Total Reviews</Text>
            <Text style={styles.statValue}>{stats.totalReviews}</Text>
          </View>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'all' && styles.activeTabText
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'in-progress' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('in-progress')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'in-progress' && styles.activeTabText
            ]}
          >
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'completed' && styles.activeTabText
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <FlatList
          data={filteredProjects}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ProjectCard project={item} />}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="inbox" size={64} color="#ddd" />
          <Text style={styles.emptyStateText}>
            {selectedTab === 'completed'
              ? 'No completed projects yet'
              : 'No projects in progress'}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {selectedTab === 'completed'
              ? 'Start a project and complete it!'
              : 'Start a project from the Discover tab'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#f8f9fa'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    marginBottom: 4
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333'
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff'
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#2d6a4f'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999'
  },
  activeTabText: {
    color: '#2d6a4f'
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  completedCard: {
    opacity: 0.8,
    backgroundColor: '#f9f9f9'
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  projectCardTitle: {
    flex: 1,
    marginRight: 8
  },
  projectCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4
  },
  completedText: {
    color: '#999',
    textDecorationLine: 'line-through'
  },
  projectCategory: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500'
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2d6a4f'
  },
  completedProgress: {
    backgroundColor: '#27ae60'
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    minWidth: 36,
    textAlign: 'right'
  },
  projectCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  cardMetaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  completedBadge: {
    marginLeft: 'auto',
    backgroundColor: '#d4edda',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4
  },
  completedBadgeText: {
    fontSize: 11,
    color: '#27ae60',
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center'
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  }
});

export default ProgressScreen;
