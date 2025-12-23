import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BrutalButton, BrutalCard } from '../components/brutal';
import PageGrid from '../components/pack/PageGrid';
import { colors, spacing, fontFamily, fontSize } from '../theme';
import { usePackStore } from '../stores/packStore';
import { useAuthStore } from '../stores/authStore';

type PreviewRouteParams = {
  Preview: {
    packType: 'weekly' | 'custom';
  };
};

const PreviewScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PreviewRouteParams, 'Preview'>>();
  const packType = route.params?.packType || 'weekly';

  const { generatedPages, childName, theme, weekNumber, totalPages } = usePackStore();
  const { user } = useAuthStore();

  const isPro = user?.plan === 'Pro';
  const pageCount = generatedPages.length;

  const handleDownload = () => {
    if (!isPro) {
      // 跳转到升级页面
      Alert.alert(
        '升级到 Pro',
        '下载 PDF 需要 Pro 订阅。立即升级享受无限下载！',
        [
          { text: '取消', style: 'cancel' },
          { text: '查看方案', onPress: () => navigation.navigate('Pricing' as never) },
        ]
      );
      return;
    }

    // Pro 用户下载
    Alert.alert('下载中', '正在生成 PDF，请稍候...');
    // TODO: 实现实际的 PDF 下载逻辑
  };

  const handleRegenerate = () => {
    Alert.alert(
      '重新生成',
      '确定要重新生成练习册吗？当前内容将被替换。',
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部信息 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>
            {packType === 'weekly' ? `第 ${weekNumber} 周练习` : '自定义练习'}
          </Text>
          <Text style={styles.subtitle}>
            {childName ? `${childName} 的练习册` : '练习册预览'} · {pageCount} 页
          </Text>
        </View>
        <BrutalCard color={colors.duckYellow} style={styles.themeTag}>
          <Text style={styles.themeText}>{theme}</Text>
        </BrutalCard>
      </View>

      {/* 页面网格 */}
      <View style={styles.gridContainer}>
        {generatedPages.length > 0 ? (
          <PageGrid pages={generatedPages} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>暂无页面</Text>
          </View>
        )}
      </View>

      {/* 底部操作栏 */}
      <View style={styles.footer}>
        <BrutalButton
          title="重新生成"
          onPress={handleRegenerate}
          variant="outline"
          style={styles.footerButton}
        />
        <BrutalButton
          title={isPro ? '下载 PDF' : '升级下载'}
          onPress={handleDownload}
          color={isPro ? colors.duckGreen : colors.duckOrange}
          style={[styles.footerButton, styles.downloadButton]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
    backgroundColor: colors.white,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.black,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginTop: spacing.xs,
  },
  themeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  themeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  gridContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.gray400,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 2,
    borderTopColor: colors.black,
    backgroundColor: colors.white,
    gap: spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  downloadButton: {
    flex: 2,
  },
});

export default PreviewScreen;
