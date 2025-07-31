import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  String? _authToken;
  bool _isLoading = false;

  User? get user => _user;
  String? get authToken => _authToken;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _authToken != null;

  Future<void> login(String pin) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/login', {'PIN': pin});
      final data = json.decode(utf8.decode(response.bodyBytes));
      
      if (data['status'] == true) {
        final userData = data['data']['user'];
        final token = data['data']['plainTextToken'];

        _user = User.fromJson(userData);
        _authToken = token;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(userData));
        await prefs.setString('authToken', token);
      } else {
        throw Exception(data['message'] ?? 'Login failed');
      }
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      await ApiService.post('/logout', {});
    } catch (e) {
      // Logout error handled silently
    }

    _user = null;
    _authToken = null;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    await prefs.remove('authToken');

    notifyListeners();
  }

  Future<void> loadStoredAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user');
    final token = prefs.getString('authToken');

    if (userData != null && token != null) {
      _user = User.fromJson(jsonDecode(userData));
      _authToken = token;
      notifyListeners();
    }
  }
} 