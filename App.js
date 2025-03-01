import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator, { LocalAuthProvider } from './navigation/AppNavigator';

export default function App() {
  return (
    <LocalAuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </LocalAuthProvider>
  );
}
