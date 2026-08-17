/// Single source of truth for mobile API paths shared with the backend contract.
class ApiContract {
  const ApiContract._();

  static const health = '/health';
  static const svetlanaChat = '/api/svetlana/chat';
  static const authMe = '/api/auth/me';
  static const authRefresh = '/api/auth/refresh';
}
