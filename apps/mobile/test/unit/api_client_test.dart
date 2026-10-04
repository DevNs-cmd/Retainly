import 'package:flutter_test/flutter_test.dart';
import 'package:retainly_mobile/core/network/api_exception.dart';
import 'package:retainly_mobile/core/auth/token_storage.dart';
import 'package:retainly_mobile/core/network/api_client.dart';

class MockTokenStorage implements TokenStorage {
  String? token;
  MockTokenStorage([this.token]);

  @override
  Future<String?> getToken() async => token;

  @override
  Future<void> saveToken(String newToken) async => token = newToken;

  @override
  Future<void> clearToken() async => token = null;
}

void main() {
  group('ApiClient & Network Tests', () {
    test('TokenStorage saves and retrieves tokens correctly', () async {
      final storage = MockTokenStorage();
      expect(await storage.getToken(), isNull);

      await storage.saveToken('jwt-test-123');
      expect(await storage.getToken(), 'jwt-test-123');

      await storage.clearToken();
      expect(await storage.getToken(), isNull);
    });

    test('ApiException maps status codes accurately', () {
      expect(ApiException.fromStatusCode(400, {'message': 'Bad body'}), isA<BadRequestException>());
      expect(ApiException.fromStatusCode(401, {'message': 'Unauthorized'}), isA<UnauthorizedException>());
      expect(ApiException.fromStatusCode(403, {'message': 'Forbidden'}), isA<ForbiddenException>());
      expect(ApiException.fromStatusCode(404, {'message': 'Not Found'}), isA<NotFoundException>());
      expect(ApiException.fromStatusCode(409, {'message': 'Conflict'}), isA<ConflictException>());
      expect(ApiException.fromStatusCode(422, {'message': 'Unprocessable'}), isA<ValidationException>());
      expect(ApiException.fromStatusCode(429, {'message': 'Too many requests'}), isA<RateLimitException>());
      expect(ApiException.fromStatusCode(500, {'message': 'Server error'}), isA<ServerException>());
      expect(ApiException.fromStatusCode(502, {'message': 'Bad gateway'}), isA<ServiceUnavailableException>());
      expect(ApiException.fromStatusCode(503, {'message': 'Service unavailable'}), isA<ServiceUnavailableException>());
    });

    test('ApiClient constructs with custom token storage', () {
      final storage = MockTokenStorage('sample-token');
      final client = ApiClient(tokenStorage: storage);
      expect(client, isNotNull);
    });
  });
}
