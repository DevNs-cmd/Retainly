import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

enum EnvironmentType { dev, staging, prod }

class Environment {
  static EnvironmentType current = EnvironmentType.dev;
  static String? customBaseUrl;

  static String get apiBaseUrl {
    if (customBaseUrl != null && customBaseUrl!.isNotEmpty) {
      return customBaseUrl!;
    }

    switch (current) {
      case EnvironmentType.prod:
        return 'https://api.retainly.com/api';
      case EnvironmentType.staging:
        return 'https://staging-api.retainly.com/api';
      case EnvironmentType.dev:
        if (kIsWeb) {
          return 'http://localhost:3000/api';
        }
        try {
          if (Platform.isAndroid) {
            // Android emulator loops back to host machine via 10.0.2.2
            return 'http://10.0.2.2:3000/api';
          }
        } catch (_) {}
        return 'http://localhost:3000/api';
    }
  }

  static void setCustomUrl(String? url) {
    customBaseUrl = url;
  }
}
