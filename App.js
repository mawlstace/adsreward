import React, { useEffect } from 'react';
import { StatusBar, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  // Clear all app cache on startup
  useEffect(() => {
    const clearAppCache = async () => {
      try {
        console.log('Clearing app cache...');
        
        // List of all keys to clear
        const keysToRemove = [
          'userRewards',       // Clear rewards
          'viewedAds',         // Clear ad view history
          'recentlyViewed',    // Clear recently viewed ads
          'usedRewardsCount',  // Reset used rewards counter
          'watchedAdsCount'    // Reset watched ads counter
          // Don't clear userInterests to preserve user preferences
        ];
        
        // Clear all specified keys
        await Promise.all(keysToRemove.map(key => AsyncStorage.removeItem(key)));
        
        console.log('App cache cleared successfully');
        
        // Optional: Alert user that cache was cleared (remove in production)
        // Alert.alert('Cache Cleared', 'App data has been reset successfully.');
      } catch (error) {
        console.error('Error clearing app cache:', error);
      }
    };
    
    // Run the cache clearing function
    clearAppCache();
  }, []);

  return (
    <AuthProvider>
      <UserProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    </AuthProvider>
  );
}