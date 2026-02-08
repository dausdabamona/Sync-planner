import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Colors } from './src/theme/theme';

// Screen imports
import HomeScreen from './src/screens/HomeScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import TargetScreen from './src/screens/TargetScreen';
import IbadahScreen from './src/screens/IbadahScreen';
import MenuScreen from './src/screens/MenuScreen';

// Sub-screens (accessible from navigation)
import PomodoroScreen from './src/screens/PomodoroScreen';
import JournalScreen from './src/screens/JournalScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import TasksScreen from './src/screens/TasksScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import WisdomScreen from './src/screens/WisdomScreen';
import BrainDumpScreen from './src/screens/BrainDumpScreen';
import VisionScreen from './src/screens/VisionScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>;
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{
      fontSize: 10,
      fontWeight: focused ? '700' : '500',
      color: focused ? Colors.primary : Colors.textLight,
      marginTop: -2,
    }}>
      {label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.divider,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="PlannerTab"
        component={PlannerScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Planner" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TargetTab"
        component={TargetScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🎯" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Target" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="IbadahTab"
        component={IbadahScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🕌" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Ibadah" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="☰" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Menu" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Pomodoro" component={PomodoroScreen} options={{ title: 'Pomodoro Timer' }} />
        <Stack.Screen name="Journal" component={JournalScreen} options={{ title: 'Jurnal Harian' }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Review' }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
        <Stack.Screen name="Habits" component={HabitsScreen} options={{ title: 'Kebiasaan Sunnah' }} />
        <Stack.Screen name="Wisdom" component={WisdomScreen} options={{ title: 'Wisdom' }} />
        <Stack.Screen name="BrainDump" component={BrainDumpScreen} options={{ title: 'Brain Dump' }} />
        <Stack.Screen name="Vision" component={VisionScreen} options={{ title: 'Visi Hidup' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Pengaturan' }} />
        <Stack.Screen name="Ibadah" component={IbadahScreen} options={{ title: 'Ibadah' }} />
        <Stack.Screen name="Planner" component={PlannerScreen} options={{ title: 'Planner' }} />
        <Stack.Screen name="Target" component={TargetScreen} options={{ title: 'Target Center' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
