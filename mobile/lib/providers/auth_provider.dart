import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/auth_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiServiceProvider));
});

class AuthState {
  final User? user;
  final bool isLoading;
  final String? error;

  const AuthState({this.user, this.isLoading = false, this.error});

  bool get isLoggedIn => user != null;
}

class AuthNotifier extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    final authService = ref.read(authServiceProvider);
    final user = await authService.getCurrentUser();
    return AuthState(user: user);
  }

  Future<void> signIn(String email, String password) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final authService = ref.read(authServiceProvider);
      final user = await authService.signIn(email, password);
      return AuthState(user: user);
    });
  }

  Future<void> signUp(String name, String email, String password) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final authService = ref.read(authServiceProvider);
      final user = await authService.signUp(name, email, password);
      return AuthState(user: user);
    });
  }

  Future<void> signOut() async {
    final authService = ref.read(authServiceProvider);
    await authService.signOut();
    state = const AsyncValue.data(AuthState());
  }
}

final authProvider = AsyncNotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
