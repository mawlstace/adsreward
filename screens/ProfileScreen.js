import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';

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
  // Get user data from context
  const { userData, isLoading, userInterests, updateUserInterests } = useUser();
  
  // State for managing selected interests (categories)
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved interests when component mounts
  useEffect(() => {
    setSelectedInterests(userInterests);
  }, [userInterests]);

  // Toggle selection of a category
  const toggleInterest = (category) => {
    setSelectedInterests(prev => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Save interests to context
  const saveInterests = () => {
    setIsSaving(true);
    
    // Update the context with new interests
    updateUserInterests(selectedInterests);
    
    // Simulate a save delay for UX feedback
    setTimeout(() => {
      setIsSaving(false);
      // No alert, just visual feedback via button change
    }, 500);
  };

  // Sample activity data - in real app, fetch from API
  const activityData = [
    { id: '1', action: 'Watched ad', item: 'Nike Running Shoes', date: '1 day ago' },
    { id: '2', action: 'Claimed reward', item: 'Starbucks - Buy 1 Get 1 Free', date: '1 day ago' },
    { id: '3', action: 'Used reward', item: 'Sony - $10 OFF', date: '3 days ago' },
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

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
            style={[styles.saveButton, isSaving && styles.savingButton]}
            onPress={saveInterests}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Interests'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          {activityData.length > 0 ? (
            <View style={styles.activityList}>
              {activityData.map(item => renderActivityItem(item))}
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>No activity yet</Text>
            </View>
          )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  emptyActivity: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  }
});

export default ProfileScreen;