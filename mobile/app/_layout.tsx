import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/hooks/useAuth';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={colors.white} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.white },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="attendance/[classId]" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.yellow },
            headerTintColor: colors.black,
            headerTitleStyle: { fontWeight: '900', textTransform: 'uppercase' },
          }} 
        />
        <Stack.Screen 
          name="registration/students" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.yellow },
            headerTintColor: colors.black,
            headerTitleStyle: { fontWeight: '900', textTransform: 'uppercase' },
            title: 'REGISTER STUDENTS',
          }} 
        />
        <Stack.Screen 
          name="registration/teachers" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.yellow },
            headerTintColor: colors.black,
            headerTitleStyle: { fontWeight: '900', textTransform: 'uppercase' },
            title: 'REGISTER TEACHERS',
          }} 
        />
        <Stack.Screen 
          name="meal-verification" 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.yellow },
            headerTintColor: colors.black,
            headerTitleStyle: { fontWeight: '900', textTransform: 'uppercase' },
            title: 'MEAL VERIFICATION',
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
