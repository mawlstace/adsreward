import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';

// Import your tab screens
import HomeScreen from '../screens/HomeScreen';
import RewardsScreen from '../screens/RewardsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { userInterests } = useUser();
  const [visibleTabs, setVisibleTabs] = useState(['Home', 'RewardsTab', 'Profile']);

  // Load user preferences to determine which tabs to show
  useEffect(() => {
    const loadTabPreferences = async () => {
      try {
        // In a real app, you might load tab preferences from user settings
        // For now, we'll show all tabs by default but you can customize this
        // based on userInterests or other factors
        setVisibleTabs(['Home', 'RewardsTab', 'Profile']);
      } catch (error) {
        console.error('Error loading tab preferences:', error);
      }
    };

    loadTabPreferences();
  }, [userInterests]);

  // Check if a tab should be visible
  const isTabVisible = (tabName) => {
    return visibleTabs.includes(tabName);
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'RewardsTab') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        // Make sure screens are always unmounted when switching tabs
        // This ensures the screens will refresh their data when navigated to
        unmountOnBlur: true,
      })}
    >
      {isTabVisible('Home') && (
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            title: 'Ad Rewards'
          }}
        />
      )}
      
      {isTabVisible('RewardsTab') && (
        <Tab.Screen 
          name="RewardsTab" 
          component={RewardsScreen}
          options={{
            title: 'My Rewards'
          }}
          listeners={({ navigation, route }) => ({
            tabPress: e => {
              // Force refresh when tab is pressed directly
              navigation.setParams({ refresh: Date.now() });
            },
          })}
        />
      )}
      
      {isTabVisible('Profile') && (
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
      )}
    </Tab.Navigator>
  );
};

export default TabNavigator;