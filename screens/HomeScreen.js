import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdService from '../services/AdService'; // Import the new service
import { useUser } from '../context/UserContext';

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [availableAds, setAvailableAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allTags, setAllTags] = useState([]);
  
  // Get user context
  const { userInterests } = useUser();
  
  // useIsFocused will return true when the screen is focused
  const isFocused = useIsFocused();

  // Load categories based on user interests
  useEffect(() => {
    // Always include 'All' category
    const categories = [{ id: '1', name: 'All' }];
    
    if (userInterests && userInterests.length > 0) {
      // Load only the categories that match user interests
      console.log("HomeScreen: Filtering categories based on interests:", userInterests);
      
      // Get all available categories
      const allCategories = AdService.getAllCategories();
      
      // Filter to include only selected interests plus 'All'
      allCategories.forEach(category => {
        if (category.name !== 'All' && userInterests.includes(category.name)) {
          categories.push(category);
        }
      });
    } else {
      // If no interests are selected, show all categories
      const allCategories = AdService.getAllCategories();
      allCategories.forEach(category => {
        if (category.name !== 'All') {
          categories.push(category);
        }
      });
    }
    
    setFilteredCategories(categories);
    
    // Reset to 'All' if the currently selected category is no longer available
    if (selectedCategory !== 'All' && !categories.some(c => c.name === selectedCategory)) {
      setSelectedCategory('All');
    }
    
    // Load all possible tags
    const tags = AdService.getAllTags();
    setAllTags(tags);
  }, [userInterests]);

  // Load filtered ads when dependencies change
  useEffect(() => {
    if (isFocused) {
      loadFilteredAds();
      console.log("HomeScreen: Loading ads with category:", selectedCategory, "and interests:", userInterests);
    }
  }, [isFocused, selectedCategory, selectedTags, userInterests]);

  // Load filtered ads based on current selections
  const loadFilteredAds = async () => {
    if (!isFocused) return;
    
    try {
      setLoading(true);
      const ads = await AdService.getFilteredAds(
        selectedCategory, 
        selectedTags, 
        userInterests
      );
      setAvailableAds(ads);
    } catch (error) {
      console.error('Error loading filtered ads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.name && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadFilteredAds();
  };

  // Render ad card
  const renderAdCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.adCard}
      onPress={() => {
        // Track that this ad was viewed
        AdService.trackAdView(item.id);
        // Navigate to the ad view screen
        navigation.navigate('AdView', { adId: item.id });
      }}
    >
      {/* Add thumbnail image */}
      <Image 
        source={{ uri: item.thumbnail }}
        style={styles.adThumbnail}
        resizeMode="cover"
      />
      
      <View style={styles.adContent}>
        <View style={styles.adHeader}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.adCategory}>{item.category}</Text>
        </View>
        
        <Text style={styles.adTitle}>{item.title}</Text>
        
        {/* Display tags */}
        <View style={styles.tagsContainer}>
          {item.tags?.map((tag, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.tagBadge,
                selectedTags.includes(tag) && styles.selectedTagBadge
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text 
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.selectedTagText
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.adFooter}>
          <Text style={styles.adDuration}>{item.durationStr}</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>{item.reward}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render tag filters
  const renderTagFiltersSection = () => {
    // Show up to 10 most common tags
    const displayTags = allTags.slice(0, 10);
    
    return (
      <View style={styles.tagFiltersContainer}>
        <Text style={styles.tagFiltersTitle}>Filter by Tags:</Text>
        <View style={styles.tagFiltersList}>
          {displayTags.map((tag, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.tagFilterBadge,
                selectedTags.includes(tag) && styles.selectedTagFilterBadge
              ]}
              onPress={() => toggleTag(tag)}
            >
              <Text 
                style={[
                  styles.tagFilterText,
                  selectedTags.includes(tag) && styles.selectedTagFilterText
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Categories horizontal list */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {/* Tag filters */}
      {renderTagFiltersSection()}
      
      {/* Ads list */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading ads...</Text>
        </View>
      ) : (
        <FlatList
          data={availableAds}
          renderItem={renderAdCard}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.adsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6200ee']}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No ads found for this category or tag selection.
              </Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedTags([]);
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  categoriesContainer: {
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategory: {
    backgroundColor: '#6200ee',
  },
  categoryText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  tagFiltersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 1,
  },
  tagFiltersTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  tagFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagFilterBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTagFilterBadge: {
    backgroundColor: '#e0cfff',
  },
  tagFilterText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTagFilterText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  adsList: {
    padding: 16,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    overflow: 'hidden', // For the image corners to be rounded
  },
  adThumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
  },
  adContent: {
    padding: 16,
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  adCategory: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    color: '#000',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  tagBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedTagBadge: {
    backgroundColor: '#e0cfff',
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTagText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  adFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  adDuration: {
    fontSize: 13,
    color: '#666',
  },
  rewardBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rewardText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default HomeScreen;