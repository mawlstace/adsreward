import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalAuth } from '../navigation/AppNavigator';

const ProfileScreen = () => {
  const { setIsAuthenticated } = useLocalAuth();
  
  // This would normally be loaded from a user account
  const [userProfile, setUserProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    interests: ['Electronics', 'Fashion', 'Sports', 'Entertainment'],
    notifications: true,
    emailUpdates: false,
  });

  const [editMode, setEditMode] = useState(false);

  const toggleInterest = (interest) => {
    if (editMode) {
      setUserProfile(prevProfile => {
        if (prevProfile.interests.includes(interest)) {
          return {
            ...prevProfile,
            interests: prevProfile.interests.filter(item => item !== interest)
          };
        } else {
          return {
            ...prevProfile,
            interests: [...prevProfile.interests, interest]
          };
        }
      });
    }
  };

  const toggleNotifications = () => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      notifications: !prevProfile.notifications
    }));
  };

  const toggleEmailUpdates = () => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      emailUpdates: !prevProfile.emailUpdates
    }));
  };

  const handleSaveProfile = () => {
    // Would normally save to backend here
    setEditMode(false);
    Alert.alert(
      'Profile Updated',
      'Your profile has been successfully updated.'
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            // Sign out using the local auth context
            setIsAuthenticated(false);
            console.log('User signed out');
          }
        }
      ]
    );
  };

  // Available interest categories
  const allInterests = [
    'Electronics', 'Fashion', 'Food', 'Sports', 
    'Entertainment', 'Travel', 'Education', 'Health'
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userEmail}>{userProfile.email}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditMode(!editMode)}
        >
          <Text style={styles.editButtonText}>
            {editMode ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Interests</Text>
        <Text style={styles.sectionSubtitle}>
          Receive ads and offers based on your interests
        </Text>
        
        <View style={styles.interestsContainer}>
          {allInterests.map(interest => (
            <TouchableOpacity
              key={interest}
              style={[
                styles.interestBadge,
                userProfile.interests.includes(interest) && styles.selectedInterest,
                editMode && styles.editableInterest,
              ]}
              onPress={() => toggleInterest(interest)}
              disabled={!editMode}
            >
              <Text
                style={[
                  styles.interestText,
                  userProfile.interests.includes(interest) && styles.selectedInterestText,
                ]}
              >
                {interest}
              </Text>
              {editMode && userProfile.interests.includes(interest) && (
                <Ionicons name="close-circle" size={16} color="#fff" style={styles.removeIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Push Notifications</Text>
            <Text style={styles.preferenceDescription}>
              Receive notifications about new ads and rewards
            </Text>
          </View>
          <Switch
            value={userProfile.notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#d1d1d1', true: '#bbb5f6' }}
            thumbColor={userProfile.notifications ? '#6200ee' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.preferenceItem}>
          <View>
            <Text style={styles.preferenceTitle}>Email Updates</Text>
            <Text style={styles.preferenceDescription}>
              Receive weekly emails about new offers
            </Text>
          </View>
          <Switch
            value={userProfile.emailUpdates}
            onValueChange={toggleEmailUpdates}
            trackColor={{ false: '#d1d1d1', true: '#bbb5f6' }}
            thumbColor={userProfile.emailUpdates ? '#6200ee' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.accountItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#6200ee" />
          <Text style={styles.accountItemText}>Privacy Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.accountItem}>
          <Ionicons name="help-circle-outline" size={24} color="#6200ee" />
          <Text style={styles.accountItemText}>Help & Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.accountItem}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={[styles.accountItemText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {editMode && (
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveProfile}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  editButtonText: {
    color: '#6200ee',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedInterest: {
    backgroundColor: '#6200ee',
  },
  editableInterest: {
    borderWidth: 1,
    borderColor: '#d1d1d1',
  },
  interestText: {
    color: '#666',
    fontWeight: '500',
  },
  selectedInterestText: {
    color: '#fff',
  },
  removeIcon: {
    marginLeft: 4,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  signOutText: {
    color: '#f44336',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    color: '#999',
    fontSize: 12,
  },
});

export default ProfileScreen;