import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useUser } from '../context/UserContext';

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
  {
    id: '6',
    title: 'Summer Collection',
    company: 'Zara',
    category: 'Fashion',
    tags: ['Clothing', 'Summer', 'Trends'],
    duration: '25s',
    reward: '20% OFF'
  }
];

const CATEGORIES = [
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
  
  // Get user interests from context
  const { userInterests, filterByInterests, setFilterByInterests } = useUser();

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

  // Filter ads based on selected category, tags and user interests
  const filteredAds = SAMPLE_ADS.filter(ad => {
    // First apply category filter
    const passesCategory = selectedCategory === 'All' || ad.category === selectedCategory;
    
    // Then apply tag filter
    const passesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => ad.tags?.includes(tag));
    
    // Then apply user interests filter if enabled
    // Only apply if userInterests is not empty
    const passesInterests = !filterByInterests || 
      userInterests.length === 0 || 
      userInterests.includes(ad.category);
    
    return passesCategory && passesTags && passesInterests;
  });

  return (
    <SafeAreaView style={styles.container}>
      {userInterests.length > 0 && (
        <View style={styles.interestsContainer}>
          <Text style={styles.interestsTitle}>
            Your Interests: {userInterests.join(', ')}
          </Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setFilterByInterests(!filterByInterests)}
          >
            <Text style={styles.toggleButtonText}>
              {filterByInterests ? 'Show All Ads' : 'Show Only My Interests'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
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
              {filterByInterests && userInterests.length > 0
                ? "No ads match your interests in this category. Try showing all ads or update your interests in your profile."
                : "No ads found for this category or tag selection."}
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
  interestsContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  interestsTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6200ee',
    borderRadius: 16,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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