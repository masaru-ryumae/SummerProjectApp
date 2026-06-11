import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useApp } from '../context/AppProvider';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

/**
 * HomeScreen - Project Discovery
 * Displays all available projects with search and filtering
 */
const HomeScreen = ({ navigation }) => {
  const { projects, favorites, isLoading } = useApp();
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Extract unique categories and difficulties
  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(p => p.difficulty === selectedDifficulty);
    }

    setFilteredProjects(filtered);
  }, [searchText, selectedCategory, selectedDifficulty, projects]);

  const handleProjectPress = (project) => {
    navigation.navigate('ProjectDetail', { project });
  };

  const ProjectCard = ({ project }) => {
    const isFavorite = favorites.includes(project.id);

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => handleProjectPress(project)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            <Text style={styles.projectTitle} numberOfLines={2}>
              {project.title}
            </Text>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.badgeSmall,
                  styles[`difficulty${project.difficulty}`]
                ]}
              >
                <Text style={styles.badgeText}>
                  {project.difficulty.charAt(0).toUpperCase() +
                    project.difficulty.slice(1)}
                </Text>
              </View>
              <Text style={styles.category}>{project.category}</Text>
            </View>
          </View>
          <MaterialIcons
            name={isFavorite ? 'favorite' : 'favorite-border'}
            size={24}
            color={isFavorite ? '#e74c3c' : '#bbb'}
          />
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {project.description}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.infoText}>{project.timeWeeks}w</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="attach-money" size={16} color="#666" />
            <Text style={styles.infoText}>${project.budget}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="group" size={16} color="#666" />
            <Text style={styles.infoText}>{project.teamSize}</Text>
          </View>
        </View>

        <View style={styles.skillTags}>
          {project.requiredSkills.slice(0, 3).map((skill, idx) => (
            <View key={idx} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
          {project.requiredSkills.length > 3 && (
            <Text style={styles.moreSkills}>
              +{project.requiredSkills.length - 3} more
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView
          style={styles.filtersContainer}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Category:</Text>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterButton,
                  selectedCategory === cat && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedCategory === cat && styles.filterButtonTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Difficulty:</Text>
            {difficulties.map(diff => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.filterButton,
                  selectedDifficulty === diff && styles.filterButtonActive
                ]}
                onPress={() => setSelectedDifficulty(diff)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedDifficulty === diff && styles.filterButtonTextActive
                  ]}
                >
                  {diff}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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
            <MaterialIcons name="search-off" size={64} color="#ddd" />
            <Text style={styles.emptyStateText}>No projects found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 40
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    color: '#333'
  },
  filtersContainer: {
    paddingHorizontal: 8,
    marginBottom: 12,
    maxHeight: 120
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4
  },
  filterButtonActive: {
    backgroundColor: '#2d6a4f'
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666'
  },
  filterButtonTextActive: {
    color: '#fff'
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  titleSection: {
    flex: 1,
    marginRight: 8
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8
  },
  difficultybeginning: {
    backgroundColor: '#d4edda'
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
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333'
  },
  category: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500'
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  skillTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4
  },
  skillText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '500'
  },
  moreSkills: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    alignSelf: 'center'
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

export default HomeScreen;
