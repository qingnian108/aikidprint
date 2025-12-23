import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontFamily, fontSize, borderRadius, borderWidth, themeColors } from '../../theme';
import { Theme } from '../../types';

// 主题数据
export const THEMES: Theme[] = [
  { id: 'dinosaur', name: '恐龙', icon: '🦕', color: themeColors.dinosaur },
  { id: 'space', name: '太空', icon: '🚀', color: themeColors.space },
  { id: 'unicorn', name: '独角兽', icon: '🦄', color: themeColors.unicorn },
  { id: 'ocean', name: '海洋', icon: '🐠', color: themeColors.ocean },
  { id: 'vehicles', name: '车辆', icon: '🚗', color: themeColors.vehicles },
  { id: 'wildlife', name: '野生动物', icon: '🦁', color: themeColors.wildlife },
];

interface ThemeSelectorProps {
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onSelectTheme }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>选择主题</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <TouchableOpacity
              key={theme.id}
              onPress={() => onSelectTheme(theme.id)}
              activeOpacity={0.8}
              style={[
                styles.themeCard,
                { backgroundColor: isSelected ? theme.color : colors.white },
                isSelected && styles.themeCardSelected,
              ]}>
              <Text style={styles.themeIcon}>{theme.icon}</Text>
              <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>
                {theme.name}
              </Text>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingRight: spacing.lg,
    gap: spacing.sm,
  },
  themeCard: {
    width: 100,
    backgroundColor: colors.white,
    borderWidth: borderWidth.thick,
    borderColor: colors.black,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    // Brutal shadow
    shadowColor: colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  themeCardSelected: {
    borderWidth: borderWidth.brutal,
  },
  themeIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  themeName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.gray700,
    textAlign: 'center',
  },
  themeNameSelected: {
    color: colors.black,
    fontFamily: fontFamily.semiBold,
  },
  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ThemeSelector;
