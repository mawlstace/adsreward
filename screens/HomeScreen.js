import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample data
const SAMPLE_ADS = [
  { 
    id: '1', 
    title: 'Nike Running Shoes', 
    company: 'Nike', 
    category: 'Sports', 
    tags: ['Shoes', 'Running', 'Athletic'], 
    duration: '30s', 
    reward: '15% OFF' 
  },
  { 
    id: '2', 
    title: 'New Coffee Blend', 
    company: 'Starbucks', 
    category: 'Food', 
    tags: ['Coffee', 'Beverages', 'Hot Drinks'], 
    duration: '15s', 
    reward: 'Buy 1 Get 1 Free' 
  },
  { 
    id: '3', 
    title: 'Wireless Headphones', 
    company: 'Sony', 
    category: 'Electronics', 
    tags: ['Audio', 'Wireless', 'Tech'], 
    duration: '45s', 
    reward: '$10 OFF' 
  },
  { 
    id: '4', 
    title: 'Premium Subscription', 
    company: 'Spotify', 
    category: 'Entertainment', 
    tags: ['Music', 'Streaming', 'Premium'], 
    duration: '20s', 
    reward: '1 Month Free' 
  },
  { 
    id: '5', 
    title: 'Online Course', 
    company: 'Udemy', 
    category: 'Education', 
    tags: ['Learning', 'Online', 'Skills'], 
    duration: '60s', 
    reward: '30% OFF' 
  },
];

// All available categories
const ALL_CATEGORIES = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Electronics' },
  { id: '3', name: 'Fashion' },
  { id: '4', name: 'Food' },
  { id: '5', name: 'Sports' },
  { id: '6', name: 'Entertainment' },
  { id: '7', name: 'Education' },
];

const HomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([ALL_CATEGORIES[0]]);
  
  // useIsFocused will return true when the screen is focused
  const isFocused = useIsFocused();

  // Load user interests when the screen comes into focus
  useEffect(() => {
    const loadUserInterests = async () => {
      try {
        const savedInterests = await AsyncStorage.getItem('userInterests');
        if (savedInterests) {
          const interests = JSON.parse(savedInterests);
          setUserInterests(interests);
          
          // Create filtered categories based on user interests
          // Always include "All" category
          const filtered = [ALL_CATEGORIES[0]];
          
          // Add categories from ALL_CATEGORIES that match user interests
          ALL_CATEGORIES.forEach(category => {
            if (category.name !== 'All' && interests.includes(category.name)) {
              filtered.push(category);
            }
          });
          
          setFilteredCategories(filtered);
          
          // If selected category is not in user interests, reset to "All"
          if (selectedCategory !== 'All' && !interests.includes(selectedCategory)) {
            setSelectedCategory('All');
          }
        } else {
          // If no interests are saved, show all categories
          setFilteredCategories(ALL_CATEGORIES);
        }
      } catch (error) {
        console.error('Error loading user interests:', error);
        // Show all categories as a fallback
        setFilteredCategories(ALL_CATEGORIES);
      }
    };

    if (isFocused) {
      loadUserInterests();
    }
  }, [isFocused]);

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

  // Render ad card
  const renderAdCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.adCard}
      onPress={() => navigation.navigate('AdView', { adId: item.id })}
    >
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
        <Text style={styles.adDuration}>{item.duration}</Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>{item.reward}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Filter ads based on selected category and tags
  const filteredAds = SAMPLE_ADS.filter(ad => {
    // Category filter
    const passesCategory = selectedCategory === 'All' || ad.category === selectedCategory;
    
    // Tag filter
    const passesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => ad.tags?.includes(tag));
    
    return passesCategory && passesTags;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={filteredCategories}
          renderItem={renderCategoryItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      <FlatList
        data={filteredAds}
        renderItem={renderAdCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.adsList}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No ads found for this category or tag selection.
            </Text>
          </View>
        )}
      />
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
  adsList: {
    padding: 16,
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
  },
});

export default HomeScreen;