import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BrutalButton, BrutalCard } from '../components/brutal';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../theme';
import { useAuthStore } from '../stores/authStore';

// 模拟下载历史数据
const mockHistory = [
  { id: '1', name: 'Week 25 Pack', theme: 'dinosaur', pages: 23, date: '2024-01-15' },
  { id: '2', name: 'Custom Math Pack', theme: 'space', pages: 15, date: '2024-01-14' },
  { id: '3', name: 'Week 24 Pack', theme: 'unicorn', pages: 20, date: '2024-01-08' },
];

// 模拟统计数据
const mockStats = {
  totalDownloads: 12,
  weeklyDownloads: 3,
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const isPro = user?.plan === 'Pro';

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => logout() },
      ]
    );
  };

  const handleUpgrade = () => {
    navigation.navigate('Pricing' as never);
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const handleHistoryItem = (item: typeof mockHistory[0]) => {
    Alert.alert('查看练习册', `打开 ${item.name}`);
    // TODO: 导航到预览页面
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 用户信息 */}
        <BrutalCard color={colors.white} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.[0] || user?.email?.[0] || '👤'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.displayName || '用户'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          
          {/* 订阅状态 */}
          <View style={[styles.planBadge, isPro ? styles.proBadge : styles.freeBadge]}>
            <Text style={styles.planText}>
              {isPro ? '⭐ Pro 会员' : '免费版'}
            </Text>
          </View>
          
          {!isPro && (
            <BrutalButton
              title="升级到 Pro"
              onPress={handleUpgrade}
              color={colors.duckOrange}
              style={styles.upgradeButton}
            />
          )}
        </BrutalCard>

        {/* 统计数据 */}
        <View style={styles.statsRow}>
          <BrutalCard color={colors.duckYellow} style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.totalDownloads}</Text>
            <Text style={styles.statLabel}>总下载</Text>
          </BrutalCard>
          <BrutalCard color={colors.duckBlue} style={styles.statCard}>
            <Text style={styles.statNumber}>{mockStats.weeklyDownloads}</Text>
            <Text style={styles.statLabel}>本周下载</Text>
          </BrutalCard>
        </View>

        {/* 下载历史 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>下载历史</Text>
          {mockHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleHistoryItem(item)}
              activeOpacity={0.8}>
              <BrutalCard color={colors.white} style={styles.historyCard} shadowSize="small">
                <View style={styles.historyContent}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>{item.name}</Text>
                    <Text style={styles.historyMeta}>
                      {item.pages} 页 · {item.date}
                    </Text>
                  </View>
                  <View style={styles.historyTheme}>
                    <Text style={styles.themeEmoji}>
                      {item.theme === 'dinosaur' ? '🦕' : 
                       item.theme === 'space' ? '🚀' : '🦄'}
                    </Text>
                  </View>
                </View>
              </BrutalCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* 设置按钮 */}
        <View style={styles.actions}>
          <BrutalButton
            title="打印设置"
            onPress={handleSettings}
            variant="outline"
            style={styles.actionButton}
          />
          <BrutalButton
            title="退出登录"
            onPress={handleLogout}
            color={colors.gray200}
            style={styles.actionButton}
          />
        </View>
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
  profileCard: {
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.duckPink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.black,
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 28,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  userEmail: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray600,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.black,
    marginBottom: spacing.md,
  },
  proBadge: {
    backgroundColor: colors.duckYellow,
  },
  freeBadge: {
    backgroundColor: colors.gray200,
  },
  planText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.black,
  },
  upgradeButton: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.black,
  },
  statLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  section: {
    marginBottom: spacing.lg,
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
  historyMeta: {
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
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    marginBottom: spacing.xs,
  },
});

export default DashboardScreen;
