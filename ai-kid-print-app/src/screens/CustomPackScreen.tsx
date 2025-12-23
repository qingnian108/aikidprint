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
import ThemeSelector from '../components/pack/ThemeSelector';
import CategorySelector from '../components/pack/CategorySelector';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../theme';
import { usePackStore } from '../stores/packStore';

const CustomPackScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    theme,
    selections,
    totalPages,
    isGenerating,
    error,
    setTheme,
    setSelection,
    generateCustomPack,
    clearError,
    clearSelections,
  } = usePackStore();

  const handleGenerate = async () => {
    clearError();
    try {
      await generateCustomPack();
      Alert.alert('成功', '练习册生成成功！');
    } catch (err) {
      // 错误已在 store 中处理
    }
  };

  const isFormValid = theme && totalPages > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>自定义练习 ✏️</Text>
          <Text style={styles.subtitle}>
            选择你想要的练习类型和数量
          </Text>
        </View>

        {/* 错误提示 */}
        {error && (
          <BrutalCard color="#FEE2E2" style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </BrutalCard>
        )}

        {/* 主题选择 */}
        <BrutalCard color={colors.white} style={styles.sectionCard}>
          <ThemeSelector selectedTheme={theme} onSelectTheme={setTheme} />
        </BrutalCard>

        {/* 分类选择 */}
        <BrutalCard color={colors.white} style={styles.sectionCard}>
          <CategorySelector
            selections={selections}
            onSelectionChange={setSelection}
          />
        </BrutalCard>

        {/* 总页数显示 */}
        <BrutalCard
          color={totalPages > 0 ? colors.duckGreen : colors.gray200}
          style={styles.totalCard}>
          <View style={styles.totalContent}>
            <Text style={styles.totalLabel}>总页数</Text>
            <Text style={styles.totalNumber}>{totalPages}</Text>
          </View>
          {totalPages > 0 && (
            <BrutalButton
              title="清空"
              onPress={clearSelections}
              variant="outline"
              size="small"
            />
          )}
        </BrutalCard>

        {/* 生成按钮 */}
        <BrutalButton
          title={isGenerating ? '生成中...' : `生成 ${totalPages} 页练习册`}
          onPress={handleGenerate}
          loading={isGenerating}
          disabled={!isFormValid || isGenerating}
          color={colors.duckOrange}
          size="large"
          style={styles.generateButton}
        />

        {/* 提示信息 */}
        <BrutalCard color={colors.duckPink} style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 小提示</Text>
          <Text style={styles.tipText}>
            • 每种类型最多可选择 10 页{'\n'}
            • 点击分类展开查看详细选项{'\n'}
            • 选择主题后，所有页面都会使用该主题风格
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
    marginBottom: spacing.lg,
  },
  title: {
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
  errorCard: {
    marginBottom: spacing.md,
    borderColor: colors.error,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  totalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
    marginRight: spacing.md,
  },
  totalNumber: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.black,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.black,
    overflow: 'hidden',
  },
  generateButton: {
    marginBottom: spacing.lg,
  },
  tipCard: {
    marginBottom: spacing.lg,
  },
  tipTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray700,
    lineHeight: 22,
  },
});

export default CustomPackScreen;
