import 'api_service.dart';
import '../models/user.dart';

/// 认证服务：封装登录、注册、登出逻辑
class AuthService {
  final ApiService _api;

  AuthService(this._api);

  Future<User?> signIn(String email, String password) async {
    final data = await _api.signIn(email, password);
    final userData = data['user'] as Map<String, dynamic>?;
    if (userData == null) return null;
    return User.fromJson(userData);
  }

  Future<User?> signUp(String name, String email, String password) async {
    final data = await _api.signUp(name, email, password);
    final userData = data['user'] as Map<String, dynamic>?;
    if (userData == null) return null;
    return User.fromJson(userData);
  }

  Future<void> signOut() => _api.signOut();

  Future<User?> getCurrentUser() async {
    final session = await _api.getSession();
    final userData = session?['user'] as Map<String, dynamic>?;
    if (userData == null) return null;
    return User.fromJson(userData);
  }
}
