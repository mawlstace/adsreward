import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';

// Sample data - will be replaced with API data later
const SAMPLE_ADS = [
  { id: '1', title: 'Nike Running Shoes', company: 'Nike', category: 'Sports', duration: '30s', reward: '15% OFF' },
  { id: '2', title: 'New Coffee Blend', company: 'Starbucks', category: 'Food', duration: '15s', reward: 'Buy 1 Get 1 Free' },
  { id: '3', title: 'Wireless Headphones', company: 'Sony', category: 'Electronics', duration: '45s', reward: '$10 OFF' },
  { id: '4', title: 'Premium Subscription', company: 'Spotify', category: 'Entertainment', duration: '20s', reward: '1 Month Free' },
  { id: '5', title: 'Online Course', company: 'Udemy', category: 'Education', duration: '60s', reward: '30% OFF' },
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
  const [selectedCategory, setSelectedCategory] = React.useState('All');

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
      <View style={styles.adFooter}>
        <Text style={styles.adDuration}>{item.duration}</Text>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>{item.reward}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.name && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
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
        data={SAMPLE_ADS}
        renderItem={renderAdCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.adsList}
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
});

export default HomeScreen;
