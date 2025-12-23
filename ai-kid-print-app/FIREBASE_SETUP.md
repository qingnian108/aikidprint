# Firebase 配置指南

## 1. 获取 google-services.json

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目（或创建新项目）
3. 点击 Android 图标添加 Android 应用
4. 输入包名: `com.aikidprint`
5. 下载 `google-services.json` 文件
6. 将文件放置到 `android/app/google-services.json`

## 2. 配置 Android 项目

### android/build.gradle

确保包含以下内容:

```gradle
buildscript {
    dependencies {
        // ... 其他依赖
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### android/app/build.gradle

在文件末尾添加:

```gradle
apply plugin: 'com.google.gms.google-services'
```

## 3. 配置 Google Sign-In

1. 在 Firebase Console 中启用 Google 登录
2. 获取 Web Client ID
3. 在应用中配置 Google Sign-In

## 4. 启用 Firebase Auth

1. 在 Firebase Console 中进入 Authentication
2. 启用 Email/Password 登录
3. 启用 Google 登录

## 5. 配置 Firestore

1. 在 Firebase Console 中进入 Firestore Database
2. 创建数据库（选择生产模式或测试模式）
3. 配置安全规则
