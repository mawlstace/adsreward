import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// All available categories that match with ads
const AVAILABLE_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food',
  'Sports',
  'Entertainment',
  'Education',
];

const ProfileScreen = ({ navigation }) => {
  // User data with dynamic stats
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'March 2025',
    watchedAds: 0,
    rewardsEarned: 0,
    rewardsUsed: 0,
  });

  // State for managing selected interests (categories)
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load user data and interests on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load interests
        const savedInterests = await AsyncStorage.getItem('userInterests');
        if (savedInterests) {
          setSelectedInterests(JSON.parse(savedInterests));
        }

        // Load watched ads count
        const watchedAds = await AsyncStorage.getItem('watchedAdsCount');
        let watchedAdsCount = 0;
        if (watchedAds) {
          watchedAdsCount = parseInt(watchedAds, 10);
        }

        // Load rewards count from actual rewards data
        const savedRewards = await AsyncStorage.getItem('userRewards');
        let earnedCount = 0;
        let usedCount = 0;
        
        if (savedRewards) {
          const rewardsData = JSON.parse(savedRewards);
          earnedCount = rewardsData.length;
          
          // Load used rewards count
          const usedRewards = await AsyncStorage.getItem('usedRewardsCount');
          if (usedRewards) {
            usedCount = parseInt(usedRewards, 10);
          }
        }

        // Update user data with actual stats
        setUserData(prevData => ({
          ...prevData,
          watchedAds: watchedAdsCount,
          rewardsEarned: earnedCount,
          rewardsUsed: usedCount
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Toggle selection of a category and save immediately
  const toggleInterest = async (category) => {
    const newInterests = [...selectedInterests];
    
    if (selectedInterests.includes(category)) {
      // Remove the category
      const index = newInterests.indexOf(category);
      if (index > -1) {
        newInterests.splice(index, 1);
      }
    } else {
      // Add the category
      newInterests.push(category);
    }
    
    // Update state
    setSelectedInterests(newInterests);
    
    // Save immediately
    try {
      await AsyncStorage.setItem('userInterests', JSON.stringify(newInterests));
    } catch (error) {
      console.error('Error saving interest toggle:', error);
    }
  };

  // Save interests to AsyncStorage with visual feedback
  const saveInterests = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('userInterests', JSON.stringify(selectedInterests));
      
      // Show success state
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving interests:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Sample activity data - in a real app, this would come from a database or API
  const activityData = [
    { id: '1', action: 'Watched ad', item: 'Nike Running Shoes', date: '1 day ago' },
    { id: '2', action: 'Claimed reward', item: 'Starbucks - Buy 1 Get 1 Free', date: '1 day ago' },
    { id: '3', action: 'Used reward', item: 'Sony - $10 OFF', date: '3 days ago' },
    { id: '4', action: 'Watched ad', item: 'Spotify Premium Subscription', date: '5 days ago' },
    { id: '5', action: 'Claimed reward', item: 'Spotify - 1 Month Free', date: '5 days ago' },
  ];

  const renderActivityItem = ({ id, action, item, date }) => (
    <View key={id} style={styles.activityItem}>
      <View style={styles.activityDot} />
      <View style={styles.activityContent}>
        <Text style={styles.activityAction}>{action}</Text>
        <Text style={styles.activityItemText}>{item}</Text>
        <Text style={styles.activityDate}>{date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userData.name.charAt(0)}</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          <Text style={styles.joinDate}>Member since {userData.joinDate}</Text>
        </View>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.watchedAds}</Text>
            <Text style={styles.statLabel}>Ads Watched</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.rewardsEarned}</Text>
            <Text style={styles.statLabel}>Rewards Earned</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userData.rewardsUsed}</Text>
            <Text style={styles.statLabel}>Rewards Used</Text>
          </View>
        </View>
        
        {/* Interests Section */}
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>My Interests</Text>
          <Text style={styles.interestsSubtitle}>Select categories of ads you're interested in</Text>
          
          {AVAILABLE_CATEGORIES.map(category => (
            <View key={category} style={styles.interestItem}>
              <Text style={styles.interestLabel}>{category}</Text>
              <Switch
                value={selectedInterests.includes(category)}
                onValueChange={() => toggleInterest(category)}
                trackColor={{ false: '#d1d1d1', true: '#a992e0' }}
                thumbColor={selectedInterests.includes(category) ? '#6200ee' : '#f4f3f4'}
              />
            </View>
          ))}
          
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              isSaving && styles.savingButton,
              saveSuccess && styles.successButton
            ]}
            onPress={saveInterests}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save All Interests'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityList}>
            {activityData.map(item => renderActivityItem(item))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  interestsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  interestsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  interestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  interestLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  savingButton: {
    backgroundColor: '#a992e0',
  },
  successButton: {
    backgroundColor: '#4caf50',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activitySection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  activityList: {
    marginLeft: 8,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6200ee',
    marginTop: 5,
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activityItemText: {
    fontSize: 14,
    color: '#666',
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default ProfileScreen;