import { Platform, TextStyle } from 'react-native';

// 字体家族配置
// 注意: 需要下载 Quicksand 字体并放置到 src/assets/fonts/ 目录
// 然后运行 npx react-native-asset 链接字体
export const fontFamily = {
  regular: Platform.select({
    ios: 'Quicksand-Regular',
    android: 'Quicksand-Regular',
    default: 'System',
  }) as string,
  medium: Platform.select({
    ios: 'Quicksand-Medium',
    android: 'Quicksand-Medium',
    default: 'System',
  }) as string,
  semiBold: Platform.select({
    ios: 'Quicksand-SemiBold',
    android: 'Quicksand-SemiBold',
    default: 'System',
  }) as string,
  bold: Platform.select({
    ios: 'Quicksand-Bold',
    android: 'Quicksand-Bold',
    default: 'System',
  }) as string,
};

// 字体大小
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

// 行高
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// 预设文字样式
export const textStyles = {
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.display,
    lineHeight: fontSize.display * lineHeight.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    lineHeight: fontSize.xxxl * lineHeight.tight,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xxl,
    lineHeight: fontSize.xxl * lineHeight.tight,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.xl,
    lineHeight: fontSize.xl * lineHeight.normal,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: fontSize.xs * lineHeight.normal,
  },
  button: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * lineHeight.tight,
  },
};

export default { fontFamily, fontSize, lineHeight, textStyles };
