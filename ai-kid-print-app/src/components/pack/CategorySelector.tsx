import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontFamily, fontSize, borderRadius, borderWidth } from '../../theme';
import { Category, PageType, Selections } from '../../types';

// 分类数据
export const CATEGORIES: Category[] = [
  {
    id: 'coloring',
    name: '涂色',
    icon: '🎨',
    pageTypes: [
      { id: 'coloring-simple', name: '简单涂色', description: '大块区域涂色' },
      { id: 'coloring-detailed', name: '精细涂色', description: '细节丰富的涂色' },
    ],
  },
  {
    id: 'tracing',
    name: '描红',
    icon: '✏️',
    pageTypes: [
      { id: 'tracing-letters', name: '字母描红', description: 'A-Z 字母练习' },
      { id: 'tracing-numbers', name: '数字描红', description: '0-9 数字练习' },
      { id: 'tracing-shapes', name: '形状描红', description: '基础形状练习' },
    ],
  },
  {
    id: 'puzzles',
    name: '益智游戏',
    icon: '🧩',
    pageTypes: [
      { id: 'maze', name: '迷宫', description: '找到出口' },
      { id: 'dotToDot', name: '连线', description: '按数字连线' },
      { id: 'matching', name: '配对', description: '找到相同的' },
    ],
  },
  {
    id: 'math',
    name: '数学',
    icon: '🔢',
    pageTypes: [
      { id: 'counting', name: '数数', description: '数一数有几个' },
      { id: 'addition', name: '加法', description: '简单加法练习' },
      { id: 'patterns', name: '规律', description: '找出规律' },
    ],
  },
];

interface CategorySelectorProps {
  selections: Selections;
  onSelectionChange: (pageTypeId: string, quantity: number) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selections,
  onSelectionChange,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getQuantity = (pageTypeId: string): number => {
    return selections[pageTypeId] || 0;
  };

  const incrementQuantity = (pageTypeId: string) => {
    const current = getQuantity(pageTypeId);
    if (current < 10) {
      onSelectionChange(pageTypeId, current + 1);
    }
  };

  const decrementQuantity = (pageTypeId: string) => {
    const current = getQuantity(pageTypeId);
    if (current > 0) {
      onSelectionChange(pageTypeId, current - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>选择页面类型</Text>
      
      {CATEGORIES.map((category) => {
        const isExpanded = expandedCategory === category.id;
        const categoryTotal = category.pageTypes.reduce(
          (sum, pt) => sum + getQuantity(pt.id),
          0
        );

        return (
          <View key={category.id} style={styles.categoryContainer}>
            {/* 分类标题 */}
            <TouchableOpacity
              onPress={() => toggleCategory(category.id)}
              activeOpacity={0.8}
              style={[
                styles.categoryHeader,
                isExpanded && styles.categoryHeaderExpanded,
              ]}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <View style={styles.categoryRight}>
                {categoryTotal > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{categoryTotal}</Text>
                  </View>
                )}
                <Text style={styles.expandIcon}>
                  {isExpanded ? '▼' : '▶'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* 页面类型列表 */}
            {isExpanded && (
              <View style={styles.pageTypeList}>
                {category.pageTypes.map((pageType) => (
                  <View key={pageType.id} style={styles.pageTypeItem}>
                    <View style={styles.pageTypeInfo}>
                      <Text style={styles.pageTypeName}>{pageType.name}</Text>
                      <Text style={styles.pageTypeDesc}>{pageType.description}</Text>
                    </View>
                    <View style={styles.quantitySelector}>
                      <TouchableOpacity
                        onPress={() => decrementQuantity(pageType.id)}
                        style={[
                          styles.quantityButton,
                          getQuantity(pageType.id) === 0 && styles.quantityButtonDisabled,
                        ]}>
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>
                        {getQuantity(pageType.id)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => incrementQuantity(pageType.id)}
                        style={[
                          styles.quantityButton,
                          getQuantity(pageType.id) >= 10 && styles.quantityButtonDisabled,
                        ]}>
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
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
  categoryContainer: {
    marginBottom: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: borderWidth.thick,
    borderColor: colors.black,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    // Brutal shadow
    shadowColor: colors.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  categoryHeaderExpanded: {
    backgroundColor: colors.duckYellow,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    color: colors.black,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.duckOrange,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.black,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    color: colors.black,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.gray600,
  },
  pageTypeList: {
    backgroundColor: colors.gray100,
    borderWidth: borderWidth.thick,
    borderTopWidth: 0,
    borderColor: colors.black,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    padding: spacing.sm,
  },
  pageTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  pageTypeInfo: {
    flex: 1,
  },
  pageTypeName: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.black,
  },
  pageTypeDesc: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray500,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.duckBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.black,
  },
  quantityButtonDisabled: {
    backgroundColor: colors.gray200,
    borderColor: colors.gray400,
  },
  quantityButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.black,
  },
  quantityText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    color: colors.black,
    minWidth: 30,
    textAlign: 'center',
  },
});

export default CategorySelector;
