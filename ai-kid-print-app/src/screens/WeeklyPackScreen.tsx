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
import { BrutalButton, BrutalCard, BrutalInput } from '../components/brutal';
import AgeSelector from '../components/pack/AgeSelector';
import ThemeSelector from '../components/pack/ThemeSelector';
import { colors, spacing, fontFamily, fontSize } from '../theme';
import { usePackStore } from '../stores/packStore';

const WeeklyPackScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    childName,
    age,
    theme,
    isGenerating,
    error,
    setChildName,
    setAge,
    setTheme,
    generateWeeklyPack,
    clearError,
  } = usePackStore();

  const handleGenerate = async () => {
    clearError();
    try {
      await generateWeeklyPack();
      // 生成成功后导航到预览页面
      // navigation.navigate('Preview', { packType: 'weekly' });
      Alert.alert('成功', '练习册生成成功！');
    } catch (err) {
      // 错误已在 store 中处理
    }
  };

  const isFormValid = childName.trim() && age && theme;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>每周练习 📅</Text>
          <Text style={styles.subtitle}>
            为孩子生成本周个性化练习册
          </Text>
        </View>

        {/* 错误提示 */}
        {error && (
          <BrutalCard color="#FEE2E2" style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </BrutalCard>
        )}

        {/* 表单 */}
        <BrutalCard color={colors.white} style={styles.formCard}>
          {/* 孩子名字 */}
          <BrutalInput
            label="孩子的名字"
            value={childName}
            onChangeText={setChildName}
            placeholder="请输入孩子的名字"
            autoCapitalize="words"
          />

          {/* 年龄选择 */}
          <AgeSelector selectedAge={age} onSelectAge={setAge} />

          {/* 主题选择 */}
          <ThemeSelector selectedTheme={theme} onSelectTheme={setTheme} />
        </BrutalCard>

        {/* 生成按钮 */}
        <BrutalButton
          title={isGenerating ? '生成中...' : '生成练习册'}
          onPress={handleGenerate}
          loading={isGenerating}
          disabled={!isFormValid || isGenerating}
          color={colors.duckGreen}
          size="large"
          style={styles.generateButton}
        />

        {/* 提示信息 */}
        <BrutalCard color={colors.duckBlue} style={styles.tipCard}>
          <Text style={styles.tipTitle}>📝 练习册包含</Text>
          <Text style={styles.tipText}>
            • 涂色页面{'\n'}
            • 连线游戏{'\n'}
            • 迷宫挑战{'\n'}
            • 数字练习{'\n'}
            • 字母描红{'\n'}
            • 更多有趣内容...
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
  formCard: {
    marginBottom: spacing.lg,
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

export default WeeklyPackScreen;
