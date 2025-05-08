import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialCommunityIcons, FontAwesome, Octicons} from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="Perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Octicons name="person-fill" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Calibracion"
        options={{
          title: 'Calibración',
          tabBarIcon: ({ color }) => <FontAwesome name="camera" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Principal"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Deteccion"
        options={{
          title: 'Detección',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="face-recognition" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="Historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="file-chart-outline" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="ModoPadres"
        options={{
          title: 'ModoPadres',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="shield-account" size={24} color={color}/>,
        }}
        />
    </Tabs>
  );
}
