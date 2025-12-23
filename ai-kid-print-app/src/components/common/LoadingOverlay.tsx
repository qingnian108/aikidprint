import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: number; // 0-100
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = '生成中...',
  progress,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 旋转动画
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // 弹跳动画
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceValue, {
            toValue: -10,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(bounceValue, {
            toValue: 0,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinValue.setValue(0);
      bounceValue.setValue(0);
    }
  }, [visible]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 动画图标 */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate: spin },
                  { translateY: bounceValue },
                ],
              },
            ]}>
            <Text style={styles.icon}>🦆</Text>
          </Animated.View>

          {/* 加载文字 */}
          <Text style={styles.message}>{message}</Text>

          {/* 进度条（如果有进度） */}
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(0, progress))}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          )}

          {/* 提示文字 */}
          <Text style={styles.hint}>
            正在为您的孩子创建个性化练习册...
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderWidth: 4,
    borderColor: colors.black,
    // Brutal shadow
    shadowColor: colors.black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.duckYellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.black,
  },
  icon: {
    fontSize: 40,
  },
  message: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    width: '100%',
    marginVertical: spacing.md,
  },
  progressBackground: {
    height: 16,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.black,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.duckGreen,
  },
  progressText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default LoadingOverlay;
