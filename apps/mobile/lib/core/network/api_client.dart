import 'dart:async';
import 'dart:convert';
import 'dart:io' show SocketException;
import 'package:http/http.dart' as http;
import '../config/environment.dart';
import '../auth/token_storage.dart';
import 'api_exception.dart';

class ApiClient {
  final http.Client _client;
  final TokenStorage _tokenStorage;
  final Duration timeout;

  ApiClient({
    http.Client? client,
    TokenStorage? tokenStorage,
    this.timeout = const Duration(seconds: 15),
  })  : _client = client ?? http.Client(),
        _tokenStorage = tokenStorage ?? SecureTokenStorage();

  String get baseUrl => Environment.apiBaseUrl;

  Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final cleanPath = path.startsWith('/') ? path.substring(1) : path;
    final base = baseUrl.endsWith('/') ? baseUrl : '$baseUrl/';
    final urlStr = '$base$cleanPath';

    final uri = Uri.parse(urlStr);
    if (queryParams != null && queryParams.isNotEmpty) {
      final cleanParams = queryParams.map(
        (key, value) => MapEntry(key, value?.toString() ?? ''),
      )..removeWhere((_, value) => value.isEmpty);
      return uri.replace(queryParameters: cleanParams);
    }
    return uri;
  }

  Future<Map<String, String>> _headers() async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = await _tokenStorage.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? queryParams}) async {
    return _sendRequest(() async {
      final uri = _buildUri(path, queryParams);
      final headers = await _headers();
      return _client.get(uri, headers: headers);
    });
  }

  Future<dynamic> post(String path, {dynamic body}) async {
    return _sendRequest(() async {
      final uri = _buildUri(path);
      final headers = await _headers();
      final encodedBody = body != null ? jsonEncode(body) : null;
      return _client.post(uri, headers: headers, body: encodedBody);
    });
  }

  Future<dynamic> patch(String path, {dynamic body}) async {
    return _sendRequest(() async {
      final uri = _buildUri(path);
      final headers = await _headers();
      final encodedBody = body != null ? jsonEncode(body) : null;
      return _client.patch(uri, headers: headers, body: encodedBody);
    });
  }

  Future<dynamic> put(String path, {dynamic body}) async {
    return _sendRequest(() async {
      final uri = _buildUri(path);
      final headers = await _headers();
      final encodedBody = body != null ? jsonEncode(body) : null;
      return _client.put(uri, headers: headers, body: encodedBody);
    });
  }

  Future<dynamic> delete(String path) async {
    return _sendRequest(() async {
      final uri = _buildUri(path);
      final headers = await _headers();
      return _client.delete(uri, headers: headers);
    });
  }

  Future<dynamic> _sendRequest(Future<http.Response> Function() requestFn) async {
    try {
      final response = await requestFn().timeout(timeout);
      return _handleResponse(response);
    } on TimeoutException {
      throw NetworkException('Request timed out. Please verify your connection.');
    } on SocketException {
      throw NetworkException('Network connection failed. Ensure server is reachable.');
    } on ApiException {
      rethrow;
    } catch (e) {
      if (e is FormatException) {
        throw ApiException('Malformed response received from server.');
      }
      throw NetworkException('Connection error: $e');
    }
  }

  dynamic _handleResponse(http.Response response) {
    dynamic parsedBody;
    if (response.body.isNotEmpty) {
      try {
        parsedBody = jsonDecode(response.body);
      } catch (_) {
        parsedBody = response.body;
      }
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.statusCode == 204) return null;
      return parsedBody;
    }

    throw ApiException.fromStatusCode(response.statusCode, parsedBody);
  }
}
