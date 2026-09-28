import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, borders } from '../../src/theme';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 3,
          borderTopColor: colors.black,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attend',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <Ionicons name={focused ? 'scan' : 'scan-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconBg : undefined}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconBg: {
    backgroundColor: colors.yellow + '30',
    padding: 6,
    borderRadius: 4,
    ...borders.thin,
  },
});
