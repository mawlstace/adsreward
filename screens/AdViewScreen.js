import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdService from '../services/AdService';
import { useUser } from '../context/UserContext';
import { CommonActions } from '@react-navigation/native';


const AdViewScreen = ({ route, navigation }) => {
  const { adId } = route.params;
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [claimInProgress, setClaimInProgress] = useState(false);
  const { userData, updateUserData } = useUser();

  // Fetch ad details
  useEffect(() => {
    const fetchAdDetails = async () => {
      setLoading(true);
      
      try {
        const adDetails = await AdService.getAdById(adId);
        if (adDetails) {
          setAd(adDetails);
        } else {
          console.error('Ad not found:', adId);
        }
      } catch (error) {
        console.error('Error fetching ad details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdDetails();
  }, [adId]);

  // Simulate ad watching timer
  useEffect(() => {
    let interval;
    
    if (watching && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            setWatching(false);
            setCompleted(true);
            // Increment watched ads counter when ad completes
            incrementWatchedAdsCount();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [watching, timeRemaining]);

  // Increment watched ads count in AsyncStorage and UserContext
  const incrementWatchedAdsCount = async () => {
    try {
      // Get current count
      const currentCount = await AsyncStorage.getItem('watchedAdsCount');
      let newCount = 1; // Default to 1 if no previous count exists
      
      if (currentCount) {
        newCount = parseInt(currentCount, 10) + 1;
      }
      
      // Save new count
      await AsyncStorage.setItem('watchedAdsCount', newCount.toString());
      console.log('Watched ads count updated to:', newCount);
      
      // Update user context
      if (userData) {
        updateUserData({ watchedAds: newCount });
      }
    } catch (error) {
      console.error('Error updating watched ads count:', error);
    }
  };

  const startWatchingAd = () => {
    if (ad) {
      // Use the full duration from the ad object
      setTimeRemaining(ad.duration);
      setWatching(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper function to navigate to rewards screen - FIXED VERSION
  const goToRewardsScreen = () => {
    console.log("Navigating to rewards tab");
    
    // Clear any claim in progress
    setClaimInProgress(false);
    
    try {
      // Reset navigation to main tab navigator
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
      // Then navigate to the RewardsTab inside Main
      setTimeout(() => {
        navigation.navigate('Main', { 
          screen: 'RewardsTab',
          params: { refresh: true } 
        });
      }, 300); // Increased timeout for more reliable navigation
    } catch (error) {
      console.error("Error navigating to rewards tab:", error);
      
      // Last resort - just go back to main screen
      navigation.navigate('Main');
    }
  };

  // Claim the reward and navigate to rewards screen
  const claimReward = async () => {
    if (!ad || claimInProgress) return;
    
    setClaimInProgress(true);
    
    try {
      // Make sure we have all required fields for a valid reward
      if (!ad.id || !ad.company || !ad.reward || !ad.promoCode) {
        Alert.alert(
          "Error",
          "This ad has incomplete reward information. Please try another ad.",
          [{ text: "OK", onPress: () => setClaimInProgress(false) }]
        );
        return;
      }

      // Create reward with all necessary data
      const newReward = {
        id: ad.id,
        company: ad.company,
        reward: ad.reward,
        promoCode: ad.promoCode,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        claimedDate: new Date().toISOString(),
      };
      
      console.log("Claiming reward:", newReward);
      
      // Save directly to AsyncStorage to ensure it's saved immediately
      try {
        // Get current rewards first
        const savedRewardsStr = await AsyncStorage.getItem('userRewards');
        let currentRewards = [];
        if (savedRewardsStr) {
          currentRewards = JSON.parse(savedRewardsStr);
        }
        
        // Check if we already have this exact reward (prevent duplicates)
        const isDuplicate = currentRewards.some(reward => 
          reward.id === newReward.id && 
          reward.promoCode === newReward.promoCode
        );
        
        if (isDuplicate) {
          console.log("Duplicate reward detected, not adding again:", newReward.promoCode);
          
          // Release the button state
          setClaimInProgress(false);
          
          // Show alert and navigate
          Alert.alert(
            "Already Claimed",
            "You have already claimed this reward. Check your rewards page.",
            [{ 
              text: "Go to Rewards", 
              onPress: () => {
                console.log("Navigating to rewards from duplicate alert");
                goToRewardsScreen();
              }
            }]
          );
          
          return;
        }
        
        // Add new reward with unique ID
        const uniqueId = `${newReward.id}-${Date.now()}`;
        const rewardToAdd = {
          ...newReward,
          uniqueId: uniqueId,
          timestamp: new Date().toISOString()
        };
        
        // Update rewards list
        const updatedRewards = [...currentRewards, rewardToAdd];
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('userRewards', JSON.stringify(updatedRewards));
        console.log("Reward saved directly to storage:", rewardToAdd);
        
        // Update user context - increment rewards earned
        if (userData) {
          const currentRewardsCount = userData.rewardsEarned || 0;
          updateUserData({ rewardsEarned: currentRewardsCount + 1 });
        }
        
        // Release the button state
        setClaimInProgress(false);
        
        // Show success alert and navigate after a user confirms
        Alert.alert(
          "Reward Claimed!",
          "Your reward has been added to your rewards list.",
          [{ 
            text: "View Rewards", 
            onPress: () => {
              console.log("Navigating to rewards from success alert");
              goToRewardsScreen();
            }
          }]
        );
        
      } catch (error) {
        console.error('Error saving reward to AsyncStorage:', error);
        Alert.alert(
          "Error",
          "There was a problem saving your reward. Please try again.",
          [{ text: "OK", onPress: () => setClaimInProgress(false) }]
        );
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert(
        "Error",
        "There was a problem claiming your reward. Please try again.",
        [{ text: "OK", onPress: () => setClaimInProgress(false) }]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading ad...</Text>
      </View>
    );
  }

  // Handle the case where ad is still null after loading
  if (!ad) {
    return (
      <View style={styles.centerContainer}>
        <AntDesign name="exclamationcircleo" size={48} color="#ff6b6b" />
        <Text style={styles.errorText}>Ad not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Ad Thumbnail */}
      <Image 
        source={{ uri: ad.thumbnail }}
        style={styles.adImage}
        resizeMode="cover"
      />
      
      <View style={styles.adDetails}>
        <View style={styles.adHeaderRow}>
          <Text style={styles.companyName}>{ad.company}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{ad.category}</Text>
          </View>
        </View>
        
        <Text style={styles.adTitle}>{ad.title}</Text>
        <Text style={styles.adDescription}>{ad.description}</Text>
        
        {/* Tags */}
        <View style={styles.tagsContainer}>
          {ad.tags && ad.tags.map((tag, index) => (
            <View key={index} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.rewardContainer}>
          <View style={styles.rewardHeader}>
            <Ionicons name="gift-outline" size={20} color="#4caf50" />
            <Text style={styles.rewardLabel}>Reward:</Text>
          </View>
          <Text style={styles.rewardValue}>{ad.reward}</Text>
        </View>
      </View>
      
      <View style={styles.videoContainer}>
        {!watching && !completed ? (
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={startWatchingAd}
          >
            <AntDesign name="playcircleo" size={48} color="#6200ee" />
            <Text style={styles.startButtonText}>
              Watch Ad ({ad.duration}s)
            </Text>
          </TouchableOpacity>
        ) : watching ? (
          <View style={styles.watchingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.timerText}>
              {formatTime(timeRemaining)} remaining
            </Text>
            <Text style={styles.watchingText}>
              Please keep the app open to earn your reward
            </Text>
          </View>
        ) : (
          <View style={styles.completedContainer}>
            <AntDesign name="checkcircleo" size={48} color="#4caf50" />
            <Text style={styles.completedText}>Ad Watched Successfully!</Text>
            <Text style={styles.completedSubtext}>
              You've earned: {ad.reward}
            </Text>
            <TouchableOpacity 
              style={[
                styles.claimButton,
                claimInProgress && styles.claimingButton
              ]}
              onPress={claimReward}
              disabled={claimInProgress}
            >
              <Text style={styles.claimButtonText}>
                {claimInProgress ? 'Claiming...' : 'Claim Reward'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#ff6b6b',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  adImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e0e0e0',
  },
  adDetails: {
    padding: 20,
  },
  adHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  adTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  adDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagBadge: {
    backgroundColor: '#e0cfff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#6200ee',
  },
  rewardContainer: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  videoContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  startButtonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#6200ee',
  },
  watchingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  timerText: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  watchingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  completedText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  completedSubtext: {
    marginTop: 8,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
  claimButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  claimingButton: {
    backgroundColor: '#9c7de3',
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdViewScreen;