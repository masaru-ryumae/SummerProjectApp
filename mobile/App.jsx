import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { AppProvider } from './context/AppProvider';
import HomeScreen from './screens/HomeScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import ProgressScreen from './screens/ProgressScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import { initializeNotifications } from './utils/notifications';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Home Stack Navigator
 * Handles home screen and project details with stack navigation
 */
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8f9fa',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#e9ecef'
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 16
        },
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Discover Projects' }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: 'Project Details' }}
      />
    </Stack.Navigator>
  );
};

/**
 * Bottom Tab Navigator
 * Main navigation with 4 tabs: Home, Progress, Profile, Settings
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e9ecef',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4
        },
        tabBarActiveTintColor: '#2d6a4f',
        tabBarInactiveTintColor: '#999'
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="trending-up" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App Component
 * Initializes notifications, context, and sets up root navigation
 */
const App = () => {
  const [appReady, setAppReady] = React.useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize notifications
        await initializeNotifications();

        // Simulate loading delay for splash screen effect
        await new Promise(resolve => setTimeout(resolve, 500));

        setAppReady(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initialize();
  }, []);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
};

export default App;
