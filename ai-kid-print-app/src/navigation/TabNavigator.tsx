import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, View } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '../theme';

// 导入实际屏幕
import HomeScreen from '../screens/HomeScreen';
import WeeklyPackScreen from '../screens/WeeklyPackScreen';
import CustomPackScreen from '../screens/CustomPackScreen';
import DashboardScreen from '../screens/DashboardScreen';

export type TabParamList = {
  Home: undefined;
  WeeklyPack: undefined;
  CustomPack: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// Tab 图标组件
const TabIcon: React.FC<{ emoji: string; focused: boolean }> = ({ emoji, focused }) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={styles.iconEmoji}>{emoji}</Text>
  </View>
);

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.gray500,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="WeeklyPack"
        component={WeeklyPackScreen}
        options={{
          tabBarLabel: '每周练习',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CustomPack"
        component={CustomPackScreen}
        options={{
          tabBarLabel: '自定义',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✏️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DashboardScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 3,
    borderTopColor: colors.black,
    height: 70,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  tabBarLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerFocused: {
    backgroundColor: colors.duckYellow,
    borderWidth: 2,
    borderColor: colors.black,
  },
  iconEmoji: {
    fontSize: 20,
  },
});

export default TabNavigator;
