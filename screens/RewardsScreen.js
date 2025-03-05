import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RewardsScreen = ({ route, navigation }) => {
  // State to manage the rewards list
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Get the new reward from params if available
  const newReward = route.params?.newReward;
  
  // Load saved rewards on component mount
  useEffect(() => {
    loadRewards();
  }, []);
  
  // Add new reward when received from navigation params
  useEffect(() => {
    if (newReward) {
      console.log("New reward received:", newReward);
      
      // Make sure we're not adding duplicates by using a unique ID
      const uniqueId = `${newReward.id}-${Date.now()}`;
      
      // Add the reward with a unique ID and timestamp
      const rewardToAdd = {
        ...newReward,
        uniqueId: uniqueId,
        timestamp: new Date().toISOString()
      };
      
      // Add to existing rewards
      const updatedRewards = [...rewards, rewardToAdd];
      setRewards(updatedRewards);
      
      // Save to AsyncStorage
      saveRewards(updatedRewards);
      
      // Show feedback
      showTemporaryFeedback('Reward added!');
    }
  }, [newReward]);
  
  // Show feedback message temporarily
  const showTemporaryFeedback = (message) => {
    setFeedback(message);
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };
  
  // Load saved rewards from AsyncStorage
  const loadRewards = async () => {
    try {
      setLoading(true);
      const savedRewards = await AsyncStorage.getItem('userRewards');
      console.log("Loaded rewards from storage:", savedRewards);
      
      if (savedRewards) {
        setRewards(JSON.parse(savedRewards));
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Save rewards to AsyncStorage
  const saveRewards = async (rewardsToSave) => {
    try {
      console.log("Saving rewards:", rewardsToSave);
      await AsyncStorage.setItem('userRewards', JSON.stringify(rewardsToSave));
    } catch (error) {
      console.error('Error saving rewards:', error);
    }
  };
  
  // Delete a reward
  const deleteReward = (uniqueId) => {
    const updatedRewards = rewards.filter(reward => reward.uniqueId !== uniqueId);
    setRewards(updatedRewards);
    saveRewards(updatedRewards);
  };
  
  // Use a reward
  const useReward = (uniqueId) => {
    // Find the reward
    const reward = rewards.find(r => r.uniqueId === uniqueId);
    
    // Show promo code as feedback
    showTemporaryFeedback(`Code: ${reward.promoCode} is now being used`);
    
    // In a real app, you might mark it as used instead of deleting it
    deleteReward(uniqueId);
  };

  const renderRewardCard = ({ item }) => {
    // Format the expiry date
    const expiryDate = new Date(item.expiryDate);
    const formattedDate = expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return (
      <View style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <Text style={styles.companyName}>{item.company}</Text>
          <Text style={styles.expiryDate}>Expires: {formattedDate}</Text>
        </View>
        
        <Text style={styles.rewardText}>{item.reward}</Text>
        
        <View style={styles.promoCodeContainer}>
          <Text style={styles.promoCodeLabel}>Promo Code:</Text>
          <Text style={styles.promoCode}>{item.promoCode}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.useButton}
          onPress={() => useReward(item.uniqueId)}
        >
          <Text style={styles.useButtonText}>Use Reward</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Feedback message */}
      {showFeedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}
      
      <FlatList
        data={rewards}
        renderItem={renderRewardCard}
        keyExtractor={(item) => item.uniqueId || `${item.id}-${item.timestamp || Date.now()}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.rewardsList,
          rewards.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {loading ? "Loading rewards..." : "You don't have any rewards yet"}
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
  feedbackContainer: {
    backgroundColor: '#6200ee',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rewardsList: {
    padding: 16,
  },
  emptyListContainer: {
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
    marginBottom: 8,
  },
  companyName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  expiryDate: {
    fontSize: 12,
    color: '#666',
  },
  rewardText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#6200ee',
  },
  promoCodeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  promoCodeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  promoCode: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    letterSpacing: 1,
  },
  useButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  useButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RewardsScreen;