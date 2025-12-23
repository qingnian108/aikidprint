import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
} from 'react-native';
import { BrutalButton } from '../brutal';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../../theme';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onRetry?: () => void;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  title = '出错了',
  message,
  onRetry,
  onClose,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 错误图标 */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>😢</Text>
          </View>

          {/* 标题 */}
          <Text style={styles.title}>{title}</Text>

          {/* 错误消息 */}
          <Text style={styles.message}>{message}</Text>

          {/* 按钮 */}
          <View style={styles.buttons}>
            {onRetry && (
              <BrutalButton
                title="重试"
                onPress={onRetry}
                color={colors.duckYellow}
                style={styles.button}
              />
            )}
            <BrutalButton
              title="关闭"
              onPress={onClose}
              variant="outline"
              style={styles.button}
            />
          </View>
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
    borderColor: colors.error,
    // Brutal shadow
    shadowColor: colors.error,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.error,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    color: colors.error,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    minWidth: 100,
  },
});

export default ErrorModal;
