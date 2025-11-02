import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface NavigationProps {
  navigate: (screen: string) => void;
}

interface LoginScreenProps {
  navigation: NavigationProps;
}

export default function LoginScreen({ navigation }: LoginScreenProps): JSX.Element {
  return (
    <SafeAreaView style={styles.container} testID="login-screen">
      <LinearGradient
        colors={['#FDC83C', '#F59E0B', '#D97706']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Image 
            source={require('../../assets/logo.jpg')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.title}>VibrantKnots Admin</Text>
          <Text style={styles.tagline}>manage your listings</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.loginButton}
              testID="login-button"
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 100,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  loginText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
    alignItems: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
