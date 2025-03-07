import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

const RewardsScreen = ({ route, navigation }) => {
  // Get user context
  const { userData, updateUserData } = useUser();
  
  // State to manage the rewards list
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Get the refresh signal from route params
  const refresh = route.params?.refresh;
  
  // Load saved rewards from AsyncStorage - extract as a standalone function
  const loadRewards = useCallback(async () => {
    try {
      console.log("RewardsScreen: Loading rewards from storage");
      setLoading(true);
      const savedRewards = await AsyncStorage.getItem('userRewards');
      console.log("Loaded rewards from storage:", savedRewards);
      
      if (savedRewards) {
        const parsedRewards = JSON.parse(savedRewards);
        setRewards(parsedRewards);
        console.log("RewardsScreen: Set rewards state with", parsedRewards.length, "rewards");
      } else {
        console.log("RewardsScreen: No rewards found in storage");
        setRewards([]);
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load saved rewards on component mount or when screen is focused or refresh changes
  useEffect(() => {
    // Load rewards when focused
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("RewardsScreen focused, reloading rewards");
      loadRewards();
    });

    // Initial load
    loadRewards();

    // Cleanup listener on unmount
    return unsubscribe;
  }, [navigation, loadRewards]);
  
  // Watch for refresh param changes to trigger reload
  useEffect(() => {
    if (refresh) {
      console.log("RewardsScreen: Refresh param changed, reloading rewards");
      loadRewards();
    }
  }, [refresh, loadRewards]);
  
  // Show feedback message temporarily
  const showTemporaryFeedback = (message) => {
    setFeedback(message);
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
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
  
  // Delete a reward and update storage
  const deleteReward = async (uniqueId) => {
    try {
      console.log("Deleting reward with ID:", uniqueId);
      
      // Update local state first for immediate feedback
      const updatedRewards = rewards.filter(reward => reward.uniqueId !== uniqueId);
      setRewards(updatedRewards);
      
      // Then update storage
      await saveRewards(updatedRewards);
      
      return true; // Success
    } catch (error) {
      console.error('Error deleting reward:', error);
      return false; // Failed
    }
  };
  
  // Use a reward
  const useReward = async (uniqueId) => {
    console.log("Attempting to use reward with ID:", uniqueId);
    
    // Find the reward
    const reward = rewards.find(r => r.uniqueId === uniqueId);
    
    if (reward) {
      console.log("Found reward to use:", reward);
      
      // Show confirmation alert
      Alert.alert(
        "Use Reward",
        `Are you sure you want to use the ${reward.reward} reward from ${reward.company || 'Unknown Company'}?`,
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Use Now",
            onPress: async () => {
              try {
                // First remove the reward from view immediately for better UX
                const tempUpdatedRewards = rewards.filter(r => r.uniqueId !== uniqueId);
                setRewards(tempUpdatedRewards);
                
                // Show the promo code alert
                Alert.alert(
                  "Reward Claimed!",
                  `Your promo code is: ${reward.promoCode}\n\nShow this code to the cashier or enter it at checkout.`,
                  [
                    { 
                      text: "OK", 
                      onPress: async () => {
                        try {
                          // Complete the actual deletion from storage
                          const success = await deleteReward(uniqueId);
                          
                          if (success) {
                            // Update used rewards count in AsyncStorage
                            const usedCountStr = await AsyncStorage.getItem('usedRewardsCount');
                            let usedCount = 1;
                            if (usedCountStr) {
                              usedCount = parseInt(usedCountStr, 10) + 1;
                            }
                            await AsyncStorage.setItem('usedRewardsCount', usedCount.toString());
                            
                            // Update user context
                            if (userData) {
                              const currentUsed = userData.rewardsUsed || 0;
                              updateUserData({ rewardsUsed: currentUsed + 1 });
                            }
                            
                            // Show success message
                            showTemporaryFeedback("Reward successfully redeemed!");
                          } else {
                            // If there was an error, put the reward back in the list
                            setRewards([...tempUpdatedRewards, reward]);
                            showTemporaryFeedback("Failed to redeem reward. Please try again.");
                          }
                        } catch (error) {
                          console.error("Error completing reward usage:", error);
                          // If there was an error, put the reward back in the list
                          setRewards([...tempUpdatedRewards, reward]);
                          showTemporaryFeedback("Error redeeming reward.");
                        }
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Error in reward claiming process:', error);
                showTemporaryFeedback("Error showing reward code.");
              }
            }
          }
        ]
      );
    } else {
      console.error("Reward not found with ID:", uniqueId);
      Alert.alert("Error", "Reward not found. Please try again.");
    }
  };

  const renderRewardCard = ({ item }) => {
    // Format the expiry date
    let formattedDate = "No expiry date";
    try {
      const expiryDate = new Date(item.expiryDate);
      // Check if date is valid
      if (!isNaN(expiryDate.getTime())) {
        formattedDate = expiryDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
    }

    // Check if promo code exists
    const hasPromoCode = item.promoCode && item.promoCode.trim() !== '';

    return (
      <View style={styles.rewardCard}>
        <View style={styles.rewardHeader}>
          <Text style={styles.companyName}>{item.company || 'Unknown Company'}</Text>
          <Text style={styles.expiryDate}>Expires: {formattedDate}</Text>
        </View>
        
        <Text style={styles.rewardText}>{item.reward || 'Reward'}</Text>
        
        {hasPromoCode && (
          <View style={styles.promoCodeContainer}>
            <Text style={styles.promoCodeLabel}>Promo Code:</Text>
            <Text style={styles.promoCode}>{item.promoCode}</Text>
          </View>
        )}
        
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