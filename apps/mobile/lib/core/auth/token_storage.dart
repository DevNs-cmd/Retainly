import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract class TokenStorage {
  Future<String?> getToken();
  Future<void> saveToken(String token);
  Future<void> clearToken();
}

class SecureTokenStorage implements TokenStorage {
  final FlutterSecureStorage _storage;
  static const String _key = 'retainly_auth_token';

  // In-memory fallback if platform secure storage is not available in test or unsupported headless runs
  String? _inMemoryToken;

  SecureTokenStorage([FlutterSecureStorage? storage])
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  @override
  Future<String?> getToken() async {
    try {
      final token = await _storage.read(key: _key);
      if (token != null) return token;
    } catch (_) {
      // fallback to memory
    }
    return _inMemoryToken;
  }

  @override
  Future<void> saveToken(String token) async {
    _inMemoryToken = token;
    try {
      await _storage.write(key: _key, value: token);
    } catch (_) {
      // memory retained
    }
  }

  @override
  Future<void> clearToken() async {
    _inMemoryToken = null;
    try {
      await _storage.delete(key: _key);
    } catch (_) {
      // memory cleared
    }
  }
}
