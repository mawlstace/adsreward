import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import AuthNavigator from './AuthNavigator';
import AdViewScreen from '../screens/AdViewScreen';
import RewardsScreen from '../screens/RewardsScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  
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