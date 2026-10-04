class AuthUser {
  final String id;
  final String organizationId;
  final String role;
  final String email;

  const AuthUser({
    required this.id,
    required this.organizationId,
    required this.role,
    this.email = '',
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['sub'] ?? json['id'] ?? '',
      organizationId: json['org_id'] ?? json['organizationId'] ?? '',
      role: json['org_role'] ?? json['role'] ?? 'org:coach',
      email: json['email'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'organizationId': organizationId,
    'role': role,
    'email': email,
  };
}

enum AuthStatus {
  initial,
  loading,
  authenticated,
  unauthenticated,
  error,
}

class AuthState {
  final AuthStatus status;
  final AuthUser? user;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
  });

  bool get isAuthenticated => status == AuthStatus.authenticated && user != null;

  AuthState copyWith({
    AuthStatus? status,
    AuthUser? user,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}
