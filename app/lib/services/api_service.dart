import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_config.dart';

class ApiService {
  
  static Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('authToken');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getAuthToken();
    return {
      ...ApiConfig.defaultHeaders,
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> get(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: headers,
    );
    return response;
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
    return response;
  }

  static Future<http.Response> put(String endpoint, Map<String, dynamic> data) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
    return response;
  }

  static Future<http.Response> delete(String endpoint) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}$endpoint'),
      headers: headers,
    );
    return response;
  }
} 