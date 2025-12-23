import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { BrutalButton, BrutalCard, BrutalInput } from '../components/brutal';
import { colors, spacing, fontFamily, fontSize, borderRadius } from '../theme';
import { useAuthStore } from '../stores/authStore';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, signUp, loginWithGoogle, isLoading, error, clearError } = useAuthStore();

  const handleEmailAuth = async () => {
    setLocalError(null);
    clearError();

    // 验证输入
    if (!email.trim()) {
      setLocalError('请输入邮箱');
      return;
    }
    if (!password.trim()) {
      setLocalError('请输入密码');
      return;
    }
    if (password.length < 6) {
      setLocalError('密码至少需要6位字符');
      return;
    }

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      // 错误已在 store 中处理
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    try {
      await loginWithGoogle();
    } catch (err: any) {
      // 错误已在 store 中处理
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Logo 和标题 */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🦆</Text>
          </View>
          <Text style={styles.title}>AI Kid Print</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? '创建账户' : '欢迎回来'}
          </Text>
        </View>

        {/* 登录表单 */}
        <BrutalCard style={styles.formCard} color={colors.white}>
          {/* 错误提示 */}
          {displayError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {displayError}</Text>
            </View>
          )}

          <BrutalInput
            label="邮箱"
            value={email}
            onChangeText={setEmail}
            placeholder="请输入邮箱"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <BrutalInput
            label="密码"
            value={password}
            onChangeText={setPassword}
            placeholder="请输入密码"
            secureTextEntry
          />

          <BrutalButton
            title={isSignUp ? '注册' : '登录'}
            onPress={handleEmailAuth}
            loading={isLoading}
            color={colors.duckYellow}
            style={styles.submitButton}
          />

          {/* 分隔线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google 登录 */}
          <BrutalButton
            title="使用 Google 登录"
            onPress={handleGoogleSignIn}
            variant="outline"
            loading={isLoading}
            style={styles.googleButton}
          />

          {/* 切换登录/注册 */}
          <TouchableOpacity
            onPress={() => {
              setIsSignUp(!isSignUp);
              setLocalError(null);
              clearError();
            }}
            style={styles.switchButton}>
            <Text style={styles.switchText}>
              {isSignUp ? '已有账户？点击登录' : '没有账户？点击注册'}
            </Text>
          </TouchableOpacity>
        </BrutalCard>

        {/* 底部说明 */}
        <Text style={styles.footerText}>
          登录即表示您同意我们的服务条款和隐私政策
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.duckYellow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.black,
    marginBottom: spacing.md,
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    color: colors.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    color: colors.gray600,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.error,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gray300,
  },
  dividerText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.gray500,
    marginHorizontal: spacing.md,
  },
  googleButton: {
    marginBottom: spacing.md,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  switchText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.duckBlue,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    color: colors.gray500,
    textAlign: 'center',
  },
});

export default LoginScreen;
