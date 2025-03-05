import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalAuth } from '../App';

const Stack = createNativeStackNavigator();

// Simple login screen for demo purposes
const LoginScreen = () => {
  const { setIsAuthenticated } = useLocalAuth();

  const handleLogin = () => {
    // In a real app, you would validate credentials here
    setIsAuthenticated(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Ad Rewards</Text>
      <Text style={styles.subtitle}>Watch ads, earn rewards</Text>
      
      <TouchableOpacity 
        style={styles.loginButton}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Sign In</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      {/* Add other auth screens like Register, ForgotPassword, etc. */}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6200ee',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#6200ee',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  registerButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AuthNavigator;