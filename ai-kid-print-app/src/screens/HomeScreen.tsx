import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BrutalCard } from '../components/brutal';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../theme';
import { useAuthStore } from '../stores/authStore';
import { TabParamList } from '../navigation/TabNavigator';

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();

  // 模拟下载历史数据
  const recentDownloads = [
    { id: '1', name: 'Week 25 Pack', theme: 'dinosaur', date: '2024-01-15' },
    { id: '2', name: 'Custom Math Pack', theme: 'space', date: '2024-01-14' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 欢迎区域 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            你好，{user?.displayName || '小朋友'} 👋
          </Text>
          <Text style={styles.subtitle}>今天想做什么练习呢？</Text>
        </View>

        {/* 快捷操作卡片 */}
        <View style={styles.quickActions}>
          <BrutalCard
            color={colors.duckYellow}
            onPress={() => navigation.navigate('WeeklyPack')}
            style={styles.actionCard}>
            <Text style={styles.cardEmoji}>📅</Text>
            <Text style={styles.cardTitle}>每周练习</Text>
            <Text style={styles.cardDescription}>
              自动生成本周个性化练习册
            </Text>
          </BrutalCard>

          <BrutalCard
            color={colors.duckBlue}
            onPress={() => navigation.navigate('CustomPack')}
            style={styles.actionCard}>
            <Text style={styles.cardEmoji}>✏️</Text>
            <Text style={styles.cardTitle}>自定义练习</Text>
            <Text style={styles.cardDescription}>
              选择你想要的练习类型
            </Text>
          </BrutalCard>
        </View>

        {/* 最近下载 */}
        {user && recentDownloads.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>最近下载</Text>
            {recentDownloads.map((item) => (
              <BrutalCard
                key={item.id}
                color={colors.white}
                style={styles.historyCard}
                shadowSize="small">
                <View style={styles.historyContent}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{item.name}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <View style={styles.historyTheme}>
                    <Text style={styles.themeEmoji}>
                      {item.theme === 'dinosaur' ? '🦕' : '🚀'}
                    </Text>
                  </View>
                </View>
              </BrutalCard>
            ))}
          </View>
        )}

        {/* 提示区域 */}
        <BrutalCard color={colors.duckPink} style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 小提示</Text>
          <Text style={styles.tipText}>
            每周练习会根据孩子的年龄自动调整难度，让学习更有趣！
          </Text>
        </BrutalCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray600,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray700,
    textAlign: 'center',
  },
  recentSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.black,
    marginBottom: spacing.md,
  },
  historyCard: {
    marginBottom: spacing.sm,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
  },
  historyDate: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray500,
  },
  historyTheme: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.black,
  },
  themeEmoji: {
    fontSize: 20,
  },
  tipCard: {
    marginBottom: spacing.lg,
  },
  tipTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
});

export default HomeScreen;
