import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme/app_theme.dart';
import 'theme/colors.dart';
import 'main_shell.dart';
import '../core/auth/auth_service.dart';
import '../core/auth/auth_state.dart';
import '../features/auth/presentation/login_screen.dart';

class RetainlyApp extends ConsumerWidget {
  const RetainlyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final authState = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'Retainly',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: themeMode,
      home: _buildHome(authState),
    );
  }

  Widget _buildHome(AuthState authState) {
    switch (authState.status) {
      case AuthStatus.initial:
      case AuthStatus.loading:
        return const Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: AppColors.indigo50,
                  child: Icon(Icons.shield_outlined, size: 40, color: AppColors.indigo600),
                ),
                SizedBox(height: 20),
                CircularProgressIndicator(color: AppColors.indigo600, strokeWidth: 2),
                SizedBox(height: 12),
                Text(
                  'Connecting to Retainly Workspace...',
                  style: TextStyle(color: AppColors.slate500, fontSize: 13),
                ),
              ],
            ),
          ),
        );
      case AuthStatus.authenticated:
        return const MainShell();
      case AuthStatus.unauthenticated:
      case AuthStatus.error:
        return const LoginScreen();
    }
  }
}
