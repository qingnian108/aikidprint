import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BrutalButton, BrutalCard } from '../components/brutal';
import { colors, spacing, fontFamily, fontSize, borderRadius, borderWidth } from '../theme';
import { useSettingsStore } from '../stores/settingsStore';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { paperSize, setPaperSize } = useSettingsStore();

  const handlePaperSizeChange = (size: 'letter' | 'a4') => {
    setPaperSize(size);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 标题 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>打印设置</Text>
        </View>

        {/* 纸张大小设置 */}
        <BrutalCard color={colors.white} style={styles.settingCard}>
          <Text style={styles.settingTitle}>纸张大小</Text>
          <Text style={styles.settingDescription}>
            选择 PDF 导出时使用的纸张大小
          </Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => handlePaperSizeChange('letter')}
              activeOpacity={0.8}
              style={[
                styles.optionCard,
                paperSize === 'letter' && styles.optionCardSelected,
              ]}>
              <View style={styles.optionContent}>
                <Text style={styles.optionIcon}>📄</Text>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>Letter</Text>
                  <Text style={styles.optionSize}>8.5 × 11 英寸</Text>
                  <Text style={styles.optionRegion}>美国、加拿大常用</Text>
                </View>
              </View>
              {paperSize === 'letter' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handlePaperSizeChange('a4')}
              activeOpacity={0.8}
              style={[
                styles.optionCard,
                paperSize === 'a4' && styles.optionCardSelected,
              ]}>
              <View style={styles.optionContent}>
                <Text style={styles.optionIcon}>📃</Text>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>A4</Text>
                  <Text style={styles.optionSize}>210 × 297 毫米</Text>
                  <Text style={styles.optionRegion}>国际标准，中国常用</Text>
                </View>
              </View>
              {paperSize === 'a4' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </BrutalCard>

        {/* 提示信息 */}
        <BrutalCard color={colors.duckBlue} style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 小提示</Text>
          <Text style={styles.tipText}>
            • 纸张大小会影响 PDF 的页面尺寸{'\n'}
            • 打印前请确认打印机支持所选纸张{'\n'}
            • 设置会自动保存
          </Text>
        </BrutalCard>

        {/* 关于应用 */}
        <BrutalCard color={colors.gray100} style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>关于 AI Kid Print</Text>
          <Text style={styles.aboutText}>版本 1.0.0</Text>
          <Text style={styles.aboutText}>© 2024 AI Kid Print</Text>
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
  backButton: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    color: colors.duckBlue,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    color: colors.black,
  },
  settingCard: {
    marginBottom: spacing.lg,
  },
  settingTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.lg,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray600,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.thick,
    borderColor: colors.gray300,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.duckYellow,
    borderColor: colors.black,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
  },
  optionSize: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  optionRegion: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
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
  aboutCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  aboutTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  aboutText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray500,
  },
});

export default SettingsScreen;
