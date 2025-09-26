import 'environment.dart';

class ApiConfig {
  static String get baseUrl => EnvironmentConfig.apiBaseUrl;
  static String get fileBaseUrl => EnvironmentConfig.fileBaseUrl;
  
  // Endpoints específicos
  static const String authEndpoint = '/auth';
  static const String projectsEndpoint = '/projects';
  static const String categoriesEndpoint = '/categories';
  static const String studentsEndpoint = '/students';
  
  // Configurações de timeout
  static const Duration requestTimeout = Duration(seconds: 30);
  static const Duration connectionTimeout = Duration(seconds: 10);
  
  // Headers padrão
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}
