import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import HomeScreen from './src/screens/HomeScreen';
import ContentScreen from './src/screens/ContentScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors, fonts } from './src/theme';
import { loadConfig } from './src/api';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();

// Simple text-based icons to avoid vector icon dependency issues
function TabIcon({ label, focused }) {
  const icons = {
    Home: '\u2764\uFE0F',
    Content: '\uD83D\uDCDD',
    History: '\uD83D\uDCEC',
    Settings: '\u2699\uFE0F',
  };
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '\u2022'}
    </Text>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Load saved config
    loadConfig().then(() => setReady(true));

    // Register for push notifications
    registerForNotifications();

    // Notification listeners
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.pink} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: colors.pink,
              elevation: 0,
              shadowOpacity: 0,
            },
            headerTintColor: colors.white,
            headerTitleStyle: { ...fonts.bold, fontSize: 18 },
            tabBarStyle: {
              backgroundColor: colors.white,
              borderTopColor: colors.gray100,
              height: 60,
              paddingBottom: 8,
              paddingTop: 4,
            },
            tabBarActiveTintColor: colors.pink,
            tabBarInactiveTintColor: colors.gray400,
            tabBarLabelStyle: { fontSize: 11, ...fonts.medium },
            tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Love Notes' }}
          />
          <Tab.Screen
            name="Content"
            component={ContentScreen}
            options={{ title: 'Content' }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{ title: 'History' }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

async function registerForNotifications() {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Love Notes',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#be185d',
    });
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pinkBg,
  },
});
