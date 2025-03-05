import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample data - will be replaced with API data later
const AD_DETAILS = {
  '1': { 
    id: '1', 
    title: 'Nike Running Shoes', 
    company: 'Nike', 
    description: 'Discover our latest running shoes designed for maximum comfort and performance.',
    duration: 30, // in seconds
    reward: '15% OFF',
    promoCode: 'NIKE15RUN'
  },
  '2': { 
    id: '2', 
    title: 'New Coffee Blend', 
    company: 'Starbucks', 
    description: 'Try our new seasonal coffee blend with notes of chocolate and caramel.',
    duration: 15, 
    reward: 'Buy 1 Get 1 Free',
    promoCode: 'SBUX2FOR1'
  },
  '3': { 
    id: '3', 
    title: 'Wireless Headphones', 
    company: 'Sony', 
    description: 'Try our new Wireless Headphones.',
    duration: 15, 
    reward: 'Buy 1 Get 1 Free',
    promoCode: 'Sony1FOR1'
  }
};

const AdViewScreen = ({ route, navigation }) => {
  const { adId } = route.params;
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watching, setWatching] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [claimInProgress, setClaimInProgress] = useState(false);

  // Simulate fetching ad details
  useEffect(() => {
    const fetchAdDetails = () => {
      // Simulate API call delay
      setTimeout(() => {
        // Check if adId exists and corresponds to a valid ad
        if (adId && AD_DETAILS[adId]) {
          setAd(AD_DETAILS[adId]);
        } else {
          // Handle invalid adId
          console.error('Invalid adId:', adId);
        }
        setLoading(false);
      }, 500);
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

  // Increment watched ads count in AsyncStorage
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
    } catch (error) {
      console.error('Error updating watched ads count:', error);
    }
  };

  const startWatchingAd = () => {
    if (ad) {
      // Use the full duration without any multiplier
      setTimeRemaining(ad.duration);
      setWatching(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Claim the reward and navigate to rewards screen
  const claimReward = async () => {
    if (!ad || claimInProgress) return;
    
    setClaimInProgress(true);
    
    try {
      // Create reward with all necessary data
      const newReward = {
        id: ad.id,
        company: ad.company,
        reward: ad.reward,
        promoCode: ad.promoCode,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };
      
      console.log("Claiming reward:", newReward);
      
      // Navigate to the Rewards screen with the new reward
      setTimeout(() => {
        navigation.navigate('Rewards', { newReward });
        setClaimInProgress(false);
      }, 300); // Reduced delay for faster response
    } catch (error) {
      console.error('Error claiming reward:', error);
      setClaimInProgress(false);
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
    <View style={styles.container}>
      <View style={styles.adDetails}>
        <Text style={styles.companyName}>{ad.company}</Text>
        <Text style={styles.adTitle}>{ad.title}</Text>
        <Text style={styles.adDescription}>{ad.description}</Text>
        
        <View style={styles.rewardContainer}>
          <Text style={styles.rewardLabel}>Reward:</Text>
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
    </View>
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
  adDetails: {
    padding: 20,
  },
  companyName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
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
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 8,
  },
  rewardLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  startButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#6200ee',
  },
  watchingContainer: {
    alignItems: 'center',
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