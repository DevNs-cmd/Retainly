class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  ApiException(this.message, {this.statusCode, this.details});

  @override
  String toString() => message;

  factory ApiException.fromStatusCode(int code, dynamic responseBody) {
    String msg = 'An unexpected error occurred ($code).';
    if (responseBody is Map) {
      final rawMsg = responseBody['message'];
      if (rawMsg is String) {
        msg = rawMsg;
      } else if (rawMsg is List) {
        msg = rawMsg.join(', ');
      }
    }

    switch (code) {
      case 400:
        return BadRequestException(msg, details: responseBody);
      case 401:
        return UnauthorizedException(msg);
      case 403:
        return ForbiddenException(msg);
      case 404:
        return NotFoundException(msg);
      case 409:
        return ConflictException(msg);
      case 422:
        return ValidationException(msg, details: responseBody);
      case 429:
        return RateLimitException(msg);
      case 500:
        return ServerException(msg);
      case 502:
      case 503:
        return ServiceUnavailableException(msg);
      default:
        return ApiException(msg, statusCode: code, details: responseBody);
    }
  }
}

class BadRequestException extends ApiException {
  BadRequestException(super.message, {super.details})
      : super(statusCode: 400);
}

class UnauthorizedException extends ApiException {
  UnauthorizedException(String message)
      : super(message.isNotEmpty ? message : 'Session expired. Please sign in again.', statusCode: 401);
}

class ForbiddenException extends ApiException {
  ForbiddenException(String message)
      : super(message.isNotEmpty ? message : 'Access denied. You lack permissions for this resource.', statusCode: 403);
}

class NotFoundException extends ApiException {
  NotFoundException(String message)
      : super(message.isNotEmpty ? message : 'Requested resource was not found.', statusCode: 404);
}

class ConflictException extends ApiException {
  ConflictException(String message)
      : super(message.isNotEmpty ? message : 'A conflict occurred with existing data.', statusCode: 409);
}

class ValidationException extends ApiException {
  ValidationException(super.message, {super.details})
      : super(statusCode: 422);
}

class RateLimitException extends ApiException {
  RateLimitException(String message)
      : super(message.isNotEmpty ? message : 'Too many requests. Please slow down and try again shortly.', statusCode: 429);
}

class ServerException extends ApiException {
  ServerException(String message)
      : super(message.isNotEmpty ? message : 'Internal server error. Please try again later.', statusCode: 500);
}

class ServiceUnavailableException extends ApiException {
  ServiceUnavailableException(String message)
      : super(message.isNotEmpty ? message : 'Service temporarily unavailable. Please retry shortly.', statusCode: 503);
}

class NetworkException extends ApiException {
  NetworkException(String message)
      : super(message.isNotEmpty ? message : 'Unable to connect to server. Please check your internet connection.');
}
