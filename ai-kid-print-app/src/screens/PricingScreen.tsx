import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BrutalButton, BrutalCard } from '../components/brutal';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../theme';

const PricingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleSubscribe = () => {
    Alert.alert(
      '订阅 Pro',
      '即将跳转到 Google Play 完成订阅',
      [
        { text: '取消', style: 'cancel' },
        { text: '继续', onPress: () => console.log('Subscribe') },
      ]
    );
  };

  const features = [
    { icon: '📥', text: '无限下载 PDF' },
    { icon: '🎨', text: '所有主题解锁' },
    { icon: '📄', text: '高清打印质量' },
    { icon: '☁️', text: '云端同步' },
    { icon: '🔔', text: '新内容通知' },
    { icon: '💬', text: '优先客服支持' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>升级到 Pro ⭐</Text>
          <Text style={styles.subtitle}>
            解锁全部功能，让学习更有趣
          </Text>
        </View>

        {/* 功能列表 */}
        <BrutalCard color={colors.white} style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>Pro 会员权益</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </BrutalCard>

        {/* 价格卡片 */}
        <BrutalCard color={colors.duckYellow} style={styles.priceCard}>
          <Text style={styles.priceLabel}>月度订阅</Text>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>¥</Text>
            <Text style={styles.price}>18</Text>
            <Text style={styles.period}>/月</Text>
          </View>
          <Text style={styles.priceNote}>随时取消，无隐藏费用</Text>
        </BrutalCard>

        {/* 订阅按钮 */}
        <BrutalButton
          title="立即订阅"
          onPress={handleSubscribe}
          color={colors.duckGreen}
          size="large"
          style={styles.subscribeButton}
        />

        {/* 返回按钮 */}
        <BrutalButton
          title="稍后再说"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.laterButton}
        />

        {/* 说明文字 */}
        <Text style={styles.disclaimer}>
          订阅将通过 Google Play 处理。订阅会自动续费，
          可随时在 Google Play 设置中取消。
        </Text>
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray600,
    textAlign: 'center',
  },
  featuresCard: {
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.black,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  featureText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray700,
  },
  priceCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
  },
  priceLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currency: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.black,
    marginBottom: 4,
  },
  price: {
    fontFamily: fontFamily.bold,
    fontSize: 48,
    color: colors.black,
  },
  period: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.gray600,
    marginBottom: 8,
  },
  priceNote: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  subscribeButton: {
    marginBottom: spacing.md,
  },
  laterButton: {
    marginBottom: spacing.lg,
  },
  disclaimer: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PricingScreen;
