# Collect Mobile

Collect RSS 阅读器的移动端应用，支持 iOS 和 Android。

## 技术栈

- Flutter 3.x + Dart 3.x
- Riverpod（状态管理）
- go_router（路由）
- Dio（HTTP 客户端）

## 开发环境

```bash
# 安装依赖
flutter pub get

# 运行（需要连接设备或启动模拟器）
flutter run

# 指定 API 地址运行
flutter run --dart-define=API_BASE_URL=http://localhost:8787

# 构建 iOS
flutter build ios

# 构建 Android
flutter build apk
```

## 目录结构

```
lib/
├── main.dart          # 入口
├── app.dart           # 路由配置
├── models/            # 数据模型
├── screens/           # 页面
├── widgets/           # 可复用组件
├── services/          # API/认证服务
└── providers/         # Riverpod 状态管理
```
