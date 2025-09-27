enum Environment {
  development,
  production,
}

class EnvironmentConfig {
  static Environment _currentEnvironment = Environment.development;
  
  static Environment get currentEnvironment => _currentEnvironment;
  
  static void setEnvironment(Environment environment) {
    _currentEnvironment = environment;
  }
  
  // URLs por ambiente
  static const Map<Environment, Map<String, String>> _urls = {
    Environment.production: {
      'apiBaseUrl': 'https://fecitel.cossoftware.com.br/api/api/v3/mobile',
      'fileBaseUrl': 'https://fecitel.cossoftware.com.br/api',
    },
    Environment.development: {
      'apiBaseUrl': 'http://localhost:8000/api/v3/mobile',
      'fileBaseUrl': 'http://localhost:8000',
    },
  };
  
  static String get apiBaseUrl => _urls[_currentEnvironment]!['apiBaseUrl']!;
  static String get fileBaseUrl => _urls[_currentEnvironment]!['fileBaseUrl']!;
}
