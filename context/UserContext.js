import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userInterests, setUserInterests] = useState([]);
  const [filterByInterests, setFilterByInterests] = useState(true); // Default to filter by interests
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated API response
      const data = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: 'March 2025',
        watchedAds: 0,
        rewardsEarned: 0,
        rewardsUsed: 0,
      };
      
      setUserData(data);
      setIsLoading(false);
    };
    
    fetchUserData();
  }, []);

  // Update user data (like incrementing watched ads)
  const updateUserData = (newData) => {
    setUserData(prev => ({
      ...prev,
      ...newData
    }));
  };

  // Update user interests
  const updateUserInterests = (interests) => {
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