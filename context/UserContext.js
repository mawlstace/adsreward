import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userInterests, setUserInterests] = useState([]);
  const [filterByInterests, setFilterByInterests] = useState(true); // Default to filter by interests
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data and preferences on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Load user interests
        const savedInterests = await AsyncStorage.getItem('userInterests');
        if (savedInterests) {
          setUserInterests(JSON.parse(savedInterests));
          console.log("UserContext: Loaded interests:", JSON.parse(savedInterests));
        }
        
        // Load watched ads count
        const watchedAds = await AsyncStorage.getItem('watchedAdsCount');
        let watchedAdsCount = 0;
        if (watchedAds) {
          watchedAdsCount = parseInt(watchedAds, 10);
        }
        
        // Load rewards data
        const savedRewards = await AsyncStorage.getItem('userRewards');
        let earnedCount = 0;
        if (savedRewards) {
          const rewardsData = JSON.parse(savedRewards);
          earnedCount = rewardsData.length;
        }
        
        // Load used rewards count
        const usedRewards = await AsyncStorage.getItem('usedRewardsCount');
        let usedCount = 0;
        if (usedRewards) {
          usedCount = parseInt(usedRewards, 10);
        }
        
        // Create user data object
        const data = {
          name: 'John Doe',
          email: 'john.doe@example.com',
          joinDate: 'March 2025',
          watchedAds: watchedAdsCount,
          rewardsEarned: earnedCount,
          rewardsUsed: usedCount,
        };
        
        setUserData(data);
      } catch (error) {
        console.error('Error loading user data in context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Update user data (like incrementing watched ads)
  const updateUserData = (newData) => {
    console.log("UserContext: Updating user data:", newData);
    setUserData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      console.log("UserContext: Updated user data:", updated);
      return updated;
    });
  };

  // Update user interests
  const updateUserInterests = (interests) => {
    console.log("UserContext: Setting interests to:", interests);
    setUserInterests(interests);
  };

  // Toggle interest filtering
  const toggleInterestFiltering = () => {
    setFilterByInterests(prev => !prev);
  };

  // Value to be provided to consumers
  const value = {
    userInterests,
    updateUserInterests,
    filterByInterests,
    setFilterByInterests, 
    toggleInterestFiltering,
    userData,
    updateUserData,
    isLoading
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};