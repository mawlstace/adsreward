import React, { useState, createContext, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import AdViewScreen from '../screens/AdViewScreen';
import RewardsScreen from '../screens/RewardsScreen';

// Create a simple auth context for local development
export const LocalAuthContext = createContext();

export const LocalAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <LocalAuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </LocalAuthContext.Provider>
  );
};

// Hook to use auth context
export const useLocalAuth = () => useContext(LocalAuthContext);

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useLocalAuth();
  
  console.log('AppNavigator rendering, isAuthenticated:', isAuthenticated);
  
  React.useEffect(() => {
    console.log('AppNavigator effect run, isAuthenticated changed to:', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen 
            name="AdView"
            component={AdViewScreen}
            options={{
              headerShown: true,
              presentation: 'modal',
              title: 'Watch Ad'
            }}
          />
          <Stack.Screen 
            name="Rewards"
            component={RewardsScreen}
            options={{
              headerShown: true,
              title: 'My Rewards'
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;