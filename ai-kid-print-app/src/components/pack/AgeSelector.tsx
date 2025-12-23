import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontFamily, fontSize, borderRadius, borderWidth } from '../../theme';
import { AgeGroup } from '../../types';

// 年龄组数据
export const AGE_GROUPS: AgeGroup[] = [
  { value: '3-4', label: '3-4岁', icon: '👶' },
  { value: '5-6', label: '5-6岁', icon: '🧒' },
  { value: '7-8', label: '7-8岁', icon: '👦' },
  { value: '9-10', label: '9-10岁', icon: '🧑' },
];

interface AgeSelectorProps {
  selectedAge: string;
  onSelectAge: (age: string) => void;
}

const AgeSelector: React.FC<AgeSelectorProps> = ({ selectedAge, onSelectAge }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>选择年龄</Text>
      <View style={styles.grid}>
        {AGE_GROUPS.map((ageGroup) => {
          const isSelected = selectedAge === ageGroup.value;
          return (
            <TouchableOpacity
              key={ageGroup.value}
              onPress={() => onSelectAge(ageGroup.value)}
              activeOpacity={0.8}
              style={[
                styles.ageCard,
                isSelected && styles.ageCardSelected,
              ]}>
              <Text style={styles.ageIcon}>{ageGroup.icon}</Text>
              <Text style={[styles.ageLabel, isSelected && styles.ageLabelSelected]}>
                {ageGroup.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ageCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderWidth: borderWidth.thick,
    borderColor: colors.black,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    // Brutal shadow
    shadowColor: colors.black,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  ageCardSelected: {
    backgroundColor: colors.duckYellow,
    shadowColor: colors.duckYellow,
  },
  ageIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  ageLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.gray700,
  },
  ageLabelSelected: {
    color: colors.black,
    fontFamily: fontFamily.semiBold,
  },
});

export default AgeSelector;
