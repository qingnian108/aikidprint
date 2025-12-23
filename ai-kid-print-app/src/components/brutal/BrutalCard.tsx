import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, borderWidth } from '../../theme';

interface BrutalCardProps {
  children: React.ReactNode;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
  shadowSize?: 'small' | 'medium' | 'large';
}

const BrutalCard: React.FC<BrutalCardProps> = ({
  children,
  color = colors.white,
  onPress,
  style,
  shadowSize = 'medium',
}) => {
  const getShadowOffset = () => {
    switch (shadowSize) {
      case 'small':
        return { width: 2, height: 2 };
      case 'large':
        return { width: 6, height: 6 };
      default:
        return { width: 4, height: 4 };
    }
  };

  const cardStyle: ViewStyle = {
    ...styles.card,
    backgroundColor: color,
    shadowOffset: getShadowOffset(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: borderWidth.brutal,
    borderColor: colors.black,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    // Brutal shadow effect
    shadowColor: colors.black,
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});

export default BrutalCard;
