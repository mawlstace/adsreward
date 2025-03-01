import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalAuth } from '../navigation/AppNavigator';

const AuthScreen = () => {
  const { setIsAuthenticated } = useLocalAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAuth = () => {
    console.log('Sign in button pressed');
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // if (!isLogin) {
    //   // Additional sign-up validation
    //   if (!name.trim()) {
    //     Alert.alert('Error', 'Please enter your name');
    //     return;
    //   }
      
    //   if (password !== confirmPassword) {
    //     Alert.alert('Error', 'Passwords do not match');
    //     return;
    //   }
    // }
    
    // For MVP, we'll just authenticate locally
    console.log('Setting authenticated to true');
    setIsAuthenticated(true);
    console.log('Authentication set to true, value:', true);
    // Alert.alert(
    //   'Success',
    //   isLogin ? 'Logged in successfully!' : 'Account created successfully!',
    //   [
    //     {
    //       text: 'OK',
    //       onPress: () => {
    //         // Set authenticated state to true
    //         setIsAuthenticated(true);
    //         console.log('Local authentication successful');
    //       }
    //     }
    //   ]
    // );
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' }]}>
            <Text>LOGO</Text>
          </View>
          <Text style={styles.appName}>AdRewards</Text>
          <Text style={styles.tagline}>Watch ads. Earn rewards. Save money.</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.headerText}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
          )}
          
          {isLogin && (
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.authButton}
            onPress={handleAuth}
          >
            <Text style={styles.authButtonText}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleAuthMode}>
              <Text style={styles.switchActionText}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6200ee',
    fontSize: 14,
  },
  authButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  switchText: {
    color: '#666',
    fontSize: 14,
  },
  switchActionText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AuthScreen;
