import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Sample data - will be replaced with API data later
const SAMPLE_REWARDS = [
  { 
    id: '1', 
    company: 'Nike', 
    reward: '15% OFF', 
    promoCode: 'NIKE15RUN', 
    expiryDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days from now
    used: false
  },
  { 
    id: '2', 
    company: 'Starbucks', 
    reward: 'Buy 1 Get 1 Free', 
    promoCode: 'SBUX2FOR1', 
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    used: false
  },
  { 
    id: '3', 
    company: 'Amazon', 
    reward: '$5 OFF any purchase', 
    promoCode: 'AMZN5OFF', 
    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (expired)
    used: false
  },
  { 
    id: '4', 
    company: 'Spotify', 
    reward: '1 Month Free Premium', 
    promoCode: 'SPOTIFY1MO', 
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    used: true
  },
];

const RewardsScreen = ({ route, navigation }) => {
  const [rewards, setRewards] = useState([]);
  const [activeTab, setActiveTab] = useState('Available');

  useEffect(() => {
    // Simulate loading rewards from API or local storage
    setRewards(SAMPLE_REWARDS);
  }, []);

  // Handle new reward from AdViewScreen
  useEffect(() => {
    if (route.params?.newReward) {
      const { newReward } = route.params;
      
      // Check if reward already exists
      const existingRewardIndex = rewards.findIndex(
        reward => reward.promoCode === newReward.promoCode
      );
      
      if (existingRewardIndex >= 0) {
        // Already exists, show message
        Alert.alert(
          'Already Claimed',
          'You have already claimed this reward.'
        );
      } else {
        // Add new reward to the list
        setRewards(prevRewards => [
          { ...newReward, used: false },
          ...prevRewards
        ]);
        
        // Show success message
        Alert.alert(
          'Reward Claimed!',
          `You've successfully claimed ${newReward.reward} from ${newReward.company}`
        );
      }
      
      // Clear the route params
      navigation.setParams({ newReward: null });
    }
  }, [route.params?.newReward, navigation, rewards]);

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const formatExpiryDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const copyToClipboard = (code) => {
    // In a real app, you would use Clipboard API
    Alert.alert(
      'Copied!',
      `Promo code ${code} copied to clipboard`,
      [
        { text: 'OK' }
      ]
    );
  };

  const markAsUsed = (id) => {
    setRewards(prevRewards => 
      prevRewards.map(reward => 
        reward.id === id ? { ...reward, used: true } : reward
      )
    );
  };

  const filteredRewards = rewards.filter(reward => {
    if (activeTab === 'Available') {
      return !reward.used && !isExpired(reward.expiryDate);
    } else if (activeTab === 'Used') {
      return reward.used;
    } else { // Expired
      return isExpired(reward.expiryDate) && !reward.used;
    }
  });

  const renderRewardItem = ({ item }) => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <Text style={styles.companyName}>{item.company}</Text>
        {activeTab === 'Available' ? (
          <Text style={styles.expiryDate}>
            Expires: {formatExpiryDate(item.expiryDate)}
          </Text>
        ) : activeTab === 'Used' ? (
          <Text style={styles.usedBadge}>USED</Text>
        ) : (
          <Text style={styles.expiredBadge}>EXPIRED</Text>
        )}
      </View>
      
      <Text style={styles.rewardText}>{item.reward}</Text>
      
      <View style={styles.promoCodeContainer}>
        <Text style={styles.promoCode}>{item.promoCode}</Text>
        
        {activeTab === 'Available' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => copyToClipboard(item.promoCode)}
            >
              <Ionicons name="copy-outline" size={20} color="#6200ee" />
              <Text style={styles.buttonText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.usedButton}
              onPress={() => markAsUsed(item.id)}
            >
              <Ionicons name="checkmark-outline" size={20} color="#4caf50" />
              <Text style={[styles.buttonText, { color: '#4caf50' }]}>Mark Used</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="gift-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No rewards found</Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'Available' 
          ? 'Watch ads to earn rewards!' 
          : activeTab === 'Used' 
            ? 'Rewards you use will appear here' 
            : 'Expired rewards will appear here'}
      </Text>
      
      {activeTab === 'Available' && (
        <TouchableOpacity 
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.browseButtonText}>Browse Ads</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'Available' && styles.activeTab
          ]}
          onPress={() => setActiveTab('Available')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'Available' && styles.activeTabText
            ]}
          >
            Available
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'Used' && styles.activeTab
          ]}
          onPress={() => setActiveTab('Used')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'Used' && styles.activeTabText
            ]}
          >
            Used
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'Expired' && styles.activeTab
          ]}
          onPress={() => setActiveTab('Expired')}
        >
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'Expired' && styles.activeTabText
            ]}
          >
            Expired
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredRewards}
        renderItem={renderRewardItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.rewardsList}
        ListEmptyComponent={renderEmptyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6200ee',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#6200ee',
  },
  rewardsList: {
    padding: 16,
    flexGrow: 1,
  },
  rewardCard: {
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
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  expiryDate: {
    fontSize: 12,
    color: '#666',
  },
  usedBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  expiredBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#f44336',
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    color: '#000',
  },
  promoCodeContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  promoCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#6200ee',
    borderRadius: 4,
  },
  usedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 4,
  },
  buttonText: {
    marginLeft: 4,
    fontWeight: '500',
    color: '#6200ee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
export default RewardsScreen;
